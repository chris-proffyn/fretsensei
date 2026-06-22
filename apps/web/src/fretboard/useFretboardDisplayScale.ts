import { useEffect, useState, type RefObject } from 'react';
import {
  computeFretboardDisplayScale,
  computeFretboardFillWidthScale,
} from './displayMetrics';

export type FretboardDisplayScaleMode = 'fill-width' | 'fit';

export function useFretboardDisplayScale(
  containerRef: RefObject<HTMLElement | null>,
  mode: FretboardDisplayScaleMode = 'fill-width',
): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const update = () => {
      const { width, height } = node.getBoundingClientRect();
      const nextScale =
        mode === 'fit'
          ? computeFretboardDisplayScale(width, height)
          : computeFretboardFillWidthScale(width);
      setScale(nextScale);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, [containerRef, mode]);

  return scale;
}
