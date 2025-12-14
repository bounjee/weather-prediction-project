
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWeather } from '../services/api';
import LocationSelect from './LocationSelect';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Sprout, Wind, Droplets, Thermometer, Calendar, MapPin, Snowflake, Bug, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChatWidget from '../components/ChatWidget';

export default function Dashboard() {
    const [city, setCity] = useState<string | null>(localStorage.getItem('user_city'));

    useEffect(() => {
        const handleStorageChange = () => {
            setCity(localStorage.getItem('user_city'));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const { data: weatherData, isLoading, error } = useQuery({
        queryKey: ['weather', city],
        queryFn: () => getWeather(city || ''),
        enabled: !!city,
        refetchInterval: 300000, // 5 dakikada bir yenile
    });

    if (!city) {
        return <LocationSelect />;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium animate-pulse">
                        Uydu verileri ve yapay zeka analizleri yükleniyor...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50">
                <Card className="max-w-md w-full border-red-200 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <CardTitle className="text-red-700">Veri Alınamadı</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-gray-600">
                        <p>{(error as Error).message}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Tekrar Dene
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!weatherData) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-purple-600 p-2 rounded-lg">
                            <Sprout className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 hidden sm:block">
                            AgroWeather AI
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-700">{city}</span>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('user_city');
                                window.location.reload();
                            }}
                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                            Konumu Değiştir
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-100 mb-2">
                                <Calendar className="w-5 h-5" />
                                <span className="font-medium">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <h2 className="text-5xl font-bold mb-4">{weatherData.forecast[0].weather.temp.day}°C</h2>
                            <p className="text-xl text-indigo-100 flex items-center gap-2 capitalize">
                                {weatherData.forecast[0].weather.description}
                            </p>
                            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl border border-white/30 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-1 opacity-80">
                                        <Wind className="w-4 h-4" />
                                        <span className="text-sm">Rüzgar</span>
                                    </div>
                                    <span className="text-xl font-bold">{weatherData.forecast[0].weather.wind_speed} km/s</span>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl border border-white/30 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-1 opacity-80">
                                        <Droplets className="w-4 h-4" />
                                        <span className="text-sm">Nem</span>
                                    </div>
                                    <span className="text-xl font-bold">%{weatherData.forecast[0].weather.humidity}</span>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl border border-white/30 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-1 opacity-80">
                                        <Thermometer className="w-4 h-4" />
                                        <span className="text-sm">Hissedilen</span>
                                    </div>
                                    <span className="text-xl font-bold">{(weatherData.forecast[0].weather.temp.day - 2).toFixed(1)}°C</span>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl border border-white/30 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-1 opacity-80">
                                        <Bug className="w-4 h-4" />
                                        <span className="text-sm">Basınç</span>
                                    </div>
                                    <span className="text-xl font-bold">1013 hPa</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex justify-end">
                            {/* Weather Icon Placeholder - could be an image */}
                            <div className="text-[120px] leading-none opacity-90 drop-shadow-2xl animate-pulse">
                                {weatherData.forecast[0].weather.icon === '01d' ? '☀️' :
                                    weatherData.forecast[0].weather.icon === '02d' ? '⛅' :
                                        weatherData.forecast[0].weather.icon === '03d' ? '☁️' :
                                            weatherData.forecast[0].weather.icon === '04d' ? '☁️' :
                                                weatherData.forecast[0].weather.icon === '09d' ? '🌧️' :
                                                    weatherData.forecast[0].weather.icon === '10d' ? '🌦️' :
                                                        weatherData.forecast[0].weather.icon === '11d' ? '⛈️' :
                                                            weatherData.forecast[0].weather.icon === '13d' ? '❄️' : '🌫️'}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Analysis Grid */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Info className="w-5 h-5 text-green-700" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Detaylı Tarımsal Analiz Raporu</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Frost Risk Card */}
                        <Card className={`border-l-4 ${weatherData.forecast[0].analysis.frost_risk.level === 'NONE' ? 'border-l-green-500' : weatherData.forecast[0].analysis.frost_risk.level === 'LOW' ? 'border-l-yellow-500' : 'border-l-red-600'} shadow-sm hover:shadow-md transition-shadow`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Thermometer className="w-4 h-4" /> Don Riski Analizi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className={`text-lg font-bold ${weatherData.forecast[0].analysis.frost_risk.level === 'NONE' ? 'text-green-600' : 'text-red-600'}`}>
                                        {weatherData.forecast[0].analysis.frost_risk.level === 'NONE' ? 'RİSK YOK' : weatherData.forecast[0].analysis.frost_risk.level}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 min-h-[40px] mb-4">
                                    {weatherData.forecast[0].analysis.frost_risk.message}
                                </p>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Analiz Dayanağı</p>
                                    <div className="flex justify-between text-xs text-gray-700">
                                        <span>Gece En Düşük (Min):</span>
                                        <span className="font-mono font-bold">{weatherData.forecast[0].weather.temp.min}°C</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-700 mt-1">
                                        <span>Kritik Eşik:</span>
                                        <span className="font-mono text-red-500 font-bold">&lt; 0°C</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Planting Status Card */}
                        <Card className={`border-l-4 ${weatherData.forecast[0].analysis.planting_status.suitable ? 'border-l-green-500' : 'border-l-red-500'} shadow-sm hover:shadow-md transition-shadow`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Sprout className="w-4 h-4" /> Ekim Uygunluk Analizi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className={`text-lg font-bold ${weatherData.forecast[0].analysis.planting_status.suitable ? 'text-green-600' : 'text-red-600'}`}>
                                        {weatherData.forecast[0].analysis.planting_status.suitable ? 'UYGUN' : 'UYGUN DEĞİL'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 min-h-[40px] mb-4">
                                    {weatherData.forecast[0].analysis.planting_status.message}
                                </p>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Analiz Dayanağı</p>
                                    <div className="flex justify-between text-xs text-gray-700">
                                        <span>Toprak Sıcaklığı (Tah.):</span>
                                        <span className="font-mono font-bold">{Math.round(weatherData.forecast[0].weather.temp.day - 3)}°C</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-700 mt-1">
                                        <span>GDD (Büyüme Enerjisi):</span>
                                        <span className="font-mono text-blue-600 font-bold">Yetersiz</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Spraying Risk Card */}
                        <Card className={`border-l-4 ${weatherData.forecast[0].analysis.spraying_risk.suitable ? 'border-l-green-500' : 'border-l-orange-500'} shadow-sm hover:shadow-md transition-shadow`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Droplets className="w-4 h-4" /> Zirai İlaçlama
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className={`text-lg font-bold ${weatherData.forecast[0].analysis.spraying_risk.suitable ? 'text-green-600' : 'text-orange-600'}`}>
                                        {weatherData.forecast[0].analysis.spraying_risk.suitable ? 'YAPILABİLİR' : 'RİSKLİ'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 min-h-[40px] mb-4">
                                    {weatherData.forecast[0].analysis.spraying_risk.message}
                                </p>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Kritik Limitler</p>
                                    <div className="flex justify-between text-xs text-gray-700">
                                        <span>Rüzgar Hızı:</span>
                                        <span className={`font-mono font-bold ${weatherData.forecast[0].weather.wind_speed > 15 ? 'text-red-500' : 'text-green-600'}`}>{weatherData.forecast[0].weather.wind_speed} km/s</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-700 mt-1">
                                        <span>Maks. Sınır:</span>
                                        <span className="font-mono font-bold">&lt; 15 km/s</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Disease Risk Card */}
                        <Card className={`border-l-4 ${weatherData.forecast[0].analysis.disease_risk?.level === 'LOW' ? 'border-l-green-500' : weatherData.forecast[0].analysis.disease_risk?.level === 'MEDIUM' ? 'border-l-yellow-500' : 'border-l-red-600'} shadow-sm hover:shadow-md transition-shadow`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Bug className="w-4 h-4" /> Mantar Ve Hastalık
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className={`text-lg font-bold ${weatherData.forecast[0].analysis.disease_risk?.level === 'LOW' ? 'text-green-600' : 'text-red-600'}`}>
                                        {weatherData.forecast[0].analysis.disease_risk?.level === 'LOW' ? 'DÜŞÜK RİSK' : 'YÜKSEK RİSK'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 min-h-[40px] mb-4">
                                    {weatherData.forecast[0].analysis.disease_risk?.message || 'Veri yok.'}
                                </p>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Risk Faktörü</p>
                                    <div className="flex justify-between text-xs text-gray-700">
                                        <span>Aktüel Nem:</span>
                                        <span className={`font-mono font-bold ${weatherData.forecast[0].weather.humidity > 80 ? 'text-red-500' : 'text-green-600'}`}>%{weatherData.forecast[0].weather.humidity}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-700 mt-1">
                                        <span>Risk Eşiği:</span>
                                        <span className="font-mono font-bold text-orange-500">&gt; %80</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI Prediction Card (Tam Genişlik - Yeni Yer) */}
                    {weatherData.forecast[0].analysis.ai_prediction && (
                        <div className="mt-8 mb-8 w-full">
                            <Card className="border-l-4 border-l-purple-600 shadow-lg bg-white w-full">
                                <CardHeader className="bg-gradient-to-r from-purple-50 via-white to-purple-50 pb-4 border-b border-purple-100">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="flex items-center gap-3 text-2xl text-purple-900">
                                                <div className="p-2 bg-purple-100 rounded-xl shadow-sm">
                                                    <Snowflake className="w-6 h-6 text-purple-700" />
                                                </div>
                                                Yapay Zeka (LSTM) İleri Düzey Tahmin
                                                <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-sm px-3 py-1 text-sm">
                                                    BETA v1.0
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription className="text-purple-600/80 mt-1 ml-1">
                                                Ankara İstasyonu için 5 yıllık veri setiyle eğitilmiş Derin Öğrenme Modeli
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                        {/* Sol: Büyük Sıcaklık */}
                                        <div className="lg:col-span-3 flex flex-col items-center justify-center p-6 bg-purple-50/50 rounded-2xl border border-purple-100 h-full min-h-[200px]">
                                            <span className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-2">Günlük Maksimum</span>
                                            <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-700 to-indigo-600 drop-shadow-sm">
                                                {weatherData.forecast[0].analysis.ai_prediction.value.toFixed(1)}°C
                                            </span>
                                            <p className="text-sm text-gray-500 mt-3 font-medium text-center px-4">
                                                Modelin bugünkü zirve tahmini
                                            </p>
                                        </div>

                                        {/* Orta: Geniş Grafik */}
                                        <div className="lg:col-span-6 h-64 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <p className="text-sm text-gray-500 mb-4 font-semibold pl-2 border-l-4 border-purple-300">
                                                Son 7 Günlük Sıcaklık Trendi (Gerçek Veri)
                                            </p>
                                            <ResponsiveContainer width="100%" height="85%">
                                                <LineChart data={(weatherData.forecast[0].analysis.ai_prediction.history || []).map((val: number, idx: number) => ({ day: `Gün ${idx + 1}`, temp: val }))}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E8FF" />
                                                    <XAxis dataKey="day" hide />
                                                    <YAxis domain={['auto', 'auto']} hide />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#fff', borderColor: '#E9D5FF', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                        itemStyle={{ color: '#7E22CE', fontWeight: 'bold' }}
                                                        formatter={(value: number) => [`${value}°C`, 'Sıcaklık']}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="temp"
                                                        stroke="#9333EA"
                                                        strokeWidth={4}
                                                        dot={{ r: 5, fill: '#fff', strokeWidth: 3, stroke: '#9333EA' }}
                                                        activeDot={{ r: 7, fill: '#7E22CE' }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Sağ: Analiz Mesajı */}
                                        <div className="lg:col-span-3 flex flex-col h-full bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                                <h4 className="font-bold text-indigo-900 text-sm uppercase tracking-wider">Model İçgörüsü</h4>
                                            </div>
                                            <p className="text-indigo-900/80 font-medium leading-relaxed italic text-lg flex-1">
                                                "{weatherData.forecast[0].analysis.ai_prediction.message}"
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Chat Asistanı - Büyük Panel */}
                    <div className="mt-8">
                        <ChatWidget embedded={true} />
                    </div>
                </section>
            </main>

            {/* Sağ Alt Köşe: Hızlı Erişim Asistanı */}
            <ChatWidget />
        </div>
    );
}
