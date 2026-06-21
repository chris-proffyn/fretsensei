import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  computeMobileFretLayout,
  type FretLayoutMetrics,
  type MobileLayout,
} from './mobileLayoutMetrics';

export type { FretLayoutMetrics, MobileLayout };

export function useMobileLayout(): MobileLayout {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const contentWidth = width - insets.left - insets.right;
    const contentHeight = height - insets.top - insets.bottom;

    return computeMobileFretLayout(contentWidth, contentHeight);
  }, [
    height,
    insets.bottom,
    insets.left,
    insets.right,
    insets.top,
    width,
  ]);
}
