# Sistem Mimarisi ve Teknoloji Yığını

## 1. Mimari Genel Bakış
Sistem, modern web standartlarına uygun, modüler ve ölçeklenebilir bir yapıda tasarlanmıştır.

```mermaid
graph TD
    User[Kullanıcı (Çiftçi)] -->|HTTP/Websocket| Frontend[Frontend (React + Shadcn/UI)]
    Frontend -->|API İstekleri| Backend[Backend (Node.js + Express)]
    
    subgraph "Backend Servisleri"
        Backend --> Routing[Router & Validasyon]
        Routing --> ChatOrch[Chat Orchestrator (Niyet Analizi)]
        Routing --> DecisionEng[Agro-Decision Engine (Kural Motoru)]
        Routing --> WeatherProv[Weather Provider (API Wrapper)]
    end
    
    WeatherProv -->|Veri Çekme| ExternalAPI[Harici Hava Durumu API'si]
    ChatOrch -->|Log & Tercih| DB[(MongoDB)]
    DecisionEng -->|Kural Setleri| StaticRules[Statik Karar Kuralları]
```

## 2. Modül Tanımları

### Frontend (İstemci Tarafı)
*   **Teknoloji:** React, TypeScript, Vite.
*   **UI Kütüphanesi:** shadcn/ui, Tailwind CSS (Hızlı ve estetik geliştirme için).
*   **Durum Yönetimi:** React Query (Sunucu durumu ve cache yönetimi için).
*   **Sayfalar:**
    *   `LocationSelect`: İl/ilçe seçim ekranı.
    *   `Dashboard`: 3 günlük özet kartları ve uyarılar.
    *   `Chat`: Sohbet arayüzü.

### Backend (Sunucu Tarafı)
*   **Teknoloji:** Node.js, Express, TypeScript.
*   **Temel Modüller:**
    1.  **Weather Provider:** Harici API'den (OpenWeatherMap vb.) veri çeker, önbellekler ve standart formata dönüştürür.
    2.  **Agro-Decision Engine:** Ham hava verisini alır; don, ekim, sulama kurallarını işleyerek "Uygun", "Riskli", "Uygun Değil" gibi sonuçlar üretir.
    3.  **Chat Orchestrator:** Kullanıcı mesajını alır, basit kelime eşleştirme (keyword matching) veya niyet analizi ile kullanıcının ne sorduğunu (Intent) anlar, ilgili veriyi ve kuralı çağırıp yanıtı oluşturur.
    4.  **Logging:** Hataları ve kritik işlem kayıtlarını tutar.

### Veritabanı (MongoDB)
Veri kalıcılığı ve analiz için NoSQL yapısı kullanılır.
*   **Collections:**
    *   `users`: (Opsiyonel) Kullanıcı profilleri.
    *   `preferences`: Seçili il/ilçe, varsayılan ürün tipi.
    *   `queries`: Chatbot geçmişi, sorulan sorular (analiz için).
    *   `alerts_history`: Sistem tarafından üretilen uyarıların kaydı.

## 3. Veri Akış Şeması (Örnek: Chatbot Sorgusu)
1.  **Kullanıcı:** "Yarın ilaçlama yapabilir miyim?" yazar.
2.  **Backend (Orchestrator):** Mesajı analiz eder -> Intent: `SPRAYING_QUERY`, Zaman: `TOMORROW`.
3.  **Backend (Weather Provider):** Yarınki rüzgar ve yağış verisini çeker.
4.  **Backend (Decision Engine):** İlaçlama kurallarını (Rüzgar > 10km/s mi? Yağış var mı?) kontrol eder.
5.  **Sonuç:** "Yarın rüzgar hızı 15 km/s, ilaçlama için riskli." yanıtı oluşturulur.
6.  **Frontend:** Yanıt kullanıcıya gösterilir.
