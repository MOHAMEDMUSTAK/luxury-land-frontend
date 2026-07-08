import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Custom hook for IntersectionObserver — used for infinite scroll and lazy visibility.
 * Returns [ref, isIntersecting] tuple.
 */
export function useIntersectionObserver({
  threshold = 0,
  rootMargin = '200px',
  triggerOnce = false,
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsIntersecting(entry.isIntersecting);
          if (entry.isIntersecting && triggerOnce) {
            observer.unobserve(node);
          }
        },
        { threshold, rootMargin }
      );
      observer.observe(node);
      observerRef.current = observer;
    }

    targetRef.current = node;
  }, [threshold, rootMargin, triggerOnce]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [setRef, isIntersecting] as const;
}
