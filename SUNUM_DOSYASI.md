# PROJE SUNUM DOSYASI

## 1. Proje Adı: AgroWeatherAI

**Slogan:** "Veriye Dayalı Akıllı Tarım, Güvenli Gelecek"

**AgroWeatherAI**, çiftçiler ve tarım profesyonelleri için geliştirilmiş, yapay zeka destekli yeni nesil bir hava durumu ve risk analiz platformudur. Geleneksel hava durumu uygulamalarının ötesine geçerek, **tarımsal operasyonlara özel** (sulama, ilaçlama, hasat, ekim) içgörüler sunar.

---

## 2. Problem ve Çözüm

### Problem
*   Çiftçiler, değişken hava koşulları nedeniyle (anlık don, aşırı nem, kuraklık) her yıl büyük maddi kayıplar yaşamaktadır.
*   Klasik hava durumu uygulamaları sadece "Hava 20 derece" der; ancak bu bilginin "Domates ekimi için uygun mu?" olduğu sorusuna cevap vermez.
*   Piyasa fiyatlarını takip etmek ve karar vermek için birden fazla kaynağa ihtiyaç duyulur.

### Çözümümüz
*   **Derin Öğrenme (LSTM):** Geçmiş 90 günlük verileri analiz ederek gelecekteki sıcaklık trendlerini ve sapmalarını tahminler.
*   **Operasyonel Karar Desteği:** "Traktörle tarlaya girilir mi?", "Bugün ilaç atılır mı?" gibi kritik sorulara net, renk kodlu (Yeşil/Kırmızı) cevaplar üretir.
*   **Entegre Asistan:** Çiftçinin anlık sorularını yanıtlayan bir yapay zeka asistanı içerir.
*   **Piyasa Ekranı:** Gübre, mazot ve ürün fiyatlarını tek ekranda canlı olarak gösterir.

---

## 3. Sistem Mimarisi ve Teknolojiler

Proje, modern ve ölçeklenebilir bir mikroservis mimarisine sahiptir.

### A. Frontend (Kullanıcı Arayüzü) -> `frontend/`
*   **Framework:** React (TypeScript) + Vite
*   **Tasarım:** Tailwind CSS (Özel "AgriCast" doğa teması, Glassmorphism efektleri)
*   **Animasyon:** Framer Motion (Akıcı geçişler, kayan yazılar, etkileşimli kartlar)
*   **İkon Seti:** Lucide React
*   **Özellikler:** Responsif tasarım, Dark/Light mode altyapısı.

### B. Backend (API Gateway) -> `backend/`
*   **Dil:** Node.js + Express (TypeScript)
*   **Görevi:**
    *   İstemci (Frontend) ile Veri Kaynakları arasındaki köprüdür.
    *   Python AI servisine isteği iletip tahmin sonucunu alır.
    *   Zirai risk hesaplamalarını (Don riski, nem hastalığı vb.) işler.

### C. Yapay Zeka (AI Engine) -> `ai-model/`
*   **Dil:** Python (Flask üzerinden servis edilir)
*   **Kütüphaneler:** TensorFlow (Keras), Pandas, NumPy, Scikit-learn, Joblib.
*   **Model Tipi:** **Çok Değişkenli LSTM (Multivariate LSTM)**
    *   Sadece sıcaklığı değil; Nem, Rüzgar Hızı, Basınç ve Yağış miktarını aynı anda öğrenen ve tahmin eden gelişmiş bir sinir ağı mimarisidir.
*   **Yerel Veri Stratejisi (Offline-Ready):**
    *   Proje artık dış dünyaya (OpenWeather vb.) bağımlı değildir.
    *   **Eğitim Verisi:** 25.000+ satırlık `cities.csv` (Türkiye geneli tarihsel veri seti).
    *   **Tahmin Mekanizması:** Model, son 90 günlük veriyi "seed" (tohum) olarak kullanır ve ileriye dönük tahmini `days` parametresi kadar iteratif olarak oluşturur (backend çağrısında `days=6`, varsayılan `days=7`).
*   **Risk Analizi:** LSTM'den gelen çoklu parametre Node.js tarafındaki Karar Motoruna (Decision Engine) aktarılır ve tarımsal riskler (Don, Mantar, İlaçlama vb.) bu veriler üzerinden hesaplanır.


---

## 4. Temel Özellikler (Demo Sırası)

1.  **Canlı Piyasa Bandı (Marquee):**
    *   Ekranın en üstünde Buğday, Arpa, Mazot ve Gübre fiyatları sürekli akar.
    *   Çiftçiye ekonomik farkındalık sağlar.

2.  **Akıllı Hero Kartı:**
    *   Anlık sıcaklık, rüzgar, nem ve basınç verilerini gösterir.
    *   Hissedilen sıcaklık ve dinamik hava durumu ikonu içerir.

3.  **Yapay Zeka (LSTM) Öngörüsü:**
    *   Klasik tahminden farklı olarak, makine öğrenmesi modelinin güven skoru ile birlikte "Beklenen Zirve Sıcaklık" ve özel tavsiyesini (örn: "Sıcaklık düşüş trendinde, don riski var") içerir.

4.  **Operasyon Kartları:**
    *   **Tarlaya Giriş Durumu:** Toprak nemine göre traktör kullanımının uygunluğunu (Yeşil/Kırmızı) bildirir.
    *   **Güneş & Ay Döngüsü:** Gün ışığı sürelerine göre çalışma saatlerini planlamayı sağlar.

5.  **Tarımsal Risk Raporu:**
    *   **Don Riski**, **Ekim Durumu**, **İlaçlama**, **Hastalık Riski** başlıklarında detaylı analiz sunar.

6.  **Zirai Asistan (Chatbot):**
    *   Ekranın alt kısmında veya gömülü olarak yer alır, çiftçinin serbest sorularına yanıt verir.

---

## 5. Gelecek Yol Haritası (Future Works)

1.  **Görüntü İşleme (Computer Vision):** Çekilen yaprak fotoğrafından hastalık tespiti (Gemini Vision API entegrasyonu).
2.  **Sesli Komut:** Tarlada eller serbest kullanım için sesli asistan.
3.  **IoT Entegrasyonu:** Tarladaki fiziksel sensörlerden (Toprak nem sensörü) doğrudan veri akışı.
4.  **Çoklu Konum:** Sadece Ankara değil, GPS üzerinden otomatik konum ve mikro-klima analizi.

---

*Hazırlayan: [Adınız/Ekibiniz]*
*Tarih: 22 Aralık 2025*
