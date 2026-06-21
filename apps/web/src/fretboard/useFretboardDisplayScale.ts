import { useEffect, useState, type RefObject } from 'react';
import { computeFretboardDisplayScale } from './displayMetrics';

export function useFretboardDisplayScale(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!enabled) {
      setScale(1);
      return;
    }

    const node = containerRef.current;
    if (!node) {
      return;
    }

    const update = () => {
      const { width, height } = node.getBoundingClientRect();
      setScale(computeFretboardDisplayScale(width, height));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, [containerRef, enabled]);

  return scale;
}
