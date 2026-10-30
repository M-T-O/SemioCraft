# SemioCraft — Sosyal Bilimler Akademik Çalışma & YZ Jüri İstasyonu

SemioCraft, İletişim Fakültesi ve Sosyal Bilimler Enstitüsü lisansüstü öğrencileri için kuramsal not tutma, jüri/sınav hazırlığı, hızlı okuma ve Gemini destekli **Sokratik Tez Jürisi & Sözlü Sınav Simülasyonunu** tek bir entegre platformda buluşturan modern bir akademik çalışma istasyonudur.

---

## Kullanıcı Onayı ve Kritik Kararlar

> [!IMPORTANT]
> Kullanıcı ile yapılan 1. aşama soru-cevap netleştirmesi doğrultusunda şu mimari ve tasarım kararları kesinleştirilmiştir:
> - **Öncelikli YZ Özelliği**: Gemini 3.8 Flash modeliyle güçlendirilmiş **Sokratik Tez Jürisi ve Sözlü Sınav Simülatörü**. Seçilen ders notları, sınav konuları veya tez hipotezi üzerinden öğrenciye zorlayıcı kuramsal sorular yöneltir, yanıtlarını metodolojik ve kuramsal olarak puanlayıp yapıcı geri bildirim sağlar.
> - **Görsel Stil ve Tema**: Kullanıcının dilediğinde tek tıkla geçiş yapabileceği **Dinamik Çift Tema (Modern Dark Workstation / Minimal Editoryal Akademik Açık Tema)**.
> - **Veri Saklama & Gizlilik**: Akademik notların ve çalışma planlarının gizliliği için tüm veriler **LocalStorage** üzerinde istemci tarafında tutulacak; tam veri taşınabilirliği için **JSON Dışa/İçe Aktarım (Export/Import)** korunacak ve geliştirilecektir.
> - **Güvenli YZ Mimarisi**: Gemini API çağrıları `@google/genai` TypeScript SDK ile sunucu tarafında (`server.ts` Express katmanı) güvenle yürütülecektir.

---

## 1. Genel Bakış ve Temel Konsept

- **Ne Yapar?**:
  1. **Sınav & Jüri Programları**: Geri sayım sayacı, dinamik ilerleme çubuğu ve görev bazlı to-do listeleriyle vize, final ve tez jüri teslimlerini organize eder.
  2. **Dersler ve Akordiyon Notlar**: Ders bazında tarih ve konu başlığına göre katlanabilir, filtrelenebilir ve tek tıkla kopyalanabilir ders notları arşivi.
  3. **Teori ve Alıntılar Kasası**: Kuramcı (Barthes, Benjamin, Foucault, Hall, Baudrillard, Berger vb.), eser, alıntı, çözümleme ve etiketlerle künyeli alıntı deposu.
  4. **Okuma & Feynman Odaklayıcı**: Ayarlanabilir WPM hızına sahip RSVP akış okuyucusu ve 25 dakikalık odak seansı sonunda kavramı basitleştirerek kasaya aktaran Feynman modülü.
  5. **✦ Sokratik Tez Jürisi & Sözlü Sınav Simülatörü (YENİ)**: Kullanıcının kayıtlı notlarını veya özel tez metnini analiz ederek profesör/jüri kimliğiyle soru soran, öğrencinin cevabını eleştirel sosyal bilimler kuramları çerçevesinde inceleyip karşı argümanlar sunan interaktif yapay zeka jürisi.

- **Hedef Kitle**: İletişim, Medya, Sosyoloji, Görsel İletişim Tasarımı ve Kültürel Çalışmalar yüksek lisans/doktora öğrencileri ve akademisyen adayları.
- **Sağlanan Temel Değer**: Ağır akademik kuramları sadece ezberlemek yerine, gerçekçi bir jüri simülasyonu ve Feynman tekniği ile içselleştirmeyi sağlayan etkileşimli bir çalışma döngüsü.

---

## 2. Kullanıcı Deneyimi ve Görsel Tasarım

### Ana Kullanıcı Akışları
1. **Çalışma ve Not Alma**: Öğrenci dersini seçer, haftalık kuramsal notlarını girer veya Teori Kasası'ndan alıntıları tarar.
2. **Sokratik Jüriye Çıkış**: 
   - Öğrenci "Sokratik Jüri" sekmesine geçer.
   - Sınav/Ders notlarından birini seçer veya tez hipotezini girer.
   - Jüri profilini seçer (örn: *Eleştirel Frankfurt Okulu Savunucusu*, *Pozitivist Metodolog*, *Kültürel Çalışmalar & Stuart Hall Ekolü*, veya *Dengeli Tez Jürisi*).
   - Gemini jüri üyesi ilk çapraz soruyu sorar. Öğrenci metin veya sesli girdi mantığında cevabını yazar.
   - Jüri argümandaki epistemolojik boşlukları gösterir, puanlar ve yeni bir derinleştirme sorusu yöneltir. İstenirse seans özeti doğrudan Teori Kasasına kaydedilebilir.
3. **Odaklı Okuma & Sınav Takibi**: RSVP ile dakikada 350-450 kelime makale tarama; 25 dakikalık seans bitiminde Feynman kutusuyla özet çıkarma.

### Görsel Kimlik ve Tema Yapısı (Çift Tema)
- **Koyu Tema (Dark Workstation)**:
  - Arka plan: Derin gece tonları (`#090b12` / `#0f121d`)
  - Kart yüzeyleri: `#151926` ve 1px hafif bordürler (`#262e45`)
  - Vurgular: Akıllı mor/indigo (`#8b5cf6`), elektrik camgöbeği (`#06b6d4`)
- **Açık Tema (Editorial Academic Paper)**:
  - Arka plan: Göz yormayan sıcak kütüphane kağıdı (`#f8faf9` / `#f1f4f2`)
  - Kart yüzeyleri: Saf temiz beyaz (`#ffffff`) ve zarif nötr bordürler (`#e2e8f0`)
  - Vurgular: Mürekkep laciverti (`#1e293b`), antik mühür tonu (`#6366f1`) ve koyu zümrüt
- **Tipografi**:
  - Gövde & Arayüz: Net, okunaklı modern sans (`Inter`, sistem fontları)
  - Kuramsal Alıntılar & Başlıklar: Akademik editoryal ağırlık (`Playfair Display` / zarif serif fallback)
  - Kod, Tarih & Sayaçlar: Monospace (`ui-monospace`, `Consolas`)
- **Anti-Slop Disiplini**:
  - Gereksiz yapay hap (pill) yığınları yok; etiketler ve tarihler editoryal ayraçlarla (`·`) sunulacak.
  - Sahte gösterge skorları yerine gerçek kuramsal geri bildirim kriterleri (Kuramsal Yetkinlik, Argümantasyon Tutarlılığı, Kavramsal Netlik).

---

## 3. Temel Ürün Kararları ve Mimari Tercihler

- **Karar 1: Tam Teşekküllü React + Vite + Express (Full-Stack Mimari)**
  - *Seçilen Yaklaşım*: Frontend React SPA (`App.tsx` ve modüler bileşenler) olarak yapılandırılacak; sunucu tarafında `server.ts` Express API proxy'si ile `@google/genai` çalıştırılacaktır.
  - *Neden*: Gemini API anahtarının tarayıcıya asla sızmaması ve güvenlik yönergelerine tam uyum için server-side AI yürütümü şarttır.
- **Karar 2: Model Seçimi (`gemini-3.8-flash`)**
  - *Seçilen Yaklaşım*: Sokratik jüri soruları ve argüman değerlendirmesi için düşük gecikmeli, güçlü akıl yürütme kabiliyetine sahip `gemini-3.8-flash` modeli kullanılacaktır.
  - *Neden*: Öğrencinin yanıtlarına anında akademik derinlikte karşılık verebilmesi ve JSON tabanlı yapılandırılmış değerlendirme sağlayabilmesi için ideal hız/kalite dengesine sahiptir.
- **Karar 3: Dayanıklı Yerel Veri (LocalStorage + JSON Sync)**
  - *Seçilen Yaklaşım*: Tüm ders notları, sınav hedefleri, teori kartları ve jüri simülasyon geçmişi kullanıcının tarayıcısında saklanır. Tek tıkla `.json` yedeği indirilebilir veya yüklenebilir.

---

## 4. Teknik Mimari ve Veri Stratejisi

### Sistem Bileşen Hiyerarşisi

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SemioCraft İstemci                            │
│                                                                         │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐  │
│  │ Üst Çubuk (Header)    │  │ Çift Tema Toggle (Açık / Koyu)         │  │
│  │ Yedek Al / Geri Yükle │  │ Sekme Gezgini (Tabs Navigation)        │  │
│  └───────────────────────┘  └────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────┐  │
│  │ 1. Sınav & Jüri │ 2. Dersler &    │ 3. Teori &      │ 4. RSVP &   │  │
│  │    Takvimi      │    Not Akordiyon│    Alıntı Kasası│    Feynman  │  │
│  └─────────────────┴─────────────────┴─────────────────┴─────────────┘  │
│                                      │                                  │
│  ┌───────────────────────────────────▼───────────────────────────────┐  │
│  │ 5. ✦ Sokratik Tez Jürisi & Sözlü Sınav Simülatörü                 │  │
│  │    - Jüri Ekolü Seçimi (Frankfurt Okulu, Göstergebilim, Metodoloji│  │
│  │    - Not veya Hipotez Entegrasyonu                                │  │
│  │    - Karşılıklı Soru-Cevap Oturumu                                │  │
│  │    - Kuramsal Puanlama & Argüman Güçlendirme Analizi              │  │
│  └───────────────────────────────────┬───────────────────────────────┘  │
│                                      │ (HTTP POST /api/jury-simulate)   │
└──────────────────────────────────────┼──────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               Node.js + Express Sunucu Katmanı (server.ts)              │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ @google/genai SDK (gemini-3.8-flash)                              │  │
│  │ - System Instructions: "Akademik Sosyal Bilimler Jüri Heyeti"    │  │
│  │ - responseSchema: Sokratik soru, eleştiri, güçlü/zayıf noktalar   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Veri Modelleri & Durum Yönetimi
- **Exam**: `{ id, title, code, date, todos: [{ id, text, completed }] }`
- **Course**: `{ id, code, name, entries: [{ id, title, date, content }] }`
- **Theory**: `{ id, title, theorist, source, quote, analysis, tags: [] }`
- **JurySession**: `{ id, title, school, messages: [{ role: 'jury'|'student', text, feedback?: { score, critique, suggestions } }] }`
- **Theme**: `'dark' | 'light'` (tarayıcı kök sınıfına `dark` class eklenerek Tailwind dark: modülleriyle senkronize).

---

## 5. Doğrulama ve Kabul Kriterleri

1. **Çift Tema Desteği**: Koyu ve Açık tema arasında geçiş anında gerçekleşmeli, kontrast standartları (WCAG AA) korunmalı ve tercih hatırlanmalıdır.
2. **Sokratik Jüri Simülatörü**:
   - Seçilen kuramcı ekolüne göre özgün, akademik ve kışkırtıcı sorular sorabilmelidir.
   - Öğrencinin yanıtını değerlendirirken yapıcı eleştiri, kuramsal referans eksiklikleri ve karşı tez önerileri sunmalıdır.
3. **Mevcut Tüm Özelliklerin Korunması**:
   - Sınav geri sayımı ve görev işaretleme eksiksiz çalışmalı.
   - Ders notları arama, akordiyon açma-kapama ve kopyalama hatasız olmalı.
   - Teori ve Alıntı Kasası arama, etiketleme ve APA/künye formatında kopyalama çalışmalı.
   - RSVP hızlı okuyucu (WPM hız ayarlı) ve Feynman 25 dk sayacı sorunsuz işlemeli.
4. **Veri Güvenliği & Taşınabilirlik**:
   - Sayfa yenilendiğinde hiçbir veri kaybolmamalı.
   - JSON dışa aktarma ve içe aktarma hatasız çalışmalıdır.
   - Sunucu derlemesi (`compile_applet`) hatasız tamamlanmalıdır.
