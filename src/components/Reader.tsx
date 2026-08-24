import { useReducer, useRef, useEffect, useCallback } from 'react';
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

  const playerRef = useRef<AudioPlayer | null>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize audio player
  useEffect(() => {
    const player = new AudioPlayer(chapter.audioUrl, chapter.timings);
    playerRef.current = player;

    // Set initial speed
    player.setPlaybackRate(state.speed);

    return () => {
      player.dispose();
    };
  }, [chapter.audioUrl, chapter.timings]);

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
    enabled: !state.isUserScrolling, // Disable during user scroll
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
    if (!playerRef.current) return;

    if (state.status === 'playing') {
      playerRef.current.pause();
      dispatch({ type: 'PAUSE' });
    } else {
      await playerRef.current.play();
      dispatch({ type: 'PLAY' });
    }
  }, [state.status]);

  // Speed change handler
  const handleSpeedChange = useCallback((speed: number) => {
    dispatch({ type: 'SET_SPEED', speed });
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
