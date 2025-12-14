import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SUPPORTED_CITIES = ["Ankara"];

export default function LocationSelect() {
    // Varsayılan olarak Ankara seçili gelsin veya kullanıcı listeden sadece Ankara'yı görsün
    const [selectedCity, setSelectedCity] = useState('Ankara');
    const navigate = useNavigate();

    const handleContinue = () => {
        if (selectedCity) {
            localStorage.setItem('user_city', selectedCity);
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">AgroWeather AI</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Yapay Zeka destekli Tarımsal Karar Destek Sistemi
                    </p>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-2">
                        <div className="shrink-0">
                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-blue-800">
                            <strong>Bilgilendirme:</strong> Yapay Zeka (LSTM) modelimiz şu an yalnızca <strong>Ankara</strong> istasyonu verileriyle eğitildiği için sadece bu bölgede hizmet vermektedir.
                        </p>
                    </div>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            Bölge Seçimi
                        </label>
                        <select
                            id="city"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 bg-white py-3 px-4 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-base"
                        >
                            {SUPPORTED_CITIES.map((city) => (
                                <option key={city} value={city}>
                                    {city} (Aktif)
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleContinue}
                        className="flex w-full justify-center rounded-md border border-transparent py-3 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 bg-purple-600 hover:bg-purple-700"
                    >
                        Sisteme Giriş Yap
                    </button>
                </div>
            </div>
        </div>
    );
}
