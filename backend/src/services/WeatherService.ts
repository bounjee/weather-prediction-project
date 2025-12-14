import axios from 'axios';
import { DayForecast, WeatherData } from '../types';
import { DecisionEngine } from './DecisionEngine';

// Mock data generator for fallback
const generateMockData = (days: number): WeatherData[] => {
    const today = new Date();
    const mockData: WeatherData[] = [];

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const isRainy = Math.random() > 0.7;
        const baseTemp = 15 + Math.random() * 10 - 5;

        mockData.push({
            date: date.toISOString().split('T')[0],
            temp: {
                day: Math.round(baseTemp),
                min: Math.round(baseTemp - 5),
                max: Math.round(baseTemp + 5),
                night: Math.round(baseTemp - 8)
            },
            humidity: 40 + Math.round(Math.random() * 40),
            wind_speed: 5 + Math.round(Math.random() * 25),
            description: isRainy ? 'Yağmurlu' : (Math.random() > 0.5 ? 'Parçalı Bulutlu' : 'Güneşli'),
            precipitation_prob: isRainy ? 70 + Math.round(Math.random() * 30) : Math.round(Math.random() * 20),
            icon: isRainy ? 'rain' : 'clear'
        });
    }
    return mockData;
};

interface OpenWeatherForecastItem {
    dt: number;
    main: {
        temp: number;
        temp_min: number;
        temp_max: number;
        humidity: number;
    };
    weather: {
        main: string;
        description: string;
        icon: string;
    }[];
    clouds: {
        all: number;
    };
    wind: {
        speed: number;
        deg: number;
    };
    pop: number; // Probability of precipitation
    dt_txt: string;
}

interface OpenWeatherResponse {
    list: OpenWeatherForecastItem[];
    city: {
        name: string;
        coord: {
            lat: number;
            lon: number;
        };
    };
}

export class WeatherService {
    private readonly API_KEY = process.env.OPENWEATHER_API_KEY;
    private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
    // Use metric units for Celsius
    private readonly UNITS = 'metric';
    private readonly LANGUAGE = 'tr';

    async getForecast(city: string): Promise<DayForecast[]> {
        // Fallback to mock if no key is present in env
        if (!this.API_KEY || this.API_KEY === 'your_api_key_here') {
            console.warn('API Key missing, using mock data.');
            return this.getMockForecast(city);
        }

        try {
            // 1. Call 5 day / 3 hour forecast API
            const response = await axios.get<OpenWeatherResponse>(`${this.BASE_URL}/forecast`, {
                params: {
                    q: city,
                    appid: this.API_KEY,
                    units: this.UNITS,
                    lang: this.LANGUAGE
                }
            });

            // 2. Process and aggregate data by day
            const dailyData = this.processForecastData(response.data.list);

            // 3. Analyze each day
            return dailyData.slice(0, 3).map(weather => ({ // Take first 3 days
                weather,
                analysis: DecisionEngine.analyze(weather)
            }));

        } catch (error) {
            console.error('Weather API Error:', error);
            // Fallback to mock on error to keep app running
            console.log('Falling back to mock data...');
            return this.getMockForecast(city);
        }
    }

    private processForecastData(list: OpenWeatherForecastItem[]): WeatherData[] {
        const dailyMap = new Map<string, OpenWeatherForecastItem[]>();

        // Group by date (YYYY-MM-DD)
        list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyMap.has(date)) {
                dailyMap.set(date, []);
            }
            dailyMap.get(date)?.push(item);
        });

        const results: WeatherData[] = [];

        dailyMap.forEach((items, date) => {
            // Calculate aggregations for the day
            let minTemp = 100;
            let maxTemp = -100;
            let maxWind = 0;
            let avgHumidity = 0;
            let maxPop = 0;

            // For description, take the one from noon (or middle of available data)
            const midIndex = Math.floor(items.length / 2);
            const description = items[midIndex].weather[0].description;
            const icon = items[midIndex].weather[0].main.toLowerCase();

            // Calculate day/night temps (approximate)
            // OpenWeather defines day around 12:00, night around 00:00, but we have 3hr intervals.
            // Let's take max as day, min as night for simplicity or average
            let tempSum = 0;

            items.forEach(item => {
                if (item.main.temp_min < minTemp) minTemp = item.main.temp_min;
                if (item.main.temp_max > maxTemp) maxTemp = item.main.temp_max;
                if (item.wind.speed > maxWind) maxWind = item.wind.speed;
                if (item.pop > maxPop) maxPop = item.pop;
                avgHumidity += item.main.humidity;
                tempSum += item.main.temp;
            });

            const dayTemp = Math.round(tempSum / items.length);
            // In a real app, 'night' temp implies the following night, but here we simplify
            const nightTemp = Math.round(minTemp);

            // Convert wind speed from m/s to km/h if needed (OpenWeather returns m/s for metric)
            // 1 m/s = 3.6 km/h
            const windKmH = Math.round(maxWind * 3.6);

            results.push({
                date,
                temp: {
                    min: Math.round(minTemp),
                    max: Math.round(maxTemp),
                    day: dayTemp,
                    night: nightTemp
                },
                humidity: Math.round(avgHumidity / items.length),
                wind_speed: windKmH,
                description: description.charAt(0).toUpperCase() + description.slice(1),
                precipitation_prob: Math.round(maxPop * 100), // pop is 0-1
                icon
            });
        });

        return results.sort((a, b) => a.date.localeCompare(b.date));
    }

    private getMockForecast(city: string): DayForecast[] {
        const rawData = generateMockData(3);
        return rawData.map(weather => ({
            weather,
            analysis: DecisionEngine.analyze(weather)
        }));
    }
}
