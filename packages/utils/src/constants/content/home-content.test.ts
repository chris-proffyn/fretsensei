import { HOME_ACTIONS, HOME_CONTENT, HOME_SECONDARY_ACTION } from './home-content';

describe('home content', () => {
  it('exposes required homepage copy fields', () => {
    expect(HOME_CONTENT.headline).toBe('Welcome to ModeWise');
    expect(HOME_CONTENT.body.length).toBeGreaterThan(0);
    expect(HOME_CONTENT.primaryActionLabel).toBe('Mode Practice');
    expect(HOME_CONTENT.secondaryActionLabel).toBe('How to use ModeWise');
    expect(HOME_CONTENT.reassurance.length).toBeGreaterThan(0);
  });

  it('includes a visible enabled Mode Practice action', () => {
    const modePractice = HOME_ACTIONS.find((action) => action.id === 'mode-practice');

    expect(modePractice).toEqual(
      expect.objectContaining({
        label: 'Mode Practice',
        route: '/practice',
        variant: 'primary',
        enabled: true,
        visible: true,
      }),
    );
  });

  it('uses unique homepage action ids', () => {
    const ids = HOME_ACTIONS.map((action) => action.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('exposes a secondary how-to action', () => {
    expect(HOME_SECONDARY_ACTION).toEqual({
      id: 'how-to',
      label: 'How to use ModeWise',
      route: '/how-to',
      variant: 'secondary',
    });
  });
});
