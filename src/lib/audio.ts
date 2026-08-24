import type { TimingIndex } from './timing';

export class AudioPlayer {
  private synthesis: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private timingIndex: TimingIndex | null = null;
  private isPlaying: boolean = false;
  private onEndCallback: (() => void) | null = null;
  private currentTimeInternal: number = 0;
  private durationInternal: number = 30; // Default 30 seconds for chapter
  private playbackRateInternal: number = 1;
  private sentenceIndexInternal: number = 0;
  private sentences: string[] = [];

  constructor(audioUrl: string, timingIndex: TimingIndex | null = null) {
    // Use Web Speech API as fallback - works in all browsers without CORS
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
    this.timingIndex = timingIndex;
    console.log('AudioPlayer: Using Web Speech API (Text-to-Speech)');
  }

  get audioElement(): HTMLAudioElement | null {
    return null; // Not using audio element
  }

  get currentTime(): number {
    return this.currentTimeInternal;
  }

  get duration(): number {
    return this.durationInternal;
  }

  get paused(): boolean {
    return !this.isPlaying;
  }

  setPlaybackRate(rate: number): void {
    this.playbackRateInternal = rate;
    // Update rate if currently speaking
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
      this.speakCurrentSentence();
    }
  }

  async play(): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Speech synthesis not supported');
    }

    if (this.isPlaying) return;

    this.isPlaying = true;
    this.speakCurrentSentence();
  }

  pause(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.isPlaying = false;
  }

  seekTo(time: number): void {
    // Convert time to sentence index
    if (this.timingIndex) {
      const sentenceIndex = this.timingIndex.sentenceAt(time);
      if (sentenceIndex >= 0) {
        this.sentenceIndexInternal = Math.min(sentenceIndex, this.sentences.length - 1);
        this.currentTimeInternal = time;
      }
    }

    // If playing, restart from new position
    if (this.isPlaying) {
      this.synthesis?.cancel();
      this.speakCurrentSentence();
    }
  }

  private speakCurrentSentence(): void {
    if (!this.synthesis || this.sentenceIndexInternal >= this.sentences.length) {
      this.isPlaying = false;
      this.onEndCallback?.();
      return;
    }

    const text = this.sentences[this.sentenceIndexInternal];
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = this.playbackRateInternal;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to get a good English voice
    const voices = this.synthesis.getVoices();
    const englishVoice = voices.find(v =>
      v.lang.startsWith('en-') && v.name.includes('Google') || v.name.includes('Natural')
    );
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Move to next sentence when done
    utterance.onend = () => {
      this.sentenceIndexInternal++;
      this.currentTimeInternal = this.timingIndex?.timeAtSentence(this.sentenceIndexInternal) ?? this.currentTimeInternal + 2;

      if (this.isPlaying && this.sentenceIndexInternal < this.sentences.length) {
        this.speakCurrentSentence();
      } else {
        this.isPlaying = false;
        this.onEndCallback?.();
      }
    };

    this.synthesis.speak(utterance);
  }

  /** Get current sentence index from audio time */
  getCurrentSentence(): number {
    return this.sentenceIndexInternal;
  }

  /** Get start time for a given sentence index */
  timeAtSentence(sentenceIndex: number): number | null {
    return this.timingIndex?.timeAtSentence(sentenceIndex) ?? null;
  }

  /** Get start time for a given flat word index */
  timeAtFlatWord(flat: number): number | null {
    return this.timingIndex?.timeAtFlatWord(flat) ?? null;
  }

  /** Calculate progress (0-1) */
  getProgress(): number {
    if (this.durationInternal === 0) return 0;
    return this.currentTimeInternal / this.durationInternal;
  }

  /** Set timing index (can be updated after loading) */
  setTimingIndex(timingIndex: TimingIndex): void {
    this.timingIndex = timingIndex;
  }

  /** Set sentences for TTS */
  setSentences(sentences: string[]): void {
    this.sentences = sentences;
    this.durationInternal = sentences.length * 2; // Approx 2 seconds per sentence
  }

  /** Clean up resources */
  dispose(): void {
    this.pause();
    this.synthesis = null;
  }

  /** Check if audio is ready to play */
  isReady(): boolean {
    return this.synthesis !== null && this.sentences.length > 0;
  }

  /** Set on end callback */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }
}
