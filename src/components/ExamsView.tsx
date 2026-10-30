import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Clock, CheckCircle2, Circle } from 'lucide-react';
import { Exam } from '../types.ts';
import { ConfirmModal } from './ConfirmModal.tsx';

interface ExamsViewProps {
  exams: Exam[];
  onAddExam: (exam: Omit<Exam, 'id'>) => void;
  onDeleteExam: (id: string) => void;
  onAddTodo: (examId: string, text: string) => void;
  onToggleTodo: (examId: string, todoId: string) => void;
  onDeleteTodo: (examId: string, todoId: string) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  onAddExam,
  onDeleteExam,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todoInputs, setTodoInputs] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Live ticker to keep countdowns accurate in real time
  const [, setTick] = useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // New exam form state
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [date, setDate] = useState('');
  const [firstTodo, setFirstTodo] = useState('');

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onAddExam({
      title: title.trim(),
      code: code.trim() || 'DERS',
      date: new Date(date).toISOString(),
      todos: firstTodo.trim()
        ? [{ id: 'td_' + Date.now(), text: firstTodo.trim(), completed: false }]
        : [],
    });

    setTitle('');
    setCode('');
    setDate('');
    setFirstTodo('');
    setIsModalOpen(false);
  };

  const handleAddTodoSubmit = (examId: string) => {
    const text = (todoInputs[examId] || '').trim();
    if (!text) return;
    onAddTodo(examId, text);
    setTodoInputs((prev) => ({ ...prev, [examId]: '' }));
  };

  const getTimeRemaining = (targetIso: string) => {
    const diff = new Date(targetIso).getTime() - Date.now();
    if (diff <= 0) return { text: 'Teslim / Sınav Vakti Geldi!', isUrgent: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return {
      text: `${days} gün ${hours} saat kaldı`,
      isUrgent: days <= 2,
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-main)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Sınav & Jüri Teslim Programları
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Vize, final ve lisansüstü tez jüri hedeflerinizi belirleyin; adım adım yapılacaklar listenizi takip edin.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Sınav Programı</span>
        </button>
      </div>

      {/* Grid of Exams */}
      {exams.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-[var(--border-main)] bg-[var(--bg-surface)]">
          <Calendar className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Henüz Bir Sınav Programı Yok</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mt-1 mb-4">
            İlk vize, final veya jüri tesliminizi ekleyerek çalışma hedeflerinizi oluşturun.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Program Oluştur</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => {
            const total = exam.todos.length;
            const completed = exam.todos.filter((t) => t.completed).length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            const remaining = getTimeRemaining(exam.date);
            const formattedDate = new Date(exam.date).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={exam.id}
                className="rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-5 flex flex-col justify-between transition-all hover:border-[var(--accent)]/50 shadow-sm"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[var(--border-main)]">
                    <div>
                      <span className="text-[11px] font-mono-code font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {exam.code}
                      </span>
                      <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1.5 tracking-tight">
                        {exam.title}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    <div className="text-right px-3 py-1.5 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] min-w-[120px]">
                      <div className={`text-xs font-mono-code font-bold ${remaining.isUrgent ? 'text-rose-500' : 'text-[var(--accent)]'}`}>
                        {remaining.text}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                        Kalan Süre
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span>Hazırlık İlerlemesi</span>
                      <span className="font-mono-code font-semibold text-[var(--accent)]">
                        {completed}/{total} Görev (%{percent})
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--bg-inset)] overflow-hidden border border-[var(--border-main)]">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* To-Do Section */}
                  <div className="mt-5 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Bu hedef için yeni görev yazın..."
                        value={todoInputs[exam.id] || ''}
                        onChange={(e) => setTodoInputs({ ...todoInputs, [exam.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTodoSubmit(exam.id);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]"
                      />
                      <button
                        onClick={() => handleAddTodoSubmit(exam.id)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--accent-subtle)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white border border-[var(--accent)]/30 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        + Ekle
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {exam.todos.map((todo) => (
                        <div
                          key={todo.id}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all ${
                            todo.completed
                              ? 'bg-[var(--bg-inset)]/50 border-transparent opacity-60'
                              : 'bg-[var(--bg-inset)] border-[var(--border-main)]/60 hover:border-[var(--border-main)]'
                          }`}
                        >
                          <button
                            onClick={() => onToggleTodo(exam.id, todo.id)}
                            className="mt-0.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                          >
                            {todo.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <span
                            className={`flex-1 text-xs leading-relaxed ${
                              todo.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                            }`}
                          >
                            {todo.text}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTodo(exam.id, todo.id);
                            }}
                            className="text-[var(--text-muted)] hover:text-rose-500 p-1 text-xs transition-colors cursor-pointer shrink-0"
                            title="Görevi Sil"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="pt-4 mt-5 border-t border-[var(--border-main)] flex justify-end">
                  <button
                    onClick={() => setDeleteTarget({ id: exam.id, title: exam.title })}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Programı Sil</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <h2 className="font-bold text-base text-[var(--text-primary)]">
                Yeni Sınav / Jüri Programı
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Sınav / Jüri / Teslim Başlığı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Görsel Kültür Vizesi veya Tez Jüri Savunması"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Ders Kodu
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: GİT501"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Tarih ve Saat
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  İlk Görev (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Barthes Mitolojiler 1-3. bölümleri oku"
                  value={firstTodo}
                  onChange={(e) => setFirstTodo(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm cursor-pointer"
                >
                  Programı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Sınav Programını Sil"
        message={`"${deleteTarget?.title}" sınav programını ve içindeki tüm görevleri kalıcı olarak silmek istediğinize emin misiniz?`}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteExam(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
