import { forwardRef } from 'react';
import './Sentence.css';

interface SentenceProps {
  text: string;
  index: number;
  isCurrent: boolean;
  onClick?: () => void;
}

export const Sentence = forwardRef<HTMLDivElement, SentenceProps>(
  ({ text, index, isCurrent, onClick }, ref) => {
    return (
      <div
        ref={ref}
        className={`sentence ${isCurrent ? 'current' : ''}`}
        data-index={index}
        onClick={onClick}
      >
        {text}
      </div>
    );
  }
);

Sentence.displayName = 'Sentence';
