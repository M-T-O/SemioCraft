import { Exam, Course, TheoryCard, JurySession } from './types.ts';

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'ex_1',
    code: 'GİT501',
    title: 'Görsel Kültür & Eleştirel Teori Vizesi',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
    todos: [
      { id: 'td_1', text: "Roland Barthes 'Mitolojiler' 1-4. bölümleri oku ve not çıkar", completed: true },
      { id: 'td_2', text: "Walter Benjamin 'Mekanik Yeniden Üretim Çağında Sanat' makalesi analizi", completed: true },
      { id: 'td_3', text: "Stuart Hall Kodlama/Kodaçımlama modeli şemasını deftere çiz", completed: false },
      { id: 'td_4', text: "14:00'te Merkez Kütüphane 2. katta çalışma grubuyla buluş", completed: false },
      { id: 'td_5', text: 'Çıkmış vize sorularını ve kavram listesini gözden geçir', completed: false },
    ],
  },
  {
    id: 'ex_2',
    code: 'GİT508',
    title: 'Yarıyıl Tasarım Jüri Sunumu',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    todos: [
      { id: 'td_21', text: 'Figma üzerinde afiş tipografi hiyerarşisi gridlerini tamamla', completed: false },
      { id: 'td_22', text: 'Afişin kavramsal metnini (300 kelime) hazırla', completed: false },
      { id: 'td_23', text: 'Mac Laboratuvarında 1/1 prova baskı al', completed: false },
    ],
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs_1',
    code: 'GİT501',
    name: 'Görsel Kültür ve Eleştirel Teori',
    entries: [
      {
        id: 'ent_1',
        title: 'Hafta 3: Frankfurt Okulu, Adorno ve Kültür Endüstrisi',
        date: '2026-10-18',
        content: `Adorno ve Horkheimer, Aydınlanmanın Diyalektiği eserinde kültür endüstrisi kavramını ele alır.

Temel Noktalar:
1. Standardizasyon: Popüler kültür ürünleri aynı kalıplarla üretilir.
2. Sahte Bireysellik: Bireye özgür seçim şansı sunuluyormuş gibi yapılırken aslında arzular pazar tarafından üretilir.
3. Eğlence ve Oyalama: İşçinin yabancılaşmasını unutturmak için bir kaçış mekanizmasıdır.

Vize İpucu: Sanatın özerkliği ile metalaşması arasındaki çatışma sorulabilir.`,
      },
      {
        id: 'ent_2',
        title: 'Hafta 4: Walter Benjamin ve Auranın Yitimi',
        date: '2026-10-25',
        content: `Mekanik yeniden üretim çağı:
- Sanat yapıtının biricikliği (aurası) çoğaltılabilirlik karşısında çözülür.
- Bu durum bir yandan elitist sanat tapıncını yok ederken, diğer yandan imajları kitle iletişiminde manipülasyona açık hale getirir.
- Çözüm: Sanatın ritüel yerine politikaya yaslanması.`,
      },
    ],
  },
  {
    id: 'crs_2',
    code: 'GİT508',
    name: 'İleri Tipografi ve Görsel Hiyerarşi',
    entries: [
      {
        id: 'ent_3',
        title: 'Hafta 2: İsviçre Tipografisi ve Grid Sistemleri',
        date: '2026-10-12',
        content: `Josef Müller-Brockmann grid mantığı:
- Sayfada bilginin rasyonel ve nesnel akışı.
- Asimetrik denge ve negatif alanın nefes aldırma gücü.
- Jüri tesliminde ana başlık ile gövde metni puntoları arasında en az 3 kat hiyerarşi korunacak.`,
      },
    ],
  },
];

export const INITIAL_THEORIES: TheoryCard[] = [
  {
    id: 'th_1',
    title: 'Mit ve Doğallaştırma Söylemi',
    theorist: 'Roland Barthes',
    source: 'Mitolojiler (Mythologies), s. 78',
    quote: 'Mit, şeyleri yok etmez; sadece onları arındırır, masumlaştırır ve tarihsellikten koparıp doğallaştırır.',
    analysis: 'Reklamların ve medya dilinin toplumsal kabulleri sanki evrensel bir doğa kanunuymuş gibi hissettirmesini açıklar.',
    tags: ['#mit', '#göstergebilim', '#masumlaştırma'],
  },
  {
    id: 'th_2',
    title: 'Aura ve Mekanik Yeniden Üretim',
    theorist: 'Walter Benjamin',
    source: 'Tekniğin Olanaklarıyla Çoğaltılabildiği Çağda Sanat Yapıtı, s. 44',
    quote: 'Sanat yapıtının mekanik olarak çoğaltılabilirliği çağında solup giden şey, onun aurasıdır.',
    analysis: 'Dijitalleşme ile kopyalanan imajların biricikliğini yitirmesi ve ritüelden çıkıp siyasete/tüketime evrilmesi.',
    tags: ['#aura', '#özgünlük', '#kitlekültürü'],
  },
  {
    id: 'th_3',
    title: 'Mülkiyet ve Görme Biçimleri',
    theorist: 'John Berger',
    source: 'Görme Biçimleri (Ways of Seeing), s. 84',
    quote: 'Yağlıboya resim, sahibine sahip olduğu şeyleri yeniden üretip gösteren bir aynadır.',
    analysis: 'Görsel kültür ile kapitalizm arasındaki bağ; imajın sahip olma arzusunu tetikleme biçimi.',
    tags: ['#mülkiyet', '#kapitalizm', '#bakış'],
  },
];

export const INITIAL_JURY_SESSIONS: JurySession[] = [
  {
    id: 'js_init_1',
    title: 'Kültür Endüstrisi ve Dijital Platformlar',
    school: 'frankfurt',
    level: 'master',
    keyThemes: ['Adorno', 'Standartlaşma', 'Yabancılaşma', 'Sosyal Medya'],
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: 'msg_1',
        role: 'jury',
        text: 'Hoş geldiniz meslektaşım. Tez konunuzda dijital algoritmaların kültür endüstrisinin yeni biçimi olduğunu iddia ediyorsunuz. Peki Adorno\'nun "özerk sanat" kavramı, Spotify veya Instagram çağında halen geçerli midir, yoksa sanat tamamen meta dolaşımına mı teslim olmuştur?',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  },
];
