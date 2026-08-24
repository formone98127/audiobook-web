// State management types for audiobook reader

export type ReaderStatus = 'loading' | 'ready' | 'playing' | 'paused' | 'error';

export type ReaderState = {
  status: ReaderStatus;
  chapter: ChapterData | null;
  currentSentence: number;
  totalSentences: number;
  audioTime: number;
  duration: number;
  isUserScrolling: boolean;
  speed: number;
  fontSize: number;
  error: string | null;
};

export type ChapterData = {
  index: number;
  title: string;
  paragraphs: string[];
  timings: TimingIndex;
  audioUrl: string;
};

import type { TimingIndex } from '../lib/timing';

export type Action =
  | { type: 'CHAPTER_LOADED'; chapter: ChapterData }
  | { type: 'AUDIO_TIME_UPDATE'; sentenceIndex: number; audioTime: number }
  | { type: 'USER_SCROLL_START' }
  | { type: 'USER_SCROLL_END'; sentenceIndex: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_FONT_SIZE'; fontSize: number }
  | { type: 'SEEK'; sentenceIndex: number }
  | { type: 'ERROR'; error: string };
