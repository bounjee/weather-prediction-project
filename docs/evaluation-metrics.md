# Başarı Ölçümü ve Değerlendirme Metrikleri

Projenin başarısı hem teknik doğruluğu hem de sağladığı tarımsal fayda üzerinden ölçülecektir.

## 1. Teknik Doğruluk Metrikleri (Hava Tahmini)
Kullanılan API'nin ve sunulan verinin tutarlılığını ölçmek için:

*   **Sıcaklık (Temperature):**
    *   **MAE (Mean Absolute Error):** Tahmin edilen sıcaklık ile gerçekleşen sıcaklık arasındaki ortalama fark. Hedef: < 2°C.
    *   **RMSE (Root Mean Square Error):** Büyük hataları cezalandıran hata kareler ortalaması.

*   **Yağış (Precipitation):**
    *   **Sınıflandırma Metrikleri:** Yağış "Var/Yok" tahmin başarısı.
        *   **Precision (Kesinlik):** "Yağacak" dediğimizde kaçında yağdı?
        *   **Recall (Duyarlılık):** Gerçekleşen yağışların kaçını bildik?
        *   **F1-Score:** Precision ve Recall'un harmonik ortalaması.

## 2. Tarımsal Fayda Metrikleri (Karar Destek)
Kural motorunun başarısını ölçmek için sübjektif ve senaryo bazlı testler:

*   **Don Uyarısı Doğruluğu:**
    *   Sistemin "Riskli" dediği gecelerde gerçekleşen don olaylarının oranı.
    *   *Hedef:* Yanlış negatif (Don olup da uyarılmama) oranını %0'a yakın tutmak. (Güvenlik öncelikli yaklaşım).

*   **Kullanıcı Tatmini (Simüle):**
    *   Chatbot cevaplarının tutarlılığı ve anlaşılırlığı. Yanıtların "Aksiyon Odaklı" olup olmadığı (Sadece "derece 5" demek yerine "ekim yapmayın" demesi).

## 3. Raporlama ve Analiz Planı
Proje raporunda sunulmak üzere:

1.  **Baseline Karşılaştırması:** Basit bir "Yarın hava nasıl?" cevabı ile projenin ürettiği "Yarın don riski var, ilaçlamayı erteleyin" cevabının fayda analizi.
2.  **Vaka Analizi:** Geçmiş tarihli 3 kritik gün (Örn: ani don yaşanan bir gün) seçilerek, sistemin o gün için ne önereceği simüle edilecek ve "Eğer bu sistem kullanılsaydı X zararı önlenebilirdi" savı tartışılacak.
