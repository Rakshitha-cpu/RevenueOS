import test from 'node:test';
import assert from 'node:assert/strict';
import { formatINR } from '../utils/formatters';
import { SCENARIO_EVENTS } from '../store/slices/scenarioSlice';
import { INITIAL_METRICS } from '../store/slices/metricsSlice';

test('RevenueOS Frontend Store & Slices Suite', (t) => {
  assert.equal(INITIAL_METRICS.totalSimulated, 200);
  assert.equal(INITIAL_METRICS.upliftPercentage, 31.4);
  assert.ok(SCENARIO_EVENTS.BANK_OUTAGE.length > 0);
  assert.equal(formatINR(4650), '₹4,650');
  assert.equal(formatINR(1050000), '₹10,50,000');
});
