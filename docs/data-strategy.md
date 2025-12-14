# Veri Stratejisi ve API Entegrasyonu

## 1. Veri Kaynağı
Projenin temel "yakıtı" güvenilir ve güncel meteorolojik verilerdir. Tahminleme modeli geliştirmek yerine, başarısı kanıtlanmış global sağlayıcıların API'leri kullanılacaktır.

*   **Önerilen API:** OpenWeatherMap One Call API 3.0 (veya muadili ücretsiz/freemium servisler).
*   **Gerekli Veri Parametreleri:**
    *   Sıcaklık (Mevcut, Min, Max)
    *   Hissedilen Sıcaklık
    *   Yağış Miktarı (mm) ve Olasılığı (%)
    *   Rüzgar Hızı (km/s) ve Yönü
    *   Nem Oranı (%)
    *   Bulutluluk Durumu

## 2. Veri İşleme Yaklaşımı (Pipeline)

Veri akışı şu üç aşamadan oluşur:

### Adım 1: Veri Alımı (Ingestion)
*   Kullanıcı konum seçtiğinde veya sorgu attığında API çağrısı yapılır.
*   **Optimist Cache:** Aynı ilçe için 10-15 dakika içinde yapılan sorgularda tekrar API'ye gidilmez, sunucu belleğindeki (veya Redis) veri kullanılır.

### Adım 2: Zenginleştirme (Transformation)
*   Ham API yanıtı (JSON), projenin ihtiyaç duyduğu veri modeline dönüştürülür.
*   *Örnek:* API'den gelen `wind_speed: 3.5 m/s` değeri, kullanıcı için daha anlaşılır olan `km/s` birimine çevrilir.

### Adım 3: Karar Katmanı (Decision)
*   Zenginleştirilmiş veri, `Decision Engine`e beslenir.
*   Burada "veri" -> "bilgi"ye dönüşür. (Sıcaklık -2°C -> "Don Riski Var").

## 3. Geçmiş Veri (Historical Data)
Proje raporunda sistemin başarısını analiz edebilmek için karşılaştırma verisi gereklidir.
*   **Strateji:** API'lerin "Historical Weather" endpoint'leri kullanılarak son 3-5 yılın aynı dönemine ait veriler çekilecek (demo ve test amaçlı).
*   **Kullanım:** "Geçen sene bugün don olmuştu, bu sene risk daha düşük" gibi bağlamsal bilgiler sunmak için kullanılabilir (opsiyonel).

## 4. Veri Gizliliği
*   Kullanıcıdan hassas kişisel veri (TC, tam adres vb.) talep edilmez.
*   Sadece İl/İlçe tercihi ve sohbet logları anonimleştirilerek saklanır.
