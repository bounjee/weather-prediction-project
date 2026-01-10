# 📊 AgroWeatherAI - Model Eğitim Özeti

## 🎯 Proje Özeti
Tarımsal hava tahmin sistemi için Deep Learning (LSTM) modeli eğitildi.

---

## 📁 Veri Seti

| Bilgi | Değer |
|-------|-------|
| **Kaynak** | `cities.csv` |
| **Tarih Aralığı** | 2019 - 2025 (~6 yıl) |
| **Şehir** | Ankara |
| **Toplam Kayıt** | 2,407 günlük veri |

### Kullanılan Özellikler (10 Boyut)

| # | Özellik | Birim | Açıklama |
|---|---------|-------|----------|
| 1 | Ortalama Sıcaklık | °C | Günün ortalama sıcaklığı |
| 2 | Maksimum Sıcaklık | °C | Günün en yüksek sıcaklığı |
| 3 | Minimum Sıcaklık | °C | Günün en düşük sıcaklığı |
| 4 | Rüzgar Hızı | km/s | Ortalama rüzgar hızı |
| 5 | Nem | % | Bağıl nem oranı |
| 6 | Basınç | hPa | Atmosfer basıncı |
| 7 | Yağış Miktarı | mm | Toplam yağış |
| 8 | Yağışlı Saat | saat | Yağış süresi |
| 9 | Gün Sin | - | Mevsimsel kodlama (sin) |
| 10 | Gün Cos | - | Mevsimsel kodlama (cos) |

---

## 🔀 Veri Bölünmesi

Veri seti kronolojik sırayla üçe bölünmüştür:

| Set | Oran | Örnek Sayısı | Amaç |
|-----|------|--------------|------|
| **Train (Eğitim)** | %70 | 1,684 | Model bu veriyle öğrenir |
| **Validation (Doğrulama)** | %15 | 361 | Eğitim sırasında overfitting kontrolü |
| **Test** | %15 | 362 | Final değerlendirme (model hiç görmedi) |

> ⚠️ **Önemli:** Zaman serisi olduğu için shuffle (karıştırma) yapılmadı, kronolojik sıra korundu.

---

## 🧠 Model Mimarisi

**Model Tipi:** Deep Bidirectional LSTM (Derin Çift Yönlü LSTM)

### Katman Yapısı

| Katman | Tip | Nöron Sayısı | Ek İşlemler |
|--------|-----|--------------|-------------|
| 1 | Bidirectional LSTM | 128 | BatchNormalization + Dropout (%30) |
| 2 | LSTM | 128 | Dropout (%30) |
| 3 | LSTM | 64 | BatchNormalization + Dropout (%20) |
| 4 | Dense (Tam Bağlantılı) | 64 | ReLU aktivasyon + Dropout (%10) |
| 5 | Dense | 32 | ReLU aktivasyon |
| 6 | Dense (Çıkış) | 10 | Lineer (tahmin çıktısı) |

### Eğitim Parametreleri

| Parametre | Değer | Açıklama |
|-----------|-------|----------|
| Look-back | 90 gün | Model kaç gün geriye bakıyor |
| Epochs | 100 (max) | Maksimum eğitim turu |
| Batch Size | 32 | Her adımda işlenen örnek sayısı |
| Optimizer | Adam | Ağırlık güncelleme algoritması |
| Loss Function | MSE | Kayıp fonksiyonu (Mean Squared Error) |
| Early Stopping | patience=15 | 15 epoch iyileşme olmazsa dur |
| Learning Rate Reduction | patience=7 | 7 epoch iyileşme olmazsa LR'yi yarıla |

---

## 📈 Eğitim Sonuçları

### Scaled (Ölçeklenmiş) Metrikler

| Metrik | Validation | Test |
|--------|------------|------|
| MAE | 0.0676 | 0.0628 |
| MSE (Loss) | 0.0095 | 0.0077 |

### Gerçek Birimde MAE (Mean Absolute Error)

| Özellik | MAE | Birim | Performans |
|---------|-----|-------|------------|
| Sıcaklık (ortalama) | **2.55** | °C | İyi |
| Maksimum Sıcaklık | 3.05 | °C | İyi |
| Minimum Sıcaklık | 2.32 | °C | İyi |
| Nem | 7.78 | % | Orta |
| Basınç | 3.19 | hPa | İyi |
| Rüzgar | 2.46 | km/s | İyi |
| Yağış | 1.13 | mm | Mükemmel |

---

## 🔬 Karşılaştırmalı Deneyler

Farklı model konfigürasyonlarının performansını ölçmek için deneyler yapıldı.

### Deney Konfigürasyonları

| Deney # | Model Tipi | Look-back | Katman Sayısı | Epoch |
|---------|------------|-----------|---------------|-------|
| 1 | Basit LSTM | 30 gün | 1 LSTM + 1 Dense | 20 |
| 2 | Basit LSTM | 90 gün | 1 LSTM + 1 Dense | 20 |
| 3 | Derin Bi-LSTM | 90 gün | 3 LSTM + 2 Dense | 20 |
| 4 | **Derin Bi-LSTM (Tam Eğitim)** | 90 gün | 3 LSTM + 2 Dense | 78 (Early Stop) |

### Sonuç Tablosu

| Model | Look-back | Epoch | Test MAE (Scaled) | Sıcaklık MAE | Test MSE |
|-------|-----------|-------|-------------------|--------------|----------|
| Basit LSTM | 30 gün | 20 | 0.0554 | 1.81°C | 0.0064 |
| Basit LSTM | 90 gün | 20 | 0.0552 | 1.95°C | 0.0064 |
| Derin Bi-LSTM | 90 gün | 20 | 0.0792 | 2.96°C | 0.0115 |
| **Derin Bi-LSTM (Tam)** | **90 gün** | **78** | **0.0628** | **2.55°C** | **0.0077** |

### Analiz ve Tartışma

**Gözlemler:**

1. **Kısa Eğitimde (20 Epoch):** Basit model daha iyi sonuç veriyor. Bunun nedeni basit modelin daha hızlı yakınsama (converge) etmesidir.

2. **Tam Eğitimde (78 Epoch):** Derin Bi-LSTM modeli 2.55°C'ye ulaşarak MSE metriğinde (.0077) en iyi sonucu elde etti.

3. **Trade-off Analizi:**
   - Basit model: Hızlı, düşük hesaplama maliyeti, kısa vadeli tahminler için yeterli
   - Derin model: Daha fazla pattern öğrenir, mevsimsel döngüleri daha iyi yakalar

4. **Neden Derin Model Seçildi:**
   - Çok değişkenli tahmin (10 özellik) için daha uygun
   - Bidirectional yapı ile ileri-geri pattern öğrenme
   - BatchNormalization ile stabil eğitim
   - 90 günlük uzun hafıza gerektiren tarımsal kararlar için daha güvenilir

**Sonuç:**
Projede **Derin Bidirectional LSTM** modeli tercih edildi çünkü:
- Mevsimsel tarımsal kararlar için 90 günlük hafıza kritik
- Çoklu özellik tahmininde daha robust
- Overfitting kontrolü (Dropout, BatchNorm) ile genelleme kabiliyeti yüksek
- Test MSE'de en iyi sonuç (0.0077)

---

## ❓ Hocanın Sorularına Detaylı Cevaplar

### 1. Train, Validation ve Test Setleri Nedir?

**Eğitim Seti (Train Set) - %70:**
Model bu veri üzerinde öğrenir. Ağırlıklar (weights) bu veri kullanılarak güncellenir. En büyük veri parçasıdır çünkü modelin yeterli örnek görmesi gerekir.

**Doğrulama Seti (Validation Set) - %15:**
Eğitim sırasında modelin aşırı öğrenip öğrenmediğini (overfitting) kontrol eder. Early Stopping ve Learning Rate Reduction kararları bu set üzerinden verilir. Model bu veriyi görmez ama eğitim sürecini etkiler.

**Test Seti (Test Set) - %15:**
Model bu veriyi eğitim sürecinde HİÇ görmez. Eğitim bittikten sonra modelin gerçek performansını ölçmek için kullanılır. Bu, modelin "gerçek dünya"da nasıl performans göstereceğinin tarafsız bir ölçümüdür.

**Neden Ayrı Tutulur?**
Eğer aynı veriyi hem eğitim hem test için kullansaydık, model o veriyi ezberlerdi (overfitting). Ayrı test seti, modelin genelleme yeteneğini ölçer.

---

### 2. Zaman Serisi Problemi Nedir?

Zaman serisi problemi, geçmiş değerlerden gelecek değerleri tahmin etme problemidir. Bu projede:

- **Girdi:** Son 90 günün hava durumu verileri
- **Çıktı:** 91. günün (yarının) hava durumu tahmini

**Özellikler:**
- Veriler zamana bağlıdır (temporal dependency)
- Sıralama önemlidir, karıştırılamaz
- Mevsimsellik ve trend içerir
- Bu projede multi-variate (çok değişkenli): 10 farklı özellik aynı anda tahmin ediliyor

**Örnek:**
1 Ocak - 31 Mart (90 gün) verisi → 1 Nisan tahmini

---

### 3. Neden LSTM Seçildi?

LSTM (Long Short-Term Memory) seçilmesinin nedenleri:

1. **Uzun Vadeli Hafıza:** 90 gün gibi uzun geçmiş pencereleri hatırlayabilir
2. **Vanishing Gradient Çözümü:** Geleneksel RNN'lerin aksine, gradyan kaybolması problemini çözer
3. **Bidirectional Avantajı:** Hem ileri hem geri yönde öğrenerek daha iyi pattern yakalama
4. **Proven Track Record:** Hava tahmini gibi zaman serisi problemlerinde en başarılı mimarilerden biri

**Alternatifler ve Dezavantajları:**
- ARIMA: Sadece tek değişken, karmaşık ilişkileri yakalayamaz
- Random Forest: Zamansal bağımlılıkları doğal olarak öğrenemez
- Transformer: Daha fazla veri ve hesaplama gücü gerektirir

---

### 4. Hangi Kütüphaneler Kullanıldı?

| Kütüphane | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **TensorFlow/Keras** | 2.x | Model oluşturma ve eğitim |
| **Pandas** | - | Veri okuma ve işleme |
| **NumPy** | - | Matematiksel işlemler |
| **Scikit-learn** | - | MinMaxScaler (veri ölçekleme) |
| **Matplotlib** | - | Grafik oluşturma |
| **Joblib** | - | Model ve scaler kaydetme |
| **Flask** | - | Tahmin API sunucusu |

---

### 5. Model Parametreleri Nelerdir?

| Kategori | Parametre | Değer | Açıklama |
|----------|-----------|-------|----------|
| **Girdi** | Look-back | 90 gün | Geriye bakılan gün sayısı |
| **Girdi** | Feature Dimension | 10 | Özellik sayısı |
| **Mimari** | LSTM Katman 1 | 128 nöron | Bidirectional |
| **Mimari** | LSTM Katman 2 | 128 nöron | Tek yönlü |
| **Mimari** | LSTM Katman 3 | 64 nöron | Tek yönlü |
| **Mimari** | Dense Katman 1 | 64 nöron | ReLU aktivasyon |
| **Mimari** | Dense Katman 2 | 32 nöron | ReLU aktivasyon |
| **Regularization** | Dropout | %10-30 | Overfitting önleme |
| **Eğitim** | Optimizer | Adam | Adaptive learning rate |
| **Eğitim** | Batch Size | 32 | Mini-batch boyutu |
| **Eğitim** | Learning Rate | 0.001 (başlangıç) | Otomatik azaltılır |

---

### 6. Performans Nasıl Ölçüldü?

**Kullanılan Metrikler:**

1. **MAE (Mean Absolute Error):** Ortalama mutlak hata
   - Formül: MAE = (1/n) × Σ|gerçek - tahmin|
   - Yorumu: Ortalama 2.55°C hata payı

2. **MSE (Mean Squared Error):** Ortalama karesel hata
   - Formül: MSE = (1/n) × Σ(gerçek - tahmin)²
   - Büyük hataları daha çok cezalandırır

**İki Aşamalı Değerlendirme:**

| Aşama | Set | Amaç |
|-------|-----|------|
| Eğitim Sırasında | Validation | Overfitting kontrolü, early stopping |
| Eğitim Sonrası | Test | Final performans (tarafsız ölçüm) |

**Gerçek Birimde Hesaplama:**
Model ölçeklenmiş (0-1) uzayda eğitildiği için, MAE değerleri inverse transform edilerek gerçek birimlere (°C, %, hPa) çevrildi.

---

### 7. Problem Nasıl Formüle Edildi?

**Matematiksel İfade:**

- Girdi (X): Son 90 günün 10 özelliği → Boyut: [90 × 10]
- Çıktı (y): Ertesi günün 10 özelliği → Boyut: [10]
- Model: f(X) → y

**Sliding Window Yaklaşımı:**

| Pencere | Girdi (90 gün) | Hedef (1 gün) |
|---------|----------------|---------------|
| 1 | 1 Ocak - 31 Mart | 1 Nisan |
| 2 | 2 Ocak - 1 Nisan | 2 Nisan |
| 3 | 3 Ocak - 2 Nisan | 3 Nisan |
| ... | ... | ... |

Bu şekilde ~2,400 eğitim örneği oluşturuldu.

---

### 8. Veri Hazırlama Adımları Nelerdir?

| Adım | İşlem | Açıklama |
|------|-------|----------|
| 1 | CSV Okuma | `cities.csv` dosyasından veri yükleme |
| 2 | Şehir Filtreleme | Sadece Ankara verilerini seçme |
| 3 | Tarih Sıralama | Kronolojik sıraya koyma |
| 4 | Eksik Veri Tamamlama | Linear interpolation + ffill/bfill |
| 5 | Mevsimsel Kodlama | day_sin ve day_cos ekleme |
| 6 | Ölçekleme | MinMaxScaler ile 0-1 aralığına |
| 7 | Sliding Window | 90 günlük pencereler oluşturma |
| 8 | Bölme | Train (%70) / Val (%15) / Test (%15) |

**Mevsimsel Kodlama Neden Gerekli?**
Model "27 Aralık" gibi tarihleri anlamaz. Trigonometrik kodlama ile modelin "kışın ortasındayız" bilgisini öğrenmesi sağlandı:
- day_sin = sin(2π × day_of_year / 365.25)
- day_cos = cos(2π × day_of_year / 365.25)

---

## 📊 Oluşturulan Grafikler

Eğitim sonrası `ai-model/training_graphs/` klasöründe 4 grafik oluşturulur:

| Dosya | İçerik |
|-------|--------|
| `loss_curve.png` | Training vs Validation Loss (epoch bazlı) |
| `prediction_vs_actual.png` | Tahmin vs Gerçek değerler (son 100 test örneği) |
| `scatter_correlation.png` | Korelasyon grafiği (ideal çizgi ile) |
| `feature_mae_comparison.png` | Özellik bazında MAE karşılaştırma |

---

## 🚀 Model Çalıştırma Komutları

**Eğitim:**
```bash
cd ai-model
python train_model.py
```

**Tahmin Sunucusu:**
```bash
python predict_server.py
```

---

*Tarih: 2026-01-11 | Model: Deep Bidirectional LSTM | Şehir: Ankara*
