from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import os

app = Flask(__name__)

# Modeli ve Scaler'ı Global Olarak Yükle
MODEL_PATH = 'weather_lstm_ankara.keras'
CSV_PATH = 'cities.csv'
CITY_NAME = 'Ankara'
FEATURE_COLS = ['daily_max_temp', 'daily_min_temp', 'avg_relative_humidity']
LOOK_BACK = 30

print("--- AI Servisi Başlatılıyor ---")
try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"{MODEL_PATH} bulunamadı!")
    
    model = load_model(MODEL_PATH)
    print("Keras Modeli Yüklendi.")
    
    # Dataseti yükle (Scaler'ı fit etmek ve son verileri almak için)
    # Gerçek hayatta scaler pickle oalrak kaydedilirdi, burada datasetten tekrar fit ediyoruz pratik olsun diye
    df = pd.read_csv(CSV_PATH)
    df_city = df[df['city_name'] == CITY_NAME].sort_values('date')
    data = df_city[FEATURE_COLS].values
    
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaler.fit(data) # Scaler'ı eğit
    
    # Son 30 günü sakla (Tahmin için başlangıç noktası)
    last_30_days = data[-LOOK_BACK:]
    last_30_days_scaled = scaler.transform(last_30_days)
    print("Veri Seti Hazır. Tahminlere açık.")

except Exception as e:
    print(f"KRİTİK HATA: {e}")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model yüklenemedi'}), 500
    
    try:
        # Gelen istekte gün sayısı olabilir (ileriye dönük kaç gün?)
        # Şimdilik statik olarak 'Yarın'ı tahmin edelim.
        # Gerçek bir senaryoda Node.js bize 'son 30 günlük anlık veriyi' de gönderebilirdi.
        # Biz burada datasetimizdeki en son veriyi baz alarak "Gelecek Tahmini" simülasyonu yapıyoruz.
        
        # Son veriyi modele uygun hale getir: (1, 30, 3)
        input_data = last_30_days_scaled.reshape(1, LOOK_BACK, len(FEATURE_COLS))
        
        # Tahmin yap
        prediction_scaled = model.predict(input_data)
        
        # Ters ölçekleme (0-1 arasından gerçek dereceye dön)
        placeholder = np.zeros((1, len(FEATURE_COLS)))
        placeholder[:, 0] = prediction_scaled[0, 0]
        prediction_real = scaler.inverse_transform(placeholder)[0, 0]
        
        # Trend Analizi (Son 3 günün ortalamasına göre)
        last_3_days_real = scaler.inverse_transform(last_30_days)[-3:]
        avg_temp_last_3 = np.mean(last_3_days_real[:, 0]) # Temp sütunu 0
        avg_hum_last_3 = np.mean(last_3_days_real[:, 2]) # Humidity sütunu 2 (FEATURE_COLS sırasına göre)
        
        insight = ""
        if prediction_real < avg_temp_last_3 - 2:
            insight += "Sıcaklıklarda düşüş trendi var, don riskine dikkat edilmeli. "
        elif prediction_real > avg_temp_last_3 + 2:
            insight += "Sıcaklık artış eğiliminde. "
            
        if avg_hum_last_3 > 70:
             insight += "Son günlerde nem yüksek, mantar riski artabilir."
        elif avg_hum_last_3 < 40:
             insight += "Hava kuru, sulama ihtiyacı olabilir."
             
        final_message = f"Beklenen: {prediction_real:.1f}°C. {insight}"

        return jsonify({
            'city': CITY_NAME,
            'prediction_type': 'Max Temp (LSTM) + Trend',
            'value': float(f"{prediction_real:.2f}"),
            'unit': 'C',
            'history': [float(f"{x:.1f}") for x in scaler.inverse_transform(last_30_days)[-7:, 0]],
            'message': final_message
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
