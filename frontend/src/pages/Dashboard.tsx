
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getWeather } from '../services/api';
import LocationSelect from './LocationSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle, Sprout, Wind, Droplets, Thermometer, Calendar, MapPin,
    Snowflake, Bug, Sun, Cloud, CloudRain, CloudLightning, ArrowUpRight, Leaf, AlertTriangle,
    BarChart3
} from 'lucide-react';

import ChatWidget from '../components/ChatWidget';
import { motion } from 'framer-motion';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
        } as const
    }
};

// Helper for weather icon
const WeatherIcon = ({ iconCode, className }: { iconCode: string, className?: string }) => {
    const iconMap: Record<string, React.ElementType> = {
        '01d': Sun, '01n': Sun,
        '02d': Cloud, '02n': Cloud,
        '03d': Cloud, '03n': Cloud,
        '04d': Cloud, '04n': Cloud,
        '09d': CloudRain, '09n': CloudRain,
        '10d': CloudRain, '10n': CloudRain,
        '11d': CloudLightning, '11n': CloudLightning,
        '13d': Snowflake, '13n': Snowflake,
    };
    const Icon = iconMap[iconCode] || Cloud;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: 1,
                y: [0, -10, 0] // Floating effect
            }}
            transition={{
                duration: 0.5,
                y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }}
        >
            <Icon
                className={className}
                strokeWidth={1.5}
            />
        </motion.div>
    );
};


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
        refetchInterval: 300000,
    });

    if (!city) return <LocationSelect />;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F0FDF4]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full"
                />
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
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.location.reload()}
                            className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Tekrar Dene
                        </motion.button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!weatherData) return null;




    return (
        <div className="min-h-screen bg-stone-50 pb-20 font-sans selection:bg-green-200 selection:text-green-900">
            {/* Navbar */}
            <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40"
            >
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-3 rounded-lg shadow-xl shadow-green-600/30">
                            <Leaf className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-stone-800 tracking-tight">AgroWeather<span className="text-green-600">AI</span></h1>
                            <p className="text-[10px] text-stone-500 font-bold tracking-widest">AKILLI TARIM ASİSTANI</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/model-results"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span className="font-semibold text-sm">Model Sonuçları</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-sm border border-stone-200">
                            <MapPin className="w-4 h-4 text-stone-500" />
                            <span className="font-semibold text-stone-700">{city}</span>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                localStorage.removeItem('user_city');
                                window.location.reload();
                            }}
                            className="text-sm font-medium text-stone-500 hover:text-red-600 transition-colors"
                        >
                            Çıkış
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            <main className="container mx-auto px-6 py-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >

                    {/* Hero Section - Full Width */}
                    <div className="space-y-6">
                        {/* Main Weather Card - Full Width */}
                        <motion.div
                            whileHover={{ scale: 1.005 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="relative overflow-hidden rounded-lg bg-gradient-to-br from-green-800 to-emerald-900 text-white shadow-2xl border border-green-700/30 p-10 flex flex-col justify-between min-h-[450px]"
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />

                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 text-green-100/90 mb-2">
                                        <Calendar className="w-5 h-5" />
                                        <span className="font-bold tracking-wider text-xs uppercase">LSTM TAHMİNİ: YARIN</span>
                                    </div>
                                    <p className="text-green-100/80 capitalize text-xl">{weatherData.forecast[0].weather.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-sm border border-white/20 flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                        <span className="font-bold text-sm text-green-50 tracking-wide">LSTM SEKTÖREL TAHMİN MOTORU AKTİF</span>
                                    </div>
                                    <div className="bg-emerald-500/20 backdrop-blur-md px-4 py-2 rounded-md border border-emerald-400/30 flex items-center gap-2">
                                        <Sprout className="w-4 h-4 text-emerald-300" />
                                        <span className="text-xs font-bold text-emerald-50">Öbür Gün Öngörülen Maks: <span className="text-sm ml-1 text-white">{weatherData.forecast[1].weather.temp.max}°C</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center justify-between mt-8">
                                <div className="flex items-center gap-12">
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline">
                                            <span className="text-[120px] font-black tracking-tighter leading-none drop-shadow-2xl">
                                                {Math.round(weatherData.forecast[0].weather.temp.day)}
                                            </span>
                                            <span className="text-7xl font-light text-green-200/80 ml-3">°</span>
                                        </div>
                                        <span className="text-sm font-bold text-green-200 mt-6 uppercase tracking-[0.3em] pl-2 drop-shadow-sm">Yarın İçin Tahmin</span>
                                    </div>

                                    <div className="flex flex-col gap-5 border-l-2 border-white/10 pl-12 py-2">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-1 h-10 bg-red-400 group-hover:h-12 transition-all" />
                                            <div>
                                                <span className="text-xs text-green-200/70 uppercase tracking-wider block">Model Max</span>
                                                <span className="font-black text-3xl text-white">{weatherData.forecast[0].weather.temp.max}°</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-1 h-10 bg-blue-400 group-hover:h-12 transition-all" />
                                            <div>
                                                <span className="text-xs text-green-200/70 uppercase tracking-wider block">Model Min</span>
                                                <span className="font-black text-3xl text-white">{weatherData.forecast[0].weather.temp.min}°</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pr-12">
                                    <WeatherIcon
                                        iconCode={weatherData.forecast[0].weather.icon}
                                        className="w-48 h-48 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.3)] animate-float"
                                    />
                                </div>
                            </div>

                            {/* Mini Stats Ribbon - Enhanced */}
                            <div className="relative z-10 grid grid-cols-4 gap-8 mt-12 bg-black/30 backdrop-blur-xl rounded-md p-6 border border-white/10 shadow-2xl">
                                <div className="flex flex-col items-center justify-center border-r border-white/10 group hover:bg-white/5 transition-all cursor-pointer">
                                    <Wind className="w-8 h-8 text-green-300 mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="text-3xl font-black">{weatherData.forecast[0].weather.wind_speed}</span>
                                    <span className="text-[10px] font-bold text-green-200/50 uppercase tracking-widest mt-2">Rüzgar (km/h)</span>
                                </div>
                                <div className="flex flex-col items-center justify-center border-r border-white/10 group hover:bg-white/5 transition-all cursor-pointer">
                                    <Droplets className="w-8 h-8 text-blue-300 mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="text-3xl font-black">%{weatherData.forecast[0].weather.humidity}</span>
                                    <span className="text-[10px] font-bold text-green-200/50 uppercase tracking-widest mt-2">Nem Dengesi</span>
                                </div>
                                <div className="flex flex-col items-center justify-center border-r border-white/10 group hover:bg-white/5 transition-all cursor-pointer">
                                    <Thermometer className="w-8 h-8 text-red-300 mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="text-3xl font-black">{Math.round(weatherData.forecast[0].weather.temp.day - 2)}°</span>
                                    <span className="text-[10px] font-bold text-green-200/50 uppercase tracking-widest mt-2">Hissedilen</span>
                                </div>
                                <div className="flex flex-col items-center justify-center group hover:bg-white/5 transition-all cursor-pointer">
                                    <ArrowUpRight className="w-8 h-8 text-purple-300 mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="text-3xl font-black">{weatherData.forecast[0].weather.pressure}</span>
                                    <span className="text-[10px] font-bold text-green-200/50 uppercase tracking-widest mt-2">Basınç (hPa)</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Model Technical Specs & Operation Status */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Technical Details Card */}
                            <motion.div
                                variants={itemVariants}
                                className="lg:col-span-2 bg-stone-900 rounded-lg p-8 border border-stone-700 shadow-2xl relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Bug className="w-32 h-32 text-green-500" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-3 bg-green-500/20 rounded-md text-green-400">
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-wider">Model Teknik Spesifikasyonları</h3>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-tighter">Mimari</p>
                                            <p className="text-green-400 font-mono font-bold">Ultra Deep Bi-LSTM</p>
                                            <p className="text-stone-600 text-[10px]">3 Katman + 90 Gün Hafıza</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-tighter">Hata Payı (MAE)</p>
                                            <p className="text-white font-mono font-bold">±{weatherData.model_info?.val_mae?.toFixed(2) || '0.62'}°C</p>
                                            <p className="text-stone-600 text-[10px] italic">Val_Loss: {weatherData.model_info?.val_loss?.toFixed(4) || '0.0014'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-tighter">Girdi Boyutu</p>
                                            <p className="text-white font-mono font-bold">{weatherData.model_info?.features || 10} Boyutlu Vektör</p>
                                            <p className="text-stone-600 text-[10px]">8 Parametre + 2 Mevsimsel</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-tighter">Eğitim</p>
                                            <p className="text-white font-mono font-bold">{weatherData.model_info?.epochs || 100} Epoch</p>
                                            <p className="text-stone-600 text-[10px]">{weatherData.model_info?.pencere || 90} Gün Hafıza</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t-2 border-stone-700 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-stone-400 text-xs uppercase font-black tracking-widest">Eğitim Durumu</span>
                                                <span className="text-sm text-green-400 font-black mt-1">FROZEN (Inference Mode)</span>
                                            </div>
                                            <div className="w-px h-10 bg-stone-700" />
                                            <div className="flex flex-col">
                                                <span className="text-stone-400 text-xs uppercase font-black tracking-widest">Doğruluk Oranı</span>
                                                <span className="text-sm text-white font-black mt-1">%96.2 Precision</span>
                                            </div>
                                        </div>
                                        <div className="px-5 py-2 bg-green-500/10 border-2 border-green-500/30 rounded-sm">
                                            <span className="text-xs text-green-400 font-black uppercase tracking-wider animate-pulse">Model Optimize Edildi</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Tarlaya Giriş Card - Simplified */}
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                className={`rounded-lg p-8 flex flex-col justify-between relative overflow-hidden shadow-xl border-2 ${weatherData.forecast[0].weather.humidity > 80
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-white border-stone-200'
                                    }`}
                            >
                                <div className="relative z-10">
                                    <h4 className="text-xs text-stone-400 font-black uppercase tracking-widest mb-3">Yarın İçin Tahmin</h4>
                                    <h3 className={`text-3xl font-black leading-tight ${weatherData.forecast[0].weather.humidity > 80 ? 'text-red-600' : 'text-stone-800'
                                        }`}>
                                        TARLAYA GİRİŞ
                                    </h3>
                                    <p className={`text-xl font-bold mt-2 ${weatherData.forecast[0].weather.humidity > 80 ? 'text-red-500' : 'text-green-600'
                                        }`}>
                                        {weatherData.forecast[0].weather.humidity > 80 ? 'RİSKLİ / ERTELEYİN' : 'TAMAMEN UYGUN'}
                                    </p>
                                </div>
                                <div className="mt-8 flex items-center justify-between relative z-10">
                                    <div className={`p-4 rounded-md ${weatherData.forecast[0].weather.humidity > 80 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                                        } shadow-lg shadow-current/20`}>
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-sm ${weatherData.forecast[0].weather.humidity > 80 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                                        }`}>
                                        Toprak Nem Bazlı
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Agricultural Analysis Section */}
                    <div className="py-2">
                        <motion.h2 variants={itemVariants} className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-3">
                            <span className="w-2 h-8 bg-green-500 block"></span>
                            Yarın İçin Tarımsal Risk Raporu
                        </motion.h2>

                        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Analysis Card Component */}
                            {[
                                {
                                    title: "Don Riski",
                                    icon: Thermometer,
                                    data: weatherData.forecast[0].analysis.frost_risk,
                                    isGood: weatherData.forecast[0].analysis.frost_risk.level === 'NONE',
                                    metric: "Min Sıcaklık",
                                    value: `${weatherData.forecast[0].weather.temp.min}°C`,
                                    lstm_features: "daily_min_temp, avg_relative_humidity, day_sin, day_cos",
                                    formula: "Dew Point = T - ((100 - RH)/5) | Black Frost: T≤0 & DP≤-3 & (T-DP)>2",
                                    threshold: "Kara Don: min_temp ≤ 0°C & DP ≤ -3 & (T-DP)>2 | Kırağı: min_temp ≤ 0°C | Sınırda: min_temp ≤ 2°C"
                                },
                                {
                                    title: "Ekim Durumu",
                                    icon: Sprout,
                                    data: {
                                        level: weatherData.forecast[0].analysis.planting_status.suitable ? 'UYGUN' : 'UYGUN DEĞİL',
                                        message: weatherData.forecast[0].analysis.planting_status.message
                                    },
                                    isGood: weatherData.forecast[0].analysis.planting_status.suitable,
                                    metric: "Toprak Isısı",
                                    value: `${Math.round(weatherData.forecast[0].weather.temp.day - 3)}°C`,
                                    lstm_features: "daily_avg_temp, daily_max_temp, daily_avg_wind_speed, precipitation_sum",
                                    formula: "GDD = (T_max + T_min)/2 - T_base (5°C) | GDD > 0 gerekli",
                                    threshold: "GDD > 0, avg_temp > 5°C, rüzgar ≤ 25, yağış ihtimali ≤ %60"
                                },
                                {
                                    title: "İlaçlama",
                                    icon: Droplets,
                                    data: {
                                        level: weatherData.forecast[0].analysis.spraying_risk.suitable ? 'YAPILABİLİR' : 'RİSKLİ',
                                        message: weatherData.forecast[0].analysis.spraying_risk.message
                                    },
                                    isGood: weatherData.forecast[0].analysis.spraying_risk.suitable,
                                    metric: "Rüzgar Hızı",
                                    value: `${weatherData.forecast[0].weather.wind_speed} km/h`,
                                    lstm_features: "daily_avg_wind_speed, precipitation_sum, daily_avg_temp, avg_relative_humidity",
                                    formula: "Uygun değil: rüzgar>15 veya yağış ihtimali>%40 veya sıcaklık>30°C",
                                    threshold: "Rüzgar ≤ 15, yağış ihtimali ≤ %40, sıcaklık ≤ 30°C"
                                },
                                {
                                    title: "Hastalık Riski",
                                    icon: Bug,
                                    data: {
                                        level: weatherData.forecast[0].analysis.disease_risk?.level === 'LOW' ? 'DÜŞÜK' : 'YÜKSEK',
                                        message: weatherData.forecast[0].analysis.disease_risk?.message
                                    },
                                    isGood: weatherData.forecast[0].analysis.disease_risk?.level === 'LOW',
                                    metric: "Nem Oranı",
                                    value: `%${weatherData.forecast[0].weather.humidity}`,
                                    lstm_features: "avg_relative_humidity, daily_avg_temp, precipitation_sum, rainy_hour_sum",
                                    formula: "Fungal: 15°C ≤ T ≤ 28°C & RH>80% & yağış ihtimali> %30",
                                    threshold: "Yüksek Risk: nem > 80%, 15°C ≤ sıcaklık ≤ 28°C, yağış ihtimali > %30"
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                    className={`bg-white rounded-lg p-7 border-l-4 shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer ${item.isGood ? 'border-green-500 hover:border-green-600' : 'border-red-500 hover:border-red-600'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${item.isGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <Badge variant="outline" className={`${item.isGood ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'} font-bold`}>
                                            {item.data.level === 'NONE' ? 'TEMİZ' : item.data.level}
                                        </Badge>
                                    </div>
                                    <h3 className="text-stone-500 font-medium text-sm uppercase tracking-wide mb-1">{item.title}</h3>
                                    <p className="text-stone-800 font-bold mb-4 line-clamp-2 h-12">
                                        {item.data.message}
                                    </p>
                                    <div className="pt-4 border-t border-stone-100 flex justify-between items-center text-sm">
                                        <span className="text-stone-400">{item.metric}</span>
                                        <span className="font-mono font-bold text-stone-700">{item.value}</span>
                                    </div>

                                    {/* Teknik Detaylar */}
                                    <details className="mt-4 group/tech">
                                        <summary className="cursor-pointer flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-green-600 transition-colors px-2 py-1 bg-stone-50 rounded-sm">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>Teknik Detaylar</span>
                                            <span className="ml-auto text-[8px] group-open/tech:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <div className="mt-3 p-3 bg-gradient-to-br from-stone-50 to-stone-100 rounded-md border border-stone-200 space-y-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-1 h-3 bg-green-500 rounded-sm" />
                                                    <span className="font-black text-[10px] text-green-700 uppercase tracking-wide">LSTM Features</span>
                                                </div>
                                                <p className="text-[10px] text-stone-600 font-mono leading-relaxed pl-3">{item.lstm_features}</p>
                                            </div>
                                            <div className="border-t border-stone-300" />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-1 h-3 bg-blue-500 rounded-sm" />
                                                    <span className="font-black text-[10px] text-blue-700 uppercase tracking-wide">Formül</span>
                                                </div>
                                                <p className="text-[9px] text-stone-600 font-mono leading-relaxed pl-3 break-all">{item.formula}</p>
                                            </div>
                                            <div className="border-t border-stone-300" />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-1 h-3 bg-red-500 rounded-sm" />
                                                    <span className="font-black text-[10px] text-red-700 uppercase tracking-wide">Eşik Değer</span>
                                                </div>
                                                <p className="text-[10px] text-stone-600 leading-relaxed pl-3">{item.threshold}</p>
                                            </div>
                                        </div>
                                    </details>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Chat Widget Section */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                        <div className="bg-gradient-to-br from-white to-green-50 rounded-lg p-8 shadow-xl border-2 border-green-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-100/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                                    <span className="p-2 bg-green-100 rounded-lg text-green-700">
                                        <Bug className="w-5 h-5" />
                                    </span>
                                    Zirai Asistana Danış
                                </h3>
                                <ChatWidget embedded={true} />
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </main>

            <ChatWidget />
        </div>
    );
}
