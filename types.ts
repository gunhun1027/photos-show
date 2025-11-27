export interface AIAnalysis {
  title: string;
  description: string;
  mood: string;
  tags: string[];
}

export type PrivacyLevel = 'public' | 'private';

export interface Photo {
  id: string;
  url: string;
  file?: File; // File is optional because cloud photos don't have a local File object
  timestamp: number;
  width?: number;
  height?: number;
  analysis?: AIAnalysis;
  isAnalyzing: boolean;
  error?: string;
  privacy: PrivacyLevel;
}

export enum ViewMode {
  GRID = 'GRID',
  MASONRY = 'MASONRY'
}

export type Language = 'en' | 'zh';