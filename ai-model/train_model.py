import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import matplotlib.pyplot as plt
import os

# Ayarlar
CITY_NAME = 'Ankara' # Modelin eğitileceği şehir
TARGET_COL = 'daily_max_temp' # Tahmin edilecek değer
FEATURE_COLS = ['daily_max_temp', 'daily_min_temp', 'avg_relative_humidity'] # Girdi olarak kullanılacaklar
LOOK_BACK = 30 # Geçmiş 30 güne bakarak tahmin et
EPOCHS = 20
BATCH_SIZE = 32

def load_and_process_data(filepath):
    print(f"Dataset yükleniyor: {filepath}")
    df = pd.read_csv(filepath)
    
    # Tarihi datetime objesine çevir
    df['date'] = pd.to_datetime(df['date'])
    
    # 1. Şehir Filtreleme
    df_city = df[df['city_name'] == CITY_NAME].sort_values('date')
    print(f"{CITY_NAME} için {len(df_city)} günlük veri bulundu.")
    
    if len(df_city) == 0:
        raise ValueError(f"Hata: {CITY_NAME} şehrine ait veri bulunamadı! Mevcut şehirleri kontrol edin.")

    # 2. Sadece gerekli sütunları al
    data = df_city[FEATURE_COLS].values
    
    # 3. Normalizasyon (0-1 arasına sıkıştır)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)
    
    return scaled_data, scaler, df_city['date'].values

def create_dataset(dataset, look_back=30):
    X, y = [], []
    for i in range(look_back, len(dataset)):
        # Girdi: [i-look_back ... i-1] arasındaki tüm featurelar
        X.append(dataset[i-look_back:i, :]) 
        # Çıktı: i. gündeki HEDEF DEĞER (Sadece Max Temp - yani 0. indeks)
        y.append(dataset[i, 0]) 
    return np.array(X), np.array(y)

def build_model(input_shape):
    model = Sequential()
    
    # 1. LSTM Katmanı
    model.add(LSTM(units=64, return_sequences=True, input_shape=input_shape))
    model.add(Dropout(0.2))
    
    # 2. LSTM Katmanı
    model.add(LSTM(units=32, return_sequences=False))
    model.add(Dropout(0.2))
    
    # Çıkış
    model.add(Dense(units=1)) # Tek bir sıcaklık değeri tahmin et
    
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, 'cities.csv')
    
    # 1. Veri Hazırlığı
    try:
        scaled_data, scaler, dates = load_and_process_data(csv_path)
    except FileNotFoundError:
        print("HATA: 'cities.csv' dosyası bulunamadı! Lütfen dosyayı ai-model klasörüne yükleyin.")
        exit(1)
        
    X, y = create_dataset(scaled_data, LOOK_BACK)
    
    # Eğitim/Test Ayrımı (%80 - %20)
    train_size = int(len(X) * 0.8)
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    print(f"Eğitim Verisi: {X_train.shape}, Test Verisi: {X_test.shape}")
    
    # 2. Model Kurulumu
    model = build_model((X_train.shape[1], X_train.shape[2]))
    
    # 3. Eğitim
    print(f"\nModel eğitiliyor ({CITY_NAME})...")
    history = model.fit(X_train, y_train, epochs=EPOCHS, batch_size=BATCH_SIZE, validation_data=(X_test, y_test), verbose=1)
    
    # 4. Kaydetme
    model_path = os.path.join(current_dir, f'weather_lstm_{CITY_NAME.lower()}.keras')
    model.save(model_path)
    print(f"\nModel başarıyla kaydedildi: {model_path}")
    
    # 5. Test ve Görselleştirme (Konsol Çıktısı)
    train_loss = history.history['loss'][-1]
    val_loss = history.history['val_loss'][-1]
    print(f"\nSon Eğitim Hatası (Loss): {train_loss:.5f}")
    print(f"Son Doğrulama Hatası (Val Loss): {val_loss:.5f}")
    
    print("\n--- Model Kullanıma Hazır ---")
