import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { ExamsView } from './components/ExamsView.tsx';
import { CoursesView } from './components/CoursesView.tsx';
import { TheoryVaultView } from './components/TheoryVaultView.tsx';
import { FocusView } from './components/FocusView.tsx';
import { SocraticJuryView } from './components/SocraticJuryView.tsx';
import { Toast } from './components/Toast.tsx';
import { 
  Theme, 
  Exam, 
  Course, 
  TheoryCard, 
  JurySession 
} from './types.ts';
import { 
  INITIAL_EXAMS, 
  INITIAL_COURSES, 
  INITIAL_THEORIES, 
  INITIAL_JURY_SESSIONS 
} from './initialData.ts';

const STORAGE_KEYS = {
  THEME: 'semiocraft_theme_v4',
  EXAMS: 'semiocraft_exams_v4',
  COURSES: 'semiocraft_courses_v4',
  THEORIES: 'semiocraft_theories_v4',
  JURY: 'semiocraft_jury_v4',
};

export default function App() {
  // Theme state: defaults to dark
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as Theme) || 'dark';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'exams' | 'courses' | 'vault' | 'focus' | 'jury'>('jury');

  // Core academic data state
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_EXAMS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_COURSES;
  });

  const [theories, setTheories] = useState<TheoryCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEORIES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_THEORIES;
  });

  const [jurySessions, setJurySessions] = useState<JurySession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JURY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_JURY_SESSIONS;
  });

  const [activeCourseId, setActiveCourseId] = useState<string | null>(() => {
    return courses[0]?.id || null;
  });

  const [activeJurySessionId, setActiveJurySessionId] = useState<string | null>(() => {
    return jurySessions[0]?.id || null;
  });

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastTimeoutRef = React.useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setIsToastVisible(false);
    }, 2800);
  };

  // Sync theme with HTML root class
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist states to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEORIES, JSON.stringify(theories));
  }, [theories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JURY, JSON.stringify(jurySessions));
  }, [jurySessions]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // JSON Data Export
  const handleExportData = () => {
    const data = {
      version: 'SemioCraft v4.0',
      exportedAt: new Date().toISOString(),
      exams,
      courses,
      theories,
      jurySessions,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `semiocraft_yedek_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Tüm akademik arşiv JSON olarak indirildi.');
  };

  // JSON Data Import
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.exams && parsed.courses && parsed.theories) {
          setExams(parsed.exams);
          setCourses(parsed.courses);
          setTheories(parsed.theories);
          if (parsed.jurySessions) setJurySessions(parsed.jurySessions);
          if (parsed.courses.length > 0) setActiveCourseId(parsed.courses[0].id);
          if (parsed.jurySessions?.length > 0) setActiveJurySessionId(parsed.jurySessions[0].id);
          showToast('Yedek başarıyla geri yüklendi!');
        } else {
          alert('Geçersiz SemioCraft yedek formatı.');
        }
      } catch (err: any) {
        alert('Dosya okuma hatası: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- Exam Handlers ---
  const handleAddExam = (newExamData: Omit<Exam, 'id'>) => {
    const newExam: Exam = { ...newExamData, id: 'ex_' + Date.now() };
    setExams((prev) => [newExam, ...prev]);
    showToast('Sınav programı başarıyla oluşturuldu.');
  };

  const handleDeleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    showToast('Sınav programı silindi.');
  };

  const handleAddTodo = (examId: string, text: string) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id !== examId) return e;
        return {
          ...e,
          todos: [...e.todos, { id: 'td_' + Date.now(), text, completed: false }],
        };
      })
    );
  };

  const handleToggleTodo = (examId: string, todoId: string) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id !== examId) return e;
        return {
          ...e,
          todos: e.todos.map((t) => (t.id === todoId ? { ...t, completed: !t.completed } : t)),
        };
      })
    );
  };

  const handleDeleteTodo = (examId: string, todoId: string) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id !== examId) return e;
        return {
          ...e,
          todos: e.todos.filter((t) => t.id !== todoId),
        };
      })
    );
  };

  // --- Course Handlers ---
  const handleAddCourse = (code: string, name: string) => {
    const newCourse: Course = {
      id: 'crs_' + Date.now(),
      code,
      name,
      entries: [],
    };
    setCourses((prev) => [...prev, newCourse]);
    setActiveCourseId(newCourse.id);
    showToast(`"${name}" dersi eklendi.`);
  };

  const handleDeleteCourse = (id: string) => {
    setCourses((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeCourseId === id) {
        setActiveCourseId(filtered[0]?.id || null);
      }
      return filtered;
    });
    showToast('Ders ve notları silindi.');
  };

  const handleAddEntry = (courseId: string, title: string, date: string, content: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          entries: [
            { id: 'ent_' + Date.now(), title, date, content },
            ...c.entries,
          ],
        };
      })
    );
  };

  const handleDeleteEntry = (courseId: string, entryId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          entries: c.entries.filter((ent) => ent.id !== entryId),
        };
      })
    );
    showToast('Ders notu silindi.');
  };

  // --- Theory Handlers ---
  const handleAddTheory = (newCardData: Omit<TheoryCard, 'id'>) => {
    const card: TheoryCard = { ...newCardData, id: 'th_' + Date.now() };
    setTheories((prev) => [card, ...prev]);
  };

  const handleDeleteTheory = (id: string) => {
    setTheories((prev) => prev.filter((t) => t.id !== id));
    showToast('Teori alıntısı kasadan silindi.');
  };

  const handleNewJurySession = (session: JurySession) => {
    setJurySessions((prev) => [session, ...prev]);
    setActiveJurySessionId(session.id);
  };

  const handleUpdateJurySession = (updated: JurySession) => {
    setJurySessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteJurySession = (id: string) => {
    setJurySessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (activeJurySessionId === id) {
        setActiveJurySessionId(filtered[0]?.id || null);
      }
      return filtered;
    });
    showToast('Jüri savunma oturumu silindi.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'exams' && (
          <ExamsView
            exams={exams}
            onAddExam={handleAddExam}
            onDeleteExam={handleDeleteExam}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            courses={courses}
            activeCourseId={activeCourseId}
            onSelectCourse={setActiveCourseId}
            onAddCourse={handleAddCourse}
            onDeleteCourse={handleDeleteCourse}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'vault' && (
          <TheoryVaultView
            theories={theories}
            onAddTheory={handleAddTheory}
            onDeleteTheory={handleDeleteTheory}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'focus' && (
          <FocusView
            onAddTheory={handleAddTheory}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'jury' && (
          <SocraticJuryView
            sessions={jurySessions}
            activeSessionId={activeJurySessionId}
            courses={courses}
            onSelectSession={setActiveJurySessionId}
            onNewSession={handleNewJurySession}
            onUpdateSession={handleUpdateJurySession}
            onDeleteSession={handleDeleteJurySession}
            onAddTheory={handleAddTheory}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-main)] bg-[var(--bg-surface)] py-4 px-6 text-xs text-[var(--text-muted)] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span>SemioCraft</span>
            <span className="mx-2">·</span>
            <span>Sosyal Bilimler & İletişim Lisansüstü Çalışma Pusulası</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono-code text-[var(--accent)]">
            <span>✦ Google Gemini 3.8 Flash Sokratik Savunma Sistemi</span>
          </div>
        </div>
      </footer>

      {/* Global Toast */}
      <Toast message={toastMessage} isVisible={isToastVisible} />
    </div>
  );
}
