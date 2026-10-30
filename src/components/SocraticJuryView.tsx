import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Plus, 
  GraduationCap, 
  BookOpen, 
  BookmarkPlus, 
  CheckCircle, 
  AlertCircle,
  Award,
  Trash2
} from 'lucide-react';
import { JurySession, JuryMessage, Course, TheoryCard } from '../types.ts';
import { ConfirmModal } from './ConfirmModal.tsx';

interface SocraticJuryViewProps {
  sessions: JurySession[];
  activeSessionId: string | null;
  courses: Course[];
  onSelectSession: (id: string) => void;
  onNewSession: (session: JurySession) => void;
  onUpdateSession: (updated: JurySession) => void;
  onDeleteSession: (id: string) => void;
  onAddTheory: (card: Omit<TheoryCard, 'id'>) => void;
  onShowToast: (msg: string) => void;
}

export const SocraticJuryView: React.FC<SocraticJuryViewProps> = ({
  sessions,
  activeSessionId,
  courses,
  onSelectSession,
  onNewSession,
  onUpdateSession,
  onDeleteSession,
  onAddTheory,
  onShowToast,
}) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [studentInput, setStudentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalRound, setIsFinalRound] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // New session modal state
  const [newTopic, setNewTopic] = useState('');
  const [newSchool, setNewSchool] = useState<JurySession['school']>('frankfurt');
  const [newLevel, setNewLevel] = useState<JurySession['level']>('master');
  const [selectedCourseForContext, setSelectedCourseForContext] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [isStartingSession, setIsStartingSession] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  const schoolNames: Record<JurySession['school'], { name: string; desc: string }> = {
    frankfurt: {
      name: 'Frankfurt Okulu & Eleştirel Teori',
      desc: 'Adorno, Horkheimer, Benjamin. Kültür endüstrisi, aura ve meta fetişizmi ekseninde tavizsiz sorgulama.',
    },
    semiotics: {
      name: 'Fransız & Anglo-Sakson Göstergebilim',
      desc: 'Barthes, Saussure, Eco. Düzanlam, yananlam, mit oluşturma ve gösterge sistemleri odağı.',
    },
    cultural_studies: {
      name: 'Kültürel Çalışmalar & Medya Sosyolojisi',
      desc: 'Stuart Hall, Williams, Hebdige. Hegemonya, kodaçımlama ve temsil politikaları.',
    },
    methodology: {
      name: 'Eleştirel Metodoloji & Epistemoloji',
      desc: 'Kavramsal çerçevenin tutarlılığı, yöntem sınırları ve örneklem mantığı üzerine odaklanır.',
    },
    general_defense: {
      name: 'Çok Boyutlu Tez Savunma Jürisi',
      desc: 'Tüm sosyal bilimler kuramlarını harmanlayan dengeli lisansüstü jüri heyeti.',
    },
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    setIsStartingSession(true);

    // Prepare context
    let combinedContext = customContext;
    if (selectedCourseForContext) {
      const course = courses.find((c) => c.id === selectedCourseForContext);
      if (course) {
        const notesSummary = course.entries
          .map((e) => `[${e.title}]: ${e.content.slice(0, 300)}...`)
          .join('\n\n');
        combinedContext = `${combinedContext}\n\n[SEÇİLEN DERS NOTLARI (${course.name})]:\n${notesSummary}`;
      }
    }

    try {
      const res = await fetch('/api/jury/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school: newSchool,
          topic: newTopic.trim(),
          context: combinedContext,
          level: newLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Jüri oturumu başlatılamadı.');
      }

      const newSess: JurySession = {
        id: 'js_' + Date.now(),
        title: newTopic.trim(),
        school: newSchool,
        level: newLevel,
        keyThemes: data.keyThemes || [],
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: 'm_' + Date.now(),
            role: 'jury',
            text: `${data.openingStatement}\n\n${data.firstQuestion}`,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };

      onNewSession(newSess);
      setIsNewModalOpen(false);
      setNewTopic('');
      setCustomContext('');
      onShowToast('Sokratik Jüri oturumu başlatıldı!');
    } catch (err: any) {
      onShowToast(err.message || 'Hata oluştu.');
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleSendMessage = async () => {
    if (!studentInput.trim() || !activeSession || isLoading) return;

    const currentText = studentInput.trim();
    setStudentInput('');

    // Last jury question
    const juryMessages = activeSession.messages.filter((m) => m.role === 'jury');
    const lastJuryMsg = juryMessages[juryMessages.length - 1];

    const studentMsg: JuryMessage = {
      id: 'm_std_' + Date.now(),
      role: 'student',
      text: currentText,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedSessionWithStudent: JurySession = {
      ...activeSession,
      messages: [...activeSession.messages, studentMsg],
    };
    onUpdateSession(updatedSessionWithStudent);

    setIsLoading(true);

    try {
      const res = await fetch('/api/jury/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school: activeSession.school,
          topic: activeSession.title,
          question: lastJuryMsg?.text || activeSession.title,
          studentAnswer: currentText,
          history: activeSession.messages.slice(-6).map((m) => ({
            role: m.role,
            text: m.text,
          })),
          isFinalRound,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Jüri değerlendirmesi alınamadı.');
      }

      // Attach feedback to the student message or next jury message
      const juryResponseMsg: JuryMessage = {
        id: 'm_jury_' + Date.now(),
        role: 'jury',
        text: data.followUpQuestion || 'Jüri değerlendirmesini tamamladı.',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        feedback: {
          score: data.score,
          critique: data.critique,
          theoreticalGaps: data.theoreticalGaps || [],
          followUpQuestion: data.followUpQuestion,
          feynmanKeyInsight: data.feynmanKeyInsight,
        },
      };

      const finalSession: JurySession = {
        ...updatedSessionWithStudent,
        messages: [...updatedSessionWithStudent.messages, juryResponseMsg],
      };

      onUpdateSession(finalSession);
      setIsFinalRound(false);
    } catch (err: any) {
      onShowToast(err.message || 'Değerlendirme alınamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInsightToVault = (insight: string, title: string) => {
    onAddTheory({
      title: `${title} — Jüri Çıkarımı`,
      theorist: 'Sokratik Jüri Oturumu',
      source: 'Gemini Sözlü Sınav Savunması',
      quote: insight,
      analysis: 'Jüri çapraz sorgusu sırasında argümantasyonu güçlendirmek için belirlenen kilit kuramsal ilke.',
      tags: ['#jürisavunması', '#sokratik', '#tez'],
    });
    onShowToast('Jüri çıkarımı Teori ve Alıntılar Kasasına kaydedildi!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-main)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-violet-600 text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Sokratik Tez Jürisi & Sözlü Sınav Simülatörü
            </h1>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Gemini, seçtiğiniz sosyal bilim ekolünün profesörü kimliğine bürünür; tezinizi ve ders notlarınızı çapraz sorguyla sınar.
          </p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Jüri Oturumu Başlat</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Session List */}
        <div className="lg:col-span-4 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-4 space-y-3 shadow-sm">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
            <span>Savunma Oturumları ({sessions.length})</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {sessions.map((sess) => {
              const isSelected = sess.id === activeSession?.id;
              return (
                <div
                  key={sess.id}
                  onClick={() => onSelectSession(sess.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-subtle)] shadow-sm'
                      : 'border-transparent bg-[var(--bg-inset)] hover:border-[var(--border-main)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-mono-code font-bold text-[var(--accent)]">
                      {sess.level === 'phd' ? 'Doktora' : 'Yüksek Lisans'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(sess.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ id: sess.id, title: sess.title });
                        }}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Bu savunma oturumunu sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] mt-1 line-clamp-1">
                    {sess.title}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                    {schoolNames[sess.school]?.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Area: Interactive Jury Arena */}
        {activeSession ? (
          <div className="lg:col-span-8 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-5 flex flex-col h-[650px] shadow-sm">
            {/* Arena Header */}
            <div className="pb-3.5 border-b border-[var(--border-main)] flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--accent)] font-mono-code uppercase">
                    {activeSession.level === 'phd' ? 'Doktora Tez Savunması' : 'Yüksek Lisans Sözlü Jürisi'}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">·</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {schoolNames[activeSession.school]?.name}
                  </span>
                </div>
                <h2 className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                  {activeSession.title}
                </h2>
              </div>

              {/* Themes & Header Actions */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex flex-wrap gap-1">
                  {activeSession.keyThemes.map((theme, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-main)] text-[var(--text-muted)] font-mono-code"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setDeleteTarget({ id: activeSession.id, title: activeSession.title })}
                  className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-2 py-1 rounded transition-colors cursor-pointer"
                  title="Oturumu Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Oturumu Sil</span>
                </button>
              </div>
            </div>

            {/* Chat Flow */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {activeSession.messages.map((msg) => {
                const isJury = msg.role === 'jury';
                return (
                  <div key={msg.id} className={`flex flex-col ${isJury ? 'items-start' : 'items-end'}`}>
                    <div
                      className={`max-w-[90%] sm:max-w-[80%] rounded-xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isJury
                          ? 'bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] shadow-sm'
                          : 'bg-[var(--accent)] text-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-black/10 dark:border-white/10 text-[10px] opacity-80 font-mono-code">
                        <span>{isJury ? '✦ Jüri Üyesi (Sokratik Çapraz Sorgu)' : 'Sen (Savunma / Tez Adayı)'}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>

                    {/* Feedback Card attached to jury evaluation */}
                    {msg.feedback && (
                      <div className="mt-2.5 max-w-[90%] sm:max-w-[80%] w-full rounded-xl border border-violet-500/30 bg-violet-500/5 p-3.5 space-y-2.5 text-xs animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                            <Award className="w-4 h-4 text-violet-500" />
                            <span>Jüri Argümantasyon Değerlendirmesi</span>
                          </div>
                          <span className={`font-mono-code font-bold px-2 py-0.5 rounded text-[11px] ${
                            msg.feedback.score >= 80 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                            msg.feedback.score >= 60 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          }`}>
                            Puan: {msg.feedback.score}/100
                          </span>
                        </div>

                        <p className="text-[var(--text-secondary)] leading-relaxed italic">
                          "{msg.feedback.critique}"
                        </p>

                        {/* Theoretical Gaps */}
                        {msg.feedback.theoreticalGaps.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                              Derinleştirilmesi Gereken Kuramsal Boşluklar:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.feedback.theoreticalGaps.map((gap, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-primary)]"
                                >
                                  {gap}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Feynman Insight saving */}
                        {msg.feedback.feynmanKeyInsight && (
                          <div className="pt-2 border-t border-[var(--border-main)] flex items-center justify-between gap-2">
                            <span className="text-[11px] text-[var(--text-muted)] truncate">
                              Özet: "{msg.feedback.feynmanKeyInsight}"
                            </span>
                            <button
                              onClick={() =>
                                handleSaveInsightToVault(
                                  msg.feedback!.feynmanKeyInsight,
                                  activeSession.title
                                )
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] hover:underline shrink-0 cursor-pointer"
                            >
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>Kasaya Aktar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] p-3 rounded-lg bg-[var(--bg-inset)] w-fit animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
                  <span>Jüri heyeti argümanınızı kuramsal olarak inceliyor...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Arena */}
            <div className="pt-3 border-t border-[var(--border-main)] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Argümanınızı kuramcılar ve kavramlarla destekleyerek yanıtlayın:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFinalRound}
                    onChange={(e) => setIsFinalRound(e.target.checked)}
                    className="accent-[var(--accent)]"
                  />
                  <span>Bu son savunmam (Nihai Karar İste)</span>
                </label>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                  placeholder="Yanıtınızı buraya yazın... (Enter ile gönder, Shift+Enter ile yeni satır)"
                  className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !studentInput.trim()}
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 rounded-xl border border-dashed border-[var(--border-main)] bg-[var(--bg-surface)] p-12 text-center">
            <GraduationCap className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Jüri Oturumu Seçilmedi</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mt-1 mb-4">
              Soldaki listeden bir oturum seçin veya yeni bir tez savunması oturumu başlatın.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold cursor-pointer"
            >
              Yeni Oturum Başlat
            </button>
          </div>
        )}
      </div>

      {/* New Jury Session Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="font-bold text-base text-[var(--text-primary)]">
                  Yeni Sokratik Tez Jürisi Oturumu
                </h2>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartSession} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Tez Konusu, Hipotez veya Sınav Alanı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Görsel Kültürde Auranın Yitimi ve Algoritmik Tüketim"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Akademik Düzey
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="master">Yüksek Lisans (Master Tez Savunması)</option>
                    <option value="phd">Doktora (Yeterlik & Tez Jürisi)</option>
                    <option value="bachelor">Lisans (Bitirme Projesi & Vize)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Jüri Ekolü / Kuramsal Duruş
                  </label>
                  <select
                    value={newSchool}
                    onChange={(e) => setNewSchool(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="frankfurt">Frankfurt Okulu (Adorno, Benjamin)</option>
                    <option value="semiotics">Göstergebilim (Barthes, Eco, Saussure)</option>
                    <option value="cultural_studies">Kültürel Çalışmalar (Stuart Hall)</option>
                    <option value="methodology">Eleştirel Metodoloji & Epistemoloji</option>
                    <option value="general_defense">Dengeli Jüri Heyeti (Genel)</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--accent)]">Ekol Özeti: </span>
                {schoolNames[newSchool]?.desc}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Kayıtlı Ders Notlarından Besle (İsteğe Bağlı)
                </label>
                <select
                  value={selectedCourseForContext}
                  onChange={(e) => setSelectedCourseForContext(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="">-- Ders seçilmedi (Yalnızca konudan soru üret) --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name} ({c.entries.length} Not)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Özel Not / Tez Giriş Paragrafı (İsteğe Bağlı)
                </label>
                <textarea
                  rows={3}
                  placeholder="Jürinin bilmesini istediğiniz özel argümanınız veya tez hipoteziniz..."
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
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
                  disabled={isStartingSession || !newTopic.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isStartingSession ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Jüri Toplanıyor...</span>
                    </>
                  ) : (
                    <span>Oturumu Başlat</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Jury Session Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Savunma Oturumunu Sil"
        message={`"${deleteTarget?.title}" savunma oturumunu ve oturumdaki tüm jüri diyaloglarını kalıcı olarak silmek istediğinize emin misiniz?`}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteSession(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
