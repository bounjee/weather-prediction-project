# 🌾 Tarımsal Karar Motoru Kuralları (Decision Rules)

AgroWeatherAI, sadece hava tahmini yapmaz; bu verileri **Tarımsal Karar Motoru (Decision Engine)** ile işleyerek çiftçiye tavsiye verir. Bu belgede, sistemin "Riskli" veya "Uygun" kararına varırken kullandığı fiziksel ve biyolojik formüller yer almaktadır.

*Kaynak Kod Referansı:* `backend/src/services/DecisionEngine.ts`

---

## ❄️ 1. Don Riski Analizi (Frost Risk)

Don olayı sadece sıcaklığa bağlı değildir. Havadaki nem ve sıcaklık farkı (Dew Point) kritiktir.

### Kullanılan Metrikler:
*   **Min Sıcaklık (T_min):** Günün en düşük sıcaklığı.
*   **Çiy Noktası (Dew Point):** *Magnus Formülü* ile hesaplanır.

### Karar Matrisi:
| Durum | Koşul | Açıklama |
| :--- | :--- | :--- |
| 🔴 **YÜKSEK (Kara Don)** | `T_min ≤ 0°C` VE `DewPoint ≤ -3°C` | Hava çok kuru ve soğuk. Bitki özsuyu donar, buzlanma görünmez ama bitki ölür. En tehlikeli durum. |
| 🟠 **ORTA (Beyaz Don)** | `T_min ≤ 2°C` | Bitki üzerinde beyaz buz kristalleri oluşur. |
| 🟢 **DÜŞÜK** | `T_min > 2°C` | Risk yok. |

---

## 🌱 2. Ekim Uygunluk Analizi (Planting)

Tohumun çimlenmesi için toprağın belli bir sıcaklık birikimine (ısı enerjisine) ihtiyacı vardır.

### Kullanılan Metrikler:
*   **GDD (Growing Degree Days):** Büyüme Derece Günleri.
    *   *Formül:* `(T_max + T_min) / 2 - T_base`
    *   *Taban Sıcaklık (T_base):* Genel tahıl/sebze için **10°C** kabul edilmiştir.
*   **Toprak Tahmini:** `Hava Sıcaklığı - 3°C` (Basitleştirilmiş yaklaşım).

### Karar Kuralları:
*   ✅ **UYGUN:**
    *   `GDD > 0` (Yeterli ısı birikimi var)
    *   `Ortalama Sıcaklık > 5°C`
    *   `Rüzgar < 30 km/s`
    *   `Yağış < 5mm` (Toprak çamur değil)
*   ❌ **RİSKLİ:** Yukarıdaki koşullardan biri sağlanmazsa.

---

## 🚜 3. İlaçlama Zamanlaması (Spraying)

Zirai ilacın (pestisit) verimli olması için havada uçup gitmemesi (drift) ve hemen buharlaşmaması gerekir.

### Kullanılan Metrikler:
*   **Delta-T:** Yaş termometre ve kuru termometre sıcaklık farkı. İlacın damlacık ömrünü belirler.
    *   *Hesap:* `Kuru Sıcaklık - Islak Sıcaklık (DewPoint)`

### Karar Kuralları:
*   ✅ **İDEAL:**
    *   `2°C < Delta-T < 8°C` (Damlacık ne çok hızlı buharlaşır ne de yaprakta ıslak kalır).
    *   `Rüzgar < 15 km/s` (İlaç komşu tarlaya sürüklenmez).
    *   `Yağış İhtimali < %20` (İlaç yağmurla yıkanmaz).
*   ❌ **UYGUN DEĞİL:** Rüzgarlı, yağmurlu veya çok sıcak/kuru (yüksek Delta-T) havalar.

---

## 🍄 4. Hastalık Riski (Disease)

Mantar (Fungal) hastalıklar sıcak ve nemli ortamları sever.

### Karar Kuralları:
*   🔴 **YÜKSEK RİSK:**
    *   `Nem > %80`
    *   `Sıcaklık > 15°C`
    *   `Yağış > 0mm` (Islaklık)
*   🟢 **DÜŞÜK RİSK:** Kuru ve serin havalar.

---

*Not: Bu kurallar genel tarımsal literatüre dayanmaktadır. Ürüne özel (Örn: Sadece Domates için) özelleştirilebilir.*
