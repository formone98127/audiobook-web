import { useEffect, useRef } from 'react';

interface UseScrollSpyOptions {
  threshold?: number;
  rootMargin?: string;
  onSentenceChange: (index: number) => void;
}

/**
 * Hook that uses Intersection Observer to detect which sentence is currently visible.
 * This eliminates manual scroll position calculations and fixed height assumptions.
 */
export function useScrollSpy(
  sentences: (HTMLElement | null)[],
  options: UseScrollSpyOptions
) {
  const { threshold = 0.5, rootMargin = '-30% 0px -60% 0px', onSentenceChange } = options;
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const validSentences = sentences.filter(Boolean) as HTMLElement[];
    if (validSentences.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Only trigger when element is at least 50% visible
          if (entry.isIntersecting && entry.intersectionRatio > threshold) {
            const index = Number(entry.target.dataset.index);
            if (!isNaN(index)) {
              onSentenceChange(index);
            }
          }
        }
      },
      { threshold, rootMargin }
    );

    // Observe all sentence elements
    validSentences.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [sentences, threshold, rootMargin, onSentenceChange]);

  return { isScrolling: isScrollingRef.current };
}
