import axios from 'axios';
import { DayForecast, WeatherData, WeatherResponse, ModelInfo } from '../types';
import { DecisionEngine } from './DecisionEngine';

export class WeatherService {
    private readonly AI_SERVICE_URL = 'http://127.0.0.1:5000/predict';

    async getForecast(city: string): Promise<WeatherResponse> {
        console.log(`[WeatherService] Requesting AI forecast for: ${city}`);
        try {
            const response = await axios.get(this.AI_SERVICE_URL, {
                params: { city: city, days: 6 }
            });

            const aiData = response.data;
            if (!aiData || !aiData.forecast || aiData.forecast.length < 2) {
                throw new Error('AI Service returned invalid or insufficient data');
            }

            const forecasts: DayForecast[] = aiData.forecast.map((day: any, index: number) => {
                const weather = this.mapAiToWeather(day);
                const analysis = DecisionEngine.analyze(weather);

                if (index === 0) {
                    return {
                        weather,
                        analysis: {
                            ...analysis,
                            ai_prediction: {
                                value: aiData.forecast[1].max_temp,
                                message: `Yapay Zeka (LSTM) Yarın için ${Math.round(aiData.forecast[1].max_temp)}°C zirve sıcaklık öngörüyor.`,
                                history: aiData.history || []
                            }
                        }
                    };
                }
                return { weather, analysis };
            });

            return {
                forecast: forecasts,
                model_info: aiData.model_info
            };
        } catch (error: any) {
            console.error(`[WeatherService] AI SERVICE FAILED: ${error.message}`);
            throw new Error("Yapay Zeka Servisine ulaşılamıyor. Lütfen model sunucusunun çalıştığından emin olun.");
        }
    }

    private mapAiToWeather(day: any): WeatherData {
        let icon = '01d';
        let description = 'Açık';

        if (day.precipitation > 2.0) { icon = '09d'; description = 'Şiddetli Yağış'; }
        else if (day.precipitation > 0.1) { icon = '10d'; description = 'Hafif Yağmurlu'; }
        else if (day.humidity > 80) { icon = '04d'; description = 'Çok Bulutlu'; }
        else if (day.humidity > 60) { icon = '02d'; description = 'Parçalı Bulutlu'; }

        return {
            date: day.date,
            temp: {
                min: Math.round(day.min_temp),
                max: Math.round(day.max_temp),
                day: Math.round(day.avg_temp),
                night: Math.round(day.min_temp - 2)
            },
            humidity: Math.round(day.humidity),
            wind_speed: Math.round(day.wind_speed),
            description: description,
            precipitation_prob: day.precipitation > 0.1 ? 80 : 10,
            pressure: Math.round(day.pressure),
            icon: icon
        };
    }
}
