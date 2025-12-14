export interface WeatherData {
    date: string; // YYYY-MM-DD
    temp: {
        min: number;
        max: number;
        day: number;
        night: number;
    };
    humidity: number; // %
    wind_speed: number; // km/h
    description: string;
    precipitation_prob: number; // %
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
    gdd: number;
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
