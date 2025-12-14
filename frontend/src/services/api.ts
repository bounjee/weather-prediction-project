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
        level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
        type?: 'WHITE_FROST' | 'BLACK_FROST';
        message: string;
    };
    planting_status: {
        suitable: boolean;
        risk_factor: 'NONE' | 'COLD' | 'WET' | 'WINDY' | 'GDD_LOW';
        message: string;
    };
    spraying_risk: {
        suitable: boolean;
        delta_t?: number;
        message: string;
    };
    disease_risk: {
        level: 'LOW' | 'MEDIUM' | 'HIGH';
        message: string;
    };
    gdd?: number;
    ai_prediction?: {
        value: number;
        message: string;
        history?: number[];
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

export const sendMessage = async (message: string, city: string): Promise<string> => {
    const response = await api.post<{ response: string }>('/chat', { message, city });
    return response.data.response;
};
