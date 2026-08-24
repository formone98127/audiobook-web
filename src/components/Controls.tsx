import { type AudioPlayer } from '../lib/audio';
import './Controls.css';

interface ControlsProps {
  player: AudioPlayer | null;
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
}

const SPEEDS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export function Controls({ player, isPlaying, speed, onPlayPause, onSpeedChange }: ControlsProps) {
  const cycleSpeed = () => {
    const currentIndex = SPEEDS.indexOf(speed);
    const nextIndex = (currentIndex + 1) % SPEEDS.length;
    onSpeedChange(SPEEDS[nextIndex]);
    player?.setPlaybackRate(SPEEDS[nextIndex]);
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 0 || !Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="controls">
      <div className="progress-info">
        <span className="time-current">{formatTime(player?.currentTime ?? 0)}</span>
        <span className="time-divider">/</span>
        <span className="time-total">{formatTime(player?.duration ?? 0)}</span>
      </div>

      <div className="buttons">
        <button
          className="btn-play"
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          className="btn-speed"
          onClick={cycleSpeed}
          aria-label={`Speed: ${speed}x`}
        >
          {speed}×
        </button>
      </div>
    </div>
  );
}
