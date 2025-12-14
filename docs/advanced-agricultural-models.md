# Gelişmiş Tarımsal Hava Tahmin Modelleri
Bu doküman, projeye eklenecek olan bilimsel hesaplama yöntemlerini açıklar.

## 1. Gelişmiş Don Riski Analizi (Frost Risk & Freeze Types)
Basit sıcaklık takibi yerine **Çiğlenme Noktası (Dew Point)** hesabı kullanılacaktır.

### Formül (Magnus Formülü Yaklaşımı):
Çiğlenme noktası ($T_{dp}$), sıcaklık ($T$) ve bağıl nem ($RH$) kullanılarak hesaplanır.
$$ T_{dp} = T - ((100 - RH) / 5) $$ *(Basitleştirilmiş)*

### Karar Matrisi:
| Hava Sıcaklığı ($T$) | Çiğlenme Noktası ($T_{dp}$) | Risk Türü | Açıklama |
|---|---|---|---|
| $\le 0^\circ C$ | $> 0^\circ C$ | **Kırağı (White Frost)** | Nem donarak bitki üzerinde beyaz tabaka oluşturur. Orta risk. |
| $\le 0^\circ C$ | $\le -2^\circ C$ | **Kara Don (Black Frost)** | Nem çok düşüktür, buz oluşmaz ama bitki dokusu donar ve kararır. **Çok Yüksek Risk.** |
| $0^\circ C - 2^\circ C$ | - | **Hafif Don** | Hassas bitkiler için riskli. |

## 2. Büyüme Derece Günleri (GDD - Growing Degree Days)
Bitkilerin fenolojik gelişimi (büyümesi) takvim gününe değil, maruz kaldıkları sıcaklık toplamına bağlıdır.

### Formül:
$$ GDD = \frac{T_{max} + T_{min}}{2} - T_{base} $$
*   $T_{base}$ (Baz Sıcaklık): Genellikle bitkiler için **5°C** veya **10°C** alınır. Biz buğday/arpa gibi serin iklim tahılları için **5°C** baz alacağız.

### Karar Kuralı:
*   Günlük GDD > 0 ise bitki büyür.
*   GDD toplamı belirli bir eşiğe (örn. 100) ulaştığında filizlenme başlar.
*   Dashboard'da **"Bugün bitki gelişimi için verimli mi?"** sorusunu cevaplayacağız.

## 3. Mantar Hastalık Riski (Fungal Infection Index)
Yüksek nem ve ılıman sıcaklıklar mantar hastalıklarını (Mildiyö, Pas vb.) tetikler.

### Kural:
Eğer:
1.  Sıcaklık **15°C - 25°C** arasındaysa, VE
2.  Nem **>%85** ise, VE
3.  Yaprak ıslaklığı (Yağış olasılığı > %40) varsa:
-> **YÜKSEK HASTALIK RİSKİ** (İlaçlama Önerilir)

## 4. İlaçlama İçin Delta T (Buharlaşma Riski)
İlaçlama sırasında damlacıkların buharlaşmadan yaprağa ulaşması gerekir.
$$ \Delta T = Kuru Termometre Sıcaklığı - Yaş Termometre Sıcaklığı $$
*   $\Delta T < 2$: Damlacık çok yavaş buharlaşır (İyi değil).
*   **$\Delta T$ 2-8: İDEAL İLAÇLAMA.**
*   $\Delta T > 8$: Damlacık havada buharlaşır (Etkisiz İlaçlama).
