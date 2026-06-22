import type {
  GuideFilterOptions,
  GuideSection,
  GuideTier,
  HomeAction,
  HomeEntitlement,
} from './types';

const TIER_RANK: Record<GuideTier, number> = {
  free: 0,
  plus: 1,
  pro: 2,
};

function tierAllowsAccess(sectionTier: GuideTier | undefined, userTier: GuideTier): boolean {
  if (!sectionTier) {
    return true;
  }

  return TIER_RANK[sectionTier] <= TIER_RANK[userTier];
}

function platformMatches(
  sectionPlatform: GuideFilterOptions['platform'] | undefined,
  userPlatform: GuideFilterOptions['platform'],
): boolean {
  if (!sectionPlatform || sectionPlatform === 'all') {
    return true;
  }

  return sectionPlatform === userPlatform;
}

export function canAccessAction(
  action: HomeAction,
  entitlements: HomeEntitlement[] = [],
): boolean {
  if (!action.requiredEntitlement) {
    return true;
  }

  return entitlements.includes(action.requiredEntitlement);
}

export function getVisibleHomeActions(
  actions: HomeAction[],
  entitlements: HomeEntitlement[] = [],
): HomeAction[] {
  return actions.filter(
    (action) => action.visible && action.enabled && canAccessAction(action, entitlements),
  );
}

export function filterGuideSections(
  sections: GuideSection[],
  options: GuideFilterOptions,
): GuideSection[] {
  return sections.filter(
    (section) =>
      tierAllowsAccess(section.tier, options.tier) &&
      platformMatches(section.platform, options.platform),
  );
}
