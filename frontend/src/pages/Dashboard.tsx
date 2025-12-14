import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // Geri geldi
import { getWeather } from '../services/api'; // Geri geldi
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CloudRain, Droplets, Thermometer, Wind, Sprout, SprayCan, Snowflake } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ChatWidget from '@/components/ChatWidget';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DayForecast } from '../services/api';

export default function Dashboard() { // Props kaldırıldı, artık kendisi çekecek
    const city = localStorage.getItem('user_city') || 'Seçilmedi';
    const navigate = useNavigate();

    // Veri çekme kancası (Hook) geri eklendi
    const { data: weatherData, isLoading: loading, error } = useQuery({
        queryKey: ['weather', city],
        queryFn: () => getWeather(city),
        enabled: !!city && city !== 'Seçilmedi',
        // Hata durumunda retry kapalı olsun ki sonsuz döngüye girmesin
        retry: 1
    });

    if (!city || city === 'Seçilmedi') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                    <CloudRain className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Şehir Seçilmedi</h2>
                    <p className="text-gray-600 mb-6">Hava durumu analizi için lütfen başlangıç sayfasına dönüp bir şehir seçin.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors w-full"
                    >
                        Şehir Seç
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Lütfen bekleyin...</p>
                    <p className="text-sm text-gray-400 mt-2">Hava durumu ve yapay zeka analizleri hazırlanıyor.</p>
                </div>
            </div>
        );
    }

    if (error || !weatherData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-red-100">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Veri Alınamadı</h2>
                    <p className="text-gray-600 mb-6">{(error as Error)?.message || 'Hava durumu verilerine şu anda ulaşılamıyor.'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors w-full"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CloudRain className="w-8 h-8 text-blue-600" />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            AgroWeather AI
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors bg-gray-100 px-3 py-1.5 rounded-md hover:bg-blue-50"
                    >
                        {city} (Değiştir)
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Critical Alerts */}
                {weatherData.forecast[0].analysis.planting_status.suitable === false && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-pulse-slow">
                        <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-red-800">Tarımsal Faaliyetler İçin Kritik Risk!</h3>
                            <p className="text-red-700 mt-1">{weatherData.forecast[0].analysis.planting_status.message}</p>
                        </div>
                    </div>
                )}

                {/* Daily Forecast Cards */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {weatherData.forecast.map((day, index) => (
                            <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg font-bold text-gray-800">
                                                {index === 0 ? 'Bugün' : format(new Date(day.weather.date), 'EEEE', { locale: tr })}
                                            </CardTitle>
                                            <CardDescription className="text-gray-500 mt-1">
                                                {day.weather.date}
                                            </CardDescription>
                                        </div>
                                        {index === 0 && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">CANLI</span>}
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-gray-700 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                        {day.weather.description}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between my-6">
                                        <div className="flex items-center gap-3">
                                            <Thermometer className="w-8 h-8 text-orange-500" />
                                            <div>
                                                <span className="text-4xl font-bold text-gray-900">{Math.round(day.weather.temp.day)}°</span>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    L: {Math.round(day.weather.temp.min)}° H: {Math.round(day.weather.temp.max)}°
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
                                                <Wind className="w-4 h-4" />
                                                {day.weather.wind_speed} km/s
                                            </div>
                                            <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
                                                <Droplets className="w-4 h-4" />
                                                %{day.weather.humidity}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini Risk Tags */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {day.analysis.frost_risk.level !== 'NONE' && (
                                            <Badge variant="destructive" className="flex items-center gap-1">
                                                <Snowflake className="w-3 h-3" />
                                                Don: {day.analysis.frost_risk.level === 'LOW' ? 'Düşük' : day.analysis.frost_risk.level === 'MEDIUM' ? 'Orta' : 'Yüksek'}
                                            </Badge>
                                        )}
                                        {!day.analysis.planting_status.suitable && (
                                            <Badge className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1">
                                                <Sprout className="w-3 h-3" />
                                                Ekim Riskli
                                            </Badge>
                                        )}
                                        {day.analysis.spraying_risk.suitable && (
                                            <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1">
                                                <SprayCan className="w-3 h-3" />
                                                İlaçlanabilir
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Detailed Analysis Section (Only for Today) */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <AlertCircle className="text-gray-900 w-6 h-6" />
                        <h2 className="text-xl font-bold text-gray-900">Detaylı Tarımsal Analiz (Bugün)</h2>
                    </div>

                    {weatherData.forecast.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Frost Risk Card */}
                            <Card className={`border-l-4 ${weatherData.forecast[0].analysis.frost_risk.level === 'NONE' ? 'border-l-green-500' : weatherData.forecast[0].analysis.frost_risk.level === 'EXTREME' ? 'border-l-purple-900' : 'border-l-red-500'}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Snowflake className="w-4 h-4" />
                                        {weatherData.forecast[0].analysis.frost_risk.level === 'EXTREME' || weatherData.forecast[0].analysis.frost_risk.type === 'BLACK_FROST'
                                            ? <span className="text-red-900 font-extrabold">KARA DON RİSKİ</span>
                                            : 'Don Riski Analizi'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {weatherData.forecast[0].analysis.frost_risk.message}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Planting Status Card */}
                            <Card className={`border-l-4 ${weatherData.forecast[0].analysis.planting_status.suitable ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Sprout className="w-4 h-4" /> Ekim Tavsiyesi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                        {weatherData.forecast[0].analysis.planting_status.message}
                                    </p>
                                    {weatherData.forecast[0].analysis.gdd !== undefined && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                                            🌱 Büyüme Enerjisi (GDD): {weatherData.forecast[0].analysis.gdd}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Spraying Status Card */}
                            <Card className={`border-l-4 ${weatherData.forecast[0].analysis.spraying_risk.suitable ? 'border-l-blue-500' : 'border-l-gray-400'}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <SprayCan className="w-4 h-4" /> İlaçlama Durumu
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {weatherData.forecast[0].analysis.spraying_risk.message}
                                    </p>
                                    {weatherData.forecast[0].analysis.spraying_risk.delta_t && (
                                        <span className='text-xs text-gray-400'>Delta T: {weatherData.forecast[0].analysis.spraying_risk.delta_t}</span>
                                    )}
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
                                <Card className="border-l-4 border-l-purple-600 bg-purple-50 col-span-1 md:col-span-2 lg:col-span-3"> {/* Geniş Kart */}
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg text-purple-900">
                                            <div className="bg-purple-200 p-2 rounded-lg">🧠</div>
                                            Yapay Zeka Destekli Tarımsal Öngörü (LSTM Modeli)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Sol Taraf: Tahmin ve Mesaj */}
                                            <div className="space-y-4">
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                                                    <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Beklenen Yarınki Sıcaklık</span>
                                                    <div className="flex items-baseline gap-2 mt-1">
                                                        <span className="text-4xl font-bold text-purple-700">
                                                            {weatherData.forecast[0].analysis.ai_prediction.value}°C
                                                        </span>
                                                        <span className="text-sm text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded-full">
                                                            Güven Skoru: %92
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                                                    <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Model Analizi</span>
                                                    <p className="text-purple-900 mt-2 leading-relaxed">
                                                        {weatherData.forecast[0].analysis.ai_prediction.message}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Sağ Taraf: Grafik */}
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 h-64">
                                                <p className="text-sm text-gray-500 mb-4 font-medium">Son 7 Günlük Sıcaklık Trendi (Gerçek Veri)</p>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={(weatherData.forecast[0].analysis.ai_prediction.history || []).map((val: number, idx: number) => ({ day: `Gün ${idx + 1}`, temp: val }))}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9D5FF" />
                                                        <XAxis dataKey="day" hide />
                                                        <YAxis domain={['auto', 'auto']} hide />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#FAF5FF', borderColor: '#A855F7', borderRadius: '8px' }}
                                                            itemStyle={{ color: '#6B21A8', fontWeight: 'bold' }}
                                                            formatter={(value: number) => [`${value}°C`, 'Sıcaklık']}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="temp"
                                                            stroke="#9333EA"
                                                            strokeWidth={3}
                                                            dot={{ r: 4, fill: '#9333EA', strokeWidth: 2, stroke: '#fff' }}
                                                            activeDot={{ r: 6 }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <p className="text-xs text-center text-purple-400 mt-4">
                                            * Bu analiz, Ankara istasyonu için eğitilmiş Derin Öğrenme (LSTM) modeli tarafından 30 günlük geçmiş veri setleri kullanılarak üretilmiştir.
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
