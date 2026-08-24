import type { TimingIndex } from './timing';

export class AudioPlayer {
  private audio: HTMLAudioElement;
  private timingIndex: TimingIndex | null = null;

  constructor(audioUrl: string, timingIndex: TimingIndex | null = null) {
    this.audio = new Audio(audioUrl);
    this.audio.crossOrigin = 'anonymous'; // Handle CORS for external audio
    this.timingIndex = timingIndex;

    // Add error handling
    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e, this.audio.error);
    });

    this.audio.addEventListener('canplay', () => {
      console.log('Audio can play:', audioUrl);
    });

    this.audio.addEventListener('loadstart', () => {
      console.log('Audio loading:', audioUrl);
    });
  }

  get audioElement(): HTMLAudioElement {
    return this.audio;
  }

  get currentTime(): number {
    return this.audio.currentTime;
  }

  get duration(): number {
    return this.audio.duration || 0;
  }

  get paused(): boolean {
    return this.audio.paused;
  }

  setPlaybackRate(rate: number): void {
    this.audio.playbackRate = rate;
  }

  async play(): Promise<void> {
    console.log('Attempting to play audio...');
    try {
      await this.audio.play();
      console.log('Audio playing successfully');
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  pause(): void {
    this.audio.pause();
  }

  seekTo(time: number): void {
    this.audio.currentTime = Math.max(0, Math.min(time, this.duration));
  }

  /** Get current sentence index from audio time */
  getCurrentSentence(): number {
    if (!this.timingIndex) return 0;
    const sentence = this.timingIndex.sentenceAt(this.audio.currentTime);
    return sentence >= 0 ? sentence : 0;
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
    if (this.duration === 0) return 0;
    return this.audio.currentTime / this.duration;
  }

  /** Set timing index (can be updated after loading) */
  setTimingIndex(timingIndex: TimingIndex): void {
    this.timingIndex = timingIndex;
  }

  /** Clean up resources */
  dispose(): void {
    this.audio.pause();
    this.audio.src = '';
  }

  /** Check if audio is ready to play */
  isReady(): boolean {
    return this.audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA;
  }
}
