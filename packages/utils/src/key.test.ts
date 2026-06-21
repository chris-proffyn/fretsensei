import { getKeyButtonLabel, getSelectedKey } from './music-theory/key';

describe('key selection', () => {
  it('resolves natural D to D', () => {
    expect(getSelectedKey('D', false)).toEqual({ root: 'D', displayLabel: 'D' });
  });

  it('resolves flat D to C# and displays D♭', () => {
    expect(getSelectedKey('D', true)).toEqual({ root: 'C#', displayLabel: 'D♭' });
  });

  it('resolves flat C to B and displays C♭', () => {
    expect(getSelectedKey('C', true)).toEqual({ root: 'B', displayLabel: 'C♭' });
  });

  it('keeps selected natural key when toggling flat labels', () => {
    expect(getKeyButtonLabel('D', false)).toBe('D');
    expect(getKeyButtonLabel('D', true)).toBe('D♭');
  });
});
