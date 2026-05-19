import { describe, it, expect } from 'vitest';
import { formatCurrency } from './format';

describe('formatCurrency', () => {
  it('formats number 0 as $0.00', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats 12.5 as $12.50', () => {
    expect(formatCurrency(12.5)).toBe('$12.50');
    expect(formatCurrency('12.50')).toBe('$12.50');
  });

  it('NaN-safe', () => {
    expect(formatCurrency(NaN)).toBe('$0.00');
    expect(formatCurrency('not-a-number')).toBe('$0.00');
  });
});
