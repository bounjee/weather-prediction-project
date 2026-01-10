import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Brain,
    TrendingUp,
    Database,
    BarChart3,
    Target,
    Thermometer,
    Droplets,
    Wind,
    Gauge,
    Calendar,
    Layers,
    CheckCircle2,
    Clock
} from 'lucide-react';

interface ModelMetrics {
    architecture: string;
    city: string;
    training_date: string;
    val_mae: number;
    val_loss: number;
    test_mae: number;
    test_loss: number;
    real_unit_metrics: {
        avg_temp_mae_celsius: number;
        max_temp_mae_celsius: number;
        min_temp_mae_celsius: number;
        humidity_mae_percent: number;
        pressure_mae_hpa: number;
        wind_mae_kmh: number;
        precipitation_mae_mm: number;
        temperature_avg_mae_celsius: number;
    };
    feature_maes_scaled: Record<string, number>;
    feature_maes_real: Record<string, number>;
    epochs_trained: number;
    epochs_max: number;
    early_stopping: boolean;
    look_back: number;
    features: number;
    batch_size: number;
    dataset_split: {
        train_samples: number;
        val_samples: number;
        test_samples: number;
        total_samples: number;
        train_ratio: number;
        val_ratio: number;
        test_ratio: number;
    };
    training_history: {
        loss: number[];
        val_loss: number[];
        mae: number[];
        val_mae: number[];
    };
    graph_paths: {
        loss_curve: string;
        prediction_vs_actual: string;
        scatter_correlation: string;
        feature_mae_chart: string;
    };
}

const API_BASE = 'http://localhost:3000/api';

export default function ModelResults() {
    const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'graphs' | 'dataset'>('overview');

    useEffect(() => {
        fetch(`${API_BASE}/model-metrics`)
            .then(res => {
                if (!res.ok) throw new Error('Metrikler yüklenemedi');
                return res.json();
            })
            .then(data => {
                setMetrics(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Brain className="w-16 h-16 text-blue-500 animate-pulse mx-auto mb-4" />
                    <p className="text-white text-xl">Model metrikleri yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center bg-red-500/20 p-8 rounded-2xl border border-red-500/30">
                    <p className="text-red-400 text-xl mb-4">⚠️ Model metrikleri yüklenemedi</p>
                    <p className="text-slate-400 mb-6">Lütfen önce modeli eğitin: <code className="bg-slate-700 px-2 py-1 rounded">python train_model.py</code></p>
                    <Link to="/dashboard" className="text-blue-400 hover:underline">← Dashboard'a dön</Link>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Genel Bakış', icon: Brain },
        { id: 'metrics', label: 'Performans Metrikleri', icon: Target },
        { id: 'graphs', label: 'Grafikler', icon: BarChart3 },
        { id: 'dataset', label: 'Veri Seti', icon: Database },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Brain className="w-7 h-7 text-blue-500" />
                                    Model Performans Raporu
                                </h1>
                                <p className="text-slate-400 text-sm">Akademik analiz ve test sonuçları</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 text-sm">Eğitim Tarihi</p>
                            <p className="text-white font-mono">{metrics.training_date}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 pb-12">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Hero Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Thermometer className="w-6 h-6 text-blue-400" />
                                    <span className="text-slate-400 text-sm">Sıcaklık MAE</span>
                                </div>
                                <p className="text-4xl font-bold text-white">
                                    {metrics.real_unit_metrics.temperature_avg_mae_celsius.toFixed(2)}°C
                                </p>
                                <p className="text-blue-300 text-sm mt-1">Ortalama hata payı</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Droplets className="w-6 h-6 text-green-400" />
                                    <span className="text-slate-400 text-sm">Nem MAE</span>
                                </div>
                                <p className="text-4xl font-bold text-white">
                                    {metrics.real_unit_metrics.humidity_mae_percent.toFixed(1)}%
                                </p>
                                <p className="text-green-300 text-sm mt-1">Ortalama hata payı</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp className="w-6 h-6 text-purple-400" />
                                    <span className="text-slate-400 text-sm">Eğitilen Epoch</span>
                                </div>
                                <p className="text-4xl font-bold text-white">{metrics.epochs_trained}</p>
                                <p className="text-purple-300 text-sm mt-1">
                                    {metrics.early_stopping ? '✓ Early Stopping' : `/ ${metrics.epochs_max}`}
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Database className="w-6 h-6 text-orange-400" />
                                    <span className="text-slate-400 text-sm">Toplam Veri</span>
                                </div>
                                <p className="text-4xl font-bold text-white">
                                    {metrics.dataset_split.total_samples.toLocaleString()}
                                </p>
                                <p className="text-orange-300 text-sm mt-1">Günlük kayıt</p>
                            </div>
                        </div>

                        {/* Model Architecture */}
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-blue-400" />
                                Model Mimarisi
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm">Mimari</p>
                                    <p className="text-white font-semibold">{metrics.architecture}</p>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm">Look-back Penceresi</p>
                                    <p className="text-white font-semibold">{metrics.look_back} gün</p>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm">Özellik Sayısı</p>
                                    <p className="text-white font-semibold">{metrics.features} boyut</p>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm">Batch Size</p>
                                    <p className="text-white font-semibold">{metrics.batch_size}</p>
                                </div>
                            </div>
                        </div>

                        {/* Training Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                    Eğitim Bilgileri
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                        <span className="text-slate-400">Hedef Şehir</span>
                                        <span className="text-white font-semibold">{metrics.city}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                        <span className="text-slate-400">Eğitilen Epoch</span>
                                        <span className="text-white font-semibold">{metrics.epochs_trained} / {metrics.epochs_max}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                        <span className="text-slate-400">Early Stopping</span>
                                        <span className={`font-semibold ${metrics.early_stopping ? 'text-green-400' : 'text-slate-400'}`}>
                                            {metrics.early_stopping ? '✓ Aktif' : 'Kullanılmadı'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-slate-400">Loss Function</span>
                                        <span className="text-white font-semibold">MSE (Mean Squared Error)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    Scaled Metrikler
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                        <span className="text-slate-400">Validation MAE</span>
                                        <span className="text-white font-mono">{metrics.val_mae.toFixed(6)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                        <span className="text-slate-400">Validation MSE</span>
                                        <span className="text-white font-mono">{metrics.val_loss.toFixed(6)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                        <span className="text-slate-400">Test MAE</span>
                                        <span className="text-green-400 font-mono">{metrics.test_mae.toFixed(6)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-slate-400">Test MSE</span>
                                        <span className="text-green-400 font-mono">{metrics.test_loss.toFixed(6)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Metrics Tab */}
                {activeTab === 'metrics' && (
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Target className="w-5 h-5 text-red-400" />
                                Özellik Bazında MAE (Gerçek Birim)
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Özellik</th>
                                            <th className="text-right py-3 px-4 text-slate-400 font-medium">MAE (Scaled)</th>
                                            <th className="text-right py-3 px-4 text-slate-400 font-medium">MAE (Gerçek)</th>
                                            <th className="text-right py-3 px-4 text-slate-400 font-medium">Birim</th>
                                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Performans</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { key: 'Ort.Sıcaklık', unit: '°C', realKey: 'avg_temp_mae_celsius', icon: Thermometer, color: 'blue' },
                                            { key: 'Max.Sıcaklık', unit: '°C', realKey: 'max_temp_mae_celsius', icon: Thermometer, color: 'red' },
                                            { key: 'Min.Sıcaklık', unit: '°C', realKey: 'min_temp_mae_celsius', icon: Thermometer, color: 'cyan' },
                                            { key: 'Nem', unit: '%', realKey: 'humidity_mae_percent', icon: Droplets, color: 'green' },
                                            { key: 'Basınç', unit: 'hPa', realKey: 'pressure_mae_hpa', icon: Gauge, color: 'purple' },
                                            { key: 'Rüzgar', unit: 'km/s', realKey: 'wind_mae_kmh', icon: Wind, color: 'yellow' },
                                        ].map(item => {
                                            const scaledVal = metrics.feature_maes_scaled[item.key] || 0;
                                            const realVal = (metrics.real_unit_metrics as Record<string, number>)[item.realKey] || 0;
                                            const performance = scaledVal < 0.05 ? 'Mükemmel' : scaledVal < 0.08 ? 'İyi' : scaledVal < 0.12 ? 'Orta' : 'Geliştirilebilir';
                                            const perfColor = scaledVal < 0.05 ? 'text-green-400' : scaledVal < 0.08 ? 'text-blue-400' : scaledVal < 0.12 ? 'text-yellow-400' : 'text-orange-400';

                                            return (
                                                <tr key={item.key} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                                                            <span className="text-white">{item.key}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-right py-3 px-4 font-mono text-slate-300">{scaledVal.toFixed(4)}</td>
                                                    <td className="text-right py-3 px-4 font-mono text-white font-semibold">{realVal.toFixed(2)}</td>
                                                    <td className="text-right py-3 px-4 text-slate-400">{item.unit}</td>
                                                    <td className={`py-3 px-4 ${perfColor} font-medium`}>{performance}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Training History Chart */}
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                Eğitim Geçmişi (Son {metrics.training_history.loss.length} Epoch)
                            </h2>
                            <div className="h-64 flex items-end gap-1">
                                {metrics.training_history.val_loss.map((loss, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center group">
                                        <div
                                            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t opacity-70 group-hover:opacity-100 transition-opacity"
                                            style={{ height: `${Math.min(100, loss * 1000)}%` }}
                                            title={`Epoch ${idx + 1}: ${loss.toFixed(6)}`}
                                        />
                                        {idx % 10 === 0 && (
                                            <span className="text-xs text-slate-500 mt-1">{idx + 1}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-slate-400 text-sm mt-2">Validation Loss (her bar bir epoch)</p>
                        </div>
                    </div>
                )}

                {/* Graphs Tab */}
                {activeTab === 'graphs' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'Loss Curve', path: metrics.graph_paths.loss_curve, desc: 'Training & Validation Loss' },
                                { title: 'Tahmin vs Gerçek', path: metrics.graph_paths.prediction_vs_actual, desc: 'Son 100 test örneği' },
                                { title: 'Korelasyon', path: metrics.graph_paths.scatter_correlation, desc: 'Scatter plot analizi' },
                                { title: 'Özellik MAE', path: metrics.graph_paths.feature_mae_chart, desc: 'Karşılaştırmalı bar chart' },
                            ].map(graph => (
                                <div key={graph.title} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
                                    <div className="p-4 border-b border-slate-700/50">
                                        <h3 className="text-lg font-bold text-white">{graph.title}</h3>
                                        <p className="text-slate-400 text-sm">{graph.desc}</p>
                                    </div>
                                    <div className="p-4 bg-slate-900/50">
                                        <img
                                            src={`${API_BASE}/model-graph/${graph.path.split('/').pop()}`}
                                            alt={graph.title}
                                            className="w-full rounded-lg"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23334155" width="400" height="300"/><text fill="%2394a3b8" x="200" y="150" text-anchor="middle" font-family="sans-serif" font-size="14">Grafik yüklenemedi. Modeli eğitin.</text></svg>';
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <p className="text-yellow-400 text-sm">
                                💡 <strong>İpucu:</strong> Grafikleri görmek için modeli eğitmeniz gerekir.
                                <code className="bg-slate-700 px-2 py-1 rounded mx-1">python train_model.py</code>
                                komutunu çalıştırın.
                            </p>
                        </div>
                    </div>
                )}

                {/* Dataset Tab */}
                {activeTab === 'dataset' && (
                    <div className="space-y-6">
                        {/* Split Visualization */}
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-400" />
                                Veri Seti Bölünmesi
                            </h2>

                            <div className="mb-6">
                                <div className="flex h-12 rounded-xl overflow-hidden">
                                    <div
                                        className="bg-blue-600 flex items-center justify-center"
                                        style={{ width: `${metrics.dataset_split.train_ratio * 100}%` }}
                                    >
                                        <span className="text-white font-semibold text-sm">Train %{Math.round(metrics.dataset_split.train_ratio * 100)}</span>
                                    </div>
                                    <div
                                        className="bg-yellow-600 flex items-center justify-center"
                                        style={{ width: `${metrics.dataset_split.val_ratio * 100}%` }}
                                    >
                                        <span className="text-white font-semibold text-sm">Val %{Math.round(metrics.dataset_split.val_ratio * 100)}</span>
                                    </div>
                                    <div
                                        className="bg-green-600 flex items-center justify-center"
                                        style={{ width: `${metrics.dataset_split.test_ratio * 100}%` }}
                                    >
                                        <span className="text-white font-semibold text-sm">Test %{Math.round(metrics.dataset_split.test_ratio * 100)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                                    <p className="text-blue-300 text-sm mb-1">Eğitim Seti (Train)</p>
                                    <p className="text-3xl font-bold text-white">{metrics.dataset_split.train_samples.toLocaleString()}</p>
                                    <p className="text-slate-400 text-sm">örnek</p>
                                </div>
                                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
                                    <p className="text-yellow-300 text-sm mb-1">Doğrulama Seti (Val)</p>
                                    <p className="text-3xl font-bold text-white">{metrics.dataset_split.val_samples.toLocaleString()}</p>
                                    <p className="text-slate-400 text-sm">örnek</p>
                                </div>
                                <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4">
                                    <p className="text-green-300 text-sm mb-1">Test Seti (Test)</p>
                                    <p className="text-3xl font-bold text-white">{metrics.dataset_split.test_samples.toLocaleString()}</p>
                                    <p className="text-slate-400 text-sm">örnek</p>
                                </div>
                            </div>
                        </div>

                        {/* Dataset Info */}
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-400" />
                                Veri Seti Detayları
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm">Toplam Örnek</p>
                                    <p className="text-2xl font-bold text-white">{metrics.dataset_split.total_samples.toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm">Özellik Boyutu</p>
                                    <p className="text-2xl font-bold text-white">{metrics.features}D</p>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm">Look-back</p>
                                    <p className="text-2xl font-bold text-white">{metrics.look_back} gün</p>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <p className="text-slate-400 text-sm">Zaman Aralığı</p>
                                    <p className="text-2xl font-bold text-white">~6 yıl</p>
                                </div>
                            </div>
                        </div>

                        {/* Feature List */}
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">📊 Kullanılan Özellikler (10 Boyut)</h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {[
                                    { name: 'Ort. Sıcaklık', unit: '°C', icon: '🌡️' },
                                    { name: 'Max. Sıcaklık', unit: '°C', icon: '🔥' },
                                    { name: 'Min. Sıcaklık', unit: '°C', icon: '❄️' },
                                    { name: 'Rüzgar Hızı', unit: 'km/s', icon: '💨' },
                                    { name: 'Nem', unit: '%', icon: '💧' },
                                    { name: 'Basınç', unit: 'hPa', icon: '🌀' },
                                    { name: 'Yağış', unit: 'mm', icon: '🌧️' },
                                    { name: 'Yağışlı Saat', unit: 'saat', icon: '⏱️' },
                                    { name: 'Gün Sin', unit: '', icon: '📅' },
                                    { name: 'Gün Cos', unit: '', icon: '📆' },
                                ].map((f, i) => (
                                    <div key={i} className="bg-slate-700/30 rounded-lg p-3 text-center">
                                        <span className="text-2xl">{f.icon}</span>
                                        <p className="text-white text-sm font-medium mt-1">{f.name}</p>
                                        {f.unit && <p className="text-slate-400 text-xs">{f.unit}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
