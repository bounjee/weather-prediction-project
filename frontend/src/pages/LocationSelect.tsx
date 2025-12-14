import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TURKEY_CITIES = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
    "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
    "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
    "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
    "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
    "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
    "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
    "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

export default function LocationSelect() {
    const [selectedCity, setSelectedCity] = useState('');
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
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tarım Asistanı</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Bölgenize özel hava tahmini ve tarımsal öneriler için konumunuzu seçin.
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            İl Seçiniz
                        </label>
                        <select
                            id="city"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 bg-white py-3 px-4 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 text-base"
                        >
                            <option value="">Seçiniz...</option>
                            {TURKEY_CITIES.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleContinue}
                        disabled={!selectedCity}
                        className={`flex w-full justify-center rounded-md border border-transparent py-3 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${selectedCity
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Devam Et
                    </button>
                </div>
            </div>
        </div>
    );
}
