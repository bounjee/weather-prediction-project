import { WeatherService } from './WeatherService';

export class ChatService {
    private weatherService: WeatherService;

    constructor() {
        this.weatherService = new WeatherService();
    }

    async processMessage(message: string, city: string): Promise<string> {
        const lowerMsg = message.toLowerCase();

        // 1. Get Weather Data Context
        const forecasts = await this.weatherService.getForecast(city);
        const today = forecasts[0];
        const tomorrow = forecasts[1];

        // Simple Intent Classification
        if (lowerMsg.includes('merhaba') || lowerMsg.includes('selam')) {
            return `Merhaba! Ben ${city} bölgesi için tarımsal hava durumu asistanınım. Size don riski, ekim zamanı veya ilaçlama konularında yardımcı olabilirim.`;
        }

        if (lowerMsg.includes('don') || lowerMsg.includes('soğuk')) {
            const risk = today.analysis.frost_risk;
            if (risk.level === 'HIGH' || risk.level === 'MEDIUM') {
                return `⚠️ DİKKAT: ${risk.message} Bu gece en düşük sıcaklık ${today.weather.temp.min}°C olacak.`;
            } else if (risk.level === 'LOW') {
                return `Hafif bir don riski var (${today.weather.temp.min}°C). Çukur alanlardaki hassas bitkileri korumanızı öneririm.`;
            } else {
                return 'Şu an için önemli bir don riski görünmüyor.';
            }
        }

        if (lowerMsg.includes('ekim') || lowerMsg.includes('fiğ') || lowerMsg.includes('buğday') || lowerMsg.includes('tohum')) {
            const status = today.analysis.planting_status;
            if (status.suitable) {
                return '✅ Toprak ve hava koşulları ekim için uygun görünüyor. Rüzgar ve yağış seviyeleri makul.';
            } else {
                return `❌ Ekim yapmanız şu an için önerilmez. ${status.message}`;
            }
        }

        if (lowerMsg.includes('ilaç') || lowerMsg.includes('gübre')) {
            const spray = today.analysis.spraying_risk;
            if (spray.suitable) {
                return '✅ İlaçlama yapabilirsiniz. Rüzgar sürüklenmesi veya yağmurla yıkanma riski düşük.';
            } else {
                return `❌ İlaçlama için uygun olmayan koşullar var. ${spray.message}`;
            }
        }

        if (lowerMsg.includes('yağmur') || lowerMsg.includes('yağış')) {
            if (today.weather.precipitation_prob > 50) {
                return `Evet, bugün yağış ihtimali yüksek (%${today.weather.precipitation_prob}). Yanınıza yağmurluk almayı unutmayın.`;
            } else {
                return `Bugün önemli bir yağış beklenmiyor (Olasılık: %${today.weather.precipitation_prob}).`;
            }
        }

        if (lowerMsg.includes('hastalık') || lowerMsg.includes('mantar')) {
            const disease = today.analysis.disease_risk;
            if (disease.level === 'HIGH' || disease.level === 'MEDIUM') {
                return `⚠️ DİKKAT: ${disease.message} Nemli hava mantar riskini artırıyor. Önleyici tedbir almalısınız.`;
            } else {
                return 'Mantar gibi nem kaynaklı hastalıklar için risk şu an düşük seviyede.';
            }
        }

        if (lowerMsg.includes('yapay zeka') || lowerMsg.includes('ai') || lowerMsg.includes('tahmin') || lowerMsg.includes('trend') || lowerMsg.includes('model')) {
            const ai = today.analysis.ai_prediction;
            if (ai) {
                return `🤖 Yapay Zeka Modelim Analizi: "${ai.message}"\nTahmin edilen sıcaklık: ${ai.value.toFixed(1)}°C.`;
            } else {
                return 'Yapay zeka modeline şu an erişilemiyor veya bu şehir için aktif değil.';
            }
        }

        if (lowerMsg.includes('yarın')) {
            return `Yarın hava ${tomorrow.weather.description}, sıcaklık gün içinde ${tomorrow.weather.temp.day}°C civarında olacak.`;
        }

        // Fallback
        return `${city} için şu an hava ${today.weather.description} ve ${today.weather.temp.day}°C. Size başka nasıl yardımcı olabilirim?`;
    }
}
