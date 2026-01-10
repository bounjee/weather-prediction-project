import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional, BatchNormalization, Activation
import os
import joblib

# Ayarlar
CITY_NAME = 'Ankara'
FEATURE_COLS = [
    'daily_avg_temp', 
    'daily_max_temp', 
    'daily_min_temp', 
    'daily_avg_wind_speed', 
    'avg_relative_humidity', 
    'avg_pressure', 
    'precipitation_sum',
    'rainy_hour_sum'
]
LOOK_BACK = 90 # 3 Aylık Mevsimsel Hafıza
EPOCHS = 100
BATCH_SIZE = 32

def load_and_process_data(filepath):
    print(f"\n[VERİ] Dataset hazırlanıyor: {filepath}")
    df = pd.read_csv(filepath)
    df['date'] = pd.to_datetime(df['date'])
    
    df_city = df[df['city_name'] == CITY_NAME].sort_values('date').copy()
    print(f"[BİLGİ] {CITY_NAME} için {len(df_city)} günlük tarihsel kayıt işleniyor.")

    # MEVSİMSEL KODLAMA (Zaman Serisi Mühendisliği)
    df_city['day_of_year'] = df_city['date'].dt.dayofyear
    df_city['day_sin'] = np.sin(2 * np.pi * df_city['day_of_year'] / 365.25)
    df_city['day_cos'] = np.cos(2 * np.pi * df_city['day_of_year'] / 365.25)
    
    EXTENDED_FEATURES = FEATURE_COLS + ['day_sin', 'day_cos']

    # Eksik verileri doğrusal tamamlama
    data_df = df_city[EXTENDED_FEATURES].interpolate(method='linear').fillna(method='bfill').fillna(method='ffill')
    data = data_df.values
    
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)
    
    return scaled_data, scaler, EXTENDED_FEATURES

def create_dataset(dataset, look_back=90):
    X, y = [], []
    for i in range(look_back, len(dataset)):
        X.append(dataset[i-look_back:i, :]) 
        y.append(dataset[i, :]) 
    return np.array(X), np.array(y)

def build_deep_model(input_shape, output_dim):
    from tensorflow.keras.layers import Bidirectional, BatchNormalization, Activation
    model = Sequential()
    
    # Giriş Katmanı: Çift Yönlü LSTM (Bidirectional)
    model.add(Bidirectional(LSTM(units=128, return_sequences=True), input_shape=input_shape))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))
    
    # Derinlik: 2. LSTM Katmanı
    model.add(LSTM(units=128, return_sequences=True))
    model.add(Dropout(0.3))
    
    # Derinlik: 3. LSTM Katmanı
    model.add(LSTM(units=64, return_sequences=False))
    model.add(BatchNormalization())
    model.add(Dropout(0.2))
    
    # Karar Katmanları (Dense)
    model.add(Dense(units=64))
    model.add(Activation('relu'))
    model.add(Dropout(0.1))
    
    model.add(Dense(units=32))
    model.add(Activation('relu'))
    
    # Çıkış Katmanı
    model.add(Dense(units=output_dim)) 
    
    model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])
    return model

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, 'cities.csv')
    
    # 1. Veri Hazırlığı
    scaled_data, scaler, current_features = load_and_process_data(csv_path)
    X, y = create_dataset(scaled_data, LOOK_BACK)
    
    # ============================================================
    # VERİ SETİ BÖLÜNMESI (Akademik Standart)
    # ============================================================
    # Train: %70 - Model bu veriyle öğrenir
    # Validation: %15 - Eğitim sırasında overfitting kontrolü
    # Test: %15 - Final değerlendirme (model hiç görmez)
    # ============================================================
    
    total_samples = len(X)
    train_size = int(total_samples * 0.70)
    val_size = int(total_samples * 0.15)
    test_size = total_samples - train_size - val_size
    
    # Kronolojik bölünme (zaman serisi için shuffle YAPILMAZ!)
    X_train = X[:train_size]
    y_train = y[:train_size]
    
    X_val = X[train_size:train_size + val_size]
    y_val = y[train_size:train_size + val_size]
    
    X_test = X[train_size + val_size:]
    y_test = y[train_size + val_size:]
    
    print(f"\n[VERİ BÖLÜNME RAPORU]")
    print(f"========================================")
    print(f"Toplam Örnek Sayısı: {total_samples}")
    print(f"Eğitim Seti (Train):     {len(X_train)} örnek (%70)")
    print(f"Doğrulama Seti (Val):    {len(X_val)} örnek (%15)")
    print(f"Test Seti (Test):        {len(X_test)} örnek (%15)")
    print(f"========================================\n")
    
    # 2. Model Kurulumu
    model = build_deep_model((X_train.shape[1], X_train.shape[2]), X_train.shape[2])
    
    # 3. Eğitim Stratejisi
    print(f"\n[SİSTEM] ULTRA DERİN EĞİTİM BAŞLATILIYOR")
    print(f"----------------------------------------")
    print(f"BEYİN: Deep Bidirectional LSTM")
    print(f"HAFIZA: {LOOK_BACK} Gün")
    print(f"ÖZELLİKLER: {len(current_features)} Boyutlu Vektör")
    print(f"HEDEF ŞEHİR: {CITY_NAME}")
    print(f"----------------------------------------\n")
    
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
    
    early_stop = EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True)
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=7, min_lr=0.00001)
    
    # Eğitim: Train seti ile eğit, Validation seti ile izle
    history = model.fit(
        X_train, y_train, 
        epochs=EPOCHS, 
        batch_size=BATCH_SIZE, 
        validation_data=(X_val, y_val),  # Validation set (Test değil!)
        callbacks=[early_stop, reduce_lr],
        verbose=1
    )
    
    # ============================================================
    # 4. FİNAL DEĞERLENDİRME (Test Seti Üzerinde)
    # ============================================================
    # Bu adım kritik: Model test setini eğitim sırasında HİÇ görmedi
    # Bu, modelin gerçek dünya performansının tarafsız ölçümüdür
    # ============================================================
    
    import json
    import matplotlib
    matplotlib.use('Agg')  # GUI olmadan çalış
    import matplotlib.pyplot as plt
    
    print(f"\n[TEST SETİ DEĞERLENDİRMESİ]")
    print(f"========================================")
    
    # Test seti üzerinde değerlendirme (scaled space)
    test_results = model.evaluate(X_test, y_test, verbose=0)
    test_loss = test_results[0]  # MSE
    test_mae = test_results[1]   # MAE (scaled)
    
    # Validation sonuçları (eğitim sırasından)
    final_val_loss = history.history['val_loss'][-1]
    final_val_mae = history.history['val_mae'][-1]
    epochs_trained = len(history.history['loss'])
    
    # Detaylı tahmin analizi
    y_pred_test = model.predict(X_test, verbose=0)
    
    # =================================================================
    # GERÇEK BİRİMDE MAE HESAPLAMA (Inverse Transform)
    # =================================================================
    # Önemli: Scaled (0-1) değerleri gerçek birimlere çevir
    # =================================================================
    
    y_test_real = scaler.inverse_transform(y_test)
    y_pred_real = scaler.inverse_transform(y_pred_test)
    
    # Özellik isimleri ve birimleri
    feature_info = [
        ('Ort.Sıcaklık', '°C', 0),
        ('Max.Sıcaklık', '°C', 1),
        ('Min.Sıcaklık', '°C', 2),
        ('Rüzgar', 'km/s', 3),
        ('Nem', '%', 4),
        ('Basınç', 'hPa', 5),
        ('Yağış', 'mm', 6),
        ('YağışlıSaat', 'saat', 7),
        ('GünSin', '', 8),
        ('GünCos', '', 9)
    ]
    
    print(f"\n📊 ÖZELLİK BAZINDA TEST SONUÇLARI:")
    print(f"{'='*60}")
    print(f"{'Özellik':<15} {'MAE (Scaled)':<15} {'MAE (Gerçek)':<15} {'Birim':<10}")
    print(f"{'-'*60}")
    
    feature_maes_scaled = {}
    feature_maes_real = {}
    
    for fname, unit, idx in feature_info:
        mae_scaled = np.mean(np.abs(y_test[:, idx] - y_pred_test[:, idx]))
        mae_real = np.mean(np.abs(y_test_real[:, idx] - y_pred_real[:, idx]))
        feature_maes_scaled[fname] = float(mae_scaled)
        feature_maes_real[fname] = float(mae_real)
        
        if unit:
            print(f"{fname:<15} {mae_scaled:<15.4f} {mae_real:<15.2f} {unit}")
        else:
            print(f"{fname:<15} {mae_scaled:<15.4f} {mae_real:<15.4f} (normalized)")
    
    print(f"{'='*60}")
    
    # Genel MAE (gerçek birim - sıcaklık için)
    temp_mae_real = np.mean([
        feature_maes_real['Ort.Sıcaklık'],
        feature_maes_real['Max.Sıcaklık'],
        feature_maes_real['Min.Sıcaklık']
    ])
    print(f"\n🌡️  Ortalama Sıcaklık MAE: {temp_mae_real:.2f}°C")
    print(f"📈 Genel Test MAE (scaled): {test_mae:.4f}")
    print(f"📉 Genel Test MSE (scaled): {test_loss:.6f}")
    
    # =================================================================
    # GRAFİKLER OLUŞTUR VE KAYDET
    # =================================================================
    
    graphs_dir = os.path.join(current_dir, 'training_graphs')
    os.makedirs(graphs_dir, exist_ok=True)
    
    # 1. LOSS CURVE (Training vs Validation)
    plt.figure(figsize=(12, 5))
    
    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Training Loss', color='#2196F3', linewidth=2)
    plt.plot(history.history['val_loss'], label='Validation Loss', color='#FF5722', linewidth=2)
    plt.title('Model Loss (MSE) Over Epochs', fontsize=14, fontweight='bold')
    plt.xlabel('Epoch')
    plt.ylabel('Loss (MSE)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.subplot(1, 2, 2)
    plt.plot(history.history['mae'], label='Training MAE', color='#4CAF50', linewidth=2)
    plt.plot(history.history['val_mae'], label='Validation MAE', color='#9C27B0', linewidth=2)
    plt.title('Model MAE Over Epochs', fontsize=14, fontweight='bold')
    plt.xlabel('Epoch')
    plt.ylabel('MAE (Scaled)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    loss_curve_path = os.path.join(graphs_dir, 'loss_curve.png')
    plt.savefig(loss_curve_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"\n📊 Loss Curve kaydedildi: {loss_curve_path}")
    
    # 2. PREDICTION VS ACTUAL (Sıcaklık için)
    plt.figure(figsize=(14, 8))
    
    # Son 100 test örneği
    sample_size = min(100, len(y_test_real))
    x_axis = range(sample_size)
    
    # Max Sıcaklık
    plt.subplot(2, 2, 1)
    plt.plot(x_axis, y_test_real[-sample_size:, 1], label='Gerçek', color='#2196F3', linewidth=1.5)
    plt.plot(x_axis, y_pred_real[-sample_size:, 1], label='Tahmin', color='#FF5722', linewidth=1.5, alpha=0.8)
    plt.title(f'Max Sıcaklık - MAE: {feature_maes_real["Max.Sıcaklık"]:.2f}°C', fontsize=12, fontweight='bold')
    plt.xlabel('Gün')
    plt.ylabel('°C')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Min Sıcaklık
    plt.subplot(2, 2, 2)
    plt.plot(x_axis, y_test_real[-sample_size:, 2], label='Gerçek', color='#2196F3', linewidth=1.5)
    plt.plot(x_axis, y_pred_real[-sample_size:, 2], label='Tahmin', color='#FF5722', linewidth=1.5, alpha=0.8)
    plt.title(f'Min Sıcaklık - MAE: {feature_maes_real["Min.Sıcaklık"]:.2f}°C', fontsize=12, fontweight='bold')
    plt.xlabel('Gün')
    plt.ylabel('°C')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Nem
    plt.subplot(2, 2, 3)
    plt.plot(x_axis, y_test_real[-sample_size:, 4], label='Gerçek', color='#2196F3', linewidth=1.5)
    plt.plot(x_axis, y_pred_real[-sample_size:, 4], label='Tahmin', color='#FF5722', linewidth=1.5, alpha=0.8)
    plt.title(f'Nem - MAE: {feature_maes_real["Nem"]:.2f}%', fontsize=12, fontweight='bold')
    plt.xlabel('Gün')
    plt.ylabel('%')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Basınç
    plt.subplot(2, 2, 4)
    plt.plot(x_axis, y_test_real[-sample_size:, 5], label='Gerçek', color='#2196F3', linewidth=1.5)
    plt.plot(x_axis, y_pred_real[-sample_size:, 5], label='Tahmin', color='#FF5722', linewidth=1.5, alpha=0.8)
    plt.title(f'Basınç - MAE: {feature_maes_real["Basınç"]:.2f} hPa', fontsize=12, fontweight='bold')
    plt.xlabel('Gün')
    plt.ylabel('hPa')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    prediction_path = os.path.join(graphs_dir, 'prediction_vs_actual.png')
    plt.savefig(prediction_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"📊 Prediction vs Actual kaydedildi: {prediction_path}")
    
    # 3. SCATTER PLOT (Correlation)
    plt.figure(figsize=(12, 5))
    
    plt.subplot(1, 2, 1)
    plt.scatter(y_test_real[:, 1], y_pred_real[:, 1], alpha=0.3, c='#2196F3', s=10)
    plt.plot([y_test_real[:, 1].min(), y_test_real[:, 1].max()], 
             [y_test_real[:, 1].min(), y_test_real[:, 1].max()], 
             'r--', linewidth=2, label='İdeal (y=x)')
    plt.title('Max Sıcaklık: Gerçek vs Tahmin', fontsize=12, fontweight='bold')
    plt.xlabel('Gerçek (°C)')
    plt.ylabel('Tahmin (°C)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.subplot(1, 2, 2)
    plt.scatter(y_test_real[:, 2], y_pred_real[:, 2], alpha=0.3, c='#4CAF50', s=10)
    plt.plot([y_test_real[:, 2].min(), y_test_real[:, 2].max()], 
             [y_test_real[:, 2].min(), y_test_real[:, 2].max()], 
             'r--', linewidth=2, label='İdeal (y=x)')
    plt.title('Min Sıcaklık: Gerçek vs Tahmin', fontsize=12, fontweight='bold')
    plt.xlabel('Gerçek (°C)')
    plt.ylabel('Tahmin (°C)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    scatter_path = os.path.join(graphs_dir, 'scatter_correlation.png')
    plt.savefig(scatter_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"📊 Scatter Plot kaydedildi: {scatter_path}")
    
    # 4. ÖZELLİK BAZINDA MAE BAR CHART
    plt.figure(figsize=(12, 6))
    
    features_for_chart = ['Ort.Sıcaklık', 'Max.Sıcaklık', 'Min.Sıcaklık', 'Rüzgar', 'Nem', 'Basınç', 'Yağış']
    mae_values = [feature_maes_real[f] for f in features_for_chart]
    colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#E91E63', '#795548']
    
    bars = plt.bar(features_for_chart, mae_values, color=colors, edgecolor='black', linewidth=1.2)
    plt.title('Özellik Bazında MAE (Gerçek Birim)', fontsize=14, fontweight='bold')
    plt.xlabel('Özellik')
    plt.ylabel('MAE')
    plt.xticks(rotation=45, ha='right')
    
    # Değerleri bar üstüne yaz
    for bar, val in zip(bars, mae_values):
        plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, 
                f'{val:.2f}', ha='center', va='bottom', fontsize=10)
    
    plt.tight_layout()
    bar_chart_path = os.path.join(graphs_dir, 'feature_mae_comparison.png')
    plt.savefig(bar_chart_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"📊 Feature MAE Chart kaydedildi: {bar_chart_path}")
    
    # =================================================================
    # MODEL VE METRİKLERİ KAYDET
    # =================================================================
    
    # 5. Model Kaydetme
    model_path = os.path.join(current_dir, f'weather_lstm_{CITY_NAME.lower()}.keras')
    scaler_path = os.path.join(current_dir, f'scaler_{CITY_NAME.lower()}.joblib')
    
    model.save(model_path)
    joblib.dump(scaler, scaler_path)
    
    # 6. Metrikleri Kaydet (Akademik rapor ve dashboard için)
    metrics = {
        'architecture': 'Deep Bidirectional LSTM',
        'city': CITY_NAME,
        'training_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
        
        # Validation Metrikleri (Scaled)
        'val_mae': float(final_val_mae),
        'val_loss': float(final_val_loss),
        
        # Test Metrikleri (Scaled)
        'test_mae': float(test_mae),
        'test_loss': float(test_loss),
        
        # GERÇEK BİRİMDE METRİKLER
        'real_unit_metrics': {
            'avg_temp_mae_celsius': float(feature_maes_real['Ort.Sıcaklık']),
            'max_temp_mae_celsius': float(feature_maes_real['Max.Sıcaklık']),
            'min_temp_mae_celsius': float(feature_maes_real['Min.Sıcaklık']),
            'humidity_mae_percent': float(feature_maes_real['Nem']),
            'pressure_mae_hpa': float(feature_maes_real['Basınç']),
            'wind_mae_kmh': float(feature_maes_real['Rüzgar']),
            'precipitation_mae_mm': float(feature_maes_real['Yağış']),
            'temperature_avg_mae_celsius': float(temp_mae_real)
        },
        
        # Özellik Bazında Metrikler (Scaled)
        'feature_maes_scaled': feature_maes_scaled,
        'feature_maes_real': feature_maes_real,
        
        # Eğitim Bilgileri
        'epochs_trained': int(epochs_trained),
        'epochs_max': EPOCHS,
        'early_stopping': epochs_trained < EPOCHS,
        'look_back': LOOK_BACK,
        'features': len(current_features),
        'batch_size': BATCH_SIZE,
        
        # Veri Seti Bilgileri
        'dataset_split': {
            'train_samples': int(len(X_train)),
            'val_samples': int(len(X_val)),
            'test_samples': int(len(X_test)),
            'total_samples': int(total_samples),
            'train_ratio': 0.70,
            'val_ratio': 0.15,
            'test_ratio': 0.15
        },
        
        # Training History (son 50 epoch)
        'training_history': {
            'loss': [float(x) for x in history.history['loss'][-50:]],
            'val_loss': [float(x) for x in history.history['val_loss'][-50:]],
            'mae': [float(x) for x in history.history['mae'][-50:]],
            'val_mae': [float(x) for x in history.history['val_mae'][-50:]]
        },
        
        # Grafik Yolları
        'graph_paths': {
            'loss_curve': 'training_graphs/loss_curve.png',
            'prediction_vs_actual': 'training_graphs/prediction_vs_actual.png',
            'scatter_correlation': 'training_graphs/scatter_correlation.png',
            'feature_mae_chart': 'training_graphs/feature_mae_comparison.png'
        }
    }
    
    # Joblib olarak kaydet
    metrics_path = os.path.join(current_dir, f'model_metrics_{CITY_NAME.lower()}.joblib')
    joblib.dump(metrics, metrics_path)
    
    # JSON olarak da kaydet (UI için kolay okuma)
    json_path = os.path.join(current_dir, f'model_metrics_{CITY_NAME.lower()}.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)
    
    # 7. Final Rapor
    print(f"\n{'='*60}")
    print(f"           EĞİTİM VE DEĞERLENDİRME TAMAMLANDI")
    print(f"{'='*60}")
    print(f"\n📊 VALIDATION SONUÇLARI (Eğitim sırasında izlendi):")
    print(f"   • Validation MAE (scaled): {final_val_mae:.4f}")
    print(f"   • Validation MSE: {final_val_loss:.6f}")
    print(f"\n🎯 TEST SONUÇLARI (Final - Model hiç görmedi):")
    print(f"   • Test MAE (scaled): {test_mae:.4f}")
    print(f"   • Test MSE: {test_loss:.6f}")
    print(f"\n🌡️  GERÇEK BİRİM METRİKLERİ:")
    print(f"   • Sıcaklık Ortalama MAE: {temp_mae_real:.2f}°C")
    print(f"   • Max Sıcaklık MAE: {feature_maes_real['Max.Sıcaklık']:.2f}°C")
    print(f"   • Min Sıcaklık MAE: {feature_maes_real['Min.Sıcaklık']:.2f}°C")
    print(f"   • Nem MAE: {feature_maes_real['Nem']:.2f}%")
    print(f"\n📈 EĞİTİM BİLGİLERİ:")
    print(f"   • Eğitilen Epoch: {epochs_trained}")
    print(f"   • Early Stopping: {'Evet' if epochs_trained < EPOCHS else 'Hayır'}")
    print(f"\n💾 KAYDEDİLEN DOSYALAR:")
    print(f"   • Model: {model_path}")
    print(f"   • Scaler: {scaler_path}")
    print(f"   • Metrikler (joblib): {metrics_path}")
    print(f"   • Metrikler (JSON): {json_path}")
    print(f"   • Grafikler: {graphs_dir}/")
    print(f"{'='*60}")
