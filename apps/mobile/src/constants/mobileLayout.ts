import type { ModalProps } from 'react-native';

/** Match post-launch landscape lock — RN Modal defaults to portrait on iOS. */
export const LANDSCAPE_MODAL_ORIENTATIONS: NonNullable<
  ModalProps['supportedOrientations']
> = ['landscape-left', 'landscape-right'];
