# Tarımsal Karar Kuralları (Decision Rules)

Sistem, ham hava durumu verilerini aşağıdaki deterministik kurallara göre işleyerek çiftçiye öneriler sunar. Bu kurallar literatürdeki genel tarımsal kabullere dayalı "Baseline" kurallardır.

## 1. Don Riski Hesaplama
Bitkiler için en kritik risk faktörüdür.

| Parametre | Koşul | Risk Seviyesi | Öneri |
| :--- | :--- | :--- | :--- |
| **Min. Sıcaklık** | T > 2°C | **Yok** | Risk görünmüyor. |
| **Min. Sıcaklık** | 0°C < T ≤ 2°C | **Düşük** | Hafif don riski, hassas bitkilere dikkat. |
| **Min. Sıcaklık** | -2°C < T ≤ 0°C | **Orta** | Don olayı bekleniyor, önlem alınmalı. |
| **Min. Sıcaklık** | T ≤ -2°C | **Yüksek** | Şiddetli don (Zirai Don) bekleniyor! Acil önlem. |

## 2. Ekim Uygunluğu (Planting)
Toprak ve hava koşullarının tohum ekimi için uygunluğu.

| Parametreler | Koşul | Uygunluk | Açıklama |
| :--- | :--- | :--- | :--- |
| **Yağış & Rüzgar** | Yağış > 5mm **VEYA** Rüzgar > 20 km/s | **Uygun Değil** | Toprak çamur olabilir veya rüzgar tohumu/gübreyi savurabilir. |
| **Sıcaklık** | T < 5°C | **Uygun Değil** | Toprak sıcaklığı çimlenme için yetersiz olabilir. |
| **Genel** | Diğer tüm durumlar | **Uygun** | Hava koşulları ekim için elverişli görünüyor. |

## 3. Sulama İhtiyacı
Bitkinin su stresi ve doğal yağış beklentisi.

| Parametreler | Koşul | Tavsiye | Açıklama |
| :--- | :--- | :--- | :--- |
| **Yağış** | Önümüzdeki 24s yağış olasılığı > %60 | **Ertele** | Yağmur bekleniyor, tasarruf yapın. |
| **Toprak/Nem** | Nem > %85 | **Gerekli Değil** | Nem oranı çok yüksek, küf riski oluşabilir. |
| **Sıcaklık** | T > 30°C **VE** Yağış Yok | **Gerekli** | Yüksek buharlaşma riski, sulama önerilir. |
| **Genel** | Diğer Durumlar | **Kontrol** | Toprak nemini kontrol ederek karar verin. |

## 4. İlaçlama (Serpme) Riski
Rüzgarın ilacı sürüklemesi (drift) ve yağmurun ilacı yıkaması riski.

| Parametreler | Koşul | Risk | Açıklama |
| :--- | :--- | :--- | :--- |
| **Rüzgar** | Rüzgar > 15 km/s | **Yüksek** | İlaç sürüklenme riski (drift). Yapmayın. |
| **Yağış** | 6 saat içinde yağış > %50 | **Yüksek** | İlacın yıkanma riski var. Yapmayın. |
| **Sıcaklık** | T > 30°C | **Orta** | Bazı ilaçlar yüksek sıcaklıkta buharlaşabilir/yakabilir. |
| **Genel** | Diğer durumlar | **Düşük** | İlaçlama için uygun pencere. |

## Belirsizlik İletişimi
Sistem kesin konuşmaktan kaçınır ve olasılıkları belirtir:
*   "Yağış olasılığı %60" -> "Yağmur beklentisi var."
*   "Rüzgar 14 km/s" -> "Rüzgar sınırda, dikkatli olunmalı."
