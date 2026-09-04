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
  replayCurrentScenario: () => void;
  resetTrace: () => void;
  simulateQRPayment: () => void;
  resetQR: () => void;
  decrementQRTimer: () => void;
  updateMetrics: (newMetrics: Partial<BatchMetrics>) => void;
}

let activeTraceInterval: NodeJS.Timeout | null = null;

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

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
    state.runScenario('BANK_OUTAGE');
  },

  runScenario: (scenario: ScenarioType) => {
    if (activeTraceInterval) {
      clearInterval(activeTraceInterval);
      activeTraceInterval = null;
    }

    const scenarioEvents = SCENARIO_EVENTS[scenario];
    const total = scenarioEvents.length;

    // Set initial active state with first event visible immediately
    state = {
      ...state,
      activeScenario: scenario,
      events: scenarioEvents,
      visibleEventsCount: 1,
      isRunning: true,
      qrStatus: 'ACTIVE',
      qrSecondsRemaining: 300
    };
    emitChange();

    let count = 1;
    activeTraceInterval = setInterval(() => {
      count += 1;
      if (count >= total) {
        if (activeTraceInterval) {
          clearInterval(activeTraceInterval);
          activeTraceInterval = null;
        }
        state = {
          ...state,
          visibleEventsCount: total,
          isRunning: false
        };
      } else {
        state = {
          ...state,
          visibleEventsCount: count,
          isRunning: true
        };
      }
      emitChange();
    }, 900);
  },

  replayCurrentScenario: () => {
    state.runScenario(state.activeScenario);
  },

  resetTrace: () => {
    if (activeTraceInterval) {
      clearInterval(activeTraceInterval);
      activeTraceInterval = null;
    }
    state = {
      ...state,
      visibleEventsCount: 0,
      isRunning: false,
      qrStatus: 'ACTIVE',
      qrSecondsRemaining: 300
    };
    emitChange();
  },

  simulateQRPayment: () => {
    state = {
      ...state,
      qrStatus: 'PAID',
      metrics: {
        ...state.metrics,
        totalRecovered: state.metrics.totalRecovered + 4650,
        upliftPercentage: Number((state.metrics.upliftPercentage + 0.1).toFixed(1))
      }
    };
    emitChange();
  },

  resetQR: () => {
    state = {
      ...state,
      qrStatus: 'ACTIVE',
      qrSecondsRemaining: 300
    };
    emitChange();
  },

  decrementQRTimer: () => {
    if (state.qrStatus === 'ACTIVE') {
      if (state.qrSecondsRemaining > 1) {
        state = {
          ...state,
          qrSecondsRemaining: state.qrSecondsRemaining - 1
        };
        emitChange();
      } else if (state.qrSecondsRemaining === 1) {
        state = {
          ...state,
          qrSecondsRemaining: 0,
          qrStatus: 'EXPIRED'
        };
        emitChange();
      }
    }
  },

  updateMetrics: (newMetrics: Partial<BatchMetrics>) => {
    state = {
      ...state,
      metrics: { ...state.metrics, ...newMetrics }
    };
    emitChange();
  }
};

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
