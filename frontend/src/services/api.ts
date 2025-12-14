import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

export interface WeatherData {
    date: string;
    temp: {
        min: number;
        max: number;
        day: number;
        night: number;
    };
    humidity: number;
    wind_speed: number;
    description: string;
    precipitation_prob: number;
    icon: string;
}

export interface AgroAnalysis {
    frost_risk: {
        level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
        message: string;
    };
    planting_status: {
        suitable: boolean;
        risk_factor: 'NONE' | 'COLD' | 'WET' | 'WINDY';
        message: string;
    };
    spraying_risk: {
        suitable: boolean;
        message: string;
    };
}

export interface DayForecast {
    weather: WeatherData;
    analysis: AgroAnalysis;
}

export interface WeatherResponse {
    city: string;
    forecast: DayForecast[];
}

export const getWeather = async (city: string): Promise<WeatherResponse> => {
    const response = await api.get<WeatherResponse>(`/weather/${city}`);
    return response.data;
};
