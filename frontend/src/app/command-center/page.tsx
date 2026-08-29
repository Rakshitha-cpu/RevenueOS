'use client';

import React, { useState } from 'react';
import { Terminal, Shield, Cpu, Zap, CreditCard, Play, CheckCircle } from 'lucide-react';

export default function AICommandCenter() {
  const [visibleEvents, setVisibleEvents] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);

  const events = [
    { time: "09:41:02", agent: "Risk Agent", action: "Detected 2,341 revenue-risk events", icon: Shield, color: "text-blue-400", bg: "bg-blue-900" },
    { time: "09:41:04", agent: "Risk Agent", action: "Prioritized 187 high-value opportunities", icon: Shield, color: "text-blue-400", bg: "bg-blue-900" },
    { time: "09:41:06", agent: "Recovery Agent", action: "Analyzing customer C10482", icon: Cpu, color: "text-purple-400", bg: "bg-purple-900" },
    { time: "09:41:07", agent: "Recovery Agent", action: "Diagnosed payment-method friction", icon: Cpu, color: "text-purple-400", bg: "bg-purple-900" },
    { time: "09:41:08", agent: "Recovery Agent", action: "Generated 4 strategies", icon: Cpu, color: "text-purple-400", bg: "bg-purple-900" },
    { time: "09:41:09", agent: "Impact Engine", action: "Best expected recovery: ₹4,650", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-900" },
    { time: "09:41:10", agent: "Policy Guard", action: "Action authorized ✓", icon: Shield, color: "text-emerald-400", bg: "bg-emerald-900" },
    { time: "09:41:11", agent: "Execution", action: "Payment link generated", icon: Terminal, color: "text-gray-400", bg: "bg-gray-800" },
    { time: "09:41:34", agent: "Payment", action: "SUCCESS ✓", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-900" },
    { time: "09:41:35", agent: "Workflow", action: "STOPPED ✓", icon: CheckCircle, color: "text-blue-400", bg: "bg-blue-900" },
  ];

  const startDemo = () => {
    setIsRunning(true);
    setVisibleEvents(0);
    
    events.forEach((_, index) => {
      // Stagger the event timing to simulate AI "thinking"
      let delay = index * 900;
      
      // Add a realistic pause before the payment succeeds (simulating the customer receiving the link and paying)
      if (index >= 8) delay += 2000; 

      setTimeout(() => {
        setVisibleEvents(prev => prev + 1);
      }, delay);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-8 font-mono">
      <header className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center text-white">
            <Terminal className="mr-3" /> 
            AI Command Center
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-sans">Real-time agent orchestration, reasoning, and policy enforcement log.</p>
        </div>
        <button 
          onClick={startDemo}
          disabled={isRunning && visibleEvents < events.length}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-sans font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={16} className="mr-2" />
          RUN LIVE TRACE
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Batch Simulated</p>
          <p className="text-2xl font-bold text-white">200</p>
        </div>
        <div className="bg-slate-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Value at Risk</p>
          <p className="text-2xl font-bold text-white">₹10,50,000</p>
        </div>
        <div className="bg-slate-900 border border-blue-900/50 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5"></div>
          <p className="text-blue-400 text-xs uppercase tracking-wider mb-1">RevenueOS Uplift</p>
          <p className="text-2xl font-bold text-white relative z-10">31.4% <span className="text-sm font-normal text-gray-500">vs 18% baseline</span></p>
        </div>
        <div className="bg-slate-900 border border-emerald-900/50 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/10"></div>
          <p className="text-emerald-400 text-xs uppercase tracking-wider mb-1">Batch Recovered</p>
          <p className="text-2xl font-bold text-emerald-400 relative z-10">₹3,29,700</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6">
        <div className="bg-black rounded-lg border border-gray-800 p-6 shadow-2xl min-h-[420px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-850">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-sans">Autonomous Execution Trace</span>
            <span className="text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">Policy Guard Active</span>
          </div>
          <div className="space-y-4">
            
            {events.slice(0, visibleEvents).map((event, idx) => {
              const Icon = event.icon;
              return (
                <div key={idx} className="flex items-start space-x-4 animate-in slide-in-from-left-4 fade-in duration-300">
                  <div className="text-gray-500 text-sm mt-1 w-20 shrink-0">
                    {event.time}
                  </div>
                  
                  <div className={`p-1.5 rounded-md ${event.bg} bg-opacity-20 shrink-0`}>
                    <Icon size={16} className={event.color} />
                  </div>
                  
                  <div className="flex-1 mt-0.5">
                    <span className={`font-semibold text-sm mr-3 ${event.color}`}>
                      [{event.agent.toUpperCase()}]
                    </span>
                    <span className="text-gray-300">
                      {event.action}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {isRunning && visibleEvents < events.length && (
              <div className="flex items-start space-x-4 animate-pulse mt-4">
                <div className="text-gray-700 text-sm mt-1 w-20 shrink-0">--:--:--</div>
                <div className="p-1.5 shrink-0"><div className="w-4 h-4 rounded-full bg-gray-800"></div></div>
                <div className="flex-1 text-gray-700 mt-0.5">awaiting agent response...</div>
              </div>
            )}

            {visibleEvents === 0 && !isRunning && (
              <div className="text-gray-600 text-sm italic text-center py-16">
                Click &quot;RUN LIVE TRACE&quot; above to simulate real-time AI recovery orchestration.
              </div>
            )}
            
          </div>
        </div>

        {/* Real-Time Bank Downtime & Failure Reason Intelligence Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 font-sans">
          
          {/* Bank Outage & Smart Rerouting Card */}
          <div className="bg-slate-900 border border-red-900/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping mr-2"></span>
                Banking Network Monitor
              </h3>
              <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                1 Outage Detected
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Real-time Razorpay downtime webhooks trigger autonomous smart routing to prevent retry failure.
            </p>
            
            <div className="bg-black/60 rounded-lg p-3 border border-gray-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-red-400 font-bold">HDFC Netbanking</span>
                <span className="text-red-400 font-medium">Degraded (High Latency)</span>
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-between border-t border-gray-800/80 pt-2">
                <span>Auto-Reroute Action:</span>
                <span className="text-emerald-400 font-mono font-medium">➔ 1-Tap UPI Intent</span>
              </div>
            </div>
          </div>

          {/* Root-Cause Failure Breakdown Card */}
          <div className="bg-slate-900 border border-gray-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-1">
              Failure Root-Cause Breakdown
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Categorized failure reasons across current transaction batch.
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Bank Downtime / Timeout</span>
                  <span className="text-gray-400 font-mono">42% (84 txns)</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Insufficient Balance (Auto-Retry)</span>
                  <span className="text-gray-400 font-mono">33% (66 txns)</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '33%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Card 2FA Friction / Dropoff</span>
                  <span className="text-gray-400 font-mono">25% (50 txns)</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
