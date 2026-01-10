"""
HIZLI KARŞILAŞTIRMALI DENEYLER
==============================
Sadece 3 farklı konfigürasyonu test eder.
Progress gösterimi ile.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, Callback
import os
import json
from datetime import datetime

# Sabitler
CITY_NAME = 'Ankara'
FEATURE_COLS = [
    'daily_avg_temp', 'daily_max_temp', 'daily_min_temp', 
    'daily_avg_wind_speed', 'avg_relative_humidity', 
    'avg_pressure', 'precipitation_sum', 'rainy_hour_sum'
]

class ProgressCallback(Callback):
    """Her epoch sonunda progress göster"""
    def __init__(self, total_epochs):
        self.total_epochs = total_epochs
    
    def on_epoch_end(self, epoch, logs=None):
        pct = (epoch + 1) / self.total_epochs * 100
        bar = "█" * int(pct // 5) + "░" * (20 - int(pct // 5))
        print(f"\r   [{bar}] {pct:.0f}% - Epoch {epoch+1}/{self.total_epochs} - val_mae: {logs.get('val_mae', 0):.4f}", end="")

def load_data(filepath):
    df = pd.read_csv(filepath)
    df['date'] = pd.to_datetime(df['date'])
    df_city = df[df['city_name'] == CITY_NAME].sort_values('date').copy()
    
    df_city['day_of_year'] = df_city['date'].dt.dayofyear
    df_city['day_sin'] = np.sin(2 * np.pi * df_city['day_of_year'] / 365.25)
    df_city['day_cos'] = np.cos(2 * np.pi * df_city['day_of_year'] / 365.25)
    
    EXTENDED_FEATURES = FEATURE_COLS + ['day_sin', 'day_cos']
    data_df = df_city[EXTENDED_FEATURES].interpolate(method='linear').bfill().ffill()
    return data_df.values

def create_dataset(dataset, look_back):
    X, y = [], []
    for i in range(look_back, len(dataset)):
        X.append(dataset[i-look_back:i, :])
        y.append(dataset[i, :])
    return np.array(X), np.array(y)

def build_simple_lstm(input_shape, output_dim):
    """Basit 1 katmanlı LSTM"""
    model = Sequential([
        LSTM(64, input_shape=input_shape),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dense(output_dim)
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model

def build_deep_lstm(input_shape, output_dim):
    """Derin 3 katmanlı Bi-LSTM (mevcut model)"""
    model = Sequential([
        Bidirectional(LSTM(128, return_sequences=True), input_shape=input_shape),
        BatchNormalization(),
        Dropout(0.3),
        LSTM(128, return_sequences=True),
        Dropout(0.3),
        LSTM(64),
        BatchNormalization(),
        Dropout(0.2),
        Dense(64, activation='relu'),
        Dropout(0.1),
        Dense(32, activation='relu'),
        Dense(output_dim)
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model

def run_experiment(data, config):
    """Tek bir deney çalıştır"""
    name = config['name']
    look_back = config['look_back']
    epochs = config['epochs']
    model_builder = config['model']
    
    print(f"\n{'='*60}")
    print(f"🔬 DENEY: {name}")
    print(f"   Look-back: {look_back} gün, Epochs: {epochs}")
    print(f"{'='*60}")
    
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(data)
    
    X, y = create_dataset(scaled_data, look_back)
    
    total = len(X)
    train_size = int(total * 0.70)
    val_size = int(total * 0.15)
    
    X_train, y_train = X[:train_size], y[:train_size]
    X_val, y_val = X[train_size:train_size+val_size], y[train_size:train_size+val_size]
    X_test, y_test = X[train_size+val_size:], y[train_size+val_size:]
    
    print(f"   Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
    
    model = model_builder((X_train.shape[1], X_train.shape[2]), X_train.shape[2])
    
    early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
    progress = ProgressCallback(epochs)
    
    history = model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=32,
        validation_data=(X_val, y_val),
        callbacks=[early_stop, progress],
        verbose=0
    )
    print()  # Yeni satır
    
    test_results = model.evaluate(X_test, y_test, verbose=0)
    
    y_pred = model.predict(X_test, verbose=0)
    y_test_real = scaler.inverse_transform(y_test)
    y_pred_real = scaler.inverse_transform(y_pred)
    
    temp_mae = np.mean(np.abs(y_test_real[:, 0] - y_pred_real[:, 0]))
    
    result = {
        'name': name,
        'look_back': look_back,
        'epochs_trained': len(history.history['loss']),
        'test_mae': float(test_results[1]),
        'test_loss': float(test_results[0]),
        'temp_mae_celsius': float(temp_mae)
    }
    
    print(f"\n   ✅ Test MAE (scaled): {result['test_mae']:.4f}")
    print(f"   ✅ Sıcaklık MAE: {result['temp_mae_celsius']:.2f}°C")
    
    return result

def main():
    print("\n" + "="*70)
    print("   🧪 KARŞILAŞTIRMALI DENEYLER (3 Konfigürasyon)")
    print("="*70)
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data = load_data(os.path.join(current_dir, 'cities.csv'))
    print(f"\n📊 {len(data)} günlük veri yüklendi")
    
    # SADECE 3 DENEY
    experiments = [
        {'name': 'Basit LSTM (30 gün)', 'look_back': 30, 'epochs': 20, 'model': build_simple_lstm},
        {'name': 'Basit LSTM (90 gün)', 'look_back': 90, 'epochs': 20, 'model': build_simple_lstm},
        {'name': 'Derin Bi-LSTM (90 gün)', 'look_back': 90, 'epochs': 20, 'model': build_deep_lstm},
    ]
    
    results = []
    for i, config in enumerate(experiments):
        print(f"\n📌 İlerleme: {i+1}/{len(experiments)}")
        result = run_experiment(data, config)
        results.append(result)
    
    # SONUÇ TABLOSU
    print("\n" + "="*70)
    print("   📊 KARŞILAŞTIRMA SONUÇ TABLOSU")
    print("="*70)
    print(f"\n{'Model':<30} {'Look-back':<12} {'Test MAE':<12} {'Sıcaklık MAE':<15}")
    print("-" * 70)
    
    for r in results:
        print(f"{r['name']:<30} {r['look_back']:<12} {r['test_mae']:<12.4f} {r['temp_mae_celsius']:.2f}°C")
    
    best = min(results, key=lambda x: x['test_mae'])
    print("-" * 70)
    print(f"\n🏆 EN İYİ: {best['name']} (Test MAE: {best['test_mae']:.4f}, Sıcaklık: {best['temp_mae_celsius']:.2f}°C)")
    
    # JSON kaydet
    output = {
        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'results': results
    }
    json_path = os.path.join(current_dir, 'experiment_results.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Sonuçlar kaydedildi: {json_path}")
    print("="*70)

if __name__ == "__main__":
    main()
