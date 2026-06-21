import { PACKAGE_NAME } from './index';

describe('@fretsensei/utils', () => {
  it('exports package identifier', () => {
    expect(PACKAGE_NAME).toBe('@fretsensei/utils');
  });
});
