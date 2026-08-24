import { Reader } from './components/Reader';
import { TimingIndex } from './lib/timing';
import type { ChapterData } from './state/types';
import './App.css';

// Demo data - in real app, this would be loaded from API
const demoChapter: ChapterData = {
  index: 0,
  title: 'Chapter 1',
  paragraphs: [
    'This is the first sentence of the audiobook.',
    'Here is the second sentence for testing.',
    'The third sentence demonstrates the scroll sync.',
    'Fourth sentence shows how audio highlights work.',
    'Fifth sentence completes this demo paragraph.',
    'Now we continue with more content.',
    'Each sentence gets highlighted as audio plays.',
    'You can scroll freely and audio will follow.',
    'The intersection observer detects visible sentences.',
    'This approach avoids manual scroll calculations.',
    'Click any sentence to seek audio to that point.',
    'The controls let you play, pause, and change speed.',
    'Enjoy this simpler audiobook reading experience!',
  ],
  timings: new TimingIndex({
    chapter: 0,
    sentences: [
      [0, 0, 2],
      [1, 2, 4],
      [2, 4, 6],
      [3, 6, 8],
      [4, 8, 10],
      [5, 10, 12],
      [6, 12, 14],
      [7, 14, 16],
      [8, 16, 18],
      [9, 18, 20],
      [10, 20, 22],
      [11, 22, 24],
      [12, 24, 26],
    ],
    words: [
      [0, 0, 0, 0.5],
      [0, 1, 0.5, 1],
      [1, 0, 2, 2.5],
      [1, 1, 2.5, 3],
      [2, 0, 4, 4.5],
      [2, 1, 4.5, 5],
      [3, 0, 6, 6.5],
      [3, 1, 6.5, 7],
      [4, 0, 8, 8.5],
      [4, 1, 8.5, 9],
      [5, 0, 10, 10.5],
      [5, 1, 10.5, 11],
      [6, 0, 12, 12.5],
      [6, 1, 12.5, 13],
      [7, 0, 14, 14.5],
      [7, 1, 14.5, 15],
      [8, 0, 16, 16.5],
      [8, 1, 16.5, 17],
      [9, 0, 18, 18.5],
      [9, 1, 18.5, 19],
      [10, 0, 20, 20.5],
      [10, 1, 20.5, 21],
      [11, 0, 22, 22.5],
      [11, 1, 22.5, 23],
      [12, 0, 24, 24.5],
      [12, 1, 24.5, 25],
    ],
  }),
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Demo audio
};

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>📚 Audiobook Reader</h1>
        <p>Scroll-only reader with audio sync</p>
      </header>
      <Reader chapter={demoChapter} />
    </div>
  );
}

export default App;
