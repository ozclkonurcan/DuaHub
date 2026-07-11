# DuaHub — Ürün ve Mimari Planı (PRD) v1.0

> **Vizyon:** Müslüman kullanıcının gününü uçtan uca kapsayan, premium hissiyatlı, AI destekli, offline-first bir İslami Super-App. Hedef: Ezan Vakti Pro'nun pazar liderliğini, onun zayıf olduğu üç eksende yenerek almak — **tasarım/deneyim, güven (reklamsızlık) ve yapay zeka**.
>
> Tarih: 10 Temmuz 2026 · Sahip: Onur Özçelik · Durum: Onay bekliyor

---

## 0. Yönetici Özeti

| Karar Alanı | Karar | Tek Cümlelik Gerekçe |
|---|---|---|
| Frontend | **Expo (SDK 54+) + TypeScript + expo-router + NativeWind v4 + Reanimated** | Zaten kurulu; tek codebase ile iOS/Android/Widget/Watch hedeflenebilir. |
| Backend / BaaS | **Supabase** (Postgres + Auth + Storage + Edge Functions + pgvector) | SQL + RLS + AI/RAG altyapısı tek platformda; Firebase'e göre daha öngörülebilir maliyet ve daha güçlü veri modeli. |
| Offline stratejisi | **Local-first**: expo-sqlite + Drizzle ORM, MMKV, namaz vakitleri cihazda hesaplanır (`adhan` kütüphanesi) | Ezan Vakti Pro'nun 1 numaralı şikayeti "bildirim gelmiyor" — internetsiz de %100 çalışan bir çekirdek bunu kökten çözer. |
| AI | **Claude API** — Soru-cevap asistanı için `claude-opus-4-8` (varsayılan), hafif kişiselleştirme görevleri için `claude-haiku-4-5`; RAG ile Diyanet kaynaklarına dayalı cevaplar | Dini içerikte doğruluk pazarlanabilir tek şeydir; RAG + kaynak gösterimi "AI fetva veriyor" riskini yönetir. |
| Monetizasyon | **Sıfır reklam** + Freemium abonelik (RevenueCat) | Rakibin en acı şikayeti dini uygulamada casino/uygunsuz reklamlar — "reklamsız, temiz" başlı başına bir pazarlama silahı. |
| Bildirim | **Yerel zamanlanmış bildirimler** (push değil) + Live Activities | Vakit bildirimi cihazda hesaplanıp cihazda kurulur; sunucuya ve internete bağımlılık sıfır. |

---

## 1. ADIM 1 — Rakip Analizi: Ezan Vakti Pro

### 1.1 Özellik Envanteri (tam liste)

Ezan Vakti Pro (mobilexsoft ve türevleri) yıllardır Türkiye pazarının lideri. Çekirdek özellik seti:

**İbadet çekirdeği**
1. Namaz vakitleri (Diyanet uyumlu + farklı hesaplama yöntemleri, konum bazlı)
2. Ezan alarmı / vakit bildirimleri (vakit öncesi hatırlatma, farklı ezan sesleri, sela)
3. Kıble pusulası
4. 30 günlük offline vakit görüntüleme
5. İmsakiye (Ramazan imsak/iftar tablosu)
6. Aylık/yıllık vakit takvimi, Hicri takvim

**İçerik**
7. Kur'an-ı Kerim (Arapça metin + hatim takibi)
8. Meal (Türkçe ve diğer diller)
9. Kur'an sesli dinleme (hafız seçenekleri)
10. Cüz/sure/sayfa navigasyonu
11. Hadis listeleri / günün hadisi
12. Dua kütüphanesi, Esmaü'l Hüsna
13. Dini günler ve kandil takvimi

**Araçlar**
14. Zikirmatik (sayaç)
15. Yakındaki camiler (harita)
16. Widget'lar (kilit ekranı + ana ekran)
17. Apple Watch desteği (Pro sürümde, watch face'ler)
18. Kilit ekranına Hicri tarih ekleme
19. Namaz takip çizelgesi (kılınan namazları işaretleme)
20. Şehir/ülke bazlı manuel konum, seyahat modu

### 1.2 Tespit Edilen Zayıflıklar (kullanıcı şikayetleri + UX analizi)

Şikayetvar, App Store yorumları ve Ekşi Sözlük taramasından çıkan **doğrulanmış** sorunlar:

| # | Zayıflık | Kanıt / Kaynak | DuaHub Fırsatı |
|---|---|---|---|
| Z1 | **Uygunsuz reklamlar**: dini içerikli uygulamada casino, cinsel içerikli ürün reklamları. Kullanıcılar "saygısızlık" olarak nitelendiriyor. | Şikayetvar'da çok sayıda kayıt (2025-2026) | Sıfır reklam politikası = anında güven farkı |
| Z2 | **Bildirim güvenilirliği**: bildirimler bir süre sonra kesiliyor; uygulamayı birkaç günde bir açmak gerekiyor. Güncelleme sonrası "ezana kaç dakika kaldı" özelliği bozuldu. | Şikayetvar + SSS sayfası | %100 yerel zamanlanmış bildirim mimarisi |
| Z3 | **Agresif upsell**: tam sayfa "Pro" reklamı uygulama açılışını blokluyor. | Şikayetvar (2026) | Nazik, değer-önce freemium |
| Z4 | **Eski/karmaşık arayüz**: yıllar içinde özellik yığılması; 2015 hissiyatlı yoğun ekranlar, tutarsız ikonografi, zayıf dark mode. | UX incelemesi | 2026 tasarım dili: minimal, tipografi odaklı, akıcı animasyon |
| Z5 | **Zayıf içerik kütüphanesi**: Kur'an/Sünnet içeriği yüzeysel; tefsir derinliği yok. | App Store yorumları | AI destekli ayet açıklama + zengin meal/tefsir katmanı |
| Z6 | **Widget/senkron sorunları**: widget çalışmama, ödeme sonrası streaming bozulması. | Şikayetvar + yorumlar | WidgetKit/Glance native, test edilmiş widget altyapısı |
| Z7 | **Kişiselleştirme yok**: herkese aynı içerik; alışkanlık oluşturma mekaniği yok. | Ürün incelemesi | AI kişiselleştirme + gamification (bkz. Adım 3) |
| Z8 | **Yapay zeka yok**: hiçbir AI özelliği bulunmuyor. | Ürün incelemesi | En büyük mavi okyanus alanımız |

**Stratejik okuma:** Rakip *fonksiyon* savaşını kazanmış ama *deneyim ve güven* savaşını hiç oynamamış. Kullanıcı tabanı sadakatle değil alışkanlıkla duruyor; geçiş maliyetini düşürecek (veri gerektirmeyen, ilk açılışta değer veren) bir ürün bu tabanı koparabilir.

---

## 2. ADIM 2 — Özellik Eşitleme (Feature Parity)

İlke: **"Parity ama asla kopya değil."** Her rakip özelliği DuaHub'da ya daha iyi bir formda ya da daha akıllı bir konumda yer alır.

| Rakip Özelliği | DuaHub Konumu | Nasıl Daha İyi? |
|---|---|---|
| Namaz vakitleri | **Ana ekran (Bugün)** — günün omurgası | Cihazda `adhan` ile hesaplama → internetsiz sonsuz gün; Diyanet metodu varsayılan, 10+ metod seçeneği; konum değişince otomatik güncelleme |
| Ezan alarmı | Bildirim Merkezi ayarları | Vakit başına ayrı ses/titreşim/öncesi-sonrası hatırlatma; yerel zamanlama (Z2 çözümü); iOS Critical-benzeri "kaçırma" modu |
| Kıble | Araçlar sekmesi + Bugün kısayolu | Mevcut `QiblaCompass` bileşeni üzerine: hassasiyet göstergesi, düz-tutma uyarısı, AR modu (Phase 3) |
| 30 gün offline vakit | Aşılıyor | Hesaplama cihazda olduğu için **süresiz** offline |
| İmsakiye | Ramazan Modu (sezonluk yüzey) | Ramazan'da ana ekran otomatik dönüşür: iftar/sahur geri sayımı, Live Activity, oruç takibi |
| Kur'an + Meal | Kur'an sekmesi | Sayfa (Medine hattı) + satır-arası meal modu; kelime kelime okunuş; SQLite'ta gömülü → tam offline |
| Sesli Kur'an | Kur'an içi oynatıcı | Hafız başına indirilebilir ses paketleri (R2/CDN); arka plan oynatma; ayet takipli highlight |
| Hadis / günün içeriği | Bugün akışı | Statik liste yerine kişiselleştirilmiş günlük kart (bkz. KF-2) |
| Dua kütüphanesi | Dua sekmesi (mevcut modül) | Mevcut `duas.json` + kategoriler korunur; arama, favori, sesli okuma zaten var → cilalanır |
| Esmaü'l Hüsna | Dua sekmesi alt modülü | Sesli telaffuz + anlam kartları + ezber modu |
| Zikirmatik | Araçlar + Bugün kısayolu | Mevcut `CounterButton` üzerine: haptic, hedefli setler (33/99/istediğin), zikir geçmişi, Watch'tan çekilebilir |
| Dini günler takvimi | Takvim modülü | Kandil bildirimleri + özel gün içerikleri otomatik |
| Cami bulucu | Araçlar | Harita + yürüme süresi; cuma saatleri (topluluk verisi, Phase 4) |
| Widget'lar | iOS WidgetKit + Android Glance | Vakit sayacı, günün ayeti, streak — üçü de kilit ekranı destekli |
| Apple Watch | Watch companion (Phase 3) | Sadece vakit değil: zikirmatik + namaz işaretleme bilekten |
| Namaz takip çizelgesi | İbadet Günlüğü | İşaretleme → streak/istatistik/AI içgörü besler (KF-4) |

---

## 3. ADIM 3 — İnovasyon: "Killer Features"

Öncelik sırasına göre. Her özellik: konsept → neden öne geçirir → teknik özet.

### KF-1 · "Rehber" — AI Dini Soru-Cevap Asistanı
**Konsept:** Kullanıcı doğal dilde sorar ("Seferi iken namaz nasıl kılınır?", "Adak orucu nedir?"). Rehber, **yalnızca doğrulanmış kaynaklardan** (Diyanet İlmihali, Kur'an Yolu Tefsiri, güvenilir hadis külliyatı) RAG ile beslenerek cevap verir ve **her cevabın altında kaynağını gösterir**.
**Neden kazandırır:** Pazarda güvenilir, kaynak gösteren İslami AI asistanı yok. Z5 + Z8'i aynı anda çözer.
**Kırmızı çizgiler (ürün kuralı):**
- Fetva vermez; ihtilaflı fıkhi konularda mezhep görüşlerini ayrı ayrı aktarır ve "bir din görevlisine danışın" yönlendirmesi yapar.
- Kaynaksız cevap üretmez; RAG eşiği altındaki sorularda dürüstçe "bu konuda kaynağım yok" der.
- Her cevapta "Bu bir yapay zeka özetidir" rozeti.
**Teknik:** Supabase Edge Function → Claude API (`claude-opus-4-8`, streaming, prompt caching'li sistem prompt + RAG parçaları), pgvector üzerinde kaynak korpusu. Detay: §4.5.

### KF-2 · Kişisel Manevi Akış ("Bugün" ekranı)
**Konsept:** Ana ekran herkes için aynı değil. Kullanıcının ritmine (hangi vakitleri kılıyor, hangi saatte uygulamayı açıyor, Ramazan mı, kandil mi, hangi duaları favoriliyor) göre gece toplu işle (Batch API) üretilen günlük kişisel kart seti: "Bu sabah için 2 dakikalık zikir", "Dün İkindi'yi kaçırdın, kaza hatırlatıcısı kurayım mı?", ilgi alanına göre günün ayeti + kısa AI açıklaması.
**Neden kazandırır:** Retention motoru. Rakipte kişiselleştirme sıfır (Z7).
**Teknik:** Gece cron → Batch API (`claude-haiku-4-5`, %50 indirimli) → kullanıcı başına JSON kart seti (structured outputs) → Supabase'e yazılır, sabah app senkronlar. İnternet yoksa jenerik yedek kartlar gösterilir.

### KF-3 · Kur'an Yolculuğu — Gamification
**Konsept:** Duolingo disiplininde ama **ihlas'a saygılı** bir tasarım: gösterişçi lig/rekabet yok; kişisel süreklilik var.
- **Streak**: günlük okuma zinciri (1 sayfa bile sayılır), "telafi taşı" ile 1 gün affı
- **Hatim ilerlemesi**: görsel cüz haritası, tahmini bitiş tarihi
- **Rozetler**: "İlk cüz", "Ramazan hatmi", "40 gün sabah namazı" — sessiz, kişisel
- **Ezber modu**: ayeti dinle → kapat → sesli oku → cihaz içi konuşma tanıma ile kontrol (Phase 3)
**Neden kazandırır:** Alışkanlık döngüsü = D30 retention. Rakipte yok.
**Teknik:** Tamamen local (SQLite) çalışır, girişliyse Supabase'e senkron. Konuşma tanıma: `expo-speech-recognition` (on-device).

### KF-4 · İbadet Günlüğü + AI İçgörü
**Konsept:** Namaz işaretleme çizelgesinin ötesi: haftalık "manevi rapor" — "Bu hafta sabah namazında %40 iyileşme var; en çok zorlandığın vakit Yatsı, yatma saatinle ilişkili görünüyor" tarzı nazik, yargılamayan AI özeti.
**Teknik:** Haftalık cron + Haiku 4.5, kullanıcının anonimleştirilmiş sayısal verisiyle (ham içerik değil, sayaçlar) çalışır.

### KF-5 · Live Activities + Dynamic Island
**Konsept:** iftar/sahur geri sayımı ve "sonraki vakit" sayacı kilit ekranında ve Dynamic Island'da canlı. Ramazan'da bu tek başına viral özellik.
**Teknik:** ActivityKit — Expo config plugin ile native modül (`expo-live-activity` veya özel Swift target + EAS Build). Android karşılığı: ongoing notification + Ramazan bildirim şablonu.

### KF-6 · Apple Watch Companion
Vakit kompikasyonları, bilekte zikirmatik (Digital Crown ile sayma!), namaz işaretleme, sessiz ezan (haptic). SwiftUI watch target, EAS ile derlenir.

### KF-7 · Ramazan Modu (sezonluk süper yüzey)
Uygulama Ramazan'da tema + içerik + widget olarak dönüşür: oruç takibi, iftar davetiye kartları (paylaşılabilir görsel), teravih takibi, sadaka/fitre hesaplayıcı, hatim planlayıcı ("29 günde hatim → günde 1.03 cüz" otomatik plan).

### KF-8 · Duygu-Bazlı Dua Önerisi
"Şu an nasıl hissediyorsun?" — kaygılı/şükür/üzgün/umutlu... → ilgili ayet + dua + kısa zikir seti. Basit ama duygusal bağ kuran, App Store yorumlarında anlatılan türden bir özellik. (Local eşleme tablosuyla başlar, Phase 3'te AI'lı serbest metin girişine genişler.)

### KF-9 · Sosyal Hatim (Phase 4)
Aile/arkadaş grubu ortak hatim: cüzler paylaşılır, herkes kendi cüzünü okur, grup ilerlemesi görülür. Viral döngü: davet linki → yeni kullanıcı.

### KF-10 · Tasarım Dili = Özellik
2026 standardı minimal-premium kimlik: tipografi odaklı (ör. başlıklarda zarif bir serif/Kufi dokunuşu), gece yarısı-yeşil/altın vurgulu **gerçek dark mode (varsayılan)**, Reanimated ile 60fps mikro-etkileşimler, haptic geri bildirim, SF Symbols/Material You uyumu. "Ekran görüntüsü paylaşılası" bir arayüz — App Store'da organik büyümenin en ucuz kanalı.

---

## 4. ADIM 4 — Teknik Mimari

### 4.1 Neden Supabase? (BaaS kararı)

Mevcut kodda Firebase bağlantısı var; **bilinçli olarak Supabase'e geçiyoruz**:

| Kriter | Supabase | Firebase | Kazanan |
|---|---|---|---|
| Veri modeli | Postgres (ilişkisel; hatim/streak/günlük gibi ilişkili veriler için doğal) | Firestore (NoSQL; sayaç/istatistik sorguları zahmetli ve okuma başı ücretli) | Supabase |
| AI/RAG | **pgvector gömülü** — ayrı vektör DB gerekmez | Yok (Vertex entegrasyonu ayrı dünya) | Supabase |
| Sunucu kodu | Edge Functions (Deno/TS — app ile aynı dil, Anthropic SDK çalışır) | Cloud Functions (ayrı Node projesi, soğuk başlama) | Supabase |
| Maliyet öngörüsü | Sabit kademeli; okuma başına ücret yok | Okuma/yazma başına ücret — senkron ağırlıklı bir app'te sürpriz fatura riski | Supabase |
| Güvenlik | Row Level Security (SQL ile satır bazlı) | Security Rules (ayrı DSL) | Supabase |
| Auth | Apple/Google/e-posta/anonim + RLS entegre | Olgun | Berabere |
| Push | Yok → **Expo Push Service** kullanılır (zaten en doğrusu) | FCM native | Firebase (ama bize gerekmiyor, bkz. 4.4) |

> Kritik içgörü: DuaHub'ın çekirdeği (vakitler, Kur'an, dua, zikir) **backend'e hiç ihtiyaç duymaz**. Backend yalnızca (a) hesap/senkron, (b) AI, (c) topluluk özellikleri içindir. Bu yüzden "hangi BaaS" kararı bir kilitlenme değil; incelikli bir yardımcı katman seçimi. Mevcut `firebase` bağımlılığı ve `expo-ads-admob` (deprecated) Phase 0'da kaldırılır.

### 4.2 Genel Mimari

```
┌──────────────────────────── CİHAZ (offline-first çekirdek) ────────────────────────────┐
│  Expo RN App (TypeScript, expo-router, NativeWind, Reanimated)                        │
│                                                                                        │
│  UI Katmanı ── features/* ekranları + tasarım sistemi (components/ui)                 │
│  State ────── Zustand (UI/oturum) · TanStack Query (uzak veri) · MMKV (ayarlar)       │
│  Domain ───── prayer-engine (adhan) · quran-engine · streak-engine · dhikr            │
│  Veri ─────── expo-sqlite + Drizzle                                                    │
│               ├── content.db  (SALT OKUNUR: Kur'an, meal, dualar — app ile gemide)    │
│               └── user.db     (günlük, streak, favoriler, zikir → senkronlanır)       │
│  Bildirim ─── expo-notifications: 7 günlük vakit bildirimi YEREL kurulur,             │
│               her açılışta/arka plan görevinde (expo-background-task) yenilenir       │
│  Native ───── WidgetKit/Glance · ActivityKit (Live Activity) · WatchOS target         │
└───────────────────────────────┬────────────────────────────────────────────────────────┘
                                │ (yalnızca girişli/online özellikler)
┌───────────────────────────────▼────────────────────────────────────────────────────────┐
│  SUPABASE                                                                              │
│  Auth (Apple/Google/anon) · Postgres+RLS (profiller, senkron tablolar, hatim grupları)│
│  pgvector (RAG korpusu) · Storage/CDN (ses paketleri, hafız kayıtları)                │
│  Edge Functions: /ai-chat (streaming) · /daily-cards (cron+Batch) · /weekly-insight   │
└───────────────────────────────┬────────────────────────────────────────────────────────┘
                                │ (API anahtarı YALNIZCA sunucuda)
                        ┌───────▼────────┐        ┌────────────────┐
                        │  Claude API    │        │ RevenueCat     │
                        │  (Anthropic)   │        │ PostHog·Sentry │
                        └────────────────┘        └────────────────┘
```

### 4.3 Offline ve Senkronizasyon Stratejisi

**İlke: "Girişsiz her şey çalışır; giriş sadece yedekleme + AI + sosyal ekler."**

1. **İçerik verisi (content.db):** Kur'an metni, mealler, dualar, Esma — derleme zamanında hazırlanan salt okunur SQLite dosyası, uygulamayla gemide gelir (~15-25 MB). Güncellemeler versiyonlu dosya indirme ile. Ses paketleri isteğe bağlı indirilir (Storage/CDN → `expo-file-system`).
2. **Kullanıcı verisi (user.db):** Tüm yazmalar önce yerel SQLite'a. Her tablo `updated_at` + `device_id` + `deleted_at` (soft delete) taşır.
3. **Senkron protokolü (basit ve yeterli):**
   - Push: `sync_queue` tablosundaki bekleyen mutasyonlar toplu upsert ile Supabase'e (`onConflict: updated_at` karşılaştırmalı **last-write-wins**).
   - Pull: `last_synced_at`'ten yeni satırlar çekilir, yerelde birleştirilir.
   - Sayaç türü veriler (zikir toplamları) LWW yerine **toplamsal birleştirme** (delta gönderimi) kullanır — iki cihazda sayılan zikirler kaybolmaz.
   - Tetikleyiciler: uygulama açılışı, ön plana dönüş, önemli mutasyon sonrası debounce.
   - Bu hacimde (kişisel ibadet verisi, çakışma olasılığı düşük) PowerSync/ElectricSQL gibi ağır CRDT altyapısı **gereksiz karmaşıklık**; ihtiyaç doğarsa Phase 4'te değerlendirilir.
4. **Namaz vakitleri:** `adhan` npm paketi ile cihazda astronomik hesap (Diyanet parametre seti varsayılan). Türkiye için isteğe bağlı "Resmî Diyanet verisiyle doğrula" modu: aylık tablo API'den çekilip önbelleğe alınır, fark varsa resmî tablo kazanır. İnternet yoksa hesaplanan değerler kullanılır — **uygulama asla "vakit gösteremiyorum" demez.**

### 4.4 Bildirim Mimarisi (Z2'yi kökten çözen tasarım)

- Vakit bildirimleri **sunucudan push değil, cihazda zamanlanmış yerel bildirimlerdir** (`expo-notifications` scheduled). İnternet, sunucu, hatta uygulamanın açık olması gerekmez.
- Her açılışta + `expo-background-task` ile günde ~1 kez: önümüzdeki 7 günün bildirimleri silinip yeniden kurulur (konum/ayar değişikliklerini yakalar; iOS 64 bildirim limitine 5 vakit×7 gün + hatırlatmalarla uyumlu pencere yönetimi).
- Ezan sesi: bildirim sesi olarak kısa ezan; tam ezan için bildirime dokununca app içi çalma. (iOS 30 sn bildirim sesi limiti dürüstçe tasarıma dahil edilir — rakip bunu kullanıcıya açıklamadığı için "ses gelmiyor" şikayeti alıyor.)
- Expo Push Service yalnızca **kampanya/kandil duyuruları** gibi gerçek uzak bildirimler için (FCM/APNs'i soyutlar; Firebase SDK'sına ihtiyaç bırakmaz).

### 4.5 AI Mimarisi

**Akış (soru-cevap):**
```
App ──(soru + oturum JWT)──▶ Edge Function /ai-chat
  1. Kota kontrolü (ücretsiz: toplam 10 soruluk tanıtım hakkı · premium: adil kullanım limiti) — Postgres'te sayaç
  2. Girdi sınıflandırma (hafif kural + gerekirse Haiku): selam/vakit sorusu ise LLM'siz yanıt
  3. pgvector similarity search → en alakalı 4-6 kaynak parçası (Diyanet İlmihali, Kur'an Yolu…)
  4. Claude çağrısı (streaming SSE ile app'e aktarılır)
  5. Cevap + kaynak künyeleri + günlük loglama (kalite denetimi için)
```

**Model seçimi ve maliyet** (güncel fiyatlar, MTok = milyon token):

| Görev | Model | Fiyat (girdi/çıktı) | Not |
|---|---|---|---|
| Rehber Q&A (KF-1) | `claude-opus-4-8` | $5 / $25 | Varsayılan öneri: dini içerikte cevap kalitesi ve nüans pazarlık konusu değil. Adaptive thinking açık. |
| Günlük kartlar (KF-2), haftalık içgörü (KF-4), sınıflandırma | `claude-haiku-4-5` | $1 / $5 | Batch API ile gece işlenir → **%50 ek indirim** |
| Orta yol alternatifi | `claude-sonnet-5` | $3 / $15 (31.08.2026'ya dek $2/$10) | Q&A maliyeti Opus'u zorlarsa senin kararınla geçilebilir |

Örnek birim maliyet (Q&A, ~3K girdi [sistem+RAG] / ~600 çıktı): Opus 4.8 ≈ **$0.03/soru**; sistem promptu + RAG şablonu prompt caching ile (%90 girdi indirimi, cache-read $0.5/MTok) tekrar eden kısımda ≈ $0.02'ye düşer. Premium abone ayda 60 soru sorsa AI maliyeti ≈ $1.2 → ₺ bazlı abonelik fiyatında rahat marj.

**Edge Function çekirdeği (Deno + Anthropic TS SDK):**
```ts
import Anthropic from "npm:@anthropic-ai/sdk";
const client = new Anthropic(); // ANTHROPIC_API_KEY: Supabase secret

const stream = client.messages.stream({
  model: "claude-opus-4-8",
  max_tokens: 2048,
  thinking: { type: "adaptive" },
  system: [
    { type: "text", text: REHBER_SYSTEM_PROMPT,            // sabit: kırmızı çizgiler, üslup, kaynak formatı
      cache_control: { type: "ephemeral" } },               // prompt caching breakpoint
  ],
  messages: [
    { role: "user", content: `<kaynaklar>${ragChunks}</kaynaklar>\n\nSoru: ${question}` },
  ],
});
// SSE olarak istemciye aktar; final mesajda kaynak künyeleri ayrıştırılır
```
Kişiselleştirme çıktıları (KF-2/KF-4) için `output_config: { format: { type: "json_schema", schema } }` ile **structured outputs** — kartlar her zaman geçerli JSON döner.

**Güvenlik ve uygunluk:**
- API anahtarı asla uygulamada değil; yalnızca Edge Function secret'ı.
- RLS: kullanıcı yalnızca kendi satırlarını okur/yazar.
- AI logları kişisel veriden arındırılır (KVKK); soru metinleri kalite denetimi için 30 gün, anonim.
- Sistem promptunda teolojik güvenlik: mezhep tarafsızlığı, fetva yasağı, kriz durumlarında (ör. kullanıcı sıkıntı ifade ederse) şefkatli yönlendirme.

### 4.6 Teknoloji Listesi (kesinleşen)

| Katman | Seçim |
|---|---|
| Çatı | Expo SDK 54+ (CNG/prebuild — Widget/Watch/LiveActivity için dev client + EAS Build) |
| Dil / Router | TypeScript strict · expo-router v6 |
| UI | **NativeWind v4** + tasarım token'ları · Reanimated · `expo-image` · FlashList · Lottie (react-native-paper kaldırılır) |
| State | Zustand + `react-native-mmkv` (persist) · TanStack Query |
| Yerel DB | `expo-sqlite` + Drizzle ORM (content.db / user.db) |
| Ses | `expo-audio` (`expo-av` deprecated → kaldırılır) |
| Vakit motoru | `adhan` |
| Backend | Supabase (Auth, Postgres+RLS, pgvector, Storage, Edge Functions, cron) |
| AI | Claude API — Opus 4.8 / Haiku 4.5 (+ Batch API) |
| Ödeme | RevenueCat (`react-native-purchases` mevcut) |
| Gözlem | Sentry (crash) + PostHog (ürün analitiği; `analyticsService` buraya bağlanır) |
| Build/CI | EAS Build + EAS Update (OTA) + GitHub Actions |

---

## 5. ADIM 5 — Adım Adım Geliştirme Planı

### 5.1 Hedef Klasör Yapısı

```
duahub/
├── app/                          # expo-router — SADECE route dosyaları (ince katman)
│   ├── (tabs)/
│   │   ├── index.tsx             # Bugün (kişisel akış + sonraki vakit)
│   │   ├── quran.tsx             # Kur'an
│   │   ├── dua.tsx               # Dua & Zikir
│   │   ├── rehber.tsx            # AI Asistan
│   │   └── more.tsx              # Araçlar & Profil
│   ├── (modals)/                 # kıble, ayarlar, premium, ses paketi indirme…
│   └── _layout.tsx
├── src/
│   ├── features/                 # dikey dilimler: ekran + hook + servis bir arada
│   │   ├── prayer-times/         #   engine (adhan sarmalayıcı), hooks, bileşenler
│   │   ├── notifications/        #   zamanlama motoru (7 günlük pencere)
│   │   ├── quran/                #   okuyucu, ses, hatim, ezber
│   │   ├── dua/  ├── dhikr/  ├── qibla/  ├── calendar/
│   │   ├── ai-assistant/         #   chat UI, streaming istemci, kota
│   │   ├── journal/              #   ibadet günlüğü + streak motoru
│   │   ├── ramadan/  ├── premium/  └── ...
│   ├── core/
│   │   ├── db/                   # drizzle şemaları, migration, content.db erişimi
│   │   ├── sync/                 # sync_queue, push/pull, delta birleştirme
│   │   ├── api/                  # supabase client, edge function istemcileri
│   │   ├── theme/                # renk/tipografi token'ları (NativeWind config ile tek kaynak)
│   │   └── i18n/                 # TR varsayılan; EN/AR Phase 4
│   ├── components/ui/            # Button, Card, Sheet… (tasarım sistemi)
│   └── stores/                   # zustand store'ları
├── assets/db/quran.db            # gemide gelen içerik veritabanı
├── supabase/
│   ├── migrations/               # SQL (RLS politikaları dahil)
│   └── functions/ai-chat/ · daily-cards/ · weekly-insight/
├── targets/                      # widget (iOS/Android), watch, live-activity (Phase 3)
└── scripts/build-content-db.ts   # Kur'an/meal/dua kaynaklarından content.db üretimi
```

### 5.2 Fazlar

> Mevcut kod stratejisi: `QiblaCompass`, `CounterButton`, `AudioPlayer`, dua veri modeli ve `prayerTimesService` **taşınarak yaşatılır**; `firebase*`, `expo-ads-admob`, `react-native-google-mobile-ads`, `react-native-paper`, `expo-av` **kaldırılır**.

**Phase 0 — Temel ve Temizlik (≈1 hafta)**
1. Bağımlılık temizliği + NativeWind v4 kurulumu + tasarım token'ları (renk/tipografi/spacing)
2. Klasör yapısına geçiş; `components/ui` çekirdek seti (Button, Card, Text, Sheet)
3. expo-sqlite + Drizzle iskeleti; `scripts/build-content-db.ts` ilk sürüm (dualar mevcut JSON'dan)
4. EAS Build + dev client + Sentry/PostHog kablolaması, CI (lint + typecheck)
✔ *Bitti kriteri:* Boş ama tema/navigasyon/DB iskeleti çalışan uygulama, cihazda dev build.

**Phase 1 — MVP: "Vakitler mükemmel olsun" (≈4-6 hafta) → TestFlight/Kapalı beta**
1. `prayer-engine` (adhan + Diyanet parametreleri + konum) — birim testli
2. Bugün ekranı: sonraki vakit sayacı, günlük vakit listesi, Hicri tarih
3. Bildirim motoru: 7 günlük yerel zamanlama + arka plan yenileme + vakit başına ayar
4. Kıble (mevcut bileşen cilalanır) · Zikirmatik (hedefli setler + haptic)
5. Dua kütüphanesi taşıma (arama/favori/kategori — mevcut modülden)
6. Dark mode (varsayılan) + onboarding (konum izni, bildirim izni, metod seçimi)
7. Ana ekran widget'ı v1 (iOS WidgetKit: sonraki vakit)
✔ *Bitti kriteri:* Uçak modunda dahi tüm çekirdek çalışıyor; bildirimler 7 gün boyunca isabetli.

**Phase 2 — İçerik + Hesap + Gelir (≈5-6 hafta) → Store lansmanı**
1. Kur'an modülü: sayfa görünümü, meal katmanı, sure/cüz navigasyonu (content.db)
2. Sesli Kur'an: hafız paketleri (Storage/CDN), arka plan oynatma, ayet takibi
3. Hatim takibi + streak (KF-3 çekirdeği, tamamen local)
4. Takvim: dini günler, kandil bildirimleri; İmsakiye temel görünümü
5. Supabase Auth (Apple/Google/anon) + senkron katmanı (user.db ↔ Postgres)
6. Premium: RevenueCat paywall (nazik, değer-önce) — ücretsiz katman cömert kalır
✔ *Bitti kriteri:* Store'da v1.0; parity tablosundaki tüm satırlar kapalı (Watch/LiveActivity hariç).

**Phase 3 — AI + Farklılaşma (≈6 hafta)**
1. RAG korpusu hazırlığı (kaynak temizleme, parçalama, pgvector indeksleme)
2. `/ai-chat` Edge Function + Rehber sohbet UI (streaming, kaynak kartları, kota)
3. Günlük kişisel kartlar (Batch + structured outputs) → Bugün ekranı kişiselleşir
4. İbadet Günlüğü + haftalık AI içgörü
5. Live Activities / Dynamic Island (iftar + vakit sayacı) — Ramazan 2027'den önce yetişmeli
6. Duygu-bazlı dua önerisi v1 (local eşleme)
✔ *Bitti kriteri:* AI özellikleri kota/maliyet panelleriyle canlıda; Ramazan moduna hazır.

**Phase 4 — Ekosistem ve Büyüme (sürekli)**
Apple Watch companion · Android widget paritesi (Glance) · Ezber modu (konuşma tanıma) · Sosyal hatim · Cami bulucu + cuma saatleri · i18n (EN/AR/DE/FR) · ASO ve paylaşılabilir kart görselleri.

### 5.3 Vibe Coding Çalışma Düzeni (pratik kurallar)

1. **Dikey dilim halinde ilerle:** Bir özelliği ekran+state+DB+test olarak uçtan uca bitir, sonra diğerine geç. (Sıra: prayer-engine → bildirim → Bugün ekranı → …)
2. Her dilimde önce **domain katmanını saf TypeScript** olarak yaz (UI'sız test edilebilir: `prayer-engine`, `streak-engine`), UI'yı üstüne giydir.
3. `content.db` üretim script'i tek doğruluk kaynağı — içerik asla elle koda gömülmez.
4. Cihaz gerçekliği: bildirim/konum/arka plan davranışları yalnızca **gerçek cihazda dev build** ile doğrulanır (simülatör yalan söyler).
5. Kilometre taşı = fazın "bitti kriteri"; kriter karşılanmadan sonraki faza özellik sızdırılmaz.

---

## 6. Monetizasyon

**Altın kural: Bize işletme maliyeti üreten her özellik premium'dur.** Ücretsiz katman yalnızca *marjinal maliyeti sıfır* olan (cihazda çalışan, sunucuya dokunmayan) özelliklerden oluşur. Böylece ücretsiz kullanıcı tabanı ne kadar büyürse büyüsün fatura üretmez; her aktif maliyet kalemi bir abonelik gelirine bağlıdır.

| Katman | İçerik | Bize maliyeti |
|---|---|---|
| **Ücretsiz** (cihazda çalışır, maliyet ≈ 0) | Vakitler + bildirimler, kıble, zikirmatik, Kur'an metni + 1 meal, dua kütüphanesi, temel streak/hatim takibi, temel widget, **1 varsayılan hafız ses paketi** (uygulamayla gemide, CDN'siz). **Reklam yok.** | ~0 (statik içerik + cihaz hesaplaması) |
| **DuaHub Plus** (aylık/yıllık, RevenueCat) | **Rehber AI** (soru-cevap) · kişisel günlük akış (Batch) · haftalık AI içgörü · tüm hafız ses paketleri (CDN indirme) · bulut senkron/yedekleme (çoklu cihaz) · Live Activities + Watch · gelişmiş widget'lar · tema paketleri · aile hatim grupları | AI token + CDN egress + DB — hepsi abonelik marjıyla karşılanır |
| **AI tanıtım hakkı** | Yeni kullanıcıya **toplam 10 Rehber sorusu** (günlük değil, tek seferlik; hesapla giriş şartı — kötüye kullanım/çoklu cihaz istismarını engeller). Hak bitince nazik paywall. | Sınırlı, kullanıcı başına ~$0.30 tavanlı CAC gideri |
| İlke | Paywall ibadet çekirdeğini asla kilitlemez ("namaza para" algısı ölümcül) — ama çekirdek zaten bize maliyet üretmez. Premium = AI + bulut + konfor. | |

**Maliyet koruma kalkanları:** kullanıcı başına günlük AI token bütçesi (premium'da bile adil kullanım limiti), Edge Function'da org-günlük harcama alarmı, Batch işleri yalnızca *aktif* premium kullanıcılar için üretilir (30 gün açılmayan hesaba kart üretilmez), ses paketleri bir kez indirilir ve cihazda kalır (tekrar egress yok).

---

## 7. Riskler ve Önlemler

| Risk | Önlem |
|---|---|
| AI'nin dini konuda hatalı/duyarsız cevabı | RAG-zorunlu cevap, kaynak gösterimi, fetva yasağı, kırmızı çizgi sistem promptu, cevap loglarının insan denetimi, "bildir" düğmesi |
| Vakit hesaplama farkları (Diyanet vs astronomik) | Diyanet parametre seti varsayılan + Türkiye'de resmî tablo doğrulama modu + metod seçimi şeffaflığı |
| iOS bildirim kısıtları (64 bildirim, 30 sn ses) | 7 günlük pencere yönetimi + dürüst UX metinleri |
| AI maliyet patlaması | Kota + günlük bütçe alarmı + prompt caching + Batch API + gerekirse Sonnet 5'e geçiş kararı (founder onaylı) |
| Expo native gereksinimleri (Watch/LiveActivity) | CNG + config plugin yaklaşımı; Phase 3'e kadar çekirdek Expo yüzeyinde kalır |
| Tek geliştirici kapasitesi | Fazlı plan, dikey dilim disiplini, Phase 1'in dar tutulması |

---

## 8. Başarı Metrikleri (Kuzey Yıldızı: haftalık aktif ibadet etkileşimi)

- D1/D7/D30 retention (hedef: D30 > %25 — kategori ortalamasının üstü)
- Bildirim isabet oranı (kurulan/teslim edilen) > %99
- Streak'li kullanıcı oranı, hatim başlatma→bitirme dönüşümü
- AI memnuniyeti (cevap başına 👍/👎), kaynaklı cevap oranı > %95
- Ücretsiz→Plus dönüşümü (hedef %3-5), reklamsızlığa atıf yapan yorum sayısı

---

## Kaynaklar (rakip analizi)

- [Ezan Vakti Pro — Şikayetvar genel sayfa](https://www.sikayetvar.com/ezan-vakti-pro)
- [Temaya aykırı ve rahatsız edici reklamlar şikayeti](https://www.sikayetvar.com/ezan-vakti-pro/ezan-vakti-proda-temaya-aykiri-ve-rahatsiz-edici-reklamlar-deneyimi-olumsuz-etkiliyor)
- [Casino reklamı şikayeti](https://www.sikayetvar.com/ezan-vakti-pro/ezan-vakti-proda-casino-reklami-gorulmesi-ve-kaldirilmasi-talebi)
- [Uygunsuz reklam şikayetleri](https://www.sikayetvar.com/ezan-vakti-pro/dini-uygulamada-uygunsuz-ve-sakincali-reklamlardan-rahatsizim) · [cinsel içerikli reklam](https://www.sikayetvar.com/ezan-vakti-pro/dini-icerikte-cinsel-reklamlar-saygisizlik-olusturuyor)
- [Ezan Vakti Namaz Vakitleri Pro — App Store](https://apps.apple.com/us/app/ezan-vakti-namaz-vakitleri-pro/id1372054007) · [Azan Time Pro — App Store](https://apps.apple.com/us/app/ezan-vakti-pro/id437447439)
- [Ezan Vakti Pro Plus — AppFollow puan/yorum analizi](https://appfollow.io/ios/ezan-vakti-pro-plus/442401423)
- [Ezan Vakti Pro Plus — AppBrain](https://www.appbrain.com/app/ezan-vakti-pro-plus/com.mobilexsoft.ezanvaktiproplus)
- [Resmî SSS (bildirim sorunları)](https://ezanvaktinamazvakitleri.com/ezan-vakti-namaz-vakitleri-sikca-sorulan-sorular/) · [ekşi sözlük başlığı](https://eksisozluk.com/ezan-vakti-pro--4330133)
