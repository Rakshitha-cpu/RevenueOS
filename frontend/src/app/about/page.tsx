'use client';

import React from 'react';
import { 
  Printer, Shield, Zap, RefreshCw, Phone, BarChart3, Bot, 
  ArrowRight, CheckCircle2, Award, FileText, Download, Sparkles, 
  Layers, Lock, Globe, Cpu, Users
} from 'lucide-react';

export default function AboutPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans print:bg-white print:text-black print:p-4">
      
      {/* Header & Print Control */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 mb-8 gap-4 print:border-black">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-blue-500/30 print:border print:border-black print:shadow-none">
            R
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 print:text-black">
                RevenueOS
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800 print:border-black print:text-black">
                v2.5 Production
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5 print:text-gray-700">
              Autonomous AI Payment Recovery & Intelligent Revenue Orchestrator
            </p>
          </div>
        </div>

        {/* Print & Export Buttons */}
        <div className="flex items-center space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center shadow-lg shadow-blue-600/30 transition hover:scale-105"
          >
            <Printer size={15} className="mr-2" />
            Print / Save Dossier PDF
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-10">

        {/* Executive Summary Card */}
        <section className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden print:border-black print:bg-transparent print:p-4 print:shadow-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10 print:hidden"></div>
          
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 print:text-black">
            <Sparkles size={14} className="text-yellow-400" />
            <span>Executive Architecture & Product Overview</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-snug print:text-black">
            The World's First Autonomous AI Revenue Recovery Orchestrator for High-Velocity Merchants
          </h2>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 print:text-gray-800">
            <strong>RevenueOS</strong> bridges the multi-million dollar leak in Indian e-commerce checkout funnels. When an online transaction fails due to card declines, bank downtime, or OTP timeouts, traditional systems send generic SMS spam or do nothing. 
            <strong> RevenueOS autonomously inspects customer dossiers</strong>, diagnoses gateway errors, performs native vernacular voice calls (in 6 Indian dialects), generates 1-tap WhatsApp UPI deep links, and issues T+0 instant refunds in 2.18 seconds.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 print:border-black text-center">
            <div className="p-3 bg-black/40 rounded-2xl border border-slate-800 print:border-black">
              <span className="block text-2xl font-black text-emerald-400 print:text-black">+42.8%</span>
              <span className="text-[11px] text-slate-400 print:text-gray-700 font-medium">Cart Recovery Uplift</span>
            </div>
            <div className="p-3 bg-black/40 rounded-2xl border border-slate-800 print:border-black">
              <span className="block text-2xl font-black text-blue-400 print:text-black">2.18s</span>
              <span className="text-[11px] text-slate-400 print:text-gray-700 font-medium">T+0 Instant Refund Speed</span>
            </div>
            <div className="p-3 bg-black/40 rounded-2xl border border-slate-800 print:border-black">
              <span className="block text-2xl font-black text-purple-400 print:text-black">6 Languages</span>
              <span className="text-[11px] text-slate-400 print:text-gray-700 font-medium">Native Voice Telecalling</span>
            </div>
            <div className="p-3 bg-black/40 rounded-2xl border border-slate-800 print:border-black">
              <span className="block text-2xl font-black text-amber-400 print:text-black">0% Spam</span>
              <span className="text-[11px] text-slate-400 print:text-gray-700 font-medium">DPDP / DNC Guard Active</span>
            </div>
          </div>
        </section>

        {/* How RevenueOS Works (Step-by-Step Architecture) */}
        <section className="space-y-6">
          <div className="border-b border-slate-800 pb-3 print:border-black">
            <h3 className="text-xl font-bold text-white flex items-center print:text-black">
              <Layers className="mr-2 text-indigo-400 print:text-black" size={20} />
              How It Works: 4-Stage Autonomous Recovery Pipeline
            </h3>
            <p className="text-slate-400 text-xs mt-1 print:text-gray-700">
              End-to-end telemetry from failure detection to instant settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Step 1 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 relative print:border-black print:bg-transparent">
              <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center font-bold text-xs mb-3 print:border-black print:text-black">
                1
              </div>
              <h4 className="font-bold text-white text-base mb-1.5 print:text-black">
                Telemetry & Gateway Failure Ingestion
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed print:text-gray-800">
                RevenueOS captures webhook failure events from Razorpay / NPCI gateway streams within <strong>80ms</strong>. It parses error telemetry (<code className="text-red-400 print:text-black font-mono">E_504_TIMEOUT</code>, <code className="text-red-400 print:text-black font-mono">OTP_LIMIT_EXCEEDED</code>) and scores customer recovery probability.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 relative print:border-black print:bg-transparent">
              <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center font-bold text-xs mb-3 print:border-black print:text-black">
                2
              </div>
              <h4 className="font-bold text-white text-base mb-1.5 print:text-black">
                Human-Grade Telecaller & Dossier Verification
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed print:text-gray-800">
                Agent <strong>Priya</strong> initiates a natural, two-way conversational voice call in the customer's mother tongue (Kannada, Hindi, English, Tamil, Telugu, Malayalam). Never acts on blind belief: inspects Order ID, product details, probes cancellation motives, and executes live manager escalation when needed.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 relative print:border-black print:bg-transparent">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3 print:border-black print:text-black">
                3
              </div>
              <h4 className="font-bold text-white text-base mb-1.5 print:text-black">
                1-Tap Smart UPI Deep Link Auto-Reroute
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed print:text-gray-800">
                If the card gateway is down, RevenueOS automatically generates a personalized, green-badged 1-Tap UPI WhatsApp link (<code className="text-emerald-400 print:text-black font-mono">rzp.io/i/RR-9042</code>) pre-configured with Google Pay, PhonePe, and Paytm deep-intent intents.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 relative print:border-black print:bg-transparent">
              <div className="w-8 h-8 rounded-xl bg-pink-950 border border-pink-800 text-pink-400 flex items-center justify-center font-bold text-xs mb-3 print:border-black print:text-black">
                4
              </div>
              <h4 className="font-bold text-white text-base mb-1.5 print:text-black">
                T+0 Instant Reversal & 5% Goodwill Boost
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed print:text-gray-800">
                In double-debit failure cases, RevenueOS triggers an instant <strong>T+0 refund</strong> back to the customer's UPI account in <strong>2.18 seconds</strong> with full NPCI UTR audit logs, or provides a <strong>5% Store Credit Goodwill Voucher</strong> to rescue customer lifetime value.
              </p>
            </div>

          </div>
        </section>

        {/* 6 Core Technology Pillars */}
        <section className="space-y-6">
          <div className="border-b border-slate-800 pb-3 print:border-black">
            <h3 className="text-xl font-bold text-white flex items-center print:text-black">
              <Cpu className="mr-2 text-yellow-400 print:text-black" size={20} />
              Core Architecture & Intelligence Suite
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:border-black print:bg-transparent">
              <div className="flex items-center space-x-2 text-blue-400 print:text-black font-bold text-sm">
                <Phone size={16} />
                <span>Conversational Voice Agent</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed print:text-gray-800">
                Multi-turn Gemini 2.5 Flash conversational engine with full native Indian language synthesis, turn-taking queues, and speech-to-text intelligence.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:border-black print:bg-transparent">
              <div className="flex items-center space-x-2 text-emerald-400 print:text-black font-bold text-sm">
                <RefreshCw size={16} />
                <span>Instant Refund Engine</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed print:text-gray-800">
                T+0 Razorpay Instant Refund API rails delivering sub-3-second reversals and automated NPCI UTR tracking.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:border-black print:bg-transparent">
              <div className="flex items-center space-x-2 text-purple-400 print:text-black font-bold text-sm">
                <Shield size={16} />
                <span>Policy & Compliance Guard</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed print:text-gray-800">
                RBI & DPDP Act compliant guardrails ensuring zero spam, strict opt-out compliance, and immediate DNC suppression.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:border-black print:bg-transparent">
              <div className="flex items-center space-x-2 text-amber-400 print:text-black font-bold text-sm">
                <Zap size={16} />
                <span>What-If Strategy Simulator</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed print:text-gray-800">
                Monte Carlo payment recovery simulator forecasting revenue gains across aggressive, balanced, and conservative outreach policies.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:border-black print:bg-transparent">
              <div className="flex items-center space-x-2 text-pink-400 print:text-black font-bold text-sm">
                <Award size={16} />
                <span>5% Goodwill Retention Boost</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed print:text-gray-800">
                Automated voucher generator turning frustrating payment failures into delighted repeat customers with custom merchant store credits.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:border-black print:bg-transparent">
              <div className="flex items-center space-x-2 text-cyan-400 print:text-black font-bold text-sm">
                <Users size={16} />
                <span>Human Escalation Desk</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed print:text-gray-800">
                Live case dossier handoff transferring complex or dispute calls directly to senior human specialists with zero context loss.
              </p>
            </div>

          </div>
        </section>

        {/* System Specs & Certification Footer */}
        <footer className="pt-8 border-t border-slate-800 print:border-black flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4 print:text-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
              R
            </div>
            <span className="font-semibold text-slate-300 print:text-black">RevenueOS • Built with Passion & Rigor</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>FastAPI (Python)</span>
            <span>•</span>
            <span>Next.js 14 (TypeScript)</span>
            <span>•</span>
            <span>Gemini 2.5 Flash</span>
            <span>•</span>
            <span>Razorpay APIs</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
