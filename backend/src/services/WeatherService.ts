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
        // --- DEBUG API KEY START ---
        console.log(`[WeatherService] Requesting forecast for: ${city}`);

        if (!this.API_KEY) {
            console.error('[WeatherService] ERROR: OPENWEATHER_API_KEY is undefined in environment variables.');
        } else if (this.API_KEY === 'your_api_key_here') {
            console.error('[WeatherService] ERROR: API Key is still the placeholder value.');
        } else {
            console.log(`[WeatherService] API Key detected (first 4 chars): ${this.API_KEY.substring(0, 4)}... (Length: ${this.API_KEY.length})`);
        }
        // --- DEBUG API KEY END ---

        // Fallback to mock if no key is present in env
        if (!this.API_KEY || this.API_KEY === 'your_api_key_here') {
            console.warn('[WeatherService] Using Mock Data (Fallback Mode) due to missing API Key.');
            return this.getMockForecast(city);
        }

        try {
            console.log(`[WeatherService] Sending HTTP GET request to OpenWeatherMap...`);
            // 1. Call 5 day / 3 hour forecast API
            const response = await axios.get<OpenWeatherResponse>(`${this.BASE_URL}/forecast`, {
                params: {
                    q: city,
                    appid: this.API_KEY,
                    units: this.UNITS,
                    lang: this.LANGUAGE
                }
            });

            console.log(`[WeatherService] API Response received. Status: ${response.status}`);

            // 2. Process and aggregate data by day
            const dailyData = this.processForecastData(response.data.list);

            // 3. Analyze each day
            const forecasts = dailyData.slice(0, 3).map(weather => ({
                weather,
                analysis: DecisionEngine.analyze(weather)
            }));

            // 4. (NEW) AI Prediction Integration (Only for Ankara)
            if (city.toLowerCase() === 'ankara') {
                try {
                    console.log('Fetching AI Prediction for Ankara...');
                    const aiResponse = await axios.post('http://127.0.0.1:5000/predict', {});
                    if (forecasts.length > 0 && aiResponse.data) {
                        // AI tahminini ilk günün analizine ekle (veya ayrı bir alan olarak dön)
                        // Şimdilik AgroAnalysis içine 'ai_prediction' alanı eklemediğimiz için
                        // 'gdd' alanına veya mesaja ekleyerek hile yapabiliriz, ya da type'ı güncelleyebiliriz.
                        // En temizi type.ts'i güncellemektir ama hızlı çözüm için:
                        forecasts[0].analysis.ai_prediction = {
                            value: aiResponse.data.value,
                            message: `Yapay Zeka (LSTM) Tahmini: ${aiResponse.data.value}°C`,
                            history: aiResponse.data.history || []
                        };
                    }
                } catch (aiError: any) {
                    console.error('AI Service Connection Failed:', aiError.message ? aiError.message : 'Unknown Error');
                }
            }

            return forecasts;

        } catch (error: any) {
            console.error('[WeatherService] API REQUEST FAILED.');
            console.error('[WeatherService] Error Message:', error.message);

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('[WeatherService] Response Status:', error.response.status);
                // console.error('[WeatherService] Response Data:', JSON.stringify(error.response.data));

                if (error.response.status === 401) {
                    console.error('[WeatherService] CRITICAL: 401 Unauthorized. Please check your API Key validity.');
                }
                if (error.response.status === 404) {
                    console.error(`[WeatherService] City "${city}" not found.`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error('[WeatherService] No response received from OpenWeatherMap (Network Issue?).');
            }

            // Fallback to mock on error to keep app running
            console.log('[WeatherService] Falling back to mock data so the app does not crash...');
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
            const nightTemp = Math.round(minTemp);

            // Convert wind speed from m/s to km/h (1 m/s = 3.6 km/h)
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
        console.log(`[WeatherService] Generating MOCK data for ${city}`);
        const rawData = generateMockData(3);
        return rawData.map(weather => ({
            weather,
            analysis: DecisionEngine.analyze(weather)
        }));
    }
}
