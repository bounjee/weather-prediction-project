import axios from 'axios';
import { DayForecast, WeatherData } from '../types';
import { DecisionEngine } from './DecisionEngine';

// Mock data generator for fallback/demo
const generateMockData = (days: number): WeatherData[] => {
    const today = new Date();
    const mockData: WeatherData[] = [];

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Randomize weather slightly
        const isRainy = Math.random() > 0.7;
        const baseTemp = 15 + Math.random() * 10 - 5; // 10-20 degrees range

        mockData.push({
            date: date.toISOString().split('T')[0],
            temp: {
                day: Math.round(baseTemp),
                min: Math.round(baseTemp - 5),
                max: Math.round(baseTemp + 5),
                night: Math.round(baseTemp - 8)
            },
            humidity: 40 + Math.round(Math.random() * 40),
            wind_speed: 5 + Math.round(Math.random() * 25), // 5-30 km/h
            description: isRainy ? 'Yağmurlu' : (Math.random() > 0.5 ? 'Parçalı Bulutlu' : 'Güneşli'),
            precipitation_prob: isRainy ? 70 + Math.round(Math.random() * 30) : Math.round(Math.random() * 20),
            icon: isRainy ? 'rain' : 'clear'
        });
    }
    return mockData;
};

export class WeatherService {
    private readonly API_KEY = process.env.OPENWEATHER_API_KEY;
    private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';

    async getForecast(city: string): Promise<DayForecast[]> {
        // If no API key, return mock data
        if (!this.API_KEY || typeof this.API_KEY === 'undefined' || this.API_KEY === '') {
            console.log('Using Mock Data for', city);
            const rawData = generateMockData(3);
            return rawData.map(weather => ({
                weather,
                analysis: DecisionEngine.analyze(weather)
            }));
        }

        try {
            // Real API Call Implementation would go here
            // using One Call API or 5 Day Forecast
            // For now, let's stick to mock data to ensure the UI works perfectly first
            // as users might not have provided a key yet.
            return this.getMockForecast(city);
        } catch (error) {
            console.error('Weather API Error:', error);
            throw new Error('Hava durumu verisi alınamadı.');
        }
    }

    private getMockForecast(city: string): DayForecast[] {
        const rawData = generateMockData(3);
        return rawData.map(weather => ({
            weather,
            analysis: DecisionEngine.analyze(weather)
        }));
    }
}
