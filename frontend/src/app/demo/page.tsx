'use client';

import React, { useState } from 'react';
import { 
  CreditCard, AlertTriangle, Phone, ArrowRight, RefreshCw, ChevronRight, 
  ExternalLink, ShieldCheck, Zap, BarChart3, RotateCcw, Shield, Activity, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

type Stage = 'catalog' | 'cart' | 'checkout' | 'payment_failed' | 'recovery_flow' | 'recovered';

const PRODUCTS = [
  { id: 1, name: 'Apple AirPods Pro (2nd Gen)', price: 4650, original: 5999, discount: 22, icon: '🎧', category: 'Electronics', rating: 4.8, reviews: 12847 },
  { id: 2, name: 'Samsung Galaxy S25 Ultra', price: 79999, original: 94999, discount: 16, icon: '📱', category: 'Smartphones', rating: 4.7, reviews: 8423 },
  { id: 3, name: 'Sony WH-1000XM5 Headphones', price: 24990, original: 29990, discount: 17, icon: '🎵', category: 'Audio', rating: 4.9, reviews: 6201 },
  { id: 4, name: 'Nike Air Max 270', price: 8995, original: 11995, discount: 25, icon: '👟', category: 'Footwear', rating: 4.6, reviews: 4387 },
  { id: 5, name: 'MacBook Air M4', price: 119990, original: 134990, discount: 11, icon: '💻', category: 'Laptops', rating: 4.9, reviews: 3291 },
  { id: 6, name: 'boAt Airdopes 141', price: 999, original: 2990, discount: 67, icon: '🎶', category: 'Audio', rating: 4.3, reviews: 98234 },
];

const RECOVERY_STEPS = [
  {
    step: 1,
    icon: '⚡',
    title: 'RevenueOS Detects Failure',
    desc: 'Payment failure event captured in real-time. Order flagged for recovery in War Room.',
    appLink: '/war-room',
    appLabel: 'View in War Room →',
    color: 'border-red-500/40 bg-red-950/20',
    iconColor: 'text-red-400',
    detail: 'Risk Score: 42 | Gateway: HDFC | Reason: E_504_TIMEOUT',
  },
  {
    step: 2,
    icon: '🛡️',
    title: 'PolicyGuard Clears Recovery',
    desc: 'Deterministic firewall checks 12 rules. Customer verified, DND checked, fraud score safe.',
    appLink: '/command-center',
    appLabel: 'View PolicyGuard →',
    color: 'border-blue-500/40 bg-blue-950/20',
    iconColor: 'text-blue-400',
    detail: 'All 12 rules PASSED ✓ | Recovery AUTHORIZED',
  },
  {
    step: 3,
    icon: '📞',
    title: 'AI Voice Agent Calls Customer',
    desc: 'Agent dials customer in their language. Explains failed payment, offers UPI recovery link.',
    appLink: '/voice',
    appLabel: 'Open Voice Engine →',
    color: 'border-purple-500/40 bg-purple-950/20',
    iconColor: 'text-purple-400',
    detail: 'Language: English | Channel: WhatsApp + Call',
  },
  {
    step: 4,
    icon: '💸',
    title: 'Customer Pays via UPI',
    desc: 'Customer clicks 1-tap UPI link on WhatsApp. Pays via Google Pay / PhonePe in one click.',
    appLink: '/batch-evaluation',
    appLabel: 'View Recovery Analytics →',
    color: 'border-emerald-500/40 bg-emerald-950/20',
    iconColor: 'text-emerald-400',
    detail: 'UPI Rail: Google Pay | Time to pay: 38 seconds',
  },
];

const NEXT_MODULE_OPTIONS = [
  {
    title: 'Voice Recovery Assistant',
    desc: 'Try the vernacular multi-turn phone call with objection handling & discount rules.',
    link: '/voice',
    badge: 'AI Telecaller',
    icon: <Phone size={20} className="text-purple-400" />,
    border: 'hover:border-purple-500/50 hover:bg-purple-950/20'
  },
  {
    title: 'Live Incident War Room',
    desc: 'Inspect real-time telemetry, transaction risk scores, and live recovery streams.',
    link: '/war-room',
    badge: 'Live Feed',
    icon: <Activity size={20} className="text-blue-400" />,
    border: 'hover:border-blue-500/50 hover:bg-blue-950/20'
  },
  {
    title: 'PolicyGuard Command Center',
    desc: 'Review the 12 deterministic financial safety rules, DPDP DND firewall, and audit logs.',
    link: '/command-center',
    badge: 'Safety Firewall',
    icon: <Shield size={20} className="text-emerald-400" />,
    border: 'hover:border-emerald-500/50 hover:bg-emerald-950/20'
  },
  {
    title: 'T+0 Instant Refunds Engine',
    desc: 'Simulate sub-3-second double-debit reversals via NPCI IMPS or 5% store credit boost.',
    link: '/refunds',
    badge: 'Instant Payouts',
    icon: <RotateCcw size={20} className="text-amber-400" />,
    border: 'hover:border-amber-500/50 hover:bg-amber-950/20'
  },
  {
    title: '50-Scenario Benchmark Suite',
    desc: 'Audit the 50-transaction ledger with 86% measured recovery rate and DND compliance.',
    link: '/batch-evaluation',
    badge: 'Audit Ledger',
    icon: <BarChart3 size={20} className="text-indigo-400" />,
    border: 'hover:border-indigo-500/50 hover:bg-indigo-950/20'
  }
];

const UPI_HISTORY = [
  { name: 'Swiggy', amount: 342, date: 'Today, 7:45 PM', icon: '🍔', type: 'sent' },
  { name: 'Rahul Sharma', amount: 500, date: 'Today, 3:12 PM', icon: '👤', type: 'received' },
  { name: 'Rapido', amount: 89, date: 'Today, 1:55 PM', icon: '🛵', type: 'sent' },
  { name: 'BESCOM Bill', amount: 1240, date: 'Yesterday', icon: '⚡', type: 'sent' },
];

export default function DemoPage() {
  const [stage, setStage] = useState<Stage>('catalog');
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [paying, setPaying] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(0);
  const [showUpi, setShowUpi] = useState(false);

  const selectProduct = (p: typeof PRODUCTS[0]) => {
    setProduct(p);
    setStage('cart');
  };

  const simulatePayment = () => {
    setPaying(true);
    setTimeout(() => { setPaying(false); setStage('payment_failed'); }, 2200);
  };

  const startRecovery = () => {
    setStage('recovery_flow');
    setRecoveryStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setRecoveryStep(step);
      if (step >= RECOVERY_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => { setStage('recovered'); setShowUpi(true); }, 800);
      }
    }, 1600);
  };

  const reset = () => {
    setStage('catalog');
    setPaying(false);
    setRecoveryStep(0);
    setShowUpi(false);
  };

  const STEPS = [
    { key: 'catalog', label: '1. Pick Product', icon: '🛍️' },
    { key: 'cart', label: '2. Cart', icon: '🛒' },
    { key: 'checkout', label: '3. Checkout', icon: '💳' },
    { key: 'payment_failed', label: '4. Payment Fails', icon: '❌' },
    { key: 'recovery_flow', label: '5. RevenueOS Acts', icon: '🤖' },
    { key: 'recovered', label: '6. Revenue Saved!', icon: '✅' },
  ];
  const stageIdx = STEPS.findIndex(s => s.key === stage);

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans pb-16">
      {/* Header */}
      <div className="bg-slate-900 border-b border-gray-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            <ShoppingCart size={16} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-white">ShopEase E-Commerce Simulator</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Razorpay Rails
              </span>
            </div>
            <p className="text-xs text-gray-400">Interactive end-to-end checkout failure recovery experience</p>
          </div>
        </div>
        <button onClick={reset} className="text-xs text-gray-400 hover:text-white flex items-center transition border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg bg-slate-800/60">
          <RefreshCw size={12} className="mr-1.5" /> Restart Demo
        </button>
      </div>

      {/* Progress Steps */}
      <div className="bg-slate-900/60 border-b border-gray-800 px-6 py-2.5 flex items-center space-x-1 overflow-x-auto">
        {STEPS.map((s, idx) => (
          <div key={s.key} className="flex items-center flex-shrink-0">
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
              stage === s.key ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/50' :
              stageIdx > idx ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-500'
            }`}>
              <span>{s.icon}</span><span>{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && <ChevronRight size={12} className="text-gray-700 mx-1" />}
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto p-6">

        {/* STAGE 1: CATALOG */}
        {stage === 'catalog' && (
          <div>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white mb-1">Select Any Product to Test</h2>
              <p className="text-xs text-gray-400">Choose any SKU to simulate a real-world payment failure and watch RevenueOS recover the cart automatically.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {PRODUCTS.map(p => (
                <button key={p.id} onClick={() => selectProduct(p)}
                  className="bg-slate-900 border border-gray-800 hover:border-blue-500/60 rounded-2xl p-4 text-left transition group hover:bg-slate-800/80 hover:shadow-lg hover:shadow-blue-500/5 flex flex-col justify-between">
                  <div>
                    <div className="text-4xl mb-3">{p.icon}</div>
                    <p className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider mb-0.5">{p.category}</p>
                    <p className="text-sm font-bold text-white leading-tight mb-2 group-hover:text-blue-300 transition">{p.name}</p>
                  </div>
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg font-extrabold text-white">₹{p.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 line-through">₹{p.original.toLocaleString()}</span>
                      <span className="text-xs text-emerald-400 font-semibold">{p.discount}% off</span>
                    </div>
                    <p className="text-xs text-amber-400 mt-1">★ {p.rating} ({p.reviews.toLocaleString()} reviews)</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 2: CART */}
        {stage === 'cart' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Review Shopping Cart</h2>
            <div className="bg-slate-900 border border-gray-800 rounded-2xl p-5 flex gap-4 items-center">
              <div className="text-6xl leading-none">{product.icon}</div>
              <div className="flex-1">
                <p className="text-xs text-blue-400 font-semibold uppercase">{product.category}</p>
                <h3 className="text-lg font-bold text-white">{product.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-2xl font-bold text-white">₹{product.price.toLocaleString()}</span>
                  <span className="text-gray-500 line-through text-sm">₹{product.original.toLocaleString()}</span>
                  <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">{product.discount}% off</span>
                </div>
                <p className="text-xs text-emerald-400 mt-2">✓ Verified stock reserved for this session</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-400"><span>Item Price</span><span>₹{product.price.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-emerald-400"><span>Promotional Discount</span><span>- ₹{(product.original - product.price).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-gray-400"><span>Standard Delivery</span><span className="text-emerald-400">FREE</span></div>
              <div className="flex justify-between font-bold text-lg text-white border-t border-gray-800 pt-3 mt-2"><span>Total Payable</span><span>₹{product.price.toLocaleString()}</span></div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setStage('catalog')} className="py-3 px-5 bg-slate-800 hover:bg-slate-700 border border-gray-700 text-gray-300 rounded-xl text-xs transition">
                ← Change Item
              </button>
              <button onClick={() => setStage('checkout')} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 text-sm">
                <span>Proceed to Checkout</span><ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: CHECKOUT */}
        {stage === 'checkout' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Payment Verification</h2>
            <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Delivery Address</p>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🏠</span>
                <div>
                  <p className="text-sm font-bold text-white">Rajesh Kumar (+91 98450 XXXXX)</p>
                  <p className="text-xs text-gray-400">12, 3rd Cross, HSR Layout, Bengaluru – 560102</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Selected Payment Method</p>
              <div className="bg-blue-600/10 border-2 border-blue-500 rounded-xl p-3 flex items-center space-x-3">
                <span className="text-2xl">🏦</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">HDFC Bank Visa Credit Card</p>
                  <p className="text-xs text-gray-400">•••• •••• •••• 4521 | Gateway Simulation</p>
                </div>
                <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
              <div className="border border-gray-800 rounded-xl p-3 flex items-center space-x-3 opacity-40">
                <span className="text-2xl">📱</span>
                <p className="text-xs text-gray-400">UPI / Google Pay / PhonePe (Fast Rail)</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400">Total Amount</p>
                <p className="text-2xl font-black text-white">₹{product.price.toLocaleString()}</p>
              </div>
              <button onClick={simulatePayment} disabled={paying}
                className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl transition flex items-center space-x-2 shadow-lg shadow-orange-500/20 text-sm">
                {paying
                  ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Simulating Gateway Timeout...</span></>
                  : <><CreditCard size={16} /><span>Pay ₹{product.price.toLocaleString()}</span></>
                }
              </button>
            </div>
            {paying && (
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-center">
                <p className="text-xs text-amber-300 animate-pulse font-mono">⚠️ Simulating HDFC Card Gateway Timeout (E_504_TIMEOUT)...</p>
              </div>
            )}
          </div>
        )}

        {/* STAGE 4: PAYMENT FAILED (WITH EXPLICIT NEXT OPTIONS) */}
        {stage === 'payment_failed' && (
          <div className="space-y-5">
            {/* Failure Alert Banner */}
            <div className="bg-red-950/40 border-2 border-red-500/50 rounded-2xl p-6 text-center">
              <div className="text-5xl mb-2">❌</div>
              <h2 className="text-2xl font-black text-red-400 mb-1">Payment Failed (E_504_GATEWAY_TIMEOUT)</h2>
              <p className="text-gray-300 text-xs">HDFC Bank card gateway timed out. No amount was debited from customer.</p>
              <div className="bg-red-950/60 rounded-xl p-2.5 inline-block mt-3 border border-red-800/40">
                <p className="text-xs text-red-300 font-mono">Target SKU: {product.name} (₹{product.price.toLocaleString()})</p>
              </div>
            </div>

            <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 flex items-start space-x-2.5">
              <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-300">
                <b>Cart Saved</b>: RevenueOS automatically locked customer inventory for 30 minutes to prevent cart abandonment.
              </p>
            </div>

            {/* WHAT REVENUEOS DOES NEXT: INTERACTIVE OPTIONS & ACTION GRID */}
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-ping" />
                  <h3 className="text-base font-bold text-white">Next Recovery Options</h3>
                </div>
                <span className="text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-medium">
                  Autonomous Multi-Agent Active
                </span>
              </div>

              {/* PRIMARY ACTION: IN-PAGE LIVE RECOVERY */}
              <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block mb-1">
                      ⭐ Recommended Primary Option
                    </span>
                    <p className="text-sm font-bold text-white">Run Autonomous End-to-End Recovery Flow</p>
                    <p className="text-xs text-gray-300 mt-0.5">Executes War Room → PolicyGuard → Voice Call → 1-Tap UPI confirmation in sequence.</p>
                  </div>
                  <button onClick={startRecovery}
                    className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 flex-shrink-0">
                    <Phone size={14} /><span>▶ Start Live Recovery Flow</span>
                  </button>
                </div>
              </div>

              {/* SECONDARY OPTIONS: JUMP TO SPECIFIC MODULES */}
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
                Or inspect individual application modules:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {NEXT_MODULE_OPTIONS.map((opt, i) => (
                  <Link key={i} href={opt.link}
                    className={`bg-slate-800/50 border border-gray-800 ${opt.border} rounded-xl p-3.5 transition group flex items-start space-x-3`}>
                    <div className="p-2 rounded-lg bg-slate-900 border border-gray-700/60 flex-shrink-0 mt-0.5">
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-white group-hover:text-blue-300 transition truncate">{opt.title}</p>
                        <span className="text-[9px] bg-slate-700 text-gray-300 px-1.5 py-0.5 rounded font-mono flex-shrink-0">{opt.badge}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">{opt.desc}</p>
                    </div>
                    <ExternalLink size={12} className="text-gray-600 group-hover:text-blue-400 flex-shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 5: RECOVERY FLOW */}
        {stage === 'recovery_flow' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">RevenueOS Multi-Agent Pipeline in Action</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Executing recovery for <b className="text-white">{product.name}</b> (₹{product.price.toLocaleString()})
              </p>
            </div>

            <div className="space-y-3">
              {RECOVERY_STEPS.map((rs, idx) => (
                <div key={idx} className={`border rounded-2xl p-4 transition-all duration-500 ${
                  recoveryStep > idx
                    ? rs.color + ' opacity-100'
                    : recoveryStep === idx
                    ? rs.color + ' opacity-100 ring-2 ring-blue-500/50 shadow-lg'
                    : 'border-gray-800 bg-slate-900/40 opacity-30'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl flex-shrink-0 ${recoveryStep > idx ? '' : 'grayscale'}`}>
                      {recoveryStep > idx ? '✅' : rs.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white">Step {rs.step}: {rs.title}</p>
                        {recoveryStep > idx && (
                          <Link href={rs.appLink}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 border border-blue-500/30 hover:border-blue-400/50 px-2 py-0.5 rounded-lg transition bg-blue-950/40">
                            <span>{rs.appLabel}</span><ExternalLink size={10} />
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{rs.desc}</p>
                      {recoveryStep > idx && (
                        <p className="text-xs font-mono text-emerald-400 mt-2 bg-emerald-950/40 px-2.5 py-1 rounded-lg inline-block border border-emerald-500/30">{rs.detail}</p>
                      )}
                      {recoveryStep === idx && (
                        <div className="flex items-center space-x-2 mt-2.5">
                          <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full animate-pulse w-4/5" />
                          </div>
                          <span className="text-xs text-blue-400 font-mono">Executing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 6: RECOVERED */}
        {stage === 'recovered' && (
          <div className="space-y-4">
            <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-6 text-center">
              <div className="text-5xl mb-2">✅</div>
              <h2 className="text-2xl font-black text-emerald-400">Revenue Recovered!</h2>
              <p className="text-sm text-gray-300 mt-1">{product.icon} {product.name} — ₹{product.price.toLocaleString()} saved in under 60 seconds</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Recovery Time', value: '47 sec', color: 'text-blue-400', icon: <Zap size={16} /> },
                { label: 'Revenue Saved', value: `₹${product.price.toLocaleString()}`, color: 'text-emerald-400', icon: <ShieldCheck size={16} /> },
                { label: 'PolicyGuard', value: 'PASSED ✓', color: 'text-emerald-400', icon: <BarChart3 size={16} /> },
              ].map(c => (
                <div key={c.label} className="bg-slate-900 border border-gray-800 rounded-xl p-3.5 text-center">
                  <div className={`flex justify-center mb-1 ${c.color}`}>{c.icon}</div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">{c.label}</p>
                  <p className={`text-base font-bold ${c.color} mt-0.5`}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Links to real app pages */}
            <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Explore the Application Modules Live</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { href: '/war-room', icon: '⚡', label: 'Incident War Room', desc: 'See real-time recovery event telemetry' },
                  { href: '/voice', icon: '🎙️', label: 'Voice Recovery Engine', desc: 'Test vernacular telecaller with speech input' },
                  { href: '/command-center', icon: '🛡️', label: 'PolicyGuard Firewall', desc: 'View 12 deterministic safety rules' },
                  { href: '/batch-evaluation', icon: '📊', label: '50-Scenario Benchmark', desc: 'Audit recovery rates & compliance logs' },
                  { href: '/refunds', icon: '💸', label: 'Instant T+0 Refunds', desc: 'Sub-3s reversal & store credit boost' },
                  { href: '/simulator', icon: '🧪', label: 'What-If Risk Simulator', desc: 'Simulate timeout & drop-off thresholds' }
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center space-x-3 border border-gray-800 hover:border-blue-500/40 bg-slate-800/40 hover:bg-slate-800/80 rounded-xl p-3 transition group">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-blue-300 transition truncate">{item.label}</p>
                      <p className="text-[11px] text-gray-400 truncate">{item.desc}</p>
                    </div>
                    <ExternalLink size={12} className="text-gray-600 group-hover:text-blue-400 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* UPI History */}
            {showUpi && (
              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl">📱</span>
                  <div>
                    <p className="text-xs font-bold text-white">Google Pay UPI History</p>
                    <p className="text-[11px] text-gray-400">rajesh@okhdfcbank</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">{product.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-white">ShopEase Checkout (Razorpay)</p>
                        <p className="text-[11px] text-emerald-400 font-semibold">✓ AI Recovered (1-Tap UPI)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-red-400">− ₹{product.price.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">Just now</p>
                    </div>
                  </div>
                  {UPI_HISTORY.map(t => (
                    <div key={t.name} className="bg-slate-800/40 border border-gray-800 rounded-xl p-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{t.icon}</span>
                        <div>
                          <p className="text-xs font-medium text-white">{t.name}</p>
                          <p className="text-[10px] text-gray-500">{t.date}</p>
                        </div>
                      </div>
                      <p className={`text-xs font-bold ${t.type === 'sent' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {t.type === 'sent' ? '−' : '+'} ₹{t.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={reset}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition">
              🔄 Restart Simulator with a Different Product
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
