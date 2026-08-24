import { useReducer, useRef, useEffect, useCallback, useState } from 'react';
import { Sentence } from './Sentence';
import { Controls } from './Controls';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useAudioSync } from '../hooks/useAudioSync';
import { reducer, initialState } from '../state/reducer';
import type { Action, ChapterData } from '../state/types';
import { AudioPlayer } from '../lib/audio';
import './Reader.css';

interface ReaderProps {
  chapter: ChapterData;
}

export function Reader({ chapter }: ReaderProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    status: 'ready',
    chapter,
    totalSentences: chapter.paragraphs.length,
  });

  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize audio player
  useEffect(() => {
    console.log('Initializing audio with URL:', chapter.audioUrl);
    const player = new AudioPlayer(chapter.audioUrl, chapter.timings);
    playerRef.current = player;

    // Set initial speed
    player.setPlaybackRate(state.speed);

    // Check if audio loads
    const audio = player.audioElement;

    const handleCanPlay = () => {
      console.log('Audio is ready to play');
      setAudioReady(true);
    };

    const handleError = (e: Event) => {
      console.error('Audio failed to load:', e);
      setAudioError('Failed to load audio. Please check if the audio file is accessible.');
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      player.dispose();
    };
  }, [chapter.audioUrl, chapter.timings, state.speed]);

  // Handle scroll start (user begins scrolling)
  const handleScrollStart = useCallback(() => {
    dispatch({ type: 'USER_SCROLL_START' });
  }, []);

  // Handle scroll spy detecting visible sentence
  const handleSentenceChange = useCallback((index: number) => {
    if (state.isUserScrolling) {
      // Clear any pending seek
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounced seek after user stops scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'USER_SCROLL_END', sentenceIndex: index });

        // Seek audio to new position
        const time = playerRef.current?.timeAtSentence(index);
        if (time !== null && playerRef.current) {
          playerRef.current.seekTo(time);
        }
      }, 500);
    }
  }, [state.isUserScrolling]);

  // Set up scroll spy
  useScrollSpy(sentenceRefs.current, {
    onSentenceChange: handleSentenceChange,
  });

  // Audio sync (unidirectional: audio → UI)
  useAudioSync({
    player: playerRef.current,
    enabled: !state.isUserScrolling && audioReady, // Disable during user scroll or if not ready
    onSentenceChange: (sentenceIndex, audioTime) => {
      dispatch({ type: 'AUDIO_TIME_UPDATE', sentenceIndex, audioTime });

      // Auto-scroll to keep current sentence in view
      const currentEl = sentenceRefs.current[sentenceIndex];
      if (currentEl && !state.isUserScrolling) {
        currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
  });

  // Play/Pause handler
  const handlePlayPause = useCallback(async () => {
    if (!playerRef.current || !audioReady) {
      console.error('Cannot play: audio not ready');
      return;
    }

    if (state.status === 'playing') {
      playerRef.current.pause();
      dispatch({ type: 'PAUSE' });
    } else {
      try {
        await playerRef.current.play();
        dispatch({ type: 'PLAY' });
      } catch (error) {
        console.error('Failed to play:', error);
        setAudioError('Failed to play audio. Click the play button again.');
      }
    }
  }, [state.status, audioReady]);

  // Speed change handler
  const handleSpeedChange = useCallback((speed: number) => {
    dispatch({ type: 'SET_SPEED', speed });
    playerRef.current?.setPlaybackRate(speed);
  }, []);

  // Click on sentence to seek
  const handleSentenceClick = useCallback((index: number) => {
    const time = playerRef.current?.timeAtSentence(index);
    if (time !== null && playerRef.current) {
      playerRef.current.seekTo(time);
      dispatch({ type: 'SEEK', sentenceIndex: index });
    }
  }, []);

  return (
    <div className="reader" onScroll={handleScrollStart}>
      <div className="sentences">
        {audioError && (
          <div className="error-message">
            {audioError}
          </div>
        )}
        {!audioReady && !audioError && (
          <div className="loading-message">
            Loading audio...
          </div>
        )}
        {chapter.paragraphs.map((text, i) => (
          <Sentence
            key={i}
            ref={el => sentenceRefs.current[i] = el}
            text={text}
            index={i}
            isCurrent={i === state.currentSentence}
            onClick={() => handleSentenceClick(i)}
          />
        ))}
      </div>

      <Controls
        player={playerRef.current}
        isPlaying={state.status === 'playing'}
        speed={state.speed}
        onPlayPause={handlePlayPause}
        onSpeedChange={handleSpeedChange}
      />
    </div>
  );
}
