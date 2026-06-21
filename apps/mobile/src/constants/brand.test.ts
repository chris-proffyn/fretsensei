import {
  DEVELOPER_ATTRIBUTION,
  DPA_STUDIO_NAME,
  MODEWISE_LOADING_LABEL,
} from '../constants/brand';

describe('brand constants', () => {
  it('defines the DontPanicApps studio name', () => {
    expect(DPA_STUDIO_NAME).toBe('DontPanicApps');
  });

  it('defines the ModeWise loading label', () => {
    expect(MODEWISE_LOADING_LABEL).toBe('Loading...');
  });

  it('includes DontPanicApps developer attribution', () => {
    expect(DEVELOPER_ATTRIBUTION).toBe(
      'Developed by the DontPanicApps team',
    );
  });
});
