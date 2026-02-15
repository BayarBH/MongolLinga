export interface WordItem {
  id: string;
  english: string;
  mongolian: string; // The definition in traditional mongolian
  example?: string;
}

export type ViewState = 'home' | 'study' | 'review' | 'settings';
export type WordCategory = 'General' | 'IELTS' | 'TOEFL' | 'Business' | 'Travel';

export interface AppState {
  apiKey: string | null;
  currentView: ViewState;
  words: WordItem[];
  learnedCount: number;
  dailyGoal: number;
  reviewCount: number;
  reviewTotal: number;
  selectedCategory: WordCategory;
}