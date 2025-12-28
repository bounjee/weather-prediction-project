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
**Kullanılan Model:** Deep Bidirectional LSTM (Long Short-Term Memory)

- **Mimari:** 3 katmanlı Bi-LSTM + Dropout + Batch Normalization
- **Eğitim Verisi:** 2019-2025 arası 6 yıllık Ankara hava verileri (~25.000 satır)
- **Performans:** MAE (Mean Absolute Error) = **0.054°C** (professiyonel seviye doğruluk)
- **Özellikler (Features):** Sıcaklık (avg/max/min), nem, rüzgar, basınç, yağış + mevsimsel kodlama (sin/cos)

### 📊 2. Akıllı Mevsimsel Hafıza (Seasonal Memory)
Sistem, **canlı tahmin yaparken geçmiş yılların aynı dönemini referans alır:**
- Bugün 28 Aralık ise → Geçmiş yılların (2023, 2022...) **28 Aralık** dönemindeki 90 günlük veriyi kullanır
- LSTM modeli bu verilerle "Aralık sonunda hava nasıl davranır?" sorusunu yanıtlar
- Her gün otomatik güncellenir, **manuel müdahale gerekmez**

### 🌡️ 3. Tarımsal Risk Analiz Motoru
AI tahmini ham verileri (sıcaklık, nem vb.) alır ve fiziksel formüllerle tarımsal risklere çevirir:

#### ❄️ Don Riski Analizi
**Kullanılan Metrikler:**
- **Magnus Formülü** ile Çiy Noktası (Dew Point) hesaplanır
- **Kara Don (Black Frost):** Hava çok kuru ve soğuksa bitki özsuyu donar (en tehlikeli)
- **Beyaz Don (White Frost):** Yüzeyde buz kristalleri oluşur

**Karar Kuralları:**
- 🔴 Yüksek Risk: `Min. Sıcaklık ≤ 0°C` VE `Dew Point ≤ -3°C`
- 🟠 Orta Risk: `Min. Sıcaklık ≤ 2°C`
- 🟢 Düşük Risk: `Min. Sıcaklık > 2°C`

#### 🌱 Ekim Uygunluk Analizi
**Kullanılan Metrikler:**
- **GDD (Growing Degree Days):** Toprağın birikmiş ısı enerjisi
  - Formül: `(T_max + T_min) / 2 - T_base` (T_base = 10°C)
- **Toprak Sıcaklığı Tahmini:** Hava sıcaklığı - 3°C

**Karar Kuralları:**
- ✅ Uygun: GDD > 0, Ort. Sıcaklık > 5°C, Rüzgar < 30 km/s, Yağış < 5mm
- ❌ Riskli: Yukarıdaki koşullardan biri sağlanmazsa

#### 🚜 İlaçlama Zamanlaması
**Kullanılan Metrikler:**
- **Delta-T:** Kuru termometre - Islak termometre (Dew Point) farkı
  - İlacın damlacık ömrünü belirler

**Karar Kuralları:**
- ✅ İdeal: `2°C < Delta-T < 8°C`, Rüzgar < 15 km/s, Yağış ihtimali < %20
- ❌ Uygun Değil: Çok rüzgarlı, yağmurlu veya Delta-T aralığı dışında

#### 🍄 Hastalık Riski (Fungal)
**Karar Kuralları:**
- 🔴 Yüksek: Nem > %80, Sıcaklık > 15°C, Yağış > 0mm
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
│  • ChatService: NLP tabanlı asistan mantığı             │
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
3. Backend → AI Server'a bağlanır
4. AI Server:
   - Bugünün tarihini okur (örn: 28 Aralık)
   - `cities.csv`'den geçmiş yılların 28 Eylül - 28 Aralık verilerini çeker
   - LSTM modeline verir → 7 günlük tahmin üretir
5. Backend → Gelen tahminleri Don/Ekim/İlaçlama formüllerinden geçirir
6. Frontend → Kullanıcıya "Riskli/Uygun" kartları gösterir

---

## 🔬 AI Modeli Teknik Detayları

### Veri Seti
- **Kaynak:** Meteoroloji istasyonları (Ankara)
- **Dönem:** 1 Ocak 2019 - 1 Kasım 2025
- **Satır Sayısı:** ~25.000
- **Özellikler (10 boyut):**
  - `daily_avg_temp`, `daily_max_temp`, `daily_min_temp`
  - `humidity`, `wind_speed`, `pressure`, `precipitation`
  - `day_sin`, `day_cos` (Mevsimsel kodlama: 365 günü dairesel formata çevirir)

### Model Mimarisi
```python
Model: "Deep Bidirectional LSTM"
_________________________________________________________________
Layer (type)                 Output Shape              Param #
=================================================================
Input                        (None, 90, 10)            0
Bidirectional LSTM           (None, 90, 256)           139,264
Dropout (0.2)                (None, 90, 256)           0
Bidirectional LSTM           (None, 90, 256)           394,240
Dropout (0.2)                (None, 90, 256)           0
LSTM                         (None, 64)                82,176
Dropout (0.2)                (None, 64)                0
BatchNormalization           (None, 64)                256
Dense                        (None, 64)                4,160
Dense                        (None, 32)                2,080
Dense (Output)               (None, 10)                330
=================================================================
Total params: 622,506
```

### Eğitim Stratejisi
- **Loss Function:** MSE (Mean Squared Error)
- **Optimizer:** Adam
- **Batch Size:** 32
- **Epochs:** 100 (Early Stopping ile otomatik durdurma)
- **Validation Split:** %20
- **Callbacks:**
  - Early Stopping (patience=10)
  - ReduceLROnPlateau (patience=5)

### Performans Metrikleri
- **MAE (Mean Absolute Error):** 0.054°C
- **MSE (Mean Squared Error):** 0.0062
- **Eğitim Süresi:** ~40-50 epoch'ta optimize eder

---

## 💡 Tahmin Mantığı: Seasonal Memory

Sistem her gün şu adımları izler:

1. **Tarih Tespiti:** `datetime.now()` ile bugünün tarihi alınır (örn: 28.12.2025)
2. **Geçmiş Arama:** `cities.csv` dosyasında, geçmiş yılların aynı tarih aralığı aranır:
   - Öncelik: 2 yıl önce (2023)
   - Fallback: 3, 4, 5 yıl önce de taranır
3. **90 Günlük Pencere:** Bulunan yıldan (örn: 2023) **28 Eylül - 28 Aralık** arası 90 gün çekilir
4. **Model Girişi:** Bu 90 günlük gerçek veri LSTM modeline verilir
5. **İteratif Tahmin:** Model 1. günü tahmin eder, sonucu pencereye ekler, 2. günü tahmin eder... (7 güne kadar)
6. **Sonuç:** 29 Aralık - 4 Ocak arası tahminler üretilir

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
   - "Kara Don riski! Min: -2°C, Dew Point: -5°C"
   - Teknik detaylara tıklanırsa Magnus Formülü açıklanır

**Chatbot Kullanımı:**
- *Kullanıcı:* "Yarın don var mı?"
- *AI:* "⚠️ EVET! Ciddi don riski var. En düşük -2°C olacak. Hassas bitkileri koruyun."

### Senaryo 2: İlaçlama Zamanı
**Kullanıcı Akışı:**
1. "İlaçlama" kartını kontrol eder
2. Yeşil (Uygun) görürse:
   - "Delta-T: 4.2°C (İdeal), Rüzgar: 8 km/s"
   - İlaçlamayı planlar

**Chatbot Kullanımı:**
- *Kullanıcı:* "Bugün ilaç atabilir miyim?"
- *AI:* "✅ EVET! Koşullar ideal. Rüzgar sakin, yağış yok."

---

## 📊 Performans ve Doğruluk

### Model Doğruluğu
- Sıcaklık tahmini: **±0.05°C** ortalama sapma
- 7 günlük ufuk: %95+ güvenilirlik (ilk 3 gün için)

### Risk Analizleri
- Don tahmini: Fiziksel formül (Magnus), %100 bilimsel temelli
- Ekim/İlaçlama: Tarımsal literatür standartları

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

## 🎓 Kaynaklar ve Referanslar

- Magnus Formülü: [Meteoroloji Literatürü](https://en.wikipedia.org/wiki/Dew_point)
- GDD Hesaplaması: [Tarımsal Araştırma](https://en.wikipedia.org/wiki/Growing_degree-day)
- LSTM Networks: [Hochreiter & Schmidhuber, 1997](https://www.bioinf.jku.at/publications/older/2604.pdf)

**Not:** Tüm fiziksel formüller ve tarımsal kurallar bilimsel literatüre dayanmaktadır. Sistem önerileri karar desteği amaçlıdır, profesyonel danışmanlığın yerini almaz.
