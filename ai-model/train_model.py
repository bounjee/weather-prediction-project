import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import matplotlib.pyplot as plt

# 1. Veri Yükleme ve Hazırlama
def load_data(filepath):
    # Gerçek senaryoda CSV'den okunacak
    # df = pd.read_csv(filepath)
    
    # Şimdilik MOCK veri üretiyoruz (Demo amaçlı)
    dates = pd.date_range(start='2020-01-01', end='2024-12-31', freq='D')
    df = pd.DataFrame({'Date': dates})
    
    # Sinus dalgası + rastgele gürültü ile sıcaklık simülasyonu
    x = np.arange(len(df))
    df['Temp_Max'] = 15 + 10 * np.sin(2 * np.pi * x / 365.25) + np.random.normal(0, 2, len(df))
    df['Temp_Min'] = df['Temp_Max'] - np.random.uniform(5, 12, len(df))
    df['Humidity'] = 60 + 20 * np.cos(2 * np.pi * x / 365.25) + np.random.normal(0, 5, len(df))
    
    print(f"Veri Seti Yüklendi. Toplam gün sayısı: {len(df)}")
    return df

# 2. Ön İşleme (Scaling & Windowing)
def preprocess_data(df, look_back=30):
    data = df[['Temp_Max']].values # Sadece Max Sıcaklık tahmini üzerine odaklanalım (Univariate)
    
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)
    
    X, y = [], []
    for i in range(look_back, len(scaled_data)):
        X.append(scaled_data[i-look_back:i, 0])
        y.append(scaled_data[i, 0])
        
    X, y = np.array(X), np.array(y)
    
    # LSTM için giriş şekli: [Samples, Time Steps, Features]
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))
    
    return X, y, scaler

# 3. Model Oluşturma (LSTM)
def create_model(input_shape):
    model = Sequential()
    
    # 1. LSTM Katmanı
    model.add(LSTM(units=50, return_sequences=True, input_shape=input_shape))
    model.add(Dropout(0.2)) # Overfitting'i önlemek için
    
    # 2. LSTM Katmanı
    model.add(LSTM(units=50, return_sequences=False))
    model.add(Dropout(0.2))
    
    # Çıkış Katmanı
    model.add(Dense(units=1)) # Tek bir değer (Sıcaklık) tahmin ediyoruz
    
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

# Ana Akış
if __name__ == "__main__":
    print("--- LSTM Model Eğitimi Başlıyor ---")
    
    # Veri
    df = load_data('historical_data.csv')
    
    # Hazırlık
    LOOK_BACK = 60 # Geçmiş 60 güne bakarak yarını tahmin et
    X, y, scaler = preprocess_data(df, LOOK_BACK)
    
    # Eğitim/Test Ayrımı (%80 Eğitim, %20 Test)
    train_size = int(len(X) * 0.8)
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    # Model Kurulumu
    model = create_model((X_train.shape[1], 1))
    model.summary()
    
    # Eğitim
    print("Model eğitiliyor... (Bu işlem biraz sürebilir)")
    history = model.fit(X_train, y_train, epochs=20, batch_size=32, validation_data=(X_test, y_test))
    
    # Kaydetme
    model.save('weather_lstm_model.keras')
    print("Model 'weather_lstm_model.keras' olarak kaydedildi.")
    
    # Test Tahmini
    predictions = model.predict(X_test)
    predictions = scaler.inverse_transform(predictions) # Normale çevir
    y_test_real = scaler.inverse_transform(y_test.reshape(-1, 1))
    
    # Basit bir görselleştirme (Terminalde göremesek de kodda bulunsun)
    # plt.plot(y_test_real, color='red', label='Gerçek Sıcaklık')
    # plt.plot(predictions, color='blue', label='Tahmin Edilen')
    # plt.legend()
    # plt.show()
    
    print("Eğitim Tamamlandı.")
