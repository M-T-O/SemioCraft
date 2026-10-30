export type Theme = 'dark' | 'light';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Exam {
  id: string;
  code: string;
  title: string;
  date: string;
  todos: TodoItem[];
}

export interface CourseEntry {
  id: string;
  title: string;
  date: string;
  content: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  entries: CourseEntry[];
}

export interface TheoryCard {
  id: string;
  title: string;
  theorist: string;
  source: string;
  quote: string;
  analysis: string;
  tags: string[];
}

export interface JuryFeedback {
  score: number;
  critique: string;
  theoreticalGaps: string[];
  followUpQuestion: string;
  feynmanKeyInsight: string;
}

export interface JuryMessage {
  id: string;
  role: 'jury' | 'student';
  text: string;
  timestamp: string;
  feedback?: JuryFeedback;
}

export interface JurySession {
  id: string;
  title: string;
  school: 'frankfurt' | 'semiotics' | 'cultural_studies' | 'methodology' | 'general_defense';
  level: 'master' | 'phd' | 'bachelor';
  keyThemes: string[];
  messages: JuryMessage[];
  createdAt: string;
}

export interface AppState {
  activeTab: 'exams' | 'courses' | 'vault' | 'focus' | 'jury';
  theme: Theme;
  activeCourseId: string | null;
  exams: Exam[];
  courses: Course[];
  theories: TheoryCard[];
  jurySessions: JurySession[];
  activeJurySessionId: string | null;
}
