# 🛠️ AgroWeatherAI Geliştirici & Bakım Rehberi

Bu belge, projeyi devralacak veya bakımını yapacak yazılımcılar için hazırlanmıştır. Sistemin kurulumu, eğitimi ve tahmin sunucusunun yönetimi ile ilgili teknik adımları içerir.

---

## 🏗️ Proje Yapısı

```
weather-predict/
├── ai-model/               # Python & Yapay Zeka Katmanı
│   ├── cities.csv          # Tarihsel hava durumu verisi
│   ├── train_model.py      # Modeli eğiten script
│   ├── predict_server.py   # Canlı tahmin sunucusu (Flask)
│   ├── weather_lstm_*.keras # Eğitilmiş model dosyası
│   └── scaler_*.joblib     # Veri normalizasyon dosyası
│
├── backend/                # Node.js API Katmanı
│   ├── src/services/       # İş mantığı (WeatherService, ChatService)
│   └── src/routes/         # API uç noktaları
│
└── frontend/               # React UI Katmanı
    └── src/pages/          # Dashboard ve arayüzler
```

---

## 🚀 1. AI Modeli Yönetimi (Python)

### 🐍 Kurulum
Gerekli kütüphaneleri yükleyin:
```bash
cd ai-model
pip install -r requirements.txt
```

### 🧠 Modeli Yeniden Eğitme
Eğer `cities.csv` dosyasına yeni veri eklerseniz, modeli güncellemek için:
```bash
python train_model.py
```
Bu işlem sonucunda `weather_lstm_{sehir}.keras` ve `model_metrics.joblib` dosyaları güncellenir.
*Not: Eğitim 100 epoch sürer ve Early Stopping mekanizması vardır.*

### 🔮 Tahmin Sunucusunu Başlatma
Frontend ve Backend'in tahmin alabilmesi için bu sunucu sürekli çalışmalıdır:
```bash
python predict_server.py
```
*Port:* 5000

---

## 🌐 2. Web Uygulaması Yönetimi (JS/TS)

### 🔙 Backend (API)
Tarım ve risk hesaplama motoru buradadır.
```bash
cd backend
npm install
npm run dev
```
*Port:* 3000

### 🎨 Frontend (UI)
Kullanıcı arayüzü.
```bash
cd frontend
npm install
npm run dev
```
*Port:* 5173

---

## ⚠️ Kritik Sistem Mantığı (ÖNEMLİ)

### Akıllı Mevsimsel Hafıza (Smart Seasonal Memory)
Sistem gerçek tarihli bir tahmin yaparken şu mantığı izler (`predict_server.py`):
1.  Bugünün tarihine bakar (Örn: 27 Aralık).
2.  CSV dosyasında geçmiş yıllara (2023, 2024...) giderek **aynı tarih aralığındaki** (28 Eylül - 27 Aralık) en temiz veriyi bulur.
3.  Modelin **girdi penceresi (Last 90 Days)** olarak bu geçmiş veriyi kullanır.
4.  Böylece LSTM modeli, "Aralık sonunda hava nasıl davranır?" sorusunu o mevsimin gerçek verisiyle cevaplar.

### Mock Veri Yok!
Projeden tüm mock (sahte) veriler temizlenmiştir.
- Gördüğünüz tahminler %100 AI modeli çıktısıdır.
- Gördüğünüz riskler (Don, Ekim) %100 fiziksel formül hesabıdır.

---

## 🐛 Sık Karşılaşılan Hatalar & Çözümler

**1. Hata:** `AI Service Failed (500)`
*   **Sebep:** `predict_server.py` çalışmıyor olabilir.
*   **Çözüm:** Python sunucusunu yeniden başlatın.

**2. Hata:** Tahminler çok sabit görünüyor.
*   **Sebep:** Model girdisi (Input Window) değişmiyor olabilir.
*   **Çözüm:** `cities.csv` kontrol edilmeli, tarih formatlarının `YYYY-MM-DD` olduğundan emin olunmalı.

**3. Hata:** "Model hazır değil" uyarısı.
*   **Sebep:** `.keras` veya `.joblib` dosyaları silinmiş.
*   **Çözüm:** `train_model.py` çalıştırılarak model tekrar oluşturulmalı.
