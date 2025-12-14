import { WeatherData, AgroAnalysis } from '../types';

export class DecisionEngine {

    public static analyze(weather: WeatherData): AgroAnalysis {
        return {
            frost_risk: this.assessFrostRisk(weather.temp.min),
            planting_status: this.assessPlanting(weather),
            spraying_risk: this.assessSpraying(weather)
        };
    }

    private static assessFrostRisk(minTemp: number): AgroAnalysis['frost_risk'] {
        if (minTemp <= -2) {
            return { level: 'HIGH', message: 'Şiddetli don riski! Zirai don önlemlerinizi mutlaka alın.' };
        } else if (minTemp <= 0) {
            return { level: 'MEDIUM', message: 'Orta seviye don riski. Hassas bitkiler için önlem alınmalı.' };
        } else if (minTemp <= 2) {
            return { level: 'LOW', message: 'Hafif don riski. Çukur alanlarda dikkatli olun.' };
        }
        return { level: 'NONE', message: 'Don riski bulunmuyor.' };
    }

    private static assessPlanting(weather: WeatherData): AgroAnalysis['planting_status'] {
        // Kural 1: Çok soğuk (Toprak sıcaklığı tahmini)
        if (weather.temp.day < 5) {
            return { suitable: false, risk_factor: 'COLD', message: 'Toprak sıcaklığı çimlenme için yetersiz olabilir.' };
        }
        // Kural 2: Aşırı yağış
        if (weather.precipitation_prob > 60) {
            return { suitable: false, risk_factor: 'WET', message: 'Yüksek yağış ihtimali nedeniyle ekim önerilmez, toprak çamur olabilir.' };
        }
        // Kural 3: Şiddetli Rüzgar
        if (weather.wind_speed > 20) {
            return { suitable: false, risk_factor: 'WINDY', message: 'Şiddetli rüzgar tohum ve gübreyi savurabilir.' };
        }

        return { suitable: true, risk_factor: 'NONE', message: 'Hava koşulları ekim için elverişli görünüyor.' };
    }

    private static assessSpraying(weather: WeatherData): AgroAnalysis['spraying_risk'] {
        // İlaçlama (Drift ve Yıkanma riski)
        if (weather.wind_speed > 15) {
            return { suitable: false, message: `Rüzgar hızı (${weather.wind_speed} km/s) ilaçlama için çok yüksek. Sürüklenme riski var.` };
        }
        if (weather.precipitation_prob > 50) {
            return { suitable: false, message: 'Yağmur beklentisi nedeniyle ilacın yıkanma riski var.' };
        }
        if (weather.temp.day > 30) {
            return { suitable: false, message: 'Yüksek sıcaklıkta ilaçlama buharlaşma yapabilir ve bitkiyi yakabilir.' };
        }

        return { suitable: true, message: 'İlaçlama için rüzgar ve yağış koşulları uygun.' };
    }
}
