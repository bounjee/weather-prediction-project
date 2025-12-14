# AgroWeather AI - Teknik Dokümantasyon ve Geliştirici Kılavuzu

## 1. Proje Özeti
**AgroWeather AI**, çiftçiler ve tarım uzmanları için geliştirilmiş, meteorolojik verileri yapay zeka destekli analizlerle birleştiren bir **Tarımsal Karar Destek Sistemidir (DSS)**.

Bu sistem, standart hava durumu verilerini (OpenWeatherMap) alır, tarihsel verilerle eğitilmiş bir **LSTM (Long Short-Term Memory)** modelinden tahminler ekler ve kural tabanlı bir analiz motoru (Decision Engine) ile işleyerek çiftçiye "Don Riski", "Ekim Uygunluğu", "İlaçlama Zamanı" ve "Hastalık Riski" gibi kritik içgörüler sunar.

---

## 2. Sistem Mimarisi

Proje, 3 ana bileşenden oluşan mikro-servis benzeri bir mimariye sahiptir:

1.  **Frontend (React + Vite):** Kullanıcı arayüzü ve dashboard.
2.  **Backend (Node.js + Express):** API Gateway, OpenWeatherMap entegrasyonu ve kural tabanlı analiz motoru.
3.  **AI Model Server (Python + Flask + TensorFlow):** LSTM tabanlı sıcaklık tahmin servisi.

### Veri Akış Şeması
```
[Kullanıcı] -> [Frontend (Dashboard)] -> [Backend (Node.js)] -> [OpenWeatherMap API (Anlık Veri)]
                                                      |
                                                      v
                                            [AI Model Server (Python)] <- [Eğitilmiş .keras Modeli]
                                                      |
                                                      v
[Kullanıcı] <- [Frontend] <- [Birleştirilmiş JSON Yanıtı (Forecast + AI Prediction + Analysis)]
```

---

## 3. Teknoloji Yığını (Tech Stack)

### Frontend
*   **Framework:** React 18, Vite
*   **Dil:** TypeScript
*   **Styling:** Tailwind CSS, Lucide React (İkonlar)
*   **Charts:** Recharts (Grafik görselleştirme)
*   **State Management:** React Query (TanStack Query) - (Veri çekme ve cache yönetimi için)

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Dil:** TypeScript
*   **External API:** OpenWeatherMap One Call API (veya 5 Day Forecast)
*   **Core Logic:** `DecisionEngine.ts`, `ChatService.ts`

### AI & Data Science
*   **Dil:** Python 3.x
*   **Framework:** Flask (API sunumu için)
*   **ML Library:** TensorFlow / Keras
*   **Model:** LSTM (Sequential) - 2 Katmanlı LSTM + Dropout
*   **Veri İşleme:** Pandas, NumPy, Scikit-learn (MinMaxScaler)

---

## 4. Kritik Tarımsal Analiz Mantığı (Algorithm Specifics)

Backend'deki `DecisionEngine.ts` dosyası aşağıdaki kurallara göre analiz üretir:

### A. Don Riski (Frost Risk)
*   **Veri:** `temp_min` (Günlük en düşük sıcaklık)
*   **Mantık:**
    *   `< 0°C`: **YÜKSEK RİSK** (Don olayı kesin)
    *   `0°C - 2°C`: **DÜŞÜK RİSK** (Kırağı olasılığı)
    *   `> 2°C`: **RİSK YOK**
*   **Uyarı:** Çiftçiye sulama veya örtü altı önlemleri önerilir.

### B. Ekim Uygunluğu (Planting Suitability)
*   **Veri:** `temp_max`, `rain` (yağış)
*   **Mantık:**
    *   `Yağmur Var mı?`: Evet ise -> **UYGUN DEĞİL** (Çamur riski)
    *   `Sıcaklık < 10°C`: **UYGUN DEĞİL** (Toprak soğuk, çimlenme olmaz)
    *   `Sıcaklık 15-25°C` VE `Yağış Yok`: **İDEAL / UYGUN**

### C. İlaçlama Durumu (Spraying Conditions)
*   **Veri:** `wind_speed` (Rüzgar hızı), `rain`
*   **Mantık:**
    *   `Rüzgar > 15 km/s`: **RİSKLİ** (İlaç sürüklenmesi / Drift riski)
    *   `Yağmur Var mı?`: Evet ise -> **RİSKLİ** (İlaç yıkanır, etkisi kaybolur)
    *   Diğer Durumlar: **YAPILABİLİR**

### D. Mantar/Hastalık Riski (Disease Risk)
*   **Veri:** `humidity` (Nem), `temp_max`
*   **Mantık:**
    *   `Nem > %80` VE `Sıcaklık > 20°C`: **YÜKSEK RİSK** (Nemli ve sıcak ortam mantar sporlarını tetikler)

---

## 5. Yapay Zeka Modeli (AI Model Specifications)

Sistemde kullanılan model, zaman serisi tahmini (Time Series Forecasting) için özel olarak eğitilmiştir.

*   **Model Tipi:** LSTM (Long Short-Term Memory)
*   **Eğitim Verisi:** 2020-2024 yılları arasındaki Ankara/Türkiye günlük hava durumu verileri.
*   **Öznitelikler (Features):**
    1.  `Max Temp` (Günlük En Yüksek Sıcaklık)
    2.  `Min Temp` (Günlük En Düşük Sıcaklık)
    3.  `Humidity` (Ortalama Nem)
*   **Pencere Boyutu (Lookback):** 30 Gün (Model, geçmiş 30 güne bakarak yarını tahmin eder).
*   **Girdi Şekli:** `(Batch_Size, 30, 3)`
*   **Çıktı:** Skaler değer (Yarının Sıcaklığı - Max Temp)

### API Entegrasyonu
Python sunucusu `/predict` endpoint'inde çalışır.
*   **Input:** Yok (Şimdilik statik dataset üzerinden son 30 günü alır).
*   **Output:**
    ```json
    {
        "prediction_type": "LSTM",
        "value": 15.4,
        "history": [12.1, 13.5, ...], // Son 7 gün grafiği için
        "message": "Sıcaklık düşüş trendinde..."
    }
    ```

---

## 6. Chatbot (Akıllı Asistan) Yetenekleri

`ChatService.ts` projenin beynidir. Sadece "Merhaba" diyen bir bot değil, veriye dayalı bir asistandır.

*   **Intent Recognition (Niyet Analizi):**
    *   Kullanıcı *"don riski var mı?"* dediğinde -> `Intent: FROST`
    *   Kullanıcı *"ilaç atabilir miyim?"* dediğinde -> `Intent: SPRAYING`
    *   Kullanıcı *"yapay zeka ne diyor?"* dediğinde -> `Intent: AI_PREDICTION`
*   **Context-Aware Responses:**
    *   Asistan, o anki `AgroAnalysis` sonucuna bakar.
    *   Eğer analizde "Don Riski: YÜKSEK" ise ve kullanıcı bunu sorarsa, *"Evet, ne yazık ki yüksek don riski var, önlem almalısınız"* der. Ezbere konuşmaz.

---

## 7. Dosya Yapısı & Kritik Dosyalar

*   `frontend/src/pages/Dashboard.tsx`: Ana ekran, tüm kartların ve grafiklerin olduğu yer. Full-Width AI kartı burada.
*   `backend/src/services/DecisionEngine.ts`: Tüm if-else tarım kurallarının olduğu dosya.
*   `backend/src/services/ChatService.ts`: Chatbot mantığı.
*   `ai-model/predict_server.py`: Python Flask sunucusu ve modelin çalıştırıldığı yer.
*   `ai-model/train_model.py`: Modelin eğitim scripti.

---

## 8. Gelecek Geliştirme Önerileri (Future Work)

1.  **Multi-Location Support:** Şu an model sadece "Ankara" verisiyle eğitildi. Her şehir için ayrı `.keras` modelleri eğitilip, `/predict` endpoint'ine `city` parametresi gönderilmeli.
2.  **Gelişmiş GDD (Growing Degree Days) Hesabı:** Bitki tipine özel (Bugday, Mısır vs.) büyüme takvimi eklenebilir.
3.  **Kullanıcı Geri Bildirimi:** Çiftçinin "Bugün yağmur yağdı/yağmadı" onayı ile modelin online-learning yapması sağlanabilir.
