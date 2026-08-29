import { describe, it, expect } from 'vitest';
import { formatINR, calculateUplift, sanitizeMaskedVPA } from '../src/utils/formatters';

describe('Frontend Formatter & Uplift Calculation Suite', () => {
  it('correctly formats amounts into Indian Rupees (INR)', () => {
    const formatted = formatINR(1050000);
    expect(formatted).toContain('10,50,000');
  });

  it('calculates percentage uplift accurately', () => {
    // 18.0 baseline vs 31.4 recovery
    const uplift = calculateUplift(180000, 314000);
    expect(uplift).toBe(74.4);
  });

  it('masks sensitive VPA customer identifiers for compliance', () => {
    const masked = sanitizeMaskedVPA('rakshitha@okaxis');
    expect(masked).toBe('ra*******@okaxis');
  });
});
