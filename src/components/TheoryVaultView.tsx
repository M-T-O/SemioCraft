import React, { useState } from 'react';
import { 
  BookMarked, 
  Plus, 
  Search, 
  Copy, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Layers, 
  Scale, 
  GraduationCap, 
  Check 
} from 'lucide-react';
import { TheoryCard } from '../types.ts';
import { ConfirmModal } from './ConfirmModal.tsx';

interface TheoryVaultViewProps {
  theories: TheoryCard[];
  onAddTheory: (card: Omit<TheoryCard, 'id'>) => void;
  onDeleteTheory: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const TheoryVaultView: React.FC<TheoryVaultViewProps> = ({
  theories,
  onAddTheory,
  onDeleteTheory,
  onShowToast,
}) => {
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAiAnalyzeOpen, setIsAiAnalyzeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [theorist, setTheorist] = useState('');
  const [source, setSource] = useState('');
  const [quote, setQuote] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [tags, setTags] = useState('');

  // AI analysis state
  const [aiInputText, setAiInputText] = useState('');
  const [aiSchool, setAiSchool] = useState('semiotics');
  const [aiFocusMode, setAiFocusMode] = useState('deep_semiotics');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleCreateTheory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !quote.trim()) return;

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onAddTheory({
      title: title.trim(),
      theorist: theorist.trim() || 'Genel Teori',
      source: source.trim() || 'Makale / Not',
      quote: quote.trim(),
      analysis: analysis.trim() || '—',
      tags: parsedTags.length > 0 ? parsedTags : ['#sosyalbilimler'],
    });

    setTitle('');
    setTheorist('');
    setSource('');
    setQuote('');
    setAnalysis('');
    setTags('');
    setIsNewModalOpen(false);
    onShowToast('Teori kartı kasaya eklendi.');
  };

  const copyCitation = (card: TheoryCard) => {
    const text = `"${card.quote}" — ${card.theorist}, ${card.source}`;
    navigator.clipboard.writeText(text).then(() => {
      onShowToast('Alıntı ve akademik künye panoya kopyalandı.');
    });
  };

  const schoolOptions = [
    { id: 'semiotics', label: 'Roland Barthes & Fransız Göstergebilimi', desc: 'Düzanlam, yananlam, mitler, ideolojik doğallaştırma ve gösteren/gösterilen kodları.' },
    { id: 'frankfurt', label: 'Frankfurt Okulu & Eleştirel Teori', desc: 'Adorno, Horkheimer, Benjamin. Kültür endüstrisi, aura, meta fetişizmi ve yabancılaşma.' },
    { id: 'cultural_studies', label: 'Stuart Hall & Kültürel Çalışmalar', desc: 'Hegemonya, kodlama/kodaçımlama (egemen/muhalif okuma), temsil ve kimlik politikaları.' },
    { id: 'foucault', label: 'Michel Foucault & Söylem Analizi', desc: 'İktidar/bilgi, biyoiktidar, gözetim pratikleri ve kurumsal hakikat rejimleri.' },
    { id: 'baudrillard', label: 'Jean Baudrillard & Simülasyon', desc: 'Simulakrlar, hipergerçeklik, gösterge değeri ve imajın gerçekliği yutması.' },
    { id: 'feminist_queer', label: 'Feminist & Kuir Medya Kuramları', desc: 'Eril bakış, toplumsal cinsiyet performativitesi, heteronormatif temsil ve kesişimsellik.' },
    { id: 'general', label: 'Çok Boyutlu Eleştirel Sentez', desc: 'Disiplinlerarası karşılaştırmalı sosyal bilimler ve iletişim kuramları analizi.' },
  ];

  const handleAiAnalyze = async () => {
    if (!aiInputText.trim()) return;
    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/theory/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: aiInputText,
          school: aiSchool,
          focusMode: aiFocusMode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiResult(data);
      } else {
        onShowToast(data.error || 'Analiz sırasında bir hata oluştu.');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Sunucuya bağlanılamadı.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAiResultToNewTheory = () => {
    if (!aiResult) return;
    setTitle(aiResult.title || '');
    setTheorist((aiResult.suggestedTheorists || []).join(', '));
    setSource(aiResult.apaCitationHint || `${aiResult.selectedSchoolLabel} İncelemesi`);
    setQuote(aiInputText.slice(0, 320) + (aiInputText.length > 320 ? '...' : ''));

    const fullAnalysis = [
      `[MERCEK: ${aiResult.selectedSchoolLabel}]`,
      `• Düzanlam (Denotation): ${aiResult.denotation}`,
      `• Yananlam & Mitik Kodlar: ${aiResult.connotation}`,
      `• İktidar & Temsil Boyutu: ${aiResult.powerRelations}`,
      `\nKURAMSAL ÇÖZÜMLEME:\n${aiResult.coreAnalysis}`,
      aiResult.counterTheorists?.length ? `\n• Karşı / Zıt Görüşler: ${(aiResult.counterTheorists || []).join('; ')}` : '',
      aiResult.thesisApplicationTip ? `\n• Akademik Uygulama Tüyosu: ${aiResult.thesisApplicationTip}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    setAnalysis(fullAnalysis);
    setTags((aiResult.suggestedTags || []).join(', '));

    setIsAiAnalyzeOpen(false);
    setIsNewModalOpen(true);
    setAiResult(null);
    setAiInputText('');
  };

  const filteredTheories = theories.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.theorist.toLowerCase().includes(q) ||
      t.source.toLowerCase().includes(q) ||
      t.quote.toLowerCase().includes(q) ||
      t.analysis.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-main)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Teori ve Alıntılar Kasası
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Sosyal bilim kuramcılarından kitap/makale kesitleri, kavram tanımları ve kişisel analiz notları arşivi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiAnalyzeOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>YZ Metin Analiz Asistanı</span>
          </button>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Teori / Alıntı Ekle</span>
          </button>
        </div>
      </div>

      {/* Broad Search Bar */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Kuramcı adı (Barthes, Adorno), kavram başlığı, alıntı metni veya etiket ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Grid of Theory Cards */}
      {theories.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-[var(--border-main)] bg-[var(--bg-surface)]">
          <BookMarked className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Kasa Boş</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mt-1 mb-4">
            Henüz bir kuramcı alıntısı eklemediniz. İlk alıntınızı ve kavramsal çözümlemenizi kaydedin.
          </p>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Alıntı Ekle</span>
          </button>
        </div>
      ) : filteredTheories.length === 0 ? (
        <div className="text-center py-12 text-sm text-[var(--text-muted)] bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)]">
          "{search}" kriterine uygun kuram veya alıntı bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTheories.map((card) => (
            <div
              key={card.id}
              className="rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-5 flex flex-col justify-between transition-all hover:border-[var(--accent)]/50 shadow-sm"
            >
              <div className="space-y-3">
                {/* Theorist & Title */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                      {card.theorist}
                    </span>
                    <span className="text-[11px] font-mono-code text-[var(--text-muted)] truncate max-w-[140px]">
                      {card.source}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mt-1 tracking-tight">
                    {card.title}
                  </h3>
                </div>

                {/* Quote Box (Editorial Serif) */}
                <div className="p-3.5 rounded-lg bg-[var(--bg-inset)] border-l-2 border-[var(--accent)] text-xs sm:text-sm italic font-editorial leading-relaxed text-[var(--text-primary)]">
                  "{card.quote}"
                </div>

                {/* Conceptual Analysis */}
                <div className="space-y-1 text-xs">
                  <div className="text-[10px] font-bold text-[var(--secondary-teal)] uppercase tracking-wider">
                    Kavramsal Çözümleme & Yorum:
                  </div>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {card.analysis}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {card.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-[var(--border-main)] flex items-center justify-between">
                <button
                  onClick={() => copyCitation(card)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  title="Alıntı ve künyeyi panoya kopyala"
                >
                  <Copy className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Künyeyle Kopyala</span>
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: card.id, title: card.title })}
                  className="text-xs text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                  title="Alıntıyı Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Theory Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <h2 className="font-bold text-base text-[var(--text-primary)]">
                Yeni Teori / Alıntı Ekle
              </h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTheory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Kavram / Konu Başlığı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mit ve Doğallaştırma Söylemi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Kuramcı
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Roland Barthes"
                    value={theorist}
                    onChange={(e) => setTheorist(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Eser / Kaynak / Sayfa
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Mitolojiler, s. 142"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Alıntı / Metin Kesiti
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Kitaptan veya makaleden doğrudan alıntıladığınız söz..."
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-editorial rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Kavramsal Çözümleme & Senin Yorumun
                </label>
                <textarea
                  rows={3}
                  placeholder="Bu kavramı tezinizde veya sınavda nasıl kullanacaksınız? Kendi cümleleriniz..."
                  value={analysis}
                  onChange={(e) => setAnalysis(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Etiketler (Virgülle ayırın)
                </label>
                <input
                  type="text"
                  placeholder="Örn: #mit, #göstergebilim, #ideoloji"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm cursor-pointer"
                >
                  Kasaya Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Text Analysis Modal */}
      {isAiAnalyzeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-600/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[var(--text-primary)]">
                    YZ Göstergebilimsel Metin Analiz Asistanı
                  </h2>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Metni seçtiğiniz sosyal bilim ekolünün kavramsal merceğinden saniyeler içinde çözümleyin.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiAnalyzeOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Selection Controls (Schools & Focus Mode) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Kuramsal Mercek / Ekol</span>
                </label>
                <select
                  value={aiSchool}
                  onChange={(e) => setAiSchool(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-medium"
                >
                  {schoolOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[var(--secondary-teal)]" />
                  <span>İnceleme Derinliği & Odak</span>
                </label>
                <select
                  value={aiFocusMode}
                  onChange={(e) => setAiFocusMode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-medium"
                >
                  <option value="deep_semiotics">Düzanlam, Yananlam ve Mitler (Klasik Göstergebilim)</option>
                  <option value="power_discourse">İktidar, Hegemonya ve Söylemsel Pratikler</option>
                  <option value="critical_counter">Karşı Kuramcılar, Zıt Ekoller & Argüman Boşlukları</option>
                  <option value="thesis_citation">Teze / Makaleye Uygun Format & APA Künyesi</option>
                </select>
              </div>
            </div>

            {/* School Description Note */}
            <div className="p-2.5 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] flex items-start gap-2">
              <span className="font-bold text-[var(--accent)] shrink-0">Ekol Yaklaşımı:</span>
              <span>{schoolOptions.find((s) => s.id === aiSchool)?.desc}</span>
            </div>

            {/* Input Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Analiz Edilecek Metin / Alıntı / Reklam Metni
              </label>
              <textarea
                rows={4}
                placeholder="Buraya analiz etmek istediğiniz bir tez paragrafı, haber metni, reklam sloganı veya makale kesiti yapıştırın..."
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleAiAnalyze}
                disabled={isAnalyzing || !aiInputText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Seçilen Ekolle Çözümleniyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Metni Çözümle</span>
                  </>
                )}
              </button>
            </div>

            {/* Analysis Result Display */}
            {aiResult && (
              <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/5 space-y-4 text-xs animate-in fade-in">
                {/* Result Title & Theorists */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-main)]">
                  <div>
                    <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[var(--accent)]">
                      {aiResult.selectedSchoolLabel}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)] mt-0.5">
                      {aiResult.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(aiResult.suggestedTheorists || []).map((t: string, i: number) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono-code font-semibold px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-primary)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3-Box Semiotic Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] space-y-1">
                    <span className="font-bold text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                      📌 Düzanlam (Denotation)
                    </span>
                    <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                      {aiResult.denotation}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] space-y-1">
                    <span className="font-bold text-[10px] text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      🔮 Yananlam & Mitler
                    </span>
                    <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                      {aiResult.connotation}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] space-y-1">
                    <span className="font-bold text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      ⚖️ İktidar & Temsil
                    </span>
                    <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                      {aiResult.powerRelations}
                    </p>
                  </div>
                </div>

                {/* Core Analysis Prose */}
                <div className="space-y-1.5 p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)]">
                  <span className="font-bold text-[11px] text-[var(--text-primary)] uppercase tracking-wider">
                    Kuramsal Çözümleme:
                  </span>
                  <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {aiResult.coreAnalysis}
                  </p>
                </div>

                {/* Counter Theorists & Academic Tip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiResult.counterTheorists?.length > 0 && (
                    <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] space-y-1">
                      <span className="font-bold text-[10px] text-rose-500 uppercase tracking-wider">
                        ⚡ Zıt Ekoller & Karşı Kuramcılar:
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-[var(--text-secondary)] space-y-0.5">
                        {aiResult.counterTheorists.map((ct: string, idx: number) => (
                          <li key={idx}>{ct}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiResult.thesisApplicationTip && (
                    <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] space-y-1">
                      <span className="font-bold text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Tez & Sınav Tüyosu:</span>
                      </span>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        {aiResult.thesisApplicationTip}
                      </p>
                    </div>
                  )}
                </div>

                {/* APA Citation Hint */}
                {aiResult.apaCitationHint && (
                  <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-[var(--text-muted)] font-mono-code truncate">
                      APA 7 Künye: {aiResult.apaCitationHint}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiResult.apaCitationHint);
                        onShowToast('APA künyesi panoya kopyalandı.');
                      }}
                      className="inline-flex items-center gap-1 text-[var(--accent)] font-semibold hover:underline shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Kopyala</span>
                    </button>
                  </div>
                )}

                {/* Tags and Save CTA */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1 text-[11px] text-[var(--text-muted)]">
                    {(aiResult.suggestedTags || []).map((t: string, i: number) => (
                      <span key={i} className="hover:text-[var(--text-primary)]">
                        {t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={applyAiResultToNewTheory}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer self-end sm:self-auto"
                  >
                    <span>Bu Çözümlemeyle Teori Kartı Oluştur →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Theory Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Alıntı Kartını Sil"
        message={`"${deleteTarget?.title}" kuramsal alıntı kartını silmek istediğinize emin misiniz?`}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteTheory(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
