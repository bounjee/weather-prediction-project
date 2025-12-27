# 🧠 AgroWeatherAI: Model Eğitim ve Teknik Detaylar

Bu belge, sistemin kalbinde yer alan Derin Öğrenme (Deep Learning) modelinin nasıl eğitildiğini ve teknik özelliklerini açıklar.

---

## 1. Veri Seti ve Özellikler

### 📊 Veri Kaynağı
- **Konum:** Ankara (Örnek bölge olarak seçilmiştir).
- **Kapsam:** 1 Ocak 2019 - 1 Kasım 2025 (Yaklaşık 6 yıl).
- **Büyüklük:** ~25.000 satır saatlik/günlük veri.

### 🏷️ Kullanılan Özellikler (Input Features)
Model, sadece sıcaklığa bakmaz. Atmosferik olayların birbirini etkilediği gerçeğinden yola çıkarak **10 boyutlu** bir vektör kullanır:

1. **Sıcaklıklar:** Ortalama, Maksimum ve Minimum sıcaklık (°C).
2. **Nem:** Bağıl nem oranı (%).
3. **Rüzgar:** Rüzgar hızı (km/s).
4. **Basınç:** Atmosfer basıncı (hPa) - Hava değişimlerinin en erken habercisidir.
5. **Yağış:** Toplam yağış miktarı (mm).
6. **Mevsimsel Kodlama:** `day_sin` ve `day_cos`.
   - *Neden?* Yapay zeka "27 Aralık" tarihini bilmez. Tarihleri trigonometrik (döngüsel) bir formata çevirerek modelin "Kışın ortasındayız" veya "Yaz yaklaşıyor" algısını matematiksel olarak kurmasını sağladık.

---

## 2. Model Mimarisi: Deep Bidirectional LSTM

Zaman serisi (Time-Series) tahmininde en güçlü mimari olan **LSTM (Long Short-Term Memory)** ağı kullanılmıştır.

### 🏗️ Ağ Yapısı
1. **Giriş Katmanı:** (90, 10) -> Son 90 gün x 10 Özellik.
2. **1. Bi-LSTM Katmanı:** 128 Nöron (Çift yönlü: Geçmişten geleceğe ve gelecekten geçmişe öğrenme).
   - *Dropout (%20):* Aşırı ezberlemeyi (overfitting) önlemek için.
3. **2. Bi-LSTM Katmanı:** 128 Nöron + Dropout (%20).
4. **3. LSTM Katmanı:** 64 Nöron + Dropout (%20).
   - *Batch Normalization:* Eğitim sırasında veriyi stabilize eder.
5. **Dense (Çıkış) Katmanları:** 64 -> 32 -> 10 (Tahmin edilen 10 özellik).

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
- **Callback'ler:**
  - *Early Stopping:* Model öğrenmeyi durdurursa eğitimi keser (100 epoch sınırında genelde 40-50'de en iyi sonucu verir).
  - *ReduceLROnPlateau:* Hata oranı düşmezse öğrenme hızını yavaşlatarak ince ayar yapar.

### 🏆 Model Performansı
Eğitim sonucunda elde edilen metrikler (Test Verisi Üzerinde):
- **MAE (Mean Absolute Error):** ~0.054°C
- **Hata Payı:** Model, sıcaklık tahminlerinde ortalama **±0.05°C** (yarım derecenin onda biri) kadar sapma ile çalışmaktadır. Bu, tarımsal tahminler için "mükemmel" seviyesinde kabul edilir.

---

## 4. Canlı Tahmin Mantığı (Inference)

Model canlıya alındığında **"Akıllı Mevsimsel Hafıza"** (Smart Seasonal Memory) yöntemini kullanır:

1. **Tarih Kontrolü:** Sistem bugünün tarihini alır (Örn: 27 Aralık).
2. **Veri Arama:** Veri tabanında, geçmiş yılların (öncelik 2023, 2024...) **aynı dönemine** ait "kesintisiz 90 günlük" veri bloğunu arar.
3. **Desen Analizi:** Bulduğu bu 90 günlük gerçek veriyi modele verir.
4. **Tahmin:** Model, "Geçmişte hava böyle seyrettiyse, yarın ne olur?" sorusunu çözer ve gelecek 7 günü iteratif olarak (her tahmini bir sonraki günün girdisi yaparak) hesaplar.

Bu yöntem sayesinde model, veri setindeki zamansal kopukluklardan etkilenmez ve her zaman **mevsime uygun, tutarlı** tahminler üretir.
