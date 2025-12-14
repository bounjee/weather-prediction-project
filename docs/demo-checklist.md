# Demo Checklist ve Risk Yönetimi

Proje sunumu veya demosu sırasında her şeyin yolunda gitmesi için kontrol listesi ve acil durum planları.

## Demo Kontrol Listesi (Checklist)
- [ ] **API Kotası:** Sunumdan önce API sorgu limitinin dolmadığından emin ol.
- [ ] **İnternet Bağlantısı:** Sunum bilgisayarının internete bağlı olduğunu test et.
- [ ] **Veritabanı Bağlantısı:** Backend'in MongoDB'ye sorunsuz bağlandığını loglardan teyit et.
- [ ] **Lokasyon Seçimi:** Demo sırasında hava durumu olaylarının (yağmur, soğuk vb.) olduğu bir ilçe seçerek "uyarı etiketlerini" göstermeyi garantile. (Gerekirse mock data kullan).
- [ ] **Senaryolar:** Chatbot'a sorulacak 3 soruyu ezberle/not et (Örn: "Don var mı?", "İlaçlama yapayım mı?").

## Olası Riskler ve B Planı

| Olası Risk | Etki | B Planı (Mitigation) |
| :--- | :--- | :--- |
| **API Servisinin Çökmesi** | Veri gelmez, uygulama boş kalır. | **Mock Data (Sahte Veri) Modu:** Sunum öncesi hazırlanmış json dosyalarından veri okuyan bir "Demo Modu" kodla ve gerektiğinde devreye al. |
| **İnternet Kesintisi** | Sistem çalışmaz. | Lokal'de çalışan ve cache'lenmiş veriyi veya yine Mock Data'yı kullanan versiyonu hazırda tut. Video kaydı bulundur. |
| **Chatbot'un Saçmalaması** | Yanlış/anlamsız cevap verir. | Sunumda sadece "Happy Path" (test edilmiş başarılı sorular) senaryolarını uygula. Riskli/belirsiz sorular sorma. |
| **Görsel Hatalar (CSS)** | Projeksiyon çözünürlüğünde kayma. | Arayüzü responsive (duyarlı) tasarla, tarayıcı zoom ayarlarıyla oynamaya hazır ol. |

## Sunum İpuçları
*   Demoya "Neden bu projeyi yaptım?" sorusuna güçlü bir cevapla başla (Çiftçinin yaşadığı don zararını engellemek vb.).
*   Teknik detaylara (kod, veritabanı şeması) boğulmadan önce **ürünün sağladığı faydayı** göster.
*   Chatbot ile "sohbet eder gibi" doğal bir demo akışı sergile.
