# 💬 Chatbot Örnek Diyalogları ve Test Senaryoları

AgroWeatherAI Asistanı, `ChatService` üzerinden **kural tabanlı** (anahtar kelime/intent) bir akışla cevap verir. Aşağıda sistemin desteklediği temel senaryolar ve beklenen cevap örnekleri yer almaktadır.

---

## 1. Don Riski Sorgulama
**Kullanıcı:** "Don riski var mı?"
**Kullanıcı:** "Don riski durumu nedir?"

**Beklenen Cevap Örnekleri:**
> ⚠️ DİKKAT: Şiddetli zirai don (Kırağı) bekleniyor. Bu gece en düşük sıcaklık -2°C olacak.
>
> Hafif bir don riski var (-1°C). Çukur alanlardaki hassas bitkileri korumanızı öneririm.
>
> Şu an için önemli bir don riski görünmüyor.

---

## 2. İlaçlama Tavsiyesi
**Kullanıcı:** "İlaçlama yapabilir miyim?"
**Kullanıcı:** "Rüzgar ilaca engel olur mu?"

**Beklenen Cevap (Uygunsa):**
> ✅ İlaçlama yapabilirsiniz. Rüzgar sürüklenmesi veya yağmurla yıkanma riski düşük.

**Beklenen Cevap (Riskliyse):**
> ❌ İlaçlama için uygun olmayan koşullar var. Rüzgar hızı (25 km/h) ilaçlama için yüksek (Sürüklenme Riski).

---

## 3. Ekim Zamanı
**Kullanıcı:** "Ekim için uygun mu?"
**Kullanıcı:** "Tohum ekebilir miyim?"

**Beklenen Cevap:**
> ✅ Toprak ve hava koşulları ekim için uygun görünüyor. Rüzgar ve yağış seviyeleri makul.
>
> ❌ Ekim yapmanız şu an için önerilmez. Büyüme Derece Günleri (GDD) yetersiz. Bitki gelişimi durabilir.

---

## 4. Genel Hava Durumu ve Yapay Zeka Görüşü
**Kullanıcı:** "Yarın hava nasıl?"
**Kullanıcı:** "Hava durumu nedir?"

**Beklenen Cevap:**
> Yarın hava parçalı bulutlu, sıcaklık gün içinde 14°C civarında olacak.
>
> 🤖 Yapay Zeka Modelim Analizi: "Yapay Zeka (LSTM) Yarın için 14°C zirve sıcaklık öngörüyor."
> Tahmin edilen sıcaklık: 14.0°C.

---

## 🧪 Test İpuçları
Chatbot'u test ederken şu anahtar kelimeleri kullanabilirsiniz:
- `don`, `soğuk`, `buz` -> Don riski analizi tetikler.
- `ilaç`, `gübre`, `zehir` -> İlaçlama analizi tetikler.
- `ekim`, `tohum`, `tarla` -> Ekim analizi tetikler.
- `hastalık`, `mantar` -> Hastalık riski analizi tetikler.
