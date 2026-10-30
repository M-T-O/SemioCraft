import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Robust Gemini call with automatic retry and model fallback for 503 high demand
async function generateWithRetry(params: any, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      const errMsg = err?.message || '';
      const is503 =
        err?.status === 503 ||
        errMsg.includes('503') ||
        errMsg.includes('high demand') ||
        errMsg.includes('UNAVAILABLE');

      if (is503 && attempt < maxRetries) {
        console.warn(`[Gemini API] 503 yüksek talep uyarısı alındı. Deneme ${attempt + 1}/${maxRetries} (1.5 sn bekleniyor)...`);
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        continue;
      }

      // If primary model gemini-3.8-flash has persistent 503 spikes, fallback to gemini-flash-latest
      if (is503 && params.model === 'gemini-3.8-flash') {
        console.warn('[Gemini API] gemini-3.8-flash yoğunluk nedeniyle gemini-flash-latest modeline geçiş yapılıyor...');
        return await ai.models.generateContent({
          ...params,
          model: 'gemini-flash-latest',
        });
      }

      throw err;
    }
  }
}

// Jury School Personas
const SCHOOL_PROMPTS: Record<string, string> = {
  frankfurt: `Sen Frankfurt Okulu ve Eleştirel Teori (Adorno, Horkheimer, Benjamin, Habermas) konusunda uzmanlaşmış, son derece titiz ve sorgulayıcı bir Sosyal Bilimler Tez Jürisi Üyesisin.
Öğrencinin açıklamalarında kültür endüstrisi, yabancılaşma, şeyleşme, auranın yitimi ve araçsal akıl kavramlarının derinliğini sorgula. Ezber tanımları asla kabul etme, güncel medya/dijital kültür pratikleriyle ontolojik bağı kanıtlamasını iste.`,

  semiotics: `Sen Fransız ve Anglo-Sakson Göstergebilim Ekolü (Roland Barthes, Ferdinand de Saussure, Umberto Eco, C.S. Peirce) uzmanı bir İletişim Fakültesi Jüri Başkanısın.
Öğrencinin analizlerinde düzanlam (denotation), yananlam (connotation), mit oluşturma pratikleri, gösteren-gösterilen ilişkisi ve ideolojik doğallaştırma süreçlerini ne kadar kavradığını test et. Yüzeysel betimlemeler yerine yapısalcı ve post-yapısalcı çözümlemeyi zorunlu tut.`,

  cultural_studies: `Sen Kültürel Çalışmalar ve Medya Sosyolojisi (Stuart Hall, Raymond Williams, Dick Hebdige, Antonio Gramsci) uzmanı bir Jüri Üyesisin.
Hegemonya, kodlama/kodaçımlama (egemen, müzakereci, muhalif okuma), altkültürler ve temsil politikaları ekseninde öğrenciyi zorla. Metin ile alımlayıcı (izleyici/okur) arasındaki aktif müzakereyi açıklamayan argümanları eleştir.`,

  methodology: `Sen Sosyal Bilimlerde Nitel ve Eleştirel Araştırma Yöntemleri konusunda tavizsiz bir Metodoloji Profesörüsün.
Kavramsal çerçevenin tutarlılığı, epistemolojik konumlanış, etik sınırlılıklar ve örneklem seçimi konusundaki boşlukları acımasızca ama yapıcı bir dille yüzeye çıkar.`,

  general_defense: `Sen İletişim Fakültesi ve Sosyal Bilimler Enstitüsü Lisansüstü Tez Savunma Jürisi Başkanısın.
Adayın hem kuramsal yetkinliğini (teorik temeller), hem kavramsal netliğini, hem de argümantasyon gücünü dengeli ve çok boyutlu bir Sokratik diyalogla sına.`,
};

// 1. Sokratik Jüri Başlatma Endpoint'i
app.post('/api/jury/start', async (req, res) => {
  try {
    const { school = 'general_defense', topic = 'Genel Sosyal Bilimler', context = '', level = 'master' } = req.body;
    const persona = SCHOOL_PROMPTS[school] || SCHOOL_PROMPTS.general_defense;

    const prompt = `Aşağıdaki konu ve arka plan notları doğrultusunda ${level === 'phd' ? 'Doktora' : 'Yüksek Lisans'} öğrencisinin tez savunması veya sözlü sınav oturumunu başlat:
KONU/HİPOTEZ: ${topic}
ÖĞRENCİNİN DERS/TEORİ NOTLARI: ${context || 'Not belirtilmedi, genel konu üzerine odaklan.'}

GÖREVİN:
1. Kısa, saygın ve akademik ağırlığı olan bir jüri açılış konuşması yap (en fazla 2-3 cümle).
2. Öğrencinin teorik zeminini doğrudan test edecek kışkırtıcı ve derinlikli ilk Sokratik soruyu yönelt.
3. Bu tartışmada ele alınacak 3-4 kilit kavramı (thematic tags) listele.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `${persona}\nHer zaman Türkçe, saygın, akademik ve yapıcı eleştirel bir üslup kullan.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            openingStatement: { type: Type.STRING, description: 'Jüri heyetinin kısa resmi açılış hitabı' },
            firstQuestion: { type: Type.STRING, description: 'İlk Sokratik jüri sorusu' },
            keyThemes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Oturumun odaklanacağı 3-4 kilit kuramsal kavram',
            },
          },
          required: ['openingStatement', 'firstQuestion', 'keyThemes'],
        },
      },
    });

    const parsed = JSON.parse(response?.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Jury start error:', error);
    const is503 = error?.message?.includes('503') || error?.message?.includes('high demand');
    return res.status(500).json({
      error: is503
        ? 'Google AI sunucularında anlık yoğunluk yaşanıyor (503). Lütfen birkaç saniye sonra tekrar deneyin.'
        : error.message || 'Jüri oturumu başlatılamadı.',
    });
  }
});

// 2. Sokratik Jüri Yanıt & Değerlendirme Endpoint'i
app.post('/api/jury/respond', async (req, res) => {
  try {
    const {
      school = 'general_defense',
      topic = '',
      question = '',
      studentAnswer = '',
      history = [],
      isFinalRound = false,
    } = req.body;

    const persona = SCHOOL_PROMPTS[school] || SCHOOL_PROMPTS.general_defense;

    const historyPrompt = (history || [])
      .map((h: any) => `${h.role === 'jury' ? 'JÜRİ' : 'ÖĞRENCİ'}: ${h.text}`)
      .join('\n');

    const prompt = `SAVUNMA KONUSU: ${topic}
ÖNCEKİ DİYALOGLAR:
${historyPrompt}

JÜRİNİN EN SON SORDUĞU SORU:
${question}

ÖĞRENCİNİN CEVABI:
${studentAnswer}

${isFinalRound ? 'Bu oturumun son değerlendirmesidir. Kapsamlı nihai jüri kararını ve yapıcı akademik tavsiyeleri sun.' : 'Öğrencinin cevabını titizlikle analiz et, argümandaki sağlam noktaları ve kuramsal eksiklikleri belirt. Ardından diyaloğu derinleştiren bir sonraki Sokratik soruyu yönelt.'}

GÖREVLER:
- score: Öğrencinin bu yanıtına 100 üzerinden akademik not ver (40-60 yüzeysel, 65-80 sağlam, 85+ mükemmel kuramsal kavrayış).
- critique: Yanıta dair 2-3 cümlelik yapıcı, felsefi ve yöntemsel jüri eleştirisi.
- theoreticalGaps: Öğrencinin argümanında anmadığı veya bağ kurması gereken 2-3 kuramcı/kavram (örn: ["Bourdieu - Kültürel Sermaye", "Foucault - Biyoiktidar"]).
- followUpQuestion: Bir sonraki soru (${isFinalRound ? '"Oturum başarıyla tamamlandı. Jüri nihai değerlendirmesini sundu."' : 'kavramı daha da çatallaştıran derin soru'}).
- feynmanKeyInsight: Öğrencinin bu tartışmadan Teori Kasasına kaydedebileceği, tek cümlelik çok yalın bir ana fikir.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `${persona}\nSosyal bilimler standartlarında adil, yüksek akademik beklentili ve öğretici ol. Türkçe yanıt ver.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: '100 üzerinden yanıt puanı' },
            critique: { type: Type.STRING, description: 'Jüri eleştirisi ve geri bildirimi' },
            theoreticalGaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Gözden kaçırılan veya derinleştirilmesi gereken kuramlar/kavramlar',
            },
            followUpQuestion: { type: Type.STRING, description: 'Bir sonraki Sokratik soru' },
            feynmanKeyInsight: { type: Type.STRING, description: 'Teori kasasına aktarılabilir tek cümlelik yalın özet' },
          },
          required: ['score', 'critique', 'theoreticalGaps', 'followUpQuestion', 'feynmanKeyInsight'],
        },
      },
    });

    const parsed = JSON.parse(response?.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Jury respond error:', error);
    const is503 = error?.message?.includes('503') || error?.message?.includes('high demand');
    return res.status(500).json({
      error: is503
        ? 'Google AI sunucularında anlık yoğunluk yaşanıyor (503). Lütfen birkaç saniye sonra tekrar deneyin.'
        : error.message || 'Jüri değerlendirmesi alınamadı.',
    });
  }
});

// 3. Teori ve Metin Çözümleme Asistanı (Gelişmiş Ekol ve Göstergebilimsel Mercek Seçenekleriyle)
const THEORY_SCHOOL_PROMPTS: Record<string, { label: string; instruction: string }> = {
  semiotics: {
    label: 'Roland Barthes & Fransız Göstergebilimi',
    instruction: `Sen Roland Barthes, Ferdinand de Saussure ve Umberto Eco ekolünden bir Göstergebilim (Semiyotik) uzmanısın.
Metni düzanlam (denotation - ilk ve dolaysız anlam), yananlam (connotation - kültürel/tarihsel kodlar), mit oluşturma (mythologies - doğallaştırma ideolojisi) ve gösteren/gösterilen ilişkileri üzerinden çözümle.`,
  },
  frankfurt: {
    label: 'Frankfurt Okulu & Eleştirel Teori',
    instruction: `Sen Frankfurt Okulu (Adorno, Horkheimer, Benjamin, Habermas) uzmanısın.
Metni kültür endüstrisi, meta fetişizmi, araçsal akıl, şeyleşme ve auranın yitimi kavramları üzerinden eleştir ve kitle kültürünün tahakküm mekanizmalarını açığa çıkar.`,
  },
  cultural_studies: {
    label: 'Stuart Hall & Kültürel Çalışmalar',
    instruction: `Sen Kültürel Çalışmalar ve Medya Sosyolojisi (Stuart Hall, Raymond Williams, Gramsci) uzmanısın.
Metni hegemonya, kodlama/kodaçımlama (egemen, müzakereci, muhalif okuma pozisyonları), temsil politikaları ve kimlik inşası üzerinden analiz et.`,
  },
  foucault: {
    label: 'Michel Foucault & Söylem Analizi',
    instruction: `Sen Michel Foucault ekolünde bir Söylem Analizi ve İktidar Kuramları uzmanısın.
Metni iktidar/bilgi (pouvoir-savoir), biyoiktidar, gözetim (panoptikon), öznelleştirme pratikleri ve kurumsal hakikat rejimleri ekseninde çözümle.`,
  },
  baudrillard: {
    label: 'Jean Baudrillard & Simülasyon Kuramı',
    instruction: `Sen Jean Baudrillard ve postmodern medya kuramları uzmanısın.
Metni simülasyon, simulakrlar, hipergerçeklik, gösterge değeri ve imajın gerçekliği yutması kuramları ekseninde çözümle.`,
  },
  feminist_queer: {
    label: 'Feminist & Kuir Medya Kuramları',
    instruction: `Sen feminist ve toplumsal cinsiyet kuramcısı (Laura Mulvey, Judith Butler, bell hooks) gözüyle metni inceliyorsun.
Eril bakış (male gaze), toplumsal cinsiyet performativitesi, heteronormatif temsil ve kesişimsellik (intersectionality) boyutlarını açığa çıkar.`,
  },
  general: {
    label: 'Çok Boyutlu Eleştirel Sosyal Bilimler Sentezi',
    instruction: `Sen disiplinlerarası bir sosyal bilimler ve iletişim kuramları analistisin.
Tüm eleştirel kuramları harmanlayarak metnin epistemolojik, ideolojik ve ontolojik kodlarını çok boyutlu değerlendir.`,
  },
};

app.post('/api/theory/analyze', async (req, res) => {
  try {
    const { text = '', school = 'semiotics', focusMode = 'deep_semiotics' } = req.body;
    if (!text.trim()) {
      return res.status(400).json({ error: 'Çözümlenecek metin boş olamaz.' });
    }

    const schoolConfig = THEORY_SCHOOL_PROMPTS[school] || THEORY_SCHOOL_PROMPTS.semiotics;

    const prompt = `Aşağıdaki metni "${schoolConfig.label}" kuramsal merceğinden ve "${focusMode}" odak açısıyla analiz et:
METİN:
"""
${text}
"""

GÖREVLER VE İSTENEN ANALİZ ALANLARI:
1. title: Bu çözümlemeyi özetleyen akademik, vurucu kavramsal başlık.
2. selectedSchoolLabel: Seçilen ekolün tam adı ("${schoolConfig.label}").
3. suggestedTheorists: Bu metinle doğrudan ilişkili 2-4 büyük kuramcı (örn: Roland Barthes, Stuart Hall, Theodor Adorno).
4. denotation: Düzanlam (Görünürdeki, nesnel, doğrudan ve ilk anlam katmanı).
5. connotation: Yananlam & Mitik Kodlar (Metnin alt metninde gizlenen ideolojik, kültürel ve simgesel kodlar).
6. powerRelations: İktidar ve Hegemonya (Metnin meşrulaştırdığı veya sorguladığı güç ilişkileri ve temsil biçimleri).
7. coreAnalysis: Seçilen kuramsal mercekten 2-3 paragraflık derinlemesine akademik çözümleme.
8. counterTheorists: Bu çözümlemeye itiraz edebilecek veya zıt açıdan bakacak 1-2 karşı kuramcı ve temel eleştirileri.
9. thesisApplicationTip: Öğrencinin bu kavramı tezinde, makalesinde veya sözlü sınavında nasıl kullanabileceğine dair 1-2 cümlelik pratik akademik tüyo.
10. suggestedTags: 3-5 etiket (#etiket formatında).
11. apaCitationHint: Eğer metin bir kaynaktan alıntı ise veya teze referans verilecekse APA 7 formatında künye/alıntı önerisi.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `${schoolConfig.instruction}\nSosyal bilimler standartlarında adil, kavramsal netliği yüksek ve yapıcı bir üslupla Türkçe yanıt ver.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            selectedSchoolLabel: { type: Type.STRING },
            suggestedTheorists: { type: Type.ARRAY, items: { type: Type.STRING } },
            denotation: { type: Type.STRING, description: 'Düzanlam katmanı' },
            connotation: { type: Type.STRING, description: 'Yananlam ve mitler' },
            powerRelations: { type: Type.STRING, description: 'İktidar ve temsil ilişkileri' },
            coreAnalysis: { type: Type.STRING, description: 'Detaylı kuramsal analiz' },
            counterTheorists: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Zıt ve karşı kuramcılar' },
            thesisApplicationTip: { type: Type.STRING, description: 'Tezde veya sınavda kullanım tüyosu' },
            suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            apaCitationHint: { type: Type.STRING },
          },
          required: [
            'title',
            'selectedSchoolLabel',
            'suggestedTheorists',
            'denotation',
            'connotation',
            'powerRelations',
            'coreAnalysis',
            'counterTheorists',
            'thesisApplicationTip',
            'suggestedTags',
          ],
        },
      },
    });

    const parsed = JSON.parse(response?.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Theory analysis error:', error);
    const is503 = error?.message?.includes('503') || error?.message?.includes('high demand');
    return res.status(500).json({
      error: is503
        ? 'Google AI sunucularında anlık yoğunluk yaşanıyor (503). Lütfen birkaç saniye sonra tekrar deneyin.'
        : error.message || 'Metin analizi gerçekleştirilemedi.',
    });
  }
});

// Dev vs Prod Vite Integration
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false, // AI Studio preview does not proxy WebSockets; disable HMR to prevent console errors
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SemioCraft server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
