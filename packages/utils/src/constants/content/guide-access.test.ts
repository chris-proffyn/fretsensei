import { HOME_ACTIONS } from './home-content';
import { HOW_TO_GUIDE_SECTIONS } from './how-to-guide';
import {
  canAccessAction,
  filterGuideSections,
  getVisibleHomeActions,
} from './guide-access';
import type { GuideSection, HomeAction } from './types';

describe('guide access helpers', () => {
  it('returns all v1 guide sections for free tier on web and mobile', () => {
    expect(
      filterGuideSections(HOW_TO_GUIDE_SECTIONS, { platform: 'web', tier: 'free' }),
    ).toHaveLength(HOW_TO_GUIDE_SECTIONS.length);
    expect(
      filterGuideSections(HOW_TO_GUIDE_SECTIONS, { platform: 'mobile', tier: 'free' }),
    ).toHaveLength(HOW_TO_GUIDE_SECTIONS.length);
  });

  it('filters platform-specific sections', () => {
    const sections: GuideSection[] = [
      {
        id: 'all-platforms',
        title: 'All',
        body: [{ type: 'paragraph', text: 'Shared' }],
        platform: 'all',
      },
      {
        id: 'web-only',
        title: 'Web',
        body: [{ type: 'paragraph', text: 'Web only' }],
        platform: 'web',
      },
      {
        id: 'mobile-only',
        title: 'Mobile',
        body: [{ type: 'paragraph', text: 'Mobile only' }],
        platform: 'mobile',
      },
    ];

    expect(filterGuideSections(sections, { platform: 'web', tier: 'free' }).map((s) => s.id)).toEqual(
      ['all-platforms', 'web-only'],
    );
    expect(
      filterGuideSections(sections, { platform: 'mobile', tier: 'free' }).map((s) => s.id),
    ).toEqual(['all-platforms', 'mobile-only']);
  });

  it('filters sections above the user tier', () => {
    const sections: GuideSection[] = [
      {
        id: 'free',
        title: 'Free',
        body: [{ type: 'paragraph', text: 'Free' }],
        tier: 'free',
      },
      {
        id: 'plus',
        title: 'Plus',
        body: [{ type: 'paragraph', text: 'Plus' }],
        tier: 'plus',
      },
    ];

    expect(filterGuideSections(sections, { platform: 'all', tier: 'free' }).map((s) => s.id)).toEqual(
      ['free'],
    );
    expect(filterGuideSections(sections, { platform: 'all', tier: 'plus' }).map((s) => s.id)).toEqual(
      ['free', 'plus'],
    );
  });

  it('returns visible enabled home actions for anonymous users', () => {
    expect(getVisibleHomeActions(HOME_ACTIONS)).toEqual(HOME_ACTIONS);
  });

  it('hides actions that are not visible or enabled', () => {
    const actions: HomeAction[] = [
      {
        id: 'visible',
        label: 'Visible',
        route: '/practice',
        variant: 'primary',
        enabled: true,
        visible: true,
      },
      {
        id: 'hidden',
        label: 'Hidden',
        route: '/hidden',
        variant: 'primary',
        enabled: true,
        visible: false,
      },
      {
        id: 'disabled',
        label: 'Disabled',
        route: '/disabled',
        variant: 'primary',
        enabled: false,
        visible: true,
      },
    ];

    expect(getVisibleHomeActions(actions).map((action) => action.id)).toEqual(['visible']);
  });

  it('requires matching entitlements for gated actions', () => {
    const gatedAction: HomeAction = {
      id: 'pro-drills',
      label: 'Pro Drills',
      route: '/pro-drills',
      variant: 'primary',
      requiredEntitlement: 'pro',
      enabled: true,
      visible: true,
    };

    expect(canAccessAction(gatedAction)).toBe(false);
    expect(canAccessAction(gatedAction, ['plus'])).toBe(false);
    expect(canAccessAction(gatedAction, ['pro'])).toBe(true);
    expect(getVisibleHomeActions([gatedAction])).toEqual([]);
    expect(getVisibleHomeActions([gatedAction], ['pro'])).toEqual([gatedAction]);
  });
});
