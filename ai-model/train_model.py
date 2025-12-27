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
    
    train_size = int(len(X) * 0.85)
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
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
    
    history = model.fit(
        X_train, y_train, 
        epochs=EPOCHS, 
        batch_size=BATCH_SIZE, 
        validation_data=(X_test, y_test), 
        callbacks=[early_stop, reduce_lr],
        verbose=1
    )
    
    # 4. Kaydetme
    model_path = os.path.join(current_dir, f'weather_lstm_{CITY_NAME.lower()}.keras')
    scaler_path = os.path.join(current_dir, f'scaler_{CITY_NAME.lower()}.joblib')
    
    model.save(model_path)
    joblib.dump(scaler, scaler_path)
    
    # 5. Teknik Detay Raporu (Dashboard için metrikleri kaydet)
    final_val_loss = history.history['val_loss'][-1]
    final_val_mae = history.history['val_mae'][-1]
    epochs_trained = len(history.history['loss'])
    
    # Metrikleri kaydet (predict_server.py bunları okuyacak)
    metrics = {
        'architecture': 'Deep Bidirectional LSTM',
        'val_mae': float(final_val_mae),
        'val_loss': float(final_val_loss),
        'epochs_trained': int(epochs_trained),
        'look_back': LOOK_BACK,
        'features': len(current_features)
    }
    
    metrics_path = os.path.join(current_dir, f'model_metrics_{CITY_NAME.lower()}.joblib')
    joblib.dump(metrics, metrics_path)
    
    print(f"\n[EĞİTİM TAMAMLANDI]")
    print(f"========================================")
    print(f"Final Validation Loss (MSE): {final_val_loss:.6f}")
    print(f"Final Validation MAE: {final_val_mae:.6f} (Sıcaklık Hata Payı Yaklaşık)")
    print(f"Eğitilen Epoch Sayısı: {epochs_trained}")
    print(f"Model Konumu: {model_path}")
    print(f"Metrikler: {metrics_path}")
    print(f"========================================")
