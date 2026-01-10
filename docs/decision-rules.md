# 🌾 Tarımsal Karar Motoru Kuralları (Decision Rules)

AgroWeatherAI, sadece hava tahmini yapmaz; bu verileri **Tarımsal Karar Motoru (Decision Engine)** ile işleyerek çiftçiye tavsiye verir. Bu belgede, sistemin karar verirken kullandığı mevcut kurallar **kodla birebir** özetlenmiştir.

*Kaynak Kod Referansı:* `backend/src/services/DecisionEngine.ts`

---

## ❄️ 1. Don Riski Analizi (Frost Risk)

Don olayı sadece sıcaklığa bağlı değildir. Havadaki nem ve sıcaklık farkı (Dew Point) kritiktir.

### Kullanılan Metrikler (kod)
*   **Min Sıcaklık (T_min):** Günün en düşük sıcaklığı.
*   **Bağıl Nem (RH):** Günün nem değeri.
*   **Çiy Noktası (Dew Point) — yaklaşık:**
    *   \(DP \approx T_{min} - \frac{100 - RH}{5}\)

> Not: Kod içinde “Magnus” yorumu geçse de, uygulanan hesap bu basitleştirilmiş yaklaşımdır.

### Karar Kuralları (kod)
*   🔴 **KARA DON (EXTREME):**
    *   `T_min ≤ 0` VE `DP ≤ -3` VE `(T_min - DP) > 2`
*   ⚪ **KIRAĞI (WHITE_FROST):** `T_min ≤ 0` ise
    *   `T_min ≤ -4` → HIGH
    *   `T_min ≤ -2` → MEDIUM
    *   aksi → LOW
*   🟠 **SINIRDA DON (LOW):** `T_min ≤ 2`
*   🟢 **YOK (NONE):** aksi

---

## 🌱 2. Ekim Uygunluk Analizi (Planting)

Tohumun çimlenmesi için toprağın belli bir sıcaklık birikimine (ısı enerjisine) ihtiyacı vardır.

### Kullanılan Metrikler (kod)
*   **GDD (Growing Degree Days):** Büyüme Derece Günleri.
    *   *Formül:* \(GDD = \frac{T_{max} + T_{min}}{2} - T_{base}\)
    *   *Taban Sıcaklık (T_base):* `5`
    *   Negatifse `0`’a kırpılır.

### Karar Kuralları (kod)
*   ❌ **UYGUN DEĞİL:** `GDD ≤ 0` veya `temp.day < 5` veya `precipitation_prob > 60` veya `wind_speed > 25`
*   ✅ **UYGUN:** aksi

> Not: `precipitation_prob` bu projede modelin doğrudan çıktısı değildir; `backend/src/services/WeatherService.ts` içinde basit bir türetimle üretilir.

---

## 🚜 3. İlaçlama Zamanlaması (Spraying)

Zirai ilacın (pestisit) verimli olması için havada uçup gitmemesi (drift) ve yağışla yıkanmaması gerekir.

### Karar Kuralları (kod)
*   ❌ **UYGUN DEĞİL:** `wind_speed > 15` veya `precipitation_prob > 40` veya `temp.day > 30`
*   ✅ **UYGUN:** aksi

---

## 🍄 4. Hastalık Riski (Disease)

Mantar (Fungal) hastalıklar sıcak ve nemli ortamları sever.

### Karar Kuralları (kod)
*   🔴 **YÜKSEK:** `15 ≤ temp.day ≤ 28` VE `humidity > 80` VE `precipitation_prob > 30`
*   🟠 **ORTA:** `15 ≤ temp.day ≤ 28` VE `humidity > 80`
*   🟢 **DÜŞÜK:** aksi

---

*Not: Bu kuralların tamamı `DecisionEngine` içinde deterministik olarak uygulanır; dokümantasyon ile kod çelişirse kod kaynak otoritedir.*
