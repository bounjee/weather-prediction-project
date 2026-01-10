# 🌾 AgroWeatherAI - Akıllı Tarımsal Hava Tahmin Sistemi

> **Yapay Zeka destekli, tarım odaklı hava durumu tahmin ve karar destek platformu**

AgroWeatherAI, çiftçilerin ve tarım uzmanlarının hava koşullarına dayalı kritik kararları bilimsel verilerle almasını sağlayan, tam entegre bir web uygulamasıdır. Klasik hava durumu uygulamalarının ötesinde, **don riski, ekim zamanı, ilaçlama uygunluğu ve hastalık tehditlerini** gerçek zamanlı olarak analiz eder.

---

## 🎯 Proje Hedefi

Tarımda en büyük belirsizlik kaynaklarından biri hava koşullarıdır. Bu proje:
- ✅ Bölgeye özel (hiper-lokal) tahminler yapar
- ✅ Ham hava verilerini **tarımsal aksiyonlara** dönüştürür
- ✅ Günlük operasyonel kararlar için **fizik bazlı risk analizleri** sunar
- ✅ Doğal dil tabanlı **AI asistan** ile kullanıcıya rehberlik eder

---

## ✨ Ana Özellikler

### 🧠 1. Derin Öğrenme Tabanlı Tahmin Motoru
**Kullanılan Model:** Deep (stacked) LSTM — `ai-model/train_model.py` ile eğitilir, `ai-model/predict_server.py` ile servis edilir.

- **Look-back penceresi:** 90 gün (`LOOK_BACK = 90`)
- **Model mimarisi (kod):** Bi-LSTM(128) → LSTM(128) → LSTM(64) → Dense(64→32→10) (+ Dropout/BatchNorm)
- **Eğitim verisi (repo snapshot):** `ai-model/cities.csv` (2019-01-01 → 2025-11-01, 24,970 satır / 10 şehir). Eğitimde `CITY_NAME='Ankara'` ile Ankara alt-kümesi (2,497 satır) kullanılır.
- **Girdi özellikleri:** 8 meteorolojik özellik + 2 mevsimsel kodlama (`day_sin`, `day_cos`) = 10 boyut
- **Eğitim split:** İlk %85 eğitim, son %15 doğrulama (kronolojik / time-ordered)
- **Kayıtlı metrikler (doğrulama):** `val_mae = 0.0516217`, `val_loss(MSE) = 0.0059382` (`ai-model/model_metrics_ankara.joblib`)
  - Not: Model MinMax ölçekli uzayda (0–1) eğitildiği için bu değerler doğrudan °C gibi fiziksel birimler değildir.

### 📊 2. Akıllı Mevsimsel Hafıza (Seasonal Memory)
Sistem, **canlı tahmin yaparken geçmiş yılların aynı dönemini referans alır:**
- Bugünün tarihine göre geçmiş yıllardan aynı döneme denk gelen **90 günlük kesintisiz pencere** aranır.
- Yıl deneme sırası: **[2, 3, 4, 5, 1]** yıl geri (öncelik 2 yıl önce).
- Hiçbir yılda yeterli pencere bulunamazsa, aynı şehrin `cities.csv` içindeki **son 90 günü** fallback olarak kullanılır.

### 🌡️ 3. Tarımsal Risk Analiz Motoru
AI tahmini ham verileri (sıcaklık, nem vb.) alır ve fiziksel formüllerle tarımsal risklere çevirir:

#### ❄️ Don Riski Analizi
**Kullanılan Metrikler:**
- **Dew Point (yaklaşık):** \(DP \approx T_{min} - \frac{100 - RH}{5}\)
- **Kara Don (Black Frost):** Hava çok kuru ve soğuksa bitki özsuyu donar (en tehlikeli)
- **Beyaz Don (White Frost):** Yüzeyde buz kristalleri oluşur

**Karar Kuralları:**
- 🔴 **Kara Don (EXTREME):** `Min. Sıcaklık ≤ 0°C` VE `Dew Point ≤ -3°C` VE `(Min - DewPoint) > 2`
- ⚪ **Kırağı (White Frost):** `Min. Sıcaklık ≤ 0°C` ise (≤-4 HIGH, ≤-2 MEDIUM, aksi LOW)
- 🟠 **Sınırda Don:** `Min. Sıcaklık ≤ 2°C` ise LOW, aksi NONE

#### 🌱 Ekim Uygunluk Analizi
**Kullanılan Metrikler:**
- **GDD (Growing Degree Days):** Toprağın birikmiş ısı enerjisi
  - Formül: `(T_max + T_min) / 2 - T_base` (T_base = 5°C, negatifse 0’a kırpılır)

**Karar Kuralları:**
- ✅ Uygun: GDD > 0 ve diğer engeller yoksa
- ❌ Uygun Değil: GDD ≤ 0 veya Ort. Sıcaklık < 5°C veya Yağış İhtimali > %60 veya Rüzgar > 25

#### 🚜 İlaçlama Zamanlaması
**Karar Kuralları:**
- ✅ Uygun: Rüzgar düşükse, yağış riski yoksa ve sıcaklık çok yüksek değilse
- ❌ Uygun Değil: Rüzgar > 15 veya Yağış İhtimali > %40 veya Sıcaklık > 30°C

#### 🍄 Hastalık Riski (Fungal)
**Karar Kuralları:**
- 🔴 Yüksek: Nem > %80, 15°C ≤ Sıcaklık ≤ 28°C, Yağış İhtimali > %30
- 🟢 Düşük: Kuru ve serin hava

### 💬 4. AI Chatbot Asistan
- Doğal dilde sorulara cevap verir
- Örnekler: *"Yarın don var mı?"*, *"İlaçlama yapabilir miyim?"*
- Backend'deki risk motorlarıyla entegre, gerçek zamanlı analiz yapar

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  • Modern UI (Vite + TailwindCSS + ShadcnUI)            │
│  • Dashboard, Risk Kartları, Chatbot Widget             │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP REST API
┌─────────────────▼───────────────────────────────────────┐
│              BACKEND (Node.js + Express)                 │
│  • WeatherService: AI sunucusu ile iletişim             │
│  • DecisionEngine: Risk hesaplama motoru                │
│  • ChatService: Kural tabanlı asistan mantığı           │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP (Port 5000)
┌─────────────────▼───────────────────────────────────────┐
│          AI PREDICTION SERVER (Python + Flask)           │
│  • LSTM Model (TensorFlow/Keras)                        │
│  • Seasonal Memory Logic                                │
│  • cities.csv (6 yıllık veri arşivi)                    │
└──────────────────────────────────────────────────────────┘
```

### Veri Akışı:
1. Kullanıcı Dashboard'u açar
2. Frontend → Backend'e "Ankara için tahmin" ister
3. Backend → AI Server'a `/predict` isteği atar (bu repoda backend `days=6` ile çağırır).
4. AI Server:
   - Bugünün tarihini okur.
   - Seasonal Memory ile geçmiş yılların aynı takvim dönemine denk gelen **90 günlük** pencereyi seçer (`LOOK_BACK = 90`).
   - Seçilen pencereyi ölçekler, modeli iteratif çalıştırır ve **`days` kadar** (backend: 6 gün) yarın başlayacak şekilde tahmin üretir.
5. Backend → Gelen tahminleri Don/Ekim/İlaçlama formüllerinden geçirir
6. Frontend → Kullanıcıya "Riskli/Uygun" kartları gösterir

---

## 🔬 AI Modeli Teknik Detayları

Bu bölüm, repodaki kod ve artifact’lardan doğrulanabilen AI bileşenini özetler.

### Veri seti (training)
- **Dosya:** `ai-model/cities.csv`
- **Tarih aralığı (repo snapshot):** 2019-01-01 → 2025-11-01
- **Boyut (repo snapshot):** 24,970 satır / 10 şehir (Ankara: 2,497 satır)
- **Eğitim kapsamı:** `train_model.py` içinde `CITY_NAME = 'Ankara'` filtresi uygulanır (Ankara-only eğitim).
- **Kaynak notu:** `cities.csv` için dış veri kaynağı/citation bilgisi bu repoda kayıtlı değildir.

### Feature set (10 boyut)
**Base meteorolojik özellikler (8)** (`FEATURE_COLS`):
- `daily_avg_temp`, `daily_max_temp`, `daily_min_temp`
- `daily_avg_wind_speed`
- `avg_relative_humidity`
- `avg_pressure`
- `precipitation_sum`
- `rainy_hour_sum`

**Mevsimsel kodlama (2)**:
- `day_sin = sin(2π * day_of_year / 365.25)`
- `day_cos = cos(2π * day_of_year / 365.25)`

### Veri temizleme & ölçekleme
`train_model.py` içindeki akış:
- Tarih parse edilir, şehir filtrelenir, veri kronolojik sıralanır.
- Eksik değerler: **linear interpolation + backward/forward fill**
- Ölçekleme: **MinMaxScaler(feature_range=(0,1))**

### Supervised time-series framing (training)
- Girdi penceresi: **90 gün** → `X.shape = (num_samples, 90, 10)`
- Hedef: **ertesi günün** 10D vektörü → `y.shape = (num_samples, 10)`
- Not: Eğitim **single-step (next-day)** yapılır. Multi-day tahmin, inference sırasında iteratif olarak üretilir.
- Train/validation split: **%85 / %15** (kronolojik)

### Model mimarisi (Keras)
`build_deep_model()`:
- Bidirectional LSTM(128, return_sequences=True) → BatchNorm → Dropout(0.3)
- LSTM(128, return_sequences=True) → Dropout(0.3)
- LSTM(64, return_sequences=False) → BatchNorm → Dropout(0.2)
- Dense(64) → ReLU → Dropout(0.1)
- Dense(32) → ReLU
- Dense(10) output (next-day 10D tahmin)

### Eğitim ayarları
- Loss: MSE
- Optimizer: Adam
- Epochs: 100
- Batch size: 32
- Callbacks:
  - EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True)
  - ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=7, min_lr=1e-5)

### Canlı tahmin (inference) — Smart Seasonal Memory + iteratif forecasting
`predict_server.py` akışı:
- `/predict?city=<name>&days=<N>` endpoint’i üzerinden tahmin üretilir (varsayılan `days=7`).
- Bu repodaki backend, AI sunucusunu `days=6` ile çağırır; bu nedenle UI “yarın”dan itibaren **6 günlük** tahmin listesi alır.
- Seasonal seed: geçmiş yılların aynı dönemine denk gelen 90 günlük pencere aranır; yıl sırası `[2, 3, 4, 5, 1]`.
- Tahmin: her adımda modelin “ertesi gün” çıktısı alınır; bu çıktı pencereye eklenir ve pencere kaydırılarak bir sonraki gün iteratif tahmin edilir.
- Her tahmin gününde `day_sin/day_cos` deterministik olarak yeniden hesaplanır ve girdi satırına eklenir.

### Persist edilen artifact’lar
- Model: `ai-model/weather_lstm_ankara.keras`
- Scaler: `ai-model/scaler_ankara.joblib`
- Metrikler: `ai-model/model_metrics_ankara.joblib`

---

## 💡 Tahmin Mantığı: Seasonal Memory

Sistem her gün şu adımları izler:

1. **Tarih Tespiti:** `datetime.now()` ile bugünün tarihi alınır (örn: 28.12.2025)
2. **Geçmiş Arama:** `cities.csv` dosyasında, geçmiş yılların aynı takvim dönemine denk gelen 90 günlük blok aranır:
   - Yıl deneme sırası: `[2, 3, 4, 5, 1]` (2 yıl önce öncelikli)
   - Hiçbir yılda yeterli blok bulunamazsa, aynı şehrin `cities.csv` içindeki **son 90 günü** fallback olarak kullanılır.
3. **90 Günlük Pencere:** Bulunan hedef tarihten `LOOK_BACK` gün geriye gidilerek 90 günlük pencere oluşturulur.
4. **Model Girişi:** Bu 90 günlük gerçek veri LSTM modeline verilir
5. **İteratif Tahmin:** Model 1. günü tahmin eder, sonucu pencereye ekler, 2. günü tahmin eder... (`days` kadar)
6. **Sonuç:** Yarın başlayarak `days` adet günlük tahmin üretilir.

**Neden Bu Yöntem?**
- ✅ Mevsimsel pattern'leri doğru yakalar (Aralık = Kış)
- ✅ Temporal continuity (ardışık 90 gün) LSTM için idealdir
- ✅ Veri boşluklarından etkilenmez
- ✅ Her gün otomatik güncellenir

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 16+
- Python 3.8+
- npm veya yarn

### 1. AI Model Sunucusu (Python)
```bash
cd ai-model
pip install -r requirements.txt
python predict_server.py
# Port: 5000
```

### 2. Backend API (Node.js)
```bash
cd backend
npm install
npm run dev
# Port: 3000
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Port: 5173
```

Tarayıcıda `http://localhost:5173` adresine gidin.

---

## 📁 Proje Yapısı

```
weather-predict/
├── ai-model/
│   ├── cities.csv                    # 6 yıllık hava verisi
│   ├── train_model.py                # Model eğitim scripti
│   ├── predict_server.py             # Flask API (tahmin sunucusu)
│   ├── weather_lstm_ankara.keras     # Eğitilmiş model
│   └── model_metrics_ankara.joblib   # Performans metrikleri
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── WeatherService.ts     # AI sunucusu iletişimi
│   │   │   ├── DecisionEngine.ts     # Risk hesaplama motoru
│   │   │   └── ChatService.ts        # Chatbot mantığı
│   │   └── routes/
│   │       ├── weather.ts            # /api/weather endpoint
│   │       └── chat.ts               # /api/chat endpoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Ana ekran
│   │   │   └── LocationSelect.tsx    # Şehir seçimi
│   │   └── components/
│   │       └── ChatWidget.tsx        # AI asistan widget
│   └── package.json
└── docs/
    ├── sistem-genel-bakis.md         # Genel bakış
    ├── model-egitim-detaylari.md     # AI teknik detaylar
    ├── decision-rules.md             # Risk formülleri
    └── AI_DEVELOPER_GUIDE.md         # Geliştirici rehberi
```

---

## 🧪 Örnek Kullanım Senaryoları

### Senaryo 1: Don Riski Kontrolü
**Kullanıcı Akışı:**
1. Dashboard açılır
2. "Risk Analizi" kartlarında **Don Riski** kartı görülür
3. Kart kırmızıysa (Yüksek Risk):
   - "🔴 KARA DON RİSKİ! Nem çok düşük, donma gözle görülmeyebilir ama bitki özsuyu donabilir. Kritik önlem şart."
   - Teknik detaylarda kullanılan eşikler `DecisionEngine` kurallarına dayanır

**Chatbot Kullanımı:**
- *Kullanıcı:* "Don riski var mı?"
- *AI:* "Şu an için önemli bir don riski görünmüyor."

### Senaryo 2: İlaçlama Zamanı
**Kullanıcı Akışı:**
1. "İlaçlama" kartını kontrol eder
2. Yeşil (Uygun) görürse:
   - "İlaçlama için rüzgar, sıcaklık ve nem dengesi uygun."
   - İlaçlamayı planlar

**Chatbot Kullanımı:**
- *Kullanıcı:* "Bugün ilaç atabilir miyim?"
- *AI:* "✅ İlaçlama yapabilirsiniz. Rüzgar sürüklenmesi veya yağmurla yıkanma riski düşük."

---

## 📊 Performans ve Doğruluk

### Model metrikleri (repo içi)
- Eğitim sırasında kaydedilen metrikler: `ai-model/model_metrics_ankara.joblib`
- `val_mae = 0.0516217` (scaled)
- `val_loss (MSE) = 0.0059382` (scaled)
- **Önemli not (birim):** Model MinMax ölçekli uzayda (0–1) eğitildiği için bu metrikler doğrudan °C gibi fiziksel birimler değildir. Fiziksel birimlerde ölçüm için tahmin/gerçek değerleri inverse-transform edip metrikleri değişken bazında (ör. `daily_max_temp`) hesaplamak gerekir.

---

## 🛠️ Geliştirme ve Katkı

### Model Yeniden Eğitimi
Eğer `cities.csv` dosyasına yeni veri eklerseniz:
```bash
cd ai-model
python train_model.py
```
Bu işlem:
- Yeni veriyi dahil ederek modeli eğitir
- `weather_lstm_ankara.keras` dosyasını günceller
- `model_metrics_ankara.joblib` dosyasını yeniler

### Yeni Şehir Ekleme
1. `cities.csv` dosyasına yeni şehir verilerini ekleyin
2. `train_model.py` içinde `CITY_NAME` değişkenini güncelleyin
3. Modeli yeniden eğitin

---

## 📝 Lisans ve İletişim

Bu proje eğitim ve araştırma amaçlıdır. Ticari kullanım için iletişime geçiniz.

**Geliştirici:** AgroWeatherAI Team  
**Teknoloji Stack:** React, Node.js, Python, TensorFlow, Flask  
**Son Güncelleme:** Aralık 2025

---

## 🎓 Not

Sistemdeki tarımsal risk kuralları ve eşikler, repodaki `backend/src/services/DecisionEngine.ts` dosyasında deterministik olarak tanımlıdır. Dokümantasyon metni ile kod arasında çelişki görürseniz, **kod** kaynak otoritedir.
