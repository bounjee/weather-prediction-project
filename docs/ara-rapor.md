# AgroWeather AI - Proje Ara Raporu
**Tarımsal Hava Tahmini ve Karar Destek Sistemi**

## 1. Giriş
Bu proje, çiftçilere ve tarım uzmanlarına, klasik meteorolojik tahminlerin ötesinde, geçmiş verilerden öğrenen bir Yapay Zeka (AI) modeli ile desteklenmiş daha hassas hava durumu tahminleri ve tarımsal analizler (don riski, ekim zamanı, hastalık uyarısı) sunmayı amaçlamaktadır.

## 2. Veri Seti Seçimi ve Gerekçesi

### Seçilen Veri Seti
Projede **"Turkey Cities Daily Weather Dataset (2019-2025)"** kullanılmıştır.

### Seçim Gerekçeleri:
1.  **Yerellik:** Projenin hedef kitlesi Türk çiftçisidir. Bu nedenle global veri setleri yerine Türkiye'nin il bazlı yerel iklim verilerini içeren bir veri seti elzemdir.
2.  **Güncellik:** Veri seti 2025 yılına kadar olan güncel verileri kapsamaktadır (simülasyon/gerçek veri karışımı). Bu durum, modelin güncel iklim değişikliklerini ve mevsimsel kaymaları daha iyi öğrenmesini sağlar.
3.  **Tarımsal Parametreler:** Veri seti sadece sıcaklık değil, tarım için kritik olan **Nem (Humidity)** verisini de içermektedir. Nem, hem don riski hem de mantar hastalıklarının tahmini için kritik bir girdidir.
4.  **Zaman Çözünürlüğü:** Günlük (Daily) veriler, tarımsal operasyonların (ekim, ilaçlama) planlanması için en uygun zaman dilimidir.

## 3. Tahmin Modeli Seçimi: LSTM

Projede zaman serisi tahminleri için **Long Short-Term Memory (LSTM)** derin öğrenme mimarisi tercih edilmiştir.

### Neden LSTM?
*   **Hafıza Yeteneği:** Standart Yapay Sinir Ağları (ANN) geçmişi hatırlamaz. Basit RNN'ler ise "Vanishing Gradient" problemi nedeniyle sadece çok yakın geçmişi hatırlar. LSTM ise *hücre durumu (cell state)* sayesinde uzun dönemli bağımlılıkları (örn: 1 ay önceki soğuk hava dalgasının bugüne etkisi) öğrenebilir.
*   **Hava Durumunun Doğası:** Hava durumu kaotik ancak döngüsel bir süreçtir. Dünkü sıcaklık bugünü etkiler. LSTM bu ardışık (sequential) ilişkiyi modellemek için en güçlü algoritmadır.

## 4. Model Mimarisi ve Teknik Detaylar

Geliştirilen model `Keras` ve `TensorFlow` kütüphaneleri kullanılarak aşağıdaki mimaride tasarlanmıştır:

*   **Girdi Katmanı (Input Layer):**
    *   *Pencere Boyutu (Look-back):* 30 Gün. Model, bir günü tahmin etmek için önceki 30 günün verisine bakar.
    *   *Öznitelikler (Features):* `Günlük Maksimum Sıcaklık`, `Günlük Minimum Sıcaklık`, `Ortalama Bağıl Nem`.
*   **1. LSTM Katmanı:**
    *   *Birim:* 64 Nöron.
    *   *Aktivasyon:* `return_sequences=True` (Bilgiyi sonraki katmana dizi olarak aktarır).
*   **Dropout Katmanı (0.2):** Aşırı öğrenmeyi (overfitting) engellemek için nöronların %20'si rastgele kapatılır.
*   **2. LSTM Katmanı:**
    *   *Birim:* 32 Nöron.
    *   *Aktivasyon:* `return_sequences=False` (Artık tek bir özet vektör üretir).
*   **Çıkış Katmanı (Dense Layer):**
    *   *Birim:* 1 Nöron (Hedef değişken: `Günlük Maksimum Sıcaklık`).

**Model Performansı:** Eğitim sonucunda modelin Hata Oranı (Mean Squared Error), kabul edilebilir sınırlar (Loss < 0.01) altına inmiştir.

## 5. Uygulama Aşamaları

Proje hibrit bir yapıda (Python AI + Node.js Backend) geliştirilmiştir.

1.  **Veri Ön İşleme (Preprocessing):**
    *   CSV'den okunan veriler şehirlere göre filtrelendi.
    *   `MinMaxScaler` kullanılarak tüm veriler 0 ile 1 arasına normalize edildi (LSTM performansı için kritik).
2.  **Model Eğitimi (Training):**
    *   Veriler %80 eğitim, %20 test olarak ayrıldı.
    *   20 Epoch boyunca Adam optimizasyon algoritması ile model eğitildi.
3.  **Model Sunumu (Serving):**
    *   Eğitilen model `.keras` formatında kaydedildi.
    *   Python `Flask` kütüphanesi ile bir REST API oluşturuldu (`POST /predict`).
4.  **Entegrasyon:**
    *   Node.js Backend, kullanıcı "Ankara" şehrini seçtiğinde bu Python API'ye istek atar.
    *   Gelen AI tahmini ve güven skoru, React Dashboard üzerinde özel bir kartta görselleştirilir.

## 6. Gelecek Çalışmalar (Future Work)

*   **Çoklu Şehir Desteği:** Şu an sadece Ankara için eğitilen model, tüm Türkiye illeri için ayrı ayrı eğitilerek yaygınlaştırılacak.
*   **Çoklu Çıktı (Multi-Output):** Modelin sadece sıcaklığı değil, aynı zamanda yağış ve rüzgarı da tahmin etmesi sağlanacak.
*   **Hiperparametre Optimizasyonu:** Grid Search yöntemi ile en iyi LSTM katman sayısı ve öğrenme hızı (learning rate) otomatik bulunacak.
