import React, { useState, useEffect, useRef } from 'react';
import { Timer, Zap, Play, Pause, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TheoryCard } from '../types.ts';

interface FocusViewProps {
  onAddTheory: (card: Omit<TheoryCard, 'id'>) => void;
  onShowToast: (msg: string) => void;
}

export const FocusView: React.FC<FocusViewProps> = ({ onAddTheory, onShowToast }) => {
  // --- RSVP State ---
  const defaultRsvpText = `Aura, nesnenin biricikliği ve uzaktalığının yarattığı tarihsel mesafedir. Mekanik yeniden üretim çağında sanat yapıtı, aurasından sıyrılarak kitlelerin tüketebileceği bir nesneye dönüşür. Bu durum geleneksel tapınç değerini aşındırırken, imajın siyasal ve ideolojik kullanımına kapı aralar.`;

  const [rsvpText, setRsvpText] = useState(defaultRsvpText);
  const [speedWpm, setSpeedWpm] = useState(350);
  const [isRsvpRunning, setIsRsvpRunning] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const rsvpIntervalRef = useRef<any>(null);

  const words = rsvpText.split(/\s+/).filter(Boolean);

  useEffect(() => {
    if (isRsvpRunning) {
      const intervalMs = Math.round((60 / speedWpm) * 1000);
      rsvpIntervalRef.current = setInterval(() => {
        setCurrentWordIndex((prev) => {
          if (prev < words.length - 1) {
            return prev + 1;
          } else {
            clearInterval(rsvpIntervalRef.current);
            setIsRsvpRunning(false);
            return prev;
          }
        });
      }, intervalMs);
    } else {
      if (rsvpIntervalRef.current) clearInterval(rsvpIntervalRef.current);
    }
    return () => {
      if (rsvpIntervalRef.current) clearInterval(rsvpIntervalRef.current);
    };
  }, [isRsvpRunning, speedWpm, words.length]);

  const toggleRsvp = () => {
    if (!words.length) return;
    if (currentWordIndex >= words.length - 1) {
      setCurrentWordIndex(0);
    }
    setIsRsvpRunning(!isRsvpRunning);
  };

  const resetRsvp = () => {
    setIsRsvpRunning(false);
    setCurrentWordIndex(0);
  };

  // --- Feynman Timer State ---
  const INITIAL_TIMER_SECS = 25 * 60; // 25 minutes
  const [timerRemaining, setTimerRemaining] = useState(INITIAL_TIMER_SECS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFeynmanPromptOpen, setIsFeynmanPromptOpen] = useState(false);
  const [feynmanSummary, setFeynmanSummary] = useState('');
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            setIsFeynmanPromptOpen(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerRemaining(INITIAL_TIMER_SECS);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSaveFeynmanSummary = () => {
    if (!feynmanSummary.trim()) {
      alert('Lütfen bir özet giriniz.');
      return;
    }

    onAddTheory({
      title: 'Feynman Çalışma Özeti',
      theorist: 'Bireysel Özetleme',
      source: '25 Dk. Derin Okuma Seansı',
      quote: feynmanSummary.trim(),
      analysis: '25 dakikalık odaklanma seansı sonunda çıkarılan yalınlaştırılmış ana fikir.',
      tags: ['#feynman', '#özet', '#odaklanma'],
    });

    onShowToast('Feynman özeti Teori Kasasına başarıyla aktarıldı.');
    setFeynmanSummary('');
    setIsFeynmanPromptOpen(false);
    setTimerRemaining(INITIAL_TIMER_SECS);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-main)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Okuma & Feynman Odaklayıcı
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Ağır akademik metinleri hızlı sindirmek için RSVP okuma motoru ve 25 dakikalık aktif özetleme seansı.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Module 1: RSVP Rapid Serial Visual Presentation */}
        <div className="rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-base text-[var(--text-primary)]">
                RSVP Hızlı & Odaklı Metin Okuyucu
              </h2>
            </div>
            <span className="font-mono-code text-[11px] text-[var(--text-muted)]">
              {words.length ? `${currentWordIndex + 1}/${words.length} kelime` : 'Metin yok'}
            </span>
          </div>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Uzun bir tez veya makale paragrafını yapıştırın. Kelimeler gözünüzü satır satır yormadan ekranda tek tek akarak dikkat dağınıklığını önler.
          </p>

          {/* Screen Display */}
          <div className="h-36 rounded-xl bg-[var(--bg-inset)] border border-[var(--border-main)] flex items-center justify-center p-4 text-center select-none shadow-inner">
            <span className="font-mono-code font-bold text-2xl sm:text-3xl text-[var(--accent)] tracking-wide">
              {words[currentWordIndex] || 'Hazır'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleRsvp}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                {isRsvpRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Duraklat</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>{currentWordIndex > 0 ? 'Devam Et' : 'Okumayı Başlat'}</span>
                  </>
                )}
              </button>

              <button
                onClick={resetRsvp}
                className="p-2 rounded-lg border border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                title="Başa Sar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)] font-medium">Hız:</span>
              <select
                value={speedWpm}
                onChange={(e) => setSpeedWpm(Number(e.target.value))}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value={250}>250 K/Dk (Rahat)</option>
                <option value={350}>350 K/Dk (Odak)</option>
                <option value={450}>450 K/Dk (Hızlı)</option>
                <option value={550}>550 K/Dk (Süper Hızlı)</option>
              </select>
            </div>
          </div>

          {/* Input text */}
          <div className="space-y-1 pt-1">
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Okunacak Metin
            </label>
            <textarea
              rows={4}
              value={rsvpText}
              onChange={(e) => {
                setRsvpText(e.target.value);
                setCurrentWordIndex(0);
                setIsRsvpRunning(false);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]"
              placeholder="Buraya okumak istediğiniz paragrafı yapıştırın..."
            />
          </div>
        </div>

        {/* Module 2: Feynman 25-Min Deep Study Timer */}
        <div className="rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-cyan-500" />
              <h2 className="font-bold text-base text-[var(--text-primary)]">
                Feynman Derin Çalışma Seansı
              </h2>
            </div>
            <span className="text-[11px] font-mono-code font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              25 DAKİKA
            </span>
          </div>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            25 dakikalık dikkat kesintisi olmadan okuma yapın. Süre dolduğunda okuduğunuzu karmaşık jargondan arındırarak 10 yaşındaki birine anlatır gibi 2 cümlede özetleyin.
          </p>

          {/* Timer Display */}
          <div className="py-6 text-center rounded-xl bg-[var(--bg-inset)] border border-[var(--border-main)] shadow-inner">
            <div className="font-mono-code font-extrabold text-5xl sm:text-6xl tracking-tight text-[var(--text-primary)]">
              {formatTimer(timerRemaining)}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-2">
              {isTimerRunning ? 'Odaklanma Seansı Devam Ediyor...' : 'Seans Durduruldu'}
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={toggleTimer}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Duraklat</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Seansı Başlat</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="px-4 py-2 rounded-lg border border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] text-xs font-medium transition-colors cursor-pointer"
            >
              Sıfırla
            </button>

            <button
              onClick={() => setIsFeynmanPromptOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors cursor-pointer"
              title="Özetleme alanını aç"
            >
              Özeti Şimdi Yaz
            </button>
          </div>

          {/* Feynman Summary Box */}
          {isFeynmanPromptOpen && (
            <div className="p-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-subtle)] space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                  Feynman İlkesi ile Sadeleştir:
                </h3>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                "Bu okumada öğrendiğin en kritik fikri en yalın haliyle açıkla:"
              </p>
              <textarea
                rows={3}
                value={feynmanSummary}
                onChange={(e) => setFeynmanSummary(e.target.value)}
                placeholder="Kendi kelimelerinizle en fazla 2-3 cümle..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsFeynmanPromptOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-main)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  onClick={handleSaveFeynmanSummary}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  <span>Teori Kasasına Aktar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
