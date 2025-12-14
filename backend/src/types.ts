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
