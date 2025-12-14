import { WeatherData, AgroAnalysis } from '../types';

export class DecisionEngine {

    public static analyze(weather: WeatherData): AgroAnalysis {
        const dewPoint = this.calculateDewPoint(weather.temp.min, weather.humidity);
        const gdd = this.calculateGDD(weather.temp.max, weather.temp.min);

        return {
            frost_risk: this.assessFrostRealism(weather.temp.min, dewPoint),
            planting_status: this.assessPlanting(weather, gdd),
            spraying_risk: this.assessSpraying(weather),
            disease_risk: this.assessDiseaseRisk(weather, gdd),
            gdd: gdd
        };
    }

    // Magnus Formula for Dew Point
    private static calculateDewPoint(temp: number, humidity: number): number {
        return temp - ((100 - humidity) / 5);
    }

    private static calculateGDD(maxTemp: number, minTemp: number): number {
        const BASE_TEMP = 5; // Wheat/Cereals
        const gdd = ((maxTemp + minTemp) / 2) - BASE_TEMP;
        return gdd > 0 ? parseFloat(gdd.toFixed(1)) : 0;
    }

    private static assessFrostRealism(minTemp: number, dewPoint: number): AgroAnalysis['frost_risk'] {
        // 1. Black Frost Risk (Kara Don - En Tehlikelisi)
        // Sıcaklık 0'ın altında ama Çiğlenme noktası daha da düşükse (Nem yoksa)
        if (minTemp <= 0 && dewPoint <= -3 && (minTemp - dewPoint) > 2) {
            return {
                level: 'EXTREME',
                type: 'BLACK_FROST',
                message: `🔴 KARA DON RİSKİ! Nem çok düşük, donma gözle görülmeyebilir ama bitki özsuyu donabilir. Kritik önlem şart.`
            };
        }

        // 2. White Frost (Kırağı)
        if (minTemp <= 0) {
            if (minTemp <= -4) return { level: 'HIGH', type: 'WHITE_FROST', message: 'Şiddetli zirai don (Kırağı) bekleniyor.' };
            if (minTemp <= -2) return { level: 'MEDIUM', type: 'WHITE_FROST', message: 'Orta kuvvette don. Kırağı oluşabilir.' };
            return { level: 'LOW', type: 'WHITE_FROST', message: 'Hafif don riski. Çukur alanlarda kırağı görülebilir.' };
        }

        // 3. Near Frost (Sınırda)
        if (minTemp <= 2) {
            return { level: 'LOW', message: 'Sıcaklık don noktasına yakın. Rüzgar kesilirse lokal don oluşabilir.' };
        }

        return { level: 'NONE', message: 'Don riski bulunmuyor.' };
    }

    private static assessPlanting(weather: WeatherData, gdd: number): AgroAnalysis['planting_status'] {
        // GDD Kontrolü (Büyüme enerjisi var mı?)
        if (gdd <= 0) {
            return { suitable: false, risk_factor: 'GDD_LOW', message: 'Büyüme Derece Günleri (GDD) yetersiz. Bitki gelişimi durabilir.' };
        }

        // Toprak Sıcaklığı (Tahmini)
        if (weather.temp.day < 5) {
            return { suitable: false, risk_factor: 'COLD', message: 'Toprak sıcaklığı çimlenme için yetersiz.' };
        }

        // Aşırı yağış
        if (weather.precipitation_prob > 60) {
            return { suitable: false, risk_factor: 'WET', message: 'Yüksek yağış ihtimali nedeniyle toprak çamur olabilir.' };
        }

        // Rüzgar
        if (weather.wind_speed > 25) {
            return { suitable: false, risk_factor: 'WINDY', message: 'Şiddetli rüzgar tohumu savurabilir.' };
        }

        return { suitable: true, risk_factor: 'NONE', message: `Ekim için koşullar uygun. (GDD Potansiyeli: +${gdd})` };
    }

    private static assessSpraying(weather: WeatherData): AgroAnalysis['spraying_risk'] {
        // Delta T Hesabı (Yaklaşık: T_dry - T_wet) -> Basitleştirilmiş: (Temp - DewPoint) / 3 gibi bir yaklaşım veya direkt Temp/Humidity
        // İdeal Delta T: 2 ile 8 arası.

        // Rüzgar
        if (weather.wind_speed > 15) {
            return { suitable: false, message: `Rüzgar hızı (${weather.wind_speed} km/s) ilaçlama için yüksek (Sürüklenme Riski).` };
        }

        // Yağış
        if (weather.precipitation_prob > 40) {
            return { suitable: false, message: 'Yağmur riski var, ilaç yıkanabilir.' };
        }

        // Sıcaklık
        if (weather.temp.day > 30) {
            return { suitable: false, message: 'Yüksek sıcaklık (Buharlaşma Riski).' };
        }

        return { suitable: true, message: 'İlaçlama için rüzgar, sıcaklık ve nem dengesi uygun.' };
    }

    private static assessDiseaseRisk(weather: WeatherData, gdd: number): AgroAnalysis['disease_risk'] {
        // Mantar Hastalığı: Ilık (15-25C) ve Nemli (>85%) hava
        const isWarm = weather.temp.day >= 15 && weather.temp.day <= 28;
        const isHumid = weather.humidity > 80;
        const isWet = weather.precipitation_prob > 30;

        if (isWarm && isHumid && isWet) {
            return { level: 'HIGH', message: '⚠️ YÜKSEK MANTAR RİSKİ! Ilık ve çok nemli hava fungal enfeksiyonları tetikleyebilir.' };
        }

        if (isWarm && isHumid) {
            return { level: 'MEDIUM', message: 'Neme bağlı hastalık riski artıyor. Gözlem yapılması önerilir.' };
        }

        return { level: 'LOW', message: 'Hastalık gelişimi için ortam koşulları düşük riskli.' };
    }
}
