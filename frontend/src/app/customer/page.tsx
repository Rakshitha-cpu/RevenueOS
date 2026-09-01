'use client';

import React, { useState } from 'react';
import { 
  User, AlertTriangle, TrendingUp, CreditCard, Clock, Activity, 
  Cpu, CheckCircle, Sparkles, ShieldCheck, Ban, Phone, ArrowRight, Smartphone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CustomerData {
  id: string;
  name: string;
  avatar: string;
  tier: string;
  since: string;
  targetOrder: string;
  sku: string;
  amount: number;
  failureCode: string;
  failureReason: string;
  revenueRisk: number;
  recoveryProb: number;
  preferredMethod: string;
  contactWindow: string;
  historySummary: string;
  historyBars: ('success' | 'failed' | 'pending')[];
  aiDiagnosis: string;
  aiRecommendation: string;
  expectedNet: number;
  yieldPercent: number;
  rationale: string[];
  policyGuardAction: string;
  whatsappMessage: string;
  linkUrl: string;
  routeHref: string;
  routeLabel: string;
}

const CUSTOMER_PROFILES: CustomerData[] = [
  {
    id: 'CUST-8921',
    name: 'Rajesh Kumar',
    avatar: 'RK',
    tier: 'E-Commerce Retail Shopper',
    since: 'Nov 2023',
    targetOrder: '#RZP-8921',
    sku: 'Apple AirPods Pro (2nd Gen)',
    amount: 4650,
    failureCode: 'E_504_GATEWAY_TIMEOUT',
    failureReason: 'HDFC Bank Card Gateway Timed Out. No amount debited.',
    revenueRisk: 78,
    recoveryProb: 91,
    preferredMethod: '1-Tap UPI (Google Pay / PhonePe)',
    contactWindow: 'Immediate (Active on device)',
    historySummary: '8 success • 1 failed • 1 recovered',
    historyBars: ['success','success','success','success','success','success','success','success','failed','pending'],
    aiDiagnosis: 'Bank gateway timeout friction. Customer has high purchasing intent; retrying card will fail again due to HDFC outage. 1-Tap UPI bypasses card downtime.',
    aiRecommendation: 'Launch Vernacular Voice Agent & send 1-Tap UPI link to WhatsApp.',
    expectedNet: 4547,
    yieldPercent: 97.8,
    rationale: [
      'High Intent Signal: Customer attempted payment within last 90 seconds.',
      'Root Cause: HDFC Card E_504 timeout; UPI rail has 99.9% uptime right now.',
      'Least Cost Intervention: WhatsApp 1-Tap link costs ₹1.20 vs ₹45 manual call center.'
    ],
    policyGuardAction: 'POLICYGUARD GATED: DISPATCHED WITH ZERO DIRECT FINANCIAL AUTHORITY',
    whatsappMessage: 'Hi Rajesh! Your recent payment of ₹4,650 for Apple AirPods Pro timed out at HDFC bank. To complete your order before inventory release, tap here to pay in 1 click:',
    linkUrl: 'https://rzp.io/i/airpods8921',
    routeHref: '/voice',
    routeLabel: 'TEST VOICE AGENT'
  },
  {
    id: 'CUST-98214',
    name: 'Rahul Sharma',
    avatar: 'RS',
    tier: 'B2B SaaS Annual Subscriber',
    since: 'Aug 2024',
    targetOrder: '#SUB-9402',
    sku: 'RevenueOS Pro Team License (Annual)',
    amount: 7999,
    failureCode: 'E_MANDATE_EXPIRED',
    failureReason: 'Recurring credit card mandate expired on corporate card.',
    revenueRisk: 87,
    recoveryProb: 82,
    preferredMethod: 'UPI Autopay / Corporate Card',
    contactWindow: '7:00 PM – 9:00 PM (Predicted Commute Window)',
    historySummary: '12 success • 1 failed • 1 pending',
    historyBars: ['success','success','success','success','success','success','success','success','success','success','success','success','failed','pending'],
    aiDiagnosis: 'Recurring subscription mandate friction. Attempting instant card recharge during work hours causes friction; ML model predicts high responsiveness between 7-9 PM.',
    aiRecommendation: 'Smart-timed WhatsApp Payment Link with 1-Tap UPI mandate renewal.',
    expectedNet: 7820,
    yieldPercent: 97.7,
    rationale: [
      'High Intent Signal: Customer has 12 consecutive months of on-time renewals.',
      'Root Cause: Card expiry date mismatch; recurring token expired.',
      'Optimal Timing: Scheduled outreach during customer commute window.'
    ],
    policyGuardAction: 'POLICYGUARD GATED: SMART-TIMED DISPATCH RESPECTING DND HOURS',
    whatsappMessage: 'Hi Rahul! We noticed your annual subscription renewal of ₹7,999 on your saved card failed due to token expiration. Tap here to renew seamlessly via UPI:',
    linkUrl: 'https://rzp.io/i/7xF81Lm',
    routeHref: '/command-center',
    routeLabel: 'VIEW POLICYGUARD TRACE'
  },
  {
    id: 'CUST-5510',
    name: 'Priya Sharma',
    avatar: 'PS',
    tier: 'VIP High-LTV Shopper',
    since: 'Jan 2023',
    targetOrder: '#RZP-5510',
    sku: 'Sony WH-1000XM5 Premium Headphones',
    amount: 24990,
    failureCode: 'E_OTP_EXPIRED',
    failureReason: 'Customer missed OTP SMS while traveling.',
    revenueRisk: 45,
    recoveryProb: 95,
    preferredMethod: 'PhonePe UPI / Split Pay',
    contactWindow: 'Immediate (VIP SLA < 45s)',
    historySummary: '19 success • 0 failed • High LTV (₹1,40,000+)',
    historyBars: ['success','success','success','success','success','success','success','success','success','success','success','success','success','success','success','success','success','success','success','failed'],
    aiDiagnosis: 'VIP Customer with ₹1.4L lifetime spend missed 2FA OTP. Eligible for 5% loyalty discount code (SAVE232) and Priority 24-Hour Express Dispatch.',
    aiRecommendation: 'Apply authorized 5% loyalty code SAVE232 (₹23,740) & offer 1-Tap UPI.',
    expectedNet: 23740,
    yieldPercent: 95.0,
    rationale: [
      'VIP Loyalty Status: Lifetime value exceeds ₹1.4 Lakhs across 19 orders.',
      'Authorized Incentive: PolicyGuard approved 5% retention discount code SAVE232.',
      'High SLA Target: Recover order within 45 seconds to preserve merchant NPS.'
    ],
    policyGuardAction: 'POLICYGUARD GATED: 5% RETENTION CAP ENFORCED (SAVE232 APPLIED)',
    whatsappMessage: 'Namaste Priya! As a valued VIP member, we reserved your Sony WH-1000XM5 and applied a 5% loyalty code (SAVE232). New Total: ₹23,740. Tap to pay via PhonePe:',
    linkUrl: 'https://rzp.io/i/priya5510',
    routeHref: '/voice',
    routeLabel: 'OPEN VIP VOICE CALL'
  },
  {
    id: 'CUST-3309',
    name: 'Sneha Patil',
    avatar: 'SP',
    tier: 'DND Registered Customer (DPDP)',
    since: 'May 2024',
    targetOrder: '#RZP-3309',
    sku: 'Nike Air Max 270',
    amount: 8995,
    failureCode: 'E_USER_DROPOUT',
    failureReason: 'Customer abandoned checkout and previously opted out of telecalling.',
    revenueRisk: 95,
    recoveryProb: 0,
    preferredMethod: 'DND / Opt-Out Active',
    contactWindow: 'BLOCKED (DND / No Consent)',
    historySummary: '1 success • 2 opt-outs • Outreach Halted',
    historyBars: ['success','failed','failed'],
    aiDiagnosis: 'PolicyGuard Firewall Triggered: Customer mobile number is registered on TRAI DND and previously opted out. Automated calls and push notifications are strictly suppressed.',
    aiRecommendation: 'HALT ALL OUTBOUND ACTIONS. Zero retries enforced for 100% DPDP compliance.',
    expectedNet: 0,
    yieldPercent: 0,
    rationale: [
      'DPDP Act Compliance: Explicit customer consent revoked; zero outbound calls permitted.',
      'Brand Protection: Avoids regulatory fines and spam classification.',
      'Audit Logging: Immutable audit trace recorded in batch ledger.'
    ],
    policyGuardAction: 'POLICYGUARD GATED: STOPPING RULE ACTIVATED (0 RETRIES ENFORCED)',
    whatsappMessage: '[OUTREACH SUPPRESSED BY POLICYGUARD DUE TO DND PREFERENCES]',
    linkUrl: '#',
    routeHref: '/batch-evaluation',
    routeLabel: 'VIEW DND AUDIT LEDGER'
  }
];

export default function CustomerProfile() {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData>(CUSTOMER_PROFILES[0]);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      router.push(selectedCustomer.routeHref);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6 md:p-8 font-sans">
      
      {/* Top Customer Persona Switcher */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Micro-Level Customer Signal Intelligence</h2>
            <h1 className="text-2xl font-black text-white mt-0.5">Customer Diagnosis & Economic Explainability</h1>
          </div>
          <span className="text-xs bg-slate-900 border border-gray-800 text-gray-400 px-3 py-1.5 rounded-xl self-start md:self-auto">
            Select persona to inspect distinct recovery strategies:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CUSTOMER_PROFILES.map((cust) => {
            const isSelected = selectedCustomer.id === cust.id;
            return (
              <button
                key={cust.id}
                onClick={() => setSelectedCustomer(cust)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/40 shadow-lg'
                    : 'bg-slate-900 border-gray-800 hover:border-gray-700 hover:bg-slate-800/60'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-300'
                }`}>
                  {cust.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{cust.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{cust.tier}</p>
                  <p className="text-xs font-extrabold text-emerald-400 mt-0.5">₹{cust.amount.toLocaleString()}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Selected Profile Header */}
      <header className="mb-6 bg-slate-900 border border-gray-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">
            {selectedCustomer.avatar}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-white">{selectedCustomer.name}</h2>
              <span className="text-xs bg-slate-800 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-mono">
                {selectedCustomer.id}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {selectedCustomer.tier} • Member Since {selectedCustomer.since} • Target: <b className="text-white">{selectedCustomer.sku}</b>
            </p>
          </div>
        </div>

        <div className="text-right bg-slate-950 px-5 py-3 rounded-xl border border-gray-800 shadow-inner self-stretch md:self-auto">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Revenue At Risk</p>
          <h3 className="text-2xl font-black text-white">₹{selectedCustomer.amount.toLocaleString()}</h3>
          <span className="text-[10px] text-red-400 font-mono">{selectedCustomer.failureCode}</span>
        </div>
      </header>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
        
        {/* Left Column - Behavioral Metrics */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Risk vs Recovery Gauge */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-gray-800 shadow-lg space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-400 font-semibold flex items-center">
                  <AlertTriangle size={14} className="mr-1.5 text-red-400"/> Revenue Risk Score
                </span>
                <span className="text-lg font-black text-red-400">{selectedCustomer.revenueRisk}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: `${selectedCustomer.revenueRisk}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-400 font-semibold flex items-center">
                  <TrendingUp size={14} className="mr-1.5 text-emerald-400"/> Measured Recovery Probability
                </span>
                <span className="text-lg font-black text-emerald-400">{selectedCustomer.recoveryProb}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${selectedCustomer.recoveryProb}%` }}></div>
              </div>
            </div>
          </div>

          {/* Shopper Signals */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-gray-800 space-y-4">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Preferred Recovery Rail</p>
              <p className="text-xs font-bold text-white flex items-center">
                <CreditCard size={14} className="mr-2 text-blue-400"/> {selectedCustomer.preferredMethod}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Predicted Contact Window</p>
              <p className="text-xs font-bold text-white flex items-center">
                <Clock size={14} className="mr-2 text-purple-400"/> {selectedCustomer.contactWindow}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Historical Payment Stream</p>
              <div className="flex space-x-1 items-end h-6">
                {selectedCustomer.historyBars.map((b, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 h-full rounded-sm ${
                      b === 'success' ? 'bg-emerald-500' :
                      b === 'failed' ? 'bg-red-500 animate-pulse' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-mono">{selectedCustomer.historySummary}</p>
            </div>
          </div>
        </div>

        {/* Right Column - AI Diagnosis, ROI, and WhatsApp Preview */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* AI Diagnosis Card */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-gray-800 shadow-lg">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center">
              <Activity size={14} className="mr-1.5 text-blue-400"/> Multi-Agent Diagnosis
            </h3>
            <p className="text-sm font-medium text-gray-200 leading-relaxed">
              {selectedCustomer.aiDiagnosis}
            </p>
          </div>

          {/* AI Recommendation & Economic Rationale Card */}
          <div className="bg-gradient-to-br from-blue-900/40 via-slate-900 to-indigo-950/50 rounded-2xl border border-blue-500/40 p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">AI Recommendation</span>
              <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-400/30">
                Expected Net: ₹{selectedCustomer.expectedNet.toLocaleString()} ({selectedCustomer.yieldPercent}% Yield)
              </span>
            </div>
            
            <h2 className="text-xl font-extrabold text-white mb-4 leading-snug">
              {selectedCustomer.aiRecommendation}
            </h2>

            <div className="bg-slate-950/60 rounded-xl p-4 border border-blue-500/30 space-y-2 mb-5">
              <p className="font-bold text-white text-xs flex items-center border-b border-gray-800 pb-2 mb-2">
                <Sparkles size={13} className="mr-1.5 text-amber-400" /> Explainability &amp; Economic Rationale
              </p>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {selectedCustomer.rationale.map((r, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle size={14} className="text-blue-400 mr-2 mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-[10px] font-mono text-emerald-400 flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" />
                {selectedCustomer.policyGuardAction}
              </span>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 flex-shrink-0"
              >
                <span>{isExecuting ? 'Navigating...' : selectedCustomer.routeLabel}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* WhatsApp Last-Mile Preview */}
          <div className="bg-slate-900 rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
            <div className="bg-[#075E54] px-4 py-2.5 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 bg-slate-200 text-slate-800 rounded-full flex items-center justify-center font-bold text-xs">
                  {selectedCustomer.avatar}
                </div>
                <div>
                  <p className="font-bold text-xs">{selectedCustomer.name}</p>
                  <p className="text-[10px] text-green-100 opacity-80">WhatsApp Business API • Verified Merchant</p>
                </div>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">Autonomous Action</span>
            </div>
            
            <div className="p-5 bg-slate-950/80">
              <div className="flex justify-end">
                <div className="bg-[#054740] border border-[#0d6e64] rounded-xl rounded-tr-none p-3.5 max-w-[85%] text-xs text-gray-100 shadow-md">
                  <p className="text-[9px] font-bold text-emerald-300 tracking-wider mb-1">🤖 REVENUEOS AUTOPILOT</p>
                  <p className="leading-relaxed whitespace-pre-line">{selectedCustomer.whatsappMessage}</p>
                  {selectedCustomer.linkUrl !== '#' && (
                    <a href={selectedCustomer.linkUrl} target="_blank" rel="noreferrer" className="text-blue-300 underline font-mono block mt-2 text-[11px]">
                      {selectedCustomer.linkUrl} ↗
                    </a>
                  )}
                  <div className="flex justify-end items-center mt-1.5">
                    <span className="text-[9px] text-gray-400 mr-1">Just now</span>
                    <span className="text-blue-400 text-[10px]">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
