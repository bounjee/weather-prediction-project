# 🧠 AgroWeatherAI: Model Eğitim ve Teknik Detaylar

Bu belge, sistemin kalbinde yer alan Derin Öğrenme (Deep Learning) modelinin nasıl eğitildiğini ve teknik özelliklerini açıklar.

---

## 1. Veri Seti ve Özellikler

### 📊 Veri Kaynağı
- **Veri dosyası:** `ai-model/cities.csv`
- **Kapsam (repo snapshot):** 2019-01-01 → 2025-11-01 (yaklaşık 6 yıl).
- **Kapsam:** 10 şehir, toplam 24,970 satır (günlük city-level kayıt).
- **Eğitimde kullanılan alt küme:** `CITY_NAME = 'Ankara'` filtresi ile Ankara verisi (2,497 satır).
- **Not:** `cities.csv` dosyasının dış kaynak/citation bilgisi bu repoda kayıtlı değildir; bu proje snapshot’ında veri dosyasının kendisi otorite kabul edilir.

### 🏷️ Kullanılan Özellikler (Input Features)
Model, sadece sıcaklığa bakmaz. Atmosferik olayların birbirini etkilediği gerçeğinden yola çıkarak **10 boyutlu** bir vektör kullanır:

1. **Sıcaklıklar:** Ortalama, Maksimum ve Minimum sıcaklık (°C).
2. **Nem:** Bağıl nem oranı (%).
3. **Rüzgar:** Rüzgar hızı.
4. **Basınç:** Atmosfer basıncı (hPa) - Hava değişimlerinin en erken habercisidir.
5. **Yağış:** Toplam yağış (`precipitation_sum`) ve yağışlı saat toplamı (`rainy_hour_sum`).
6. **Mevsimsel Kodlama:** `day_sin` ve `day_cos`.
   - *Neden?* Yapay zeka "27 Aralık" tarihini bilmez. Tarihleri trigonometrik (döngüsel) bir formata çevirerek modelin "Kışın ortasındayız" veya "Yaz yaklaşıyor" algısını matematiksel olarak kurmasını sağladık.

---

## 2. Model Mimarisi: Deep Bidirectional LSTM

Zaman serisi (Time-Series) tahmininde en güçlü mimari olan **LSTM (Long Short-Term Memory)** ağı kullanılmıştır.

### 🏗️ Ağ Yapısı
1. **Giriş Katmanı:** (90, 10) -> Son 90 gün x 10 Özellik.
2. **Bi-LSTM Katmanı:** 128 nöron (`return_sequences=True`) + Batch Normalization + Dropout (%30).
3. **2. LSTM Katmanı:** 128 nöron (`return_sequences=True`) + Dropout (%30).
4. **3. LSTM Katmanı:** 64 nöron (`return_sequences=False`) + Batch Normalization + Dropout (%20).
5. **Dense (Çıkış) Katmanları:** Dense(64) + ReLU + Dropout (%10) → Dense(32) + ReLU → Dense(10).

---

## 3. Eğitim Stratejisi

### 🔄 Kayan Pencere (Sliding Window)
Veri seti, **90 günlük pencerelere** bölünmüştür.
- **Input:** 1 Ocak - 31 Mart (90 gün).
- **Target:** 1 Nisan (1 gün).
- Bir sonraki adımda pencere 1 gün kayar (2 Ocak - 1 Nisan) ve hedef 2 Nisan olur.

### 📉 Optimizasyon
- **Loss Function:** MSE (Mean Squared Error). Büyük hataları cezalandırarak modelin kararlı olmasını sağlar.
- **Optimizer:** Adam (Adaptive Moment Estimation).
- **Train/validation/test split:** İlk %70 eğitim, sonraki %15 doğrulama, son %15 test (kronolojik, time-ordered split - shuffle yok).
- **Callback'ler:**
  - *Early Stopping:* `patience=15`, `restore_best_weights=True`
  - *ReduceLROnPlateau:* `factor=0.5`, `patience=7`, `min_lr=1e-5`

### 🏆 Model Performansı
Eğitim sonucunda kaydedilen metrikler (Validation verisi üzerinde):
- `ai-model/model_metrics_ankara.joblib` dosyasına `val_mae` ve `val_loss` kaydedilir.
- Bu metrikler **MinMax ölçeklenmiş (0–1) uzayında** hesaplandığı için doğrudan “°C hata payı” olarak yorumlanmamalıdır.

---

## 4. Canlı Tahmin Mantığı (Inference)

Model canlıya alındığında **"Akıllı Mevsimsel Hafıza"** (Smart Seasonal Memory) yöntemini kullanır:

1. **Tarih Kontrolü:** Sistem bugünün tarihini alır (Örn: 27 Aralık).
2. **Veri Arama:** Geçmiş yılların aynı takvim dönemine denk gelen "kesintisiz 90 günlük" veri bloğunu arar.
3. **Desen Analizi:** Bulduğu bu 90 günlük gerçek veriyi modele verir.
4. **Tahmin:** Model, "Geçmişte hava böyle seyrettiyse, yarın ne olur?" sorusunu çözer ve `days` parametresi kadar günü iteratif olarak (her tahmini bir sonraki günün girdisi yaparak) hesaplar.

Not: Canlı tahminde yıl seçimi `predict_server.py` içinde sırasıyla `[2, 3, 4, 5, 1]` yıl geri gidilerek denenir; hiçbir yılda 90 günlük kesintisiz blok bulunamazsa aynı şehrin `cities.csv` içindeki **son 90 günü** fallback olarak kullanılır.

Bu yöntem sayesinde model, veri setindeki zamansal kopukluklardan etkilenmez ve her zaman **mevsime uygun, tutarlı** tahminler üretir.
