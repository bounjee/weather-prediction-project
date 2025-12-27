from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import joblib
import os
from datetime import timedelta # Added for timedelta

app = Flask(__name__)

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
LOOK_BACK = 90 # 90 Günlük yeni hafıza penceresi

# Model ve Scaler yollarını belirle (absolute path)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, f'weather_lstm_{CITY_NAME.lower()}.keras')
SCALER_PATH = os.path.join(BASE_DIR, f'scaler_{CITY_NAME.lower()}.joblib')
CSV_PATH = os.path.join(BASE_DIR, 'cities.csv')

# Global Değişkenler
model = None
scaler = None
df = None
model_metrics = None  # Dashboard için gerçek metrikler

def load_resources():
    global model, scaler, df, model_metrics
    print("\n--- AI Servis Kaynakları Yükleniyor ---")
    try:
        if os.path.exists(MODEL_PATH):
            model = load_model(MODEL_PATH)
            print("Model (LSTM) başarıyla belleğe alındı.")
        if os.path.exists(SCALER_PATH):
            scaler = joblib.load(SCALER_PATH)
            print("Veri Ölçekleyici (Scaler) yüklendi.")
        if os.path.exists(CSV_PATH):
            df = pd.read_csv(CSV_PATH)
            df['date'] = pd.to_datetime(df['date'])
            print(f"Tarihsel Veri Seti ({len(df)} satır) hazır.")
        
        # Model metriklerini yükle (eğitimden kaydedilmiş)
        metrics_path = os.path.join(BASE_DIR, f'model_metrics_{CITY_NAME.lower()}.joblib')
        if os.path.exists(metrics_path):
            model_metrics = joblib.load(metrics_path)
            print(f"Model Metrikleri yüklendi: MAE={model_metrics['val_mae']:.4f}°C")
        else:
            print("⚠️  Model metrikleri bulunamadı, varsayılan değerler kullanılacak.")
            model_metrics = {
                'architecture': 'Deep Bidirectional LSTM',
                'val_mae': 0.62,
                'val_loss': 0.0014,
                'epochs_trained': 100,
                'look_back': 90,
                'features': 10
            }
    except Exception as e:
        print(f"KRİTİK HATA: Kaynaklar yüklenemedi! {e}")

load_resources()

@app.route('/predict', methods=['GET'])
def predict():
    city = request.args.get('city', CITY_NAME)
    days_to_predict = int(request.args.get('days', 7))

    if model is None or scaler is None or df is None:
        return jsonify({'error': 'AI Modeli veya Veri Seti hazır değil'}), 500

    try:
        from datetime import datetime, timedelta
        
        # Bugünün tarihini al
        today = datetime.now()
        
        # 2 yıl geriye başla, bulamazsan 3, 4, 5 yıl geriye git
        city_df = None
        used_year = None
        
        for year_offset in [2, 3, 4, 5, 1]:  # 2 yıl öncelikli
            target_year = today.year - year_offset
            target_date = today.replace(year=target_year)
            start_date = target_date - timedelta(days=LOOK_BACK)
            
            # Bu yılın dönemini filtrele
            temp_df = df[df['city_name'] == city].copy()
            temp_df['date'] = pd.to_datetime(temp_df['date'])
            
            temp_df = temp_df[
                (temp_df['date'] >= start_date) & 
                (temp_df['date'] <= target_date)
            ].sort_values('date')
            
            if len(temp_df) >= LOOK_BACK:
                city_df = temp_df.tail(LOOK_BACK)
                used_year = target_year
                break
        
        if city_df is None or len(city_df) < LOOK_BACK:
            print(f"⚠️  Hiçbir yılda yeterli veri yok! CSV son 90 gün kullanılıyor.")
            city_df = df[df['city_name'] == city].sort_values('date').tail(LOOK_BACK).copy()
            used_year = "CSV (fallback)"
        
        print(f"\n[TAHMİN] Bugün: {today.strftime('%Y-%m-%d')}")
        print(f"[TAHMİN] Kullanılan dönem: {city_df['date'].min()} → {city_df['date'].max()} ({used_year})")
        print(f"[TAHMİN] Veri satır sayısı: {len(city_df)}")

        # Mevsimsel Özellikler (Engineered Features)
        city_df['day_of_year'] = pd.to_datetime(city_df['date']).dt.dayofyear
        city_df['day_sin'] = np.sin(2 * np.pi * city_df['day_of_year'] / 365.25)
        city_df['day_cos'] = np.cos(2 * np.pi * city_df['day_of_year'] / 365.25)
        
        EXTENDED_COLS = FEATURE_COLS + ['day_sin', 'day_cos']
        
        # 2. Girdi Penceresini Hazırla
        input_data = city_df[EXTENDED_COLS].values
        scaled_input = scaler.transform(input_data)
        
        # Sliding Window Başlat
        current_window = scaled_input.reshape(1, LOOK_BACK, len(EXTENDED_COLS))
        
        predictions = []
        last_date = city_df['date'].iloc[-1]

        print(f"[AI] {city} için {days_to_predict} günlük tahmin süreci başlatıldı.")

        # İleriye Dönük İteratif Tahmin Döngüsü
        for i in range(days_to_predict):
            # Model Tahmini (Scaled)
            pred_scaled = model.predict(current_window, verbose=0)
            
            # Gerçek Değerlere Dönüştür (Inverse Transform)
            # Scaler 10 feature bekler, model 10 feature çıktı verir.
            pred_final = scaler.inverse_transform(pred_scaled)[0]
            
            # Tarih Hesapla (Bugünden başlayarak)
            pred_date = today + timedelta(days=i+1)
            
            # Sonucu Listeye Ekle
            predictions.append({
                'date': pred_date.strftime('%Y-%m-%d'),
                'avg_temp': float(pred_final[0]),
                'max_temp': float(pred_final[1]),
                'min_temp': float(pred_final[2]),
                'wind_speed': float(pred_final[3]),
                'humidity': float(pred_final[4]),
                'pressure': float(pred_final[5]),
                'precipitation': float(pred_final[6]),
                'rainy_hour_sum': float(pred_final[7])
            })
            
            # --- Pencereyi Güncelle (Bir sonraki gün için girdi hazırla) ---
            # 1. Yeni günün deterministik zaman verilerini hesapla
            doy = pred_date.timetuple().tm_yday
            d_sin = np.sin(2 * np.pi * doy / 365.25)
            d_cos = np.cos(2 * np.pi * doy / 365.25)
            
            # 2. Tahmin edilen değerler + Sabit zaman verileri = Yeni Girdi Satırı
            # pred_final[:8] hava durumu, d_sin/d_cos mevsimsel döngüdür.
            new_row_raw = np.zeros((1, len(EXTENDED_COLS)))
            new_row_raw[0, :len(FEATURE_COLS)] = pred_final[:len(FEATURE_COLS)] 
            new_row_raw[0, len(FEATURE_COLS):] = [d_sin, d_cos]
            
            # Ölçekle
            new_row_scaled = scaler.transform(new_row_raw)
            
            # Pencereyi Kaydır (Slide)
            current_window = np.append(current_window[:, 1:, :], new_row_scaled.reshape(1, 1, len(EXTENDED_COLS)), axis=1)

        # Geçmiş Veriler (Grafik için)
        history = city_df['daily_max_temp'].tail(7).tolist()

        return jsonify({
            'city': city,
            'forecast': predictions,
            'history': history,
            'model_info': {
                'architecture': model_metrics['architecture'],
                'pencere': model_metrics['look_back'],
                'features': model_metrics['features'],
                'val_mae': round(model_metrics['val_mae'], 4),
                'val_loss': round(model_metrics['val_loss'], 6),
                'epochs': model_metrics['epochs_trained']
            }
        })
    except Exception as e:
        print(f"HATA (Predict): {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/reload', methods=['GET'])
def reload():
    load_resources()
    return jsonify({'status': 'resources reloaded'})

if __name__ == '__main__':
    app.run(port=5000, debug=True)

