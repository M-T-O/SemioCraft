import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Copy, ChevronDown, Search, Calendar, FileText } from 'lucide-react';
import { Course, CourseEntry } from '../types.ts';
import { ConfirmModal } from './ConfirmModal.tsx';

interface CoursesViewProps {
  courses: Course[];
  activeCourseId: string | null;
  onSelectCourse: (id: string) => void;
  onAddCourse: (code: string, name: string) => void;
  onDeleteCourse: (id: string) => void;
  onAddEntry: (courseId: string, title: string, date: string, content: string) => void;
  onDeleteEntry: (courseId: string, entryId: string) => void;
  onShowToast: (msg: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  activeCourseId,
  onSelectCourse,
  onAddCourse,
  onDeleteCourse,
  onAddEntry,
  onDeleteEntry,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  // Expanded entries map
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({
    ent_1: true, // first entry expanded by default
  });

  // New course form
  const [cCode, setCCode] = useState('');
  const [cName, setCName] = useState('');

  // New entry form
  const [targetCourseId, setTargetCourseId] = useState(activeCourseId || (courses[0]?.id ?? ''));
  const [entryTitle, setEntryTitle] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [entryContent, setEntryContent] = useState('');

  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return;
    onAddCourse(cCode.trim() || 'DERS', cName.trim());
    setCCode('');
    setCName('');
    setIsNewCourseModalOpen(false);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim() || !entryContent.trim()) return;
    const cid = targetCourseId || activeCourse?.id;
    if (!cid) return;

    onAddEntry(cid, entryTitle.trim(), entryDate, entryContent.trim());
    setEntryTitle('');
    setEntryContent('');
    setIsNewEntryModalOpen(false);
    onShowToast('Ders notu başarıyla eklendi.');
  };

  const toggleAccordion = (entryId: string) => {
    setExpandedEntries((prev) => ({
      ...prev,
      [entryId]: !prev[entryId],
    }));
  };

  const copyNoteContent = (entry: CourseEntry) => {
    const formatted = `[${entry.title} (${entry.date})]\n\n${entry.content}`;
    navigator.clipboard.writeText(formatted).then(() => {
      onShowToast('Ders notu panoya kopyalandı.');
    });
  };

  const filteredEntries = (activeCourse?.entries || []).filter((ent) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      ent.title.toLowerCase().includes(q) ||
      ent.content.toLowerCase().includes(q) ||
      ent.date.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-main)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Dersler ve Akordiyon Notlar
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Aldığınız dersleri tanımlayın; altındaki ders notlarını sayfa kalabalığı olmadan girdi başlıklarına tıklayarak okuyun.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewCourseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Ders Ekle</span>
          </button>
          <button
            onClick={() => {
              if (activeCourse) setTargetCourseId(activeCourse.id);
              setIsNewEntryModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Derse Not / Girdi Ekle</span>
          </button>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-[var(--border-main)] bg-[var(--bg-surface)]">
          <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Kayıtlı Ders Yok</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mt-1 mb-4">
            Henüz bir ders eklemediniz. İlk dersinizi oluşturarak notlarınızı organize etmeye başlayın.
          </p>
          <button
            onClick={() => setIsNewCourseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Ders Ekle</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar: Course Selection */}
          <div className="md:col-span-4 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-4 space-y-3">
            <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Kayıtlı Dersler ({courses.length})
            </div>
            <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
              {courses.map((course) => {
                const isSelected = course.id === activeCourse?.id;
                return (
                  <div
                    key={course.id}
                    onClick={() => onSelectCourse(course.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)] shadow-sm'
                        : 'border-transparent bg-[var(--bg-inset)] hover:border-[var(--border-main)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-code text-[11px] font-bold text-[var(--accent)]">
                        {course.code}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {course.entries.length} Not Girdisi
                      </span>
                    </div>
                    <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] mt-1">
                      {course.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Area: Course Notes Accordion */}
          {activeCourse && (
            <div className="md:col-span-8 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] p-5 space-y-4">
              {/* Course Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-main)]">
                <div>
                  <span className="text-xs font-mono-code font-bold text-[var(--accent)]">
                    {activeCourse.code}
                  </span>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                    {activeCourse.name}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setDeleteConfirm({
                      title: 'Dersi Sil',
                      message: `"${activeCourse.name}" dersini ve içindeki ${activeCourse.entries.length} adet notu silmek istediğinize emin misiniz?`,
                      onConfirm: () => {
                        onDeleteCourse(activeCourse.id);
                        setDeleteConfirm(null);
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 self-start sm:self-auto cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Dersi Sil</span>
                </button>
              </div>

              {/* Note Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Bu derse ait notlarda, anahtar kelimelerde veya başlıklarda ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Accordion Entries List */}
              <div className="space-y-2.5">
                {activeCourse.entries.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-lg bg-[var(--bg-inset)] border border-dashed border-[var(--border-main)]">
                    <FileText className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-[var(--text-primary)]">Bu Derste Henüz Not Girdisi Yok</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 mb-3">
                      Haftalık ders notları veya okuma özetlerini ekleyin.
                    </p>
                    <button
                      onClick={() => {
                        setTargetCourseId(activeCourse.id);
                        setIsNewEntryModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>İlk Notu Ekle</span>
                    </button>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="text-center py-10 text-xs text-[var(--text-muted)] bg-[var(--bg-inset)] rounded-lg">
                    "{searchTerm}" aramasına uyan bir ders notu bulunamadı.
                  </div>
                ) : (
                  filteredEntries.map((entry) => {
                    const isExpanded = expandedEntries[entry.id] ?? false;
                    return (
                      <div
                        key={entry.id}
                        className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-inset)] overflow-hidden transition-all hover:border-[var(--accent)]/40"
                      >
                        {/* Header Bar */}
                        <div
                          onClick={() => toggleAccordion(entry.id)}
                          className="flex items-center justify-between p-3.5 cursor-pointer select-none bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] transition-colors gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <ChevronDown
                              className={`w-4 h-4 text-[var(--accent)] shrink-0 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                              {entry.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="inline-flex items-center gap-1 font-mono-code text-[11px] text-[var(--text-muted)] px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-main)]">
                              <Calendar className="w-3 h-3" />
                              {entry.date}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyNoteContent(entry);
                              }}
                              className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                              title="Notu Panoya Kopyala"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm({
                                  title: 'Ders Notunu Sil',
                                  message: `"${entry.title}" ders notunu silmek istediğinize emin misiniz?`,
                                  onConfirm: () => {
                                    onDeleteEntry(activeCourse.id, entry.id);
                                    setDeleteConfirm(null);
                                  },
                                });
                              }}
                              className="p-1 rounded hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-colors cursor-pointer"
                              title="Notu Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Body */}
                        {isExpanded && (
                          <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-inset)] text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap font-sans">
                            {entry.content}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Course Modal */}
      {isNewCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <h2 className="font-bold text-base text-[var(--text-primary)]">Yeni Ders Ekle</h2>
              <button
                onClick={() => setIsNewCourseModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Ders Kodu
                </label>
                <input
                  type="text"
                  placeholder="Örn: İLT514"
                  value={cCode}
                  onChange={(e) => setCCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Dersin Tam Adı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: İletişim Kuramları ve Medya Sosyolojisi"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCourseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm cursor-pointer"
                >
                  Dersi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Note / Entry Modal */}
      {isNewEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <h2 className="font-bold text-base text-[var(--text-primary)]">
                Yeni Ders Notu / Girdi Ekle
              </h2>
              <button
                onClick={() => setIsNewEntryModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Hangi Ders İçin?
                </label>
                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Girdi Başlığı
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Hafta 4: Walter Benjamin ve Auranın Yitimi"
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Girdi Tarihi
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Ders Notu İçeriği
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Bu derste alınan anahtar kavramlar, hoca vurguları, alıntılar..."
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--bg-inset)] border border-[var(--border-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewEntryModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm cursor-pointer"
                >
                  Notu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title={deleteConfirm?.title || ''}
        message={deleteConfirm?.message || ''}
        onConfirm={() => deleteConfirm?.onConfirm()}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};
