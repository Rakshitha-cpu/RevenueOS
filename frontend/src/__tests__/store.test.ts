import { describe, it, expect, beforeEach } from 'vitest';
import { useRevenueStore } from '../store/useRevenueStore';
import { formatINR } from '../utils/formatters';

describe('Zustand Modular Store Suite', () => {
  it('should initialize with standard metrics', () => {
    const state = useRevenueStore.getState ? useRevenueStore.getState() : (useRevenueStore as any)();
    expect(state.metrics.totalSimulated).toBe(200);
    expect(state.metrics.upliftPercentage).toBe(31.4);
    expect(state.activeScenario).toBe('BANK_OUTAGE');
  });

  it('should format INR currency strings correctly', () => {
    expect(formatINR(4650)).toBe('₹4,650');
    expect(formatINR(1050000)).toBe('₹10,50,000');
    expect(formatINR(0)).toBe('₹0');
  });
});
