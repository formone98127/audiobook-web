import { useEffect } from 'react';
import type { AudioPlayer } from '../lib/audio';

interface UseAudioSyncOptions {
  player: AudioPlayer | null;
  enabled: boolean;
  onSentenceChange: (sentenceIndex: number, audioTime: number) => void;
  updateInterval?: number;
}

/**
 * Hook that syncs audio playback with sentence highlighting.
 * Uses HTML5 Audio timeupdate events instead of polling.
 */
export function useAudioSync(options: UseAudioSyncOptions) {
  const { player, enabled, onSentenceChange, updateInterval = 100 } = options;

  useEffect(() => {
    if (!player || !enabled) return;

    const audio = player.audioElement;

    // Debounced handler to avoid excessive updates
    let lastUpdateTime = 0;
    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastUpdateTime < updateInterval) return;
      lastUpdateTime = now;

      const sentenceIndex = player.getCurrentSentence();
      const audioTime = player.currentTime;
      onSentenceChange(sentenceIndex, audioTime);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [player, enabled, onSentenceChange, updateInterval]);
}
