import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

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
    pressure: number;
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

export interface ModelInfo {
    architecture: string;
    pencere: number;
    features: number;
    val_mae: number;
    val_loss: number;
    epochs: number;
}

export interface WeatherResponse {
    city: string;
    forecast: DayForecast[];
    model_info?: ModelInfo;
}

export const getWeather = async (city: string): Promise<WeatherResponse> => {
    const response = await fetch(`${API_BASE}/weather/${city}`);
    if (!response.ok) throw new Error('Weather data fetch failed');
    return response.json();
};

export const sendMessage = async (message: string, city: string): Promise<string> => {
    const response = await axios.post<{ response: string }>(`${API_BASE}/chat`, { message, city });
    return response.data.response;
};
