import React from 'react';

export default function Dashboard() {
    const city = localStorage.getItem('user_city') || 'Seçilmedi';

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Hoşgeldiniz</h1>
                    <p className="text-gray-600">Seçili Konum: <span className="font-semibold">{city}</span></p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Mock Weather Cards */}
                    {[1, 2, 3].map((day) => (
                        <div key={day} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800">Gün {day}</h3>
                            <div className="mt-2 text-3xl font-bold text-gray-900">24°C</div>
                            <p className="text-sm text-gray-500">Parçalı Bulutlu</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-96 flex items-center justify-center text-gray-400">
                    Chatbot Alanı Buraya Gelecek
                </div>
            </div>
        </div>
    );
}
