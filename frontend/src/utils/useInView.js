import { useEffect, useState, useRef } from 'react';

export function useInView({ triggerOnce = false, threshold = 0 } = {}) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.unobserve(el);
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => {
      if (el && !triggerOnce) {
        observer.unobserve(el);
      }
    };
  }, [triggerOnce, threshold]);

  return { ref, inView };
}
