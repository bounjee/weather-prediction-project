import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWeather } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CloudRain, Droplets, Thermometer, Wind, Sprout, SprayCan, Snowflake } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ChatWidget from '@/components/ChatWidget';

export default function Dashboard() {
    const city = localStorage.getItem('user_city') || 'Seçilmedi';
    const navigate = useNavigate();

    const { data: weatherData, isLoading, error } = useQuery({
        queryKey: ['weather', city],
        queryFn: () => getWeather(city),
        enabled: !!city && city !== 'Seçilmedi',
    });

    if (!city || city === 'Seçilmedi') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900">Konum Seçilmedi</h2>
                    <p className="mt-2 text-gray-600 mb-6">Hava durumu verilerini görmek için lütfen önce bir il seçin.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Konum Seç
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center text-red-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>Veri alınırken bir hata oluştu. Lütfen tekrar deneyin.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 text-blue-500 underline"
                    >
                        Yenile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Section */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full mb-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tarım Asistanı</h1>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <span className="font-medium text-gray-700">{weatherData?.city}</span> İçin Hava Tahmini
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Konumu Değiştir
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Prediction Summary Banner */}
                {weatherData && (
                    <div className={`p-6 rounded-xl border-l-8 text-white shadow-md flex items-start gap-4 ${!weatherData.forecast[0].analysis.planting_status.suitable || weatherData.forecast[0].analysis.frost_risk.level !== 'NONE'
                        ? 'bg-gradient-to-r from-red-600 to-red-500 border-red-800'
                        : 'bg-gradient-to-r from-green-600 to-green-500 border-green-800'
                        }`}>
                        <div className="bg-white/20 p-3 rounded-full">
                            {(!weatherData.forecast[0].analysis.planting_status.suitable || weatherData.forecast[0].analysis.frost_risk.level !== 'NONE')
                                ? <AlertCircle className="w-8 h-8 text-white" />
                                : <Sprout className="w-8 h-8 text-white" />
                            }
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">
                                {(!weatherData.forecast[0].analysis.planting_status.suitable || weatherData.forecast[0].analysis.frost_risk.level !== 'NONE')
                                    ? 'Tarımsal Faaliyetler İçin Kritik Risk!'
                                    : 'Tarımsal Faaliyetler İçin Uygun Koşullar'
                                }
                            </h2>
                            <p className="text-white/90 text-sm opacity-90">
                                {(!weatherData.forecast[0].analysis.planting_status.suitable)
                                    ? `Bugün ekim yapılması önerilmiyor: ${weatherData.forecast[0].analysis.planting_status.message}`
                                    : weatherData.forecast[0].analysis.frost_risk.level !== 'NONE'
                                        ? `Don riski mevcut: ${weatherData.forecast[0].analysis.frost_risk.message}`
                                        : 'Bugün hava koşulları ekim, gübreleme ve ilaçlama için elverişli görünüyor.'
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* Daily Forecast Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {weatherData?.forecast.map((day, index) => {
                        const dateLabel = index === 0 ? 'Bugün' : index === 1 ? 'Yarın' : format(new Date(day.weather.date), 'EEEE', { locale: tr });

                        return (
                            <Card key={index} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                                <CardHeader className="bg-gray-50/50 pb-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg font-bold text-gray-800">{dateLabel}</CardTitle>
                                        <span className="text-xs text-gray-500">{day.weather.date}</span>
                                    </div>
                                    <CardDescription className="capitalize flex items-center gap-2">
                                        {/* Simple icon logic based on description/mock */}
                                        {day.weather.description.toLowerCase().includes('yağ') ? <CloudRain className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full bg-yellow-400" />}
                                        {day.weather.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-6 space-y-6">
                                    {/* Temperature Section */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Thermometer className="w-8 h-8 text-orange-500" />
                                            <div>
                                                <span className="text-3xl font-bold tracking-tighter">{day.weather.temp.day}°</span>
                                                <div className="flex gap-2 text-xs text-muted-foreground">
                                                    <span>L: {day.weather.temp.min}°</span>
                                                    <span>H: {day.weather.temp.max}°</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="flex items-center gap-1 justify-end text-sm text-gray-600">
                                                <Wind className="w-4 h-4" />
                                                <span>{day.weather.wind_speed} km/s</span>
                                            </div>
                                            <div className="flex items-center gap-1 justify-end text-sm text-gray-600">
                                                <Droplets className="w-4 h-4" />
                                                <span>%{day.weather.humidity}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Analysis Badges (Compact) */}
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                        {day.analysis.frost_risk.level !== 'NONE' && (
                                            <Badge variant="destructive" className="gap-1">
                                                <Snowflake className="w-3 h-3" />
                                                Don: {day.analysis.frost_risk.level === 'HIGH' ? 'Yüksek' : day.analysis.frost_risk.level === 'MEDIUM' ? 'Orta' : 'Düşük'}
                                            </Badge>
                                        )}

                                        <Badge variant={day.analysis.planting_status.suitable ? "success" : "warning"} className="gap-1">
                                            <Sprout className="w-3 h-3" />
                                            {day.analysis.planting_status.suitable ? 'Ekime Uygun' : 'Ekim Riskli'}
                                        </Badge>

                                        <Badge variant={day.analysis.spraying_risk.suitable ? "info" : "destructive"} className="gap-1">
                                            <SprayCan className="w-3 h-3" />
                                            {day.analysis.spraying_risk.suitable ? 'İlaçlanabilir' : 'İlaçlama Riskli'}
                                        </Badge>
                                    </div>

                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Detailed Alerts Section */}
                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        Detaylı Tarımsal Analiz (Bugün)
                    </h3>

                    {weatherData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Frost Card */}
                            <Card className={`border-l-4 ${weatherData.forecast[0].analysis.frost_risk.level === 'NONE' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Snowflake className="w-4 h-4" /> Don Riski Analizi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">
                                        {weatherData.forecast[0].analysis.frost_risk.message}
                                    </p>
                                    {/* Black Frost Alert */}
                                    {weatherData.forecast[0].analysis.frost_risk.type === 'BLACK_FROST' && (
                                        <div className="mt-2 text-xs bg-black text-white px-2 py-1 rounded inline-block font-bold">
                                            KARA DON RİSKİ
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Planting Card */}
                            <Card className={`border-l-4 ${weatherData.forecast[0].analysis.planting_status.suitable ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Sprout className="w-4 h-4" /> Ekim Tavsiyesi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">
                                        {weatherData.forecast[0].analysis.planting_status.message}
                                    </p>
                                    {/* GDD Info */}
                                    {weatherData.forecast[0].analysis.gdd !== undefined && (
                                        <p className="text-xs text-blue-600 mt-2 font-medium">
                                            🌱 Büyüme Enerjisi (GDD): {weatherData.forecast[0].analysis.gdd}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Spraying Card */}
                            <Card className={`border-l-4 ${weatherData.forecast[0].analysis.spraying_risk.suitable ? 'border-l-blue-500' : 'border-l-red-500'}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <SprayCan className="w-4 h-4" /> İlaçlama Durumu
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">
                                        {weatherData.forecast[0].analysis.spraying_risk.message}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Disease Risk Card */}
                            <Card className={`border-l-4 ${weatherData.forecast[0].analysis.disease_risk?.level === 'LOW' ? 'border-l-green-500' : weatherData.forecast[0].analysis.disease_risk?.level === 'MEDIUM' ? 'border-l-yellow-500' : 'border-l-red-600'}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <AlertCircle className="w-4 h-4" /> Mantar Hastalık Riski
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">
                                        {weatherData.forecast[0].analysis.disease_risk?.message || 'Veri yok.'}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* AI Prediction Card (NEW) */}
                            {weatherData.forecast[0].analysis.ai_prediction && (
                                <Card className="border-l-4 border-l-purple-600 bg-purple-50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base text-purple-900">
                                            <div className="bg-purple-200 p-1 rounded">🧠</div>
                                            Yapay Zeka (LSTM) Tahmini
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-purple-800 font-medium">
                                            {weatherData.forecast[0].analysis.ai_prediction.message}
                                        </p>
                                        <p className="text-xs text-purple-600 mt-1">
                                            * Bu tahmin, Ankara için eğitilmiş LSTM Derin Öğrenme modeli tarafından oluşturulmuştur.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </section>

            </main>

            {/* Chat Widget */}
            <ChatWidget />
        </div>
    );
}
