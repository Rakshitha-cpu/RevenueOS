import { create } from 'zustand';

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

interface RevenueState {
  // Trace Execution State
  visibleEventsCount: number;
  isRunning: boolean;
  events: TraceEvent[];
  
  // Batch Metrics State
  metrics: BatchMetrics;
  
  // Bank Downtime State
  activeDowntimes: BankDowntimeInfo[];
  
  // Actions
  startLiveTrace: () => void;
  resetTrace: () => void;
  incrementVisibleEvents: () => void;
  updateMetrics: (newMetrics: Partial<BatchMetrics>) => void;
}

const DEFAULT_EVENTS: TraceEvent[] = [
  { time: "09:41:02", agent: "Risk Agent", action: "Detected 2,341 revenue-risk events", iconName: "Shield", color: "text-blue-400", bg: "bg-blue-900" },
  { time: "09:41:04", agent: "Risk Agent", action: "Prioritized 187 high-value opportunities", iconName: "Shield", color: "text-blue-400", bg: "bg-blue-900" },
  { time: "09:41:06", agent: "Recovery Agent", action: "Analyzing customer C10482", iconName: "Cpu", color: "text-purple-400", bg: "bg-purple-900" },
  { time: "09:41:07", agent: "Recovery Agent", action: "Diagnosed payment-method friction", iconName: "Cpu", color: "text-purple-400", bg: "bg-purple-900" },
  { time: "09:41:08", agent: "Recovery Agent", action: "Generated 4 strategies", iconName: "Cpu", color: "text-purple-400", bg: "bg-purple-900" },
  { time: "09:41:09", agent: "Impact Engine", action: "Best expected recovery: ₹4,650", iconName: "Zap", color: "text-yellow-400", bg: "bg-yellow-900" },
  { time: "09:41:10", agent: "Policy Guard", action: "Action authorized ✓", iconName: "Shield", color: "text-emerald-400", bg: "bg-emerald-900" },
  { time: "09:41:11", agent: "Execution", action: "Payment link generated", iconName: "Terminal", color: "text-gray-400", bg: "bg-gray-800" },
  { time: "09:41:34", agent: "Payment", action: "SUCCESS ✓", iconName: "CreditCard", color: "text-emerald-400", bg: "bg-emerald-900" },
  { time: "09:41:35", agent: "Workflow", action: "STOPPED ✓", iconName: "CheckCircle", color: "text-blue-400", bg: "bg-blue-900" },
];

export const useRevenueStore = create<RevenueState>((set, get) => ({
  visibleEventsCount: 0,
  isRunning: false,
  events: DEFAULT_EVENTS,
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
  startLiveTrace: () => {
    set({ isRunning: true, visibleEventsCount: 0 });
    const totalEvents = get().events.length;
    
    get().events.forEach((_, index) => {
      let delay = index * 900;
      if (index >= 8) delay += 2000;
      
      setTimeout(() => {
        set((state) => ({ visibleEventsCount: Math.min(state.visibleEventsCount + 1, totalEvents) }));
      }, delay);
    });
  },
  resetTrace: () => set({ visibleEventsCount: 0, isRunning: false }),
  incrementVisibleEvents: () => set((state) => ({ visibleEventsCount: state.visibleEventsCount + 1 })),
  updateMetrics: (newMetrics) => set((state) => ({ metrics: { ...state.metrics, ...newMetrics } }))
}));
