# Proje Özeti: Tarımsal Karar Destekli Hava Durumu Asistanı

## 1. Proje Tanımı ve Amacı
Bu proje, Türkiye genelindeki çiftçilere yönelik, 1–3 günlük kısa vadeli hava tahminlerini ve bu tahminlere dayalı tarımsal karar destek önerilerini sunan Türkçe bir chatbot uygulamasıdır. Amacımız, sadece ham hava durumu verisi (sıcaklık, yağış vb.) sunmak yerine, bu verileri "ekim zamanı", "don riski", "sulama ihtiyacı" gibi eyleme dönüştürülebilir tarımsal iç görülere çevirmektir.

## 2. Kapsam ve Özellikler
Proje, kullanıcıların il/ilçe bazında konum seçimi yaparak aşağıdaki hizmetlere erişmesini sağlar:

*   **Hava Durumu Paneli:** Seçilen konum için 3 günlük özet hava durumu (Sıcaklık, Yağış, Rüzgar, Nem) kartları.
*   **Akıllı Uyarı Sistemi:** Tarımsal üretimi kritik etkileyen Don, Şiddetli Yağış ve Rüzgar durumlarında otomatik uyarı etiketleri.
*   **Türkçe Chatbot Asistanı:** Çiftçilerin doğal dilde sorduğu soruları (Örn: "Yarın don var mı?", "Pazar günü ekim yapabilir miyim?") anlayarak, arka plandaki karar motoru kurallarına göre anlık yanıtlar üreten bir sohbet arayüzü.

## 3. Hedef Kitle ve Kullanım Senaryosu
*   **Hedef Kitle:** Türkiye'deki küçük ve orta ölçekli tarım üreticileri.
*   **Senaryo:** Bir çiftçi, uygulama üzerinden tarlasının bulunduğu ilçeyi seçer. Ekranda "Yarın gece don riski yüksek" uyarısını görür. Chatbot'a "Don için ne yapmalıyım?" veya "Hangi saatlerde risk var?" diye sorarak detaylı bilgi alır.

## 4. Yenilik ve Özgün Değer
Bu projenin mevcut hava durumu uygulamalarından farkı üç temel saç ayağına dayanır:

1.  **Tarım Odaklı Karar Katmanı:** Ham veriyi işleyerek "ilaçlama yapılabilir" veya "sulama gereksiz" gibi sektöre özel kararlar üretmesi.
2.  **Lokalize Mikro Kararlar:** İl/ilçe seviyesinde özelleşmiş, nokta atışı uyarılar sunması.
3.  **Chatbot Entegrasyonu:** Karmaşık grafikler yerine, çiftçinin en doğal iletişim yöntemi olan "soru-cevap" şeklinde bilgiye ulaşmasını sağlaması.

## 5. Teknoloji Özeti
*   **Arayüz:** React, TypeScript, Tailwind CSS (Modern ve mobil uyumlu).
*   **Arka Uç:** Node.js, Express (API yönetimi ve Kural Motoru).
*   **Veri:** Güvenilir bir 3. parti Hava Durumu API'si.
*   **Veritabanı:** MongoDB (Kullanıcı tercihleri ve geçmişi).
