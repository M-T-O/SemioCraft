import React from 'react';
import { 
  Calendar, 
  BookOpen, 
  BookMarked, 
  Timer, 
  Sparkles, 
  Sun, 
  Moon, 
  Download, 
  Upload 
} from 'lucide-react';
import { Theme } from '../types.ts';

interface HeaderProps {
  activeTab: 'exams' | 'courses' | 'vault' | 'focus' | 'jury';
  setActiveTab: (tab: 'exams' | 'courses' | 'vault' | 'focus' | 'jury') => void;
  theme: Theme;
  onToggleTheme: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  onToggleTheme,
  onExportData,
  onImportData,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'exams' as const, label: 'Sınav & Teslim Takvimi', icon: Calendar },
    { id: 'courses' as const, label: 'Dersler ve Notlar', icon: BookOpen },
    { id: 'vault' as const, label: 'Teori & Alıntılar Kasası', icon: BookMarked },
    { id: 'focus' as const, label: 'Okuma & Feynman', icon: Timer },
    { id: 'jury' as const, label: 'Sokratik Tez Jürisi', icon: Sparkles, isAi: true },
  ];

  return (
    <header className="sticky top-0 z-40 border-b transition-colors duration-200 backdrop-blur-md bg-[var(--bg-surface)]/90 border-[var(--border-main)] px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5">
        
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              §
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
                  SemioCraft
                </span>
                <span className="text-[11px] font-mono-code font-semibold px-2 py-0.5 rounded border border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent-subtle)]">
                  LİSANSÜSTÜ
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">
                Sosyal Bilimler & İletişim Akademik Çalışma İstasyonu
              </p>
            </div>
          </div>

          {/* Quick mobile theme toggle */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg border border-[var(--border-main)] hover:border-[var(--accent)] text-[var(--text-secondary)] transition-colors"
              title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.isAi ? 'text-violet-500' : 'text-[var(--text-muted)]'}`} />
                <span>{tab.label}</span>
                {tab.isAi && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium border-[var(--border-main)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] transition-colors"
            title={theme === 'dark' ? 'Açık Editoryal Temaya Geç' : 'Koyu Çalışma İstasyonuna Geç'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Açık Tema</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-violet-600" />
                <span>Koyu Tema</span>
              </>
            )}
          </button>

          {/* Export JSON */}
          <button
            onClick={onExportData}
            className="p-2 rounded-lg border border-[var(--border-main)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] transition-colors"
            title="Tüm Veriyi JSON Olarak İndir (Yedek)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg border border-[var(--border-main)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] transition-colors"
            title="Yedek JSON Dosyası Yükle"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            className="hidden"
            onChange={onImportData}
          />
        </div>

      </div>
    </header>
  );
};
