'use client';

import { useSyncExternalStore } from 'react';

export interface TraceEvent {
  time: string;
  agent: string;
  action: string;
  iconName: string;
  color: string;
  bg: string;
}

export interface BatchMetrics {
  totalSimulated: number;
  valueAtRisk: number;
  upliftPercentage: number;
  baselinePercentage: number;
  totalRecovered: number;
}

export interface BankDowntimeInfo {
  bank: string;
  instrument: string;
  status: string;
  rerouteAction: string;
}

export type ScenarioType = 'BANK_OUTAGE' | 'VIP_RECOVERY' | 'FRAUD_BLOCK';

export interface RevenueState {
  // Trace Execution State
  visibleEventsCount: number;
  isRunning: boolean;
  events: TraceEvent[];
  activeScenario: ScenarioType;
  
  // Batch Metrics State
  metrics: BatchMetrics;
  
  // Bank Downtime State
  activeDowntimes: BankDowntimeInfo[];

  // Dynamic QR Code State
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

const SCENARIO_EVENTS: Record<ScenarioType, TraceEvent[]> = {
  BANK_OUTAGE: [
    { time: "10:14:01", agent: "Webhook Guard", action: "Ingested Razorpay event payment.downtime.started (HDFC)", iconName: "Shield", color: "text-amber-400", bg: "bg-amber-900" },
    { time: "10:14:02", agent: "Downtime Engine", action: "HDFC Netbanking degraded (98% timeout rate)", iconName: "Cpu", color: "text-red-400", bg: "bg-red-900" },
    { time: "10:14:03", agent: "Risk Agent", action: "Diagnosed failed ₹42,000 checkout for customer C9021", iconName: "Cpu", color: "text-blue-400", bg: "bg-blue-900" },
    { time: "10:14:05", agent: "What-If Simulator", action: "Smart Reroute: Bypassed HDFC retry -> Selected 1-Tap UPI Intent", iconName: "Zap", color: "text-yellow-400", bg: "bg-yellow-900" },
    { time: "10:14:06", agent: "Policy Guard", action: "Action authorized under ₹50,000 ceiling ✓", iconName: "Shield", color: "text-emerald-400", bg: "bg-emerald-900" },
    { time: "10:14:07", agent: "Execution", action: "Generated 1-Tap UPI Deep Link & Dynamic QR", iconName: "Terminal", color: "text-emerald-400", bg: "bg-emerald-900" },
    { time: "10:14:15", agent: "Razorpay Webhook", action: "payment.captured received (₹42,000 via UPI) ✓", iconName: "CreditCard", color: "text-emerald-400", bg: "bg-emerald-900" },
    { time: "10:14:16", agent: "Audit Engine", action: "Persisted to PostgreSQL. Revenue Leak Prevented ✓", iconName: "CheckCircle", color: "text-blue-400", bg: "bg-blue-900" }
  ],
  VIP_RECOVERY: [
    { time: "10:15:01", agent: "Risk Agent", action: "Detected INSUFFICIENT_FUNDS on VIP cart (₹8,500)", iconName: "Shield", color: "text-blue-400", bg: "bg-blue-900" },
    { time: "10:15:03", agent: "Smart-Timing ML", action: "Calculated optimal conversion window: 7:30 PM (Evening commute)", iconName: "Zap", color: "text-purple-400", bg: "bg-purple-900" },
    { time: "10:15:04", agent: "Voice NLP Agent", action: "Classified Hinglish transcript -> 'Kal subah pay karunga' (PROMISE_TO_PAY)", iconName: "Cpu", color: "text-blue-400", bg: "bg-blue-900" },
    { time: "10:15:05", agent: "Policy Guard", action: "Scheduled WhatsApp payment link dispatch for next morning ✓", iconName: "Shield", color: "text-emerald-400", bg: "bg-emerald-900" },
    { time: "10:15:06", agent: "Execution", action: "Payment Link generated and scheduled with zero customer friction", iconName: "Terminal", color: "text-emerald-400", bg: "bg-emerald-900" },
    { time: "10:15:18", agent: "Audit Engine", action: "Workflow completed with 94.2% predicted recovery probability ✓", iconName: "CheckCircle", color: "text-blue-400", bg: "bg-blue-900" }
  ],
  FRAUD_BLOCK: [
    { time: "10:16:01", agent: "Risk Agent", action: "High-value checkout decline: ₹85,000 (SUSPECTED_FRAUD)", iconName: "Shield", color: "text-red-400", bg: "bg-red-900" },
    { time: "10:16:02", agent: "Risk Agent", action: "Risk Score: 94/100 (Unusual device fingerprint + foreign IP)", iconName: "Cpu", color: "text-red-400", bg: "bg-red-900" },
    { time: "10:16:03", agent: "Policy Guard", action: "🚨 HARD BLOCK: Exceeds ₹50k autonomous cap & Fraud threshold", iconName: "Shield", color: "text-red-400", bg: "bg-red-900" },
    { time: "10:16:04", agent: "Policy Guard", action: "Autonomous recovery HALTED. Isolated from payment gateways", iconName: "Shield", color: "text-red-400", bg: "bg-red-900" },
    { time: "10:16:05", agent: "War Room", action: "Escalated case to Human Compliance Officer for manual verification ⚠️", iconName: "Terminal", color: "text-amber-400", bg: "bg-amber-900" },
    { time: "10:16:06", agent: "Audit Engine", action: "Security incident logged to immutable audit ledger ✓", iconName: "CheckCircle", color: "text-blue-400", bg: "bg-blue-900" }
  ]
};

// =========================================================================
// Zero-Dependency Enterprise Reactive Store (Built on useSyncExternalStore)
// Works seamlessly in Next.js 16 without needing external node_modules!
// =========================================================================

type Listener = () => void;

function createStore<T>(initializer: (set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void, get: () => T) => T) {
  let state: T;
  const listeners = new Set<Listener>();

  const get = () => state;

  const set = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const nextState = typeof partial === 'function' ? (partial as any)(state) : partial;
    state = { ...state, ...nextState };
    listeners.forEach((listener) => listener());
  };

  state = initializer(set, get);

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return function useStore(): T {
    return useSyncExternalStore(subscribe, get, get);
  };
}

export const useRevenueStore = createStore<RevenueState>((set, get) => ({
  visibleEventsCount: 0,
  isRunning: false,
  activeScenario: 'BANK_OUTAGE',
  events: SCENARIO_EVENTS.BANK_OUTAGE,
  metrics: {
    totalSimulated: 200,
    valueAtRisk: 1050000,
    upliftPercentage: 31.4,
    baselinePercentage: 18.0,
    totalRecovered: 329700
  },
  activeDowntimes: [
    {
      bank: "HDFC Netbanking",
      instrument: "netbanking",
      status: "Degraded (High Latency)",
      rerouteAction: "➔ 1-Tap UPI Intent"
    }
  ],
  qrSecondsRemaining: 300,
  qrStatus: 'ACTIVE',

  startLiveTrace: () => {
    get().runScenario(get().activeScenario);
  },

  runScenario: (scenario: ScenarioType) => {
    const scenarioEvents = SCENARIO_EVENTS[scenario];
    set({ 
      activeScenario: scenario,
      events: scenarioEvents,
      visibleEventsCount: 0,
      isRunning: true,
      qrStatus: 'ACTIVE',
      qrSecondsRemaining: 300
    });

    scenarioEvents.forEach((_, index) => {
      let delay = index * 750;
      if (index >= 5) delay += 1200;

      setTimeout(() => {
        set((state) => ({ visibleEventsCount: Math.min(state.visibleEventsCount + 1, scenarioEvents.length) }));
        if (index === scenarioEvents.length - 1) {
          set({ isRunning: false });
        }
      }, delay);
    });
  },

  resetTrace: () => set({ visibleEventsCount: 0, isRunning: false }),
  
  simulateQRPayment: () => set({ qrStatus: 'PAID' }),

  decrementQRTimer: () => {
    const current = get().qrSecondsRemaining;
    if (current <= 1) {
      set({ qrSecondsRemaining: 0, qrStatus: 'EXPIRED' });
    } else {
      set({ qrSecondsRemaining: current - 1 });
    }
  },

  updateMetrics: (newMetrics) => set((state) => ({ metrics: { ...state.metrics, ...newMetrics } }))
}));
