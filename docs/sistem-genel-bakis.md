# 🌾 AgroWeatherAI: Akıllı Tarımsal Tahmin Sistemi

## 1. Proje Nedir?
AgroWeatherAI, çiftçiler ve tarım uzmanları için geliştirilmiş, **Yapay Zeka (AI)** destekli bir karar destek sistemidir. Klasik hava durumu uygulamalarından farklı olarak, sadece "hava kaç derece" bilgisini değil, "bu hava tarımı nasıl etkiler" sorusunun cevabını verir.

Sistem, fiziksel kurallar ve derin öğrenme (Deep Learning) tekniklerini birleştirerek don riski, ekim zamanı ve ilaçlama gibi kritik konularda **nokta atışı tavsiyeler** üretir.

---

## 2. Temel Beceriler ve Özellikler

### 🌡️ Yapay Zeka Destekli Hassas Hava Tahmini
- Standart meteoroloji modelleri yerine, bölgenin **6 yıllık tarihsel verisiyle eğitilmiş** özel bir LSTM (Long Short-Term Memory) modeli kullanır.
- Yerel mikro-klimayı öğrendiği için **bölgeye özel** (hiper-lokal) tahminler yapar.

### 🛡️ Tarımsal Risk Analizi
Hava verilerini ham olarak bırakmaz, tarımsal **karar motorundan (Decision Engine)** geçirerek anlamlı uyarılara dönüştürür:
- **❄️ Don Riski:** *Magnus Formülü* ile "Dew Point" (Çiy Noktası) hesaplanır. Kara don ve beyaz don ayrımı yapılır.
- **🌱 Ekim Uygunluğu:** *GDD (Growing Degree Days)* hesaplanarak toprağın tohum için yeterince ısınıp ısınmadığı analiz edilir.
- **🚜 İlaçlama Zamanı:** *Delta-T* analizi ile rüzgar ve nem dengesine bakılarak ilacın buharlaşma veya sürüklenme riski ölçülür.
- **🍄 Hastalık Riski:** Nem ve sıcaklık kombinasyonları izlenerek mantar (fungal) hastalık riskleri önceden bildirilir.

### 🤖 Akıllı Asistan (Chatbot)
- Kullanıcılar sisteme doğal dille soru sorabilir.
- Örn: *"Yarın ilaçlama yapabilir miyim?"* veya *"Bu hafta don var mı?"*
- Asistan, AI modelinden aldığı anlık verilerle teknik analiz yaparak cevap verir.

---

## 3. Sistem Mimarisi (Nasıl Çalışır?)

Sistem, modern ve ölçeklenebilir üç ana katmandan oluşur:

### A. Frontend (Kullanıcı Arayüzü)
- **Teknoloji:** React, Vite, TailwindCSS, ShadcnUI.
- **Görev:** Kullanıcıya verileri modern, estetik ve anlaşılır kartlar halinde sunar. Animasyonlar ve görsel hiyerarşi ile karmaşık veriyi basitleştirir.

### B. Backend (İş Mantığı & API)
- **Teknoloji:** Node.js, Express.
- **Görev:** Frontend'den gelen istekleri karşılar, AI sunucusu ile konuşur ve **Tarımsal Karar Motorunu (Decision Engine)** çalıştırır. Risk hesaplamaları (formüller) burada yapılır.

### C. AI Prediction Server (Yapay Zeka Motoru)
- **Teknoloji:** Python, Flask, TensorFlow/Keras.
- **Görev:** Eğitilmiş LSTM modelini canlı tutar. Gelen tarih sorgusuna göre geçmiş veriyi işler ve gelecek 7 günün sıcaklık, nem, rüzgar tahminlerini üretir.

---

## 4. Veri Akış Şeması

1. **Kullanıcı** siteyi açar.
2. **Frontend**, Backend'e "Ankara için tahmin ver" der.
3. **Backend**, AI Sunucusuna bağlanır.
4. **AI Sunucusu**, "Mevsimsel Hafıza"sını kullanarak önümüzdeki 7 günü tahmin eder ve sonucu döner.
5. **Backend**, gelen saf veriyi (sıcaklık, nem) alır; Don, Ekim ve İlaçlama formüllerinden geçirerek **risk analizlerini** hesaplar.
6. **Sonuç**, kullanıcının ekranına "Riskli/Uygun" kartları olarak yansır.
