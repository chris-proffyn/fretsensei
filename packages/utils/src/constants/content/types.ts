export type GuideTier = 'free' | 'plus' | 'pro';

export type GuidePlatform = 'all' | 'web' | 'mobile';

export type GuideBlockTone = 'info' | 'tip' | 'warning';

export type GuideBlockType = 'paragraph' | 'bullets' | 'steps' | 'callout';

export type HomeActionVariant = 'primary' | 'secondary';

export type HomeEntitlement = 'plus' | 'pro';

export interface GuideBlock {
  type: GuideBlockType;
  text?: string;
  items?: string[];
  tone?: GuideBlockTone;
}

export interface GuideSection {
  id: string;
  title: string;
  body: GuideBlock[];
  tier?: GuideTier;
  platform?: GuidePlatform;
}

export interface HomeAction {
  id: string;
  label: string;
  description?: string;
  route: string;
  variant: HomeActionVariant;
  requiredEntitlement?: HomeEntitlement;
  enabled: boolean;
  visible: boolean;
}

export interface HomeSecondaryAction {
  id: string;
  label: string;
  route: string;
  variant: 'secondary';
}

export interface GuideFilterOptions {
  platform: GuidePlatform;
  tier: GuideTier;
}
