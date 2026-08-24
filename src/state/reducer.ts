import type { ReaderState, Action } from './types';

const initialState: ReaderState = {
  status: 'loading',
  chapter: null,
  currentSentence: 0,
  totalSentences: 0,
  audioTime: 0,
  duration: 0,
  isUserScrolling: false,
  speed: 1.0,
  fontSize: 18,
  error: null,
};

export function reducer(state: ReaderState, action: Action): ReaderState {
  switch (action.type) {
    case 'CHAPTER_LOADED':
      return {
        ...state,
        status: 'ready',
        chapter: action.chapter,
        totalSentences: action.chapter.paragraphs.length,
        currentSentence: 0,
        error: null,
      };

    case 'AUDIO_TIME_UPDATE':
      // Only update if not user scrolling (unidirectional flow)
      if (state.isUserScrolling) return state;
      return {
        ...state,
        currentSentence: action.sentenceIndex,
        audioTime: action.audioTime,
      };

    case 'USER_SCROLL_START':
      return {
        ...state,
        isUserScrolling: true,
      };

    case 'USER_SCROLL_END':
      return {
        ...state,
        isUserScrolling: false,
        currentSentence: action.sentenceIndex,
      };

    case 'PLAY':
      return {
        ...state,
        status: 'playing',
      };

    case 'PAUSE':
      return {
        ...state,
        status: 'paused',
      };

    case 'SET_SPEED':
      return {
        ...state,
        speed: action.speed,
      };

    case 'SET_FONT_SIZE':
      return {
        ...state,
        fontSize: action.fontSize,
      };

    case 'SEEK':
      return {
        ...state,
        currentSentence: action.sentenceIndex,
      };

    case 'ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error,
      };

    default:
      return state;
  }
}

export { initialState };
