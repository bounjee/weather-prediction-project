# 💬 Chatbot Örnek Diyalogları ve Test Senaryoları

AgroWeatherAI Asistanı, `ChatService` üzerinden doğal dil işleme (NLP) yeteneğiyle cevap verir. Aşağıda sistemin desteklediği temel senaryolar ve beklenen cevaplar yer almaktadır.

---

## 1. Don Riski Sorgulama
**Kullanıcı:** "Yarın don var mı?"
**Kullanıcı:** "Don riski durumu nedir?"

**Beklenen Cevap (Yüksek Risk Durumunda):**
> ⚠️ DİKKAT: Ciddi don riski tespit edildi! Kara don (Black Frost) ihtimali yüksek.
> Bu gece en düşük sıcaklık -2.4°C olacak. Hassas bitkiler için önlem alınmalıdır.

**Beklenen Cevap (Risksiz Durumda):**
> Şu an için önemli bir don riski görünmüyor. En düşük sıcaklık 8°C seviyelerinde seyredecek.

---

## 2. İlaçlama Tavsiyesi
**Kullanıcı:** "İlaçlama yapabilir miyim?"
**Kullanıcı:** "Rüzgar ilaca engel olur mu?"

**Beklenen Cevap (Uygunsa):**
> ✅ İlaçlama yapabilirsiniz.
> Rüzgar hızı (12 km/s) ideal seviyede ve yağış beklenmiyor. Delta-T değeri ilaçlamanın verimli olacağını gösteriyor.

**Beklenen Cevap (Riskliyse):**
> ❌ İlaçlama için uygun olmayan koşullar var.
> Rüzgar çok şiddetli (25 km/s), ilacın sürüklenme riski var. Lütfen rüzgarın dinmesini bekleyin.

---

## 3. Ekim Zamanı
**Kullanıcı:** "Ekim için uygun mu?"
**Kullanıcı:** "Tohum ekebilir miyim?"

**Beklenen Cevap:**
> ✅ Toprak ve hava koşulları ekim için uygun görünüyor.
> GDD (Büyüme Derecesi) pozitif ve toprak tahmini sıcaklığı 12°C. Tohum çimlenmesi için güzel bir gün.

---

## 4. Genel Hava Durumu ve Yapay Zeka Görüşü
**Kullanıcı:** "Yarın hava nasıl?"
**Kullanıcı:** "Hava durumu nedir?"

**Beklenen Cevap:**
> Yarın için tahmin edilen hava: Parçalı bulutlu, sıcaklık gün içinde 14°C civarında olacak.
> 🤖 **Yapay Zeka Analizi:** Modelimiz önümüzdeki 3 gün boyunca sıcaklıkların mevsim normallerinde seyredeceğini, ani bir soğuma beklenmediğini öngörüyor.

---

## 🧪 Test İpuçları
Chatbot'u test ederken şu anahtar kelimeleri kullanabilirsiniz:
- `don`, `soğuk`, `buz` -> Don riski analizi tetikler.
- `ilaç`, `gübre`, `zehir` -> İlaçlama analizi tetikler.
- `ekim`, `tohum`, `tarla` -> Ekim analizi tetikler.
- `hastalık`, `mantar` -> Hastalık riski analizi tetikler.
