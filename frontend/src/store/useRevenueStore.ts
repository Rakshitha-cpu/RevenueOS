'use client';

import { useSyncExternalStore } from 'react';
import { TraceEvent, BatchMetrics, BankDowntimeInfo, ScenarioType } from './types';
import { SCENARIO_EVENTS } from './slices/scenarioSlice';
import { INITIAL_METRICS } from './slices/metricsSlice';
import { INITIAL_QR_STATE } from './slices/qrSlice';
import { INITIAL_DOWNTIMES } from './slices/downtimeSlice';

export * from './types';
export * from './slices/scenarioSlice';
export * from './slices/metricsSlice';
export * from './slices/qrSlice';
export * from './slices/downtimeSlice';

export interface RevenueState {
  // Trace Execution State (Scenario Slice)
  visibleEventsCount: number;
  isRunning: boolean;
  events: TraceEvent[];
  activeScenario: ScenarioType;
  
  // Batch Metrics State (Metrics Slice)
  metrics: BatchMetrics;
  
  // Bank Downtime State (Downtime Slice)
  activeDowntimes: BankDowntimeInfo[];

  // Dynamic QR Code State (QR Slice)
  qrSecondsRemaining: number;
  qrStatus: 'ACTIVE' | 'PAID' | 'EXPIRED';
  
  // Actions
  startLiveTrace: () => void;
  runScenario: (scenario: ScenarioType) => void;
  resetTrace: () => void;
  simulateQRPayment: () => void;
  decrementQRTimer: () => void;
  updateMetrics: (newMetrics: Partial<BatchMetrics>) => void;
}

// Initial state composition from modular slices
let state: RevenueState = {
  visibleEventsCount: 0,
  isRunning: false,
  events: SCENARIO_EVENTS.BANK_OUTAGE,
  activeScenario: 'BANK_OUTAGE',
  metrics: INITIAL_METRICS,
  activeDowntimes: INITIAL_DOWNTIMES,
  qrSecondsRemaining: INITIAL_QR_STATE.qrSecondsRemaining,
  qrStatus: INITIAL_QR_STATE.qrStatus,

  startLiveTrace: () => {
    state.resetTrace();
    state.runScenario('BANK_OUTAGE');
  },

  runScenario: (scenario: ScenarioType) => {
    if (state.isRunning) return;
    
    state.events = SCENARIO_EVENTS[scenario];
    state.activeScenario = scenario;
    state.visibleEventsCount = 0;
    state.isRunning = true;
    state.qrStatus = 'ACTIVE';
    state.qrSecondsRemaining = 300;
    emitChange();

    let count = 0;
    const total = SCENARIO_EVENTS[scenario].length;

    const interval = setInterval(() => {
      count += 1;
      state.visibleEventsCount = count;
      
      if (count >= total) {
        state.isRunning = false;
        clearInterval(interval);
      }
      emitChange();
    }, 1200);
  },

  resetTrace: () => {
    state.visibleEventsCount = 0;
    state.isRunning = false;
    state.qrStatus = 'ACTIVE';
    state.qrSecondsRemaining = 300;
    emitChange();
  },

  simulateQRPayment: () => {
    state.qrStatus = 'PAID';
    state.metrics = {
      ...state.metrics,
      totalRecovered: state.metrics.totalRecovered + 4650,
      upliftPercentage: Number((state.metrics.upliftPercentage + 0.1).toFixed(1))
    };
    emitChange();
  },

  decrementQRTimer: () => {
    if (state.qrSecondsRemaining > 0 && state.qrStatus === 'ACTIVE') {
      state.qrSecondsRemaining -= 1;
      emitChange();
    } else if (state.qrSecondsRemaining <= 0 && state.qrStatus === 'ACTIVE') {
      state.qrStatus = 'EXPIRED';
      emitChange();
    }
  },

  updateMetrics: (newMetrics: Partial<BatchMetrics>) => {
    state.metrics = { ...state.metrics, ...newMetrics };
    emitChange();
  }
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

const store = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return state;
  }
};

export function useRevenueStore(): RevenueState {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
