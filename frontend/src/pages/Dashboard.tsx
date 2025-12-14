import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWeather } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CloudRain, Droplets, Thermometer, Wind, Sprout, SprayCan, Snowflake } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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
                        </div>
                    )}
                </section>

            </main>

            {/* Floating Chat Button Placeholder */}
            <div className="fixed bottom-6 right-6 z-50">
                <button className="bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg flex items-center gap-2 transition-all hover:scale-105">
                    <span className="font-bold text-lg">?</span>
                    <span className="hidden md:inline font-medium">Asistana Sor</span>
                </button>
            </div>
        </div>
    );
}
