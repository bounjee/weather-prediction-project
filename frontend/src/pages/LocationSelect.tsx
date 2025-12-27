
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, MapPin, CheckCircle2 } from 'lucide-react';

const SUPPORTED_CITIES = ["Ankara"];

export default function LocationSelect() {
    const [selectedCity, setSelectedCity] = useState('Ankara');
    const navigate = useNavigate();

    // Auto-redirect if city already selected
    useEffect(() => {
        if (localStorage.getItem('user_city')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleContinue = () => {
        if (selectedCity) {
            localStorage.setItem('user_city', selectedCity);
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F5F3] p-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-white/50 relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-green-100/50 rounded-2xl mb-4">
                        <Sprout className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-stone-800 tracking-tight">AgroWeather<span className="text-green-600">AI</span></h2>
                    <p className="mt-3 text-stone-500 font-medium">
                        Akıllı Tarımsal Takip Sistemi
                    </p>
                </div>

                <div className="mb-8 bg-amber-50/50 border border-amber-100 rounded-2xl p-5">
                    <div className="flex gap-3">
                        <div className="shrink-0 mt-1">
                            <CheckCircle2 className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="text-sm text-amber-900/80 leading-relaxed">
                            <strong>Bölgesel Kapsam:</strong> Şu anda Yapay Zeka modellerimiz yalnızca <strong>Ankara</strong> bölgesi için optimize edilmiştir.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="city" className="block text-sm font-bold text-stone-700 ml-1">
                            Bölge Seçimi
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <select
                                id="city"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="block w-full rounded-xl border border-stone-200 bg-white py-4 pl-11 pr-4 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 text-stone-700 font-medium appearance-none"
                            >
                                {SUPPORTED_CITIES.map((city) => (
                                    <option key={city} value={city}>
                                        {city} (Aktif İstasyon)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleContinue}
                        className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Başla
                    </button>
                </div>
            </motion.div>

            <p className="mt-8 text-xs text-stone-400 font-medium">
                © 2025 AgriCast Technology v2.0
            </p>
        </div>
    );
}
