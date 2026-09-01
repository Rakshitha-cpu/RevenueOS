'use client';

import React, { useState } from 'react';
import { CreditCard, AlertTriangle, Phone, ArrowRight, RefreshCw, ChevronRight, ExternalLink, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
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
    setTimeout(() => { setPaying(false); setStage('payment_failed'); }, 2500);
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
    }, 1800);
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
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
      {/* Header */}
      <div className="bg-slate-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-bold text-blue-400">🛒 ShopEase</span>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Powered by Razorpay</span>
        </div>
        <button onClick={reset} className="text-xs text-gray-400 hover:text-white flex items-center transition border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg">
          <RefreshCw size={12} className="mr-1.5" /> Restart Demo
        </button>
      </div>

      {/* Progress */}
      <div className="bg-slate-900/60 border-b border-gray-800 px-4 py-2 flex items-center space-x-1 overflow-x-auto">
        {STEPS.map((s, idx) => (
          <div key={s.key} className="flex items-center flex-shrink-0">
            <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition ${
              stage === s.key ? 'bg-blue-600 text-white' :
              stageIdx > idx ? 'bg-emerald-600/20 text-emerald-400' : 'text-gray-600'
            }`}>
              <span>{s.icon}</span><span>{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && <ChevronRight size={12} className="text-gray-700 mx-0.5" />}
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="flex-1 p-6 max-w-3xl">

          {/* STAGE 1: CATALOG */}
          {stage === 'catalog' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Choose Any Product</h2>
              <p className="text-xs text-gray-400 mb-4">Select any item to see how RevenueOS recovers a failed payment for it.</p>
              <div className="grid grid-cols-2 gap-3">
                {PRODUCTS.map(p => (
                  <button key={p.id} onClick={() => selectProduct(p)}
                    className="bg-slate-900 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-4 text-left transition group hover:bg-slate-800/60">
                    <div className="text-4xl mb-2">{p.icon}</div>
                    <p className="text-xs text-blue-400 font-medium mb-0.5">{p.category}</p>
                    <p className="text-sm font-bold text-white leading-tight mb-1">{p.name}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-white">₹{p.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 line-through">₹{p.original.toLocaleString()}</span>
                      <span className="text-xs text-emerald-400 font-semibold">{p.discount}% off</span>
                    </div>
                    <p className="text-xs text-yellow-400 mt-1">★ {p.rating} ({p.reviews.toLocaleString()} reviews)</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 2: CART */}
          {stage === 'cart' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-5 flex gap-4">
                <div className="text-6xl leading-none">{product.icon}</div>
                <div className="flex-1">
                  <p className="text-xs text-blue-400 font-medium mb-1">{product.category}</p>
                  <h3 className="text-base font-bold text-white">{product.name}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xl font-bold text-white">₹{product.price.toLocaleString()}</span>
                    <span className="text-gray-500 line-through text-sm">₹{product.original.toLocaleString()}</span>
                    <span className="text-emerald-400 text-sm font-semibold">{product.discount}% off</span>
                  </div>
                  <p className="text-xs text-emerald-400 mt-1">✓ Free delivery by Tomorrow</p>
                </div>
              </div>
              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-400"><span>Price</span><span>₹{product.price.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-emerald-400"><span>Discount</span><span>- ₹{(product.original - product.price).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-gray-400"><span>Delivery</span><span className="text-emerald-400">FREE</span></div>
                <div className="flex justify-between font-bold text-lg text-white border-t border-gray-700 pt-2 mt-1"><span>Total</span><span>₹{product.price.toLocaleString()}</span></div>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setStage('catalog')} className="py-3 px-5 bg-slate-800 hover:bg-slate-700 border border-gray-700 text-gray-300 rounded-xl text-sm transition">← Change Item</button>
                <button onClick={() => setStage('checkout')} className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition flex items-center justify-center space-x-2">
                  <span>Proceed to Checkout</span><ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: CHECKOUT */}
          {stage === 'checkout' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Payment</h2>
              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Delivery Address</p>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">🏠</span>
                  <div>
                    <p className="text-sm font-bold text-white">Rajesh Kumar</p>
                    <p className="text-xs text-gray-400">12, 3rd Cross, HSR Layout, Bengaluru – 560102</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Payment Method</p>
                <div className="bg-blue-600/10 border-2 border-blue-500 rounded-xl p-3 flex items-center space-x-3">
                  <span className="text-2xl">🏦</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">HDFC Bank Visa Credit Card</p>
                    <p className="text-xs text-gray-400">•••• •••• •••• 4521 | Expires 09/27</p>
                  </div>
                  <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>
                <div className="border border-gray-700 rounded-xl p-3 flex items-center space-x-3 opacity-40">
                  <span className="text-2xl">📱</span><p className="text-sm text-gray-300">UPI / Google Pay / PhonePe</p>
                </div>
              </div>
              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-white">₹{product.price.toLocaleString()}</p>
                </div>
                <button onClick={simulatePayment} disabled={paying}
                  className="px-8 py-3.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold rounded-xl transition flex items-center space-x-2">
                  {paying
                    ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Processing...</span></>
                    : <><CreditCard size={16} /><span>Pay ₹{product.price.toLocaleString()}</span></>
                  }
                </button>
              </div>
              {paying && (
                <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-blue-300 animate-pulse">🔐 Securing payment via Razorpay... Do not close this window.</p>
                </div>
              )}
            </div>
          )}

          {/* STAGE 4: PAYMENT FAILED */}
          {stage === 'payment_failed' && (
            <div className="space-y-4">
              <div className="bg-red-950/40 border-2 border-red-500/50 rounded-2xl p-6 text-center">
                <div className="text-5xl mb-3">❌</div>
                <h2 className="text-2xl font-bold text-red-400 mb-1">Payment Failed</h2>
                <p className="text-gray-300 text-sm">Your transaction could not be processed.</p>
                <div className="bg-red-950/60 rounded-xl p-3 inline-block mt-3">
                  <p className="text-xs text-red-300 font-mono">Error Code: E_504_GATEWAY_TIMEOUT</p>
                  <p className="text-xs text-gray-400 mt-0.5">HDFC Bank gateway timed out. No amount was debited.</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Transaction Details</p>
                {[
                  ['Item', product.name],
                  ['Amount', `₹${product.price.toLocaleString()}`],
                  ['Payment Method', 'HDFC Visa •••• 4521'],
                  ['Status', 'Failed — Gateway Timeout'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-400">{k}</span>
                    <span className={k === 'Status' ? 'text-red-400 font-semibold' : 'text-white'}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 flex items-start space-x-2">
                <AlertTriangle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-300">Your {product.icon} <b>{product.name}</b> is still reserved! Cart saved for 30 minutes.</p>
              </div>

              {/* What happens next — THE KEY SECTION */}
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-5">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
                  <p className="text-sm font-bold text-blue-300">RevenueOS Detected This Failure</p>
                </div>
                <p className="text-xs text-gray-400 mb-4">Here is exactly what our application does next — automatically, without any merchant action:</p>

                <div className="space-y-2 mb-4">
                  {[
                    { icon: '⚡', label: 'War Room flags this order for recovery', link: '/war-room' },
                    { icon: '🛡️', label: 'PolicyGuard verifies it\'s safe to act', link: '/command-center' },
                    { icon: '📞', label: 'AI Voice Agent calls the customer', link: '/voice' },
                    { icon: '✅', label: 'Revenue recovered in under 60 seconds', link: '/batch-evaluation' },
                  ].map((item, i) => (
                    <Link key={i} href={item.link}
                      className="flex items-center space-x-3 bg-slate-800/60 hover:bg-slate-700/60 border border-gray-700/50 hover:border-blue-500/40 rounded-xl px-3 py-2.5 transition group">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs text-gray-300 group-hover:text-white flex-1">{item.label}</span>
                      <ExternalLink size={12} className="text-gray-600 group-hover:text-blue-400" />
                    </Link>
                  ))}
                </div>

                <button onClick={startRecovery}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2">
                  <Phone size={15} /><span>▶ Watch the Full Recovery Flow Live</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: RECOVERY FLOW */}
          {stage === 'recovery_flow' && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">RevenueOS Recovery in Progress</h2>
              <p className="text-xs text-gray-400 mb-2">Watch each step of the application execute automatically for <b className="text-white">{product.name}</b> (₹{product.price.toLocaleString()})</p>

              {RECOVERY_STEPS.map((rs, idx) => (
                <div key={idx} className={`border rounded-2xl p-4 transition-all duration-500 ${
                  recoveryStep > idx
                    ? rs.color + ' opacity-100'
                    : recoveryStep === idx
                    ? rs.color + ' opacity-100 ring-1 ring-white/20'
                    : 'border-gray-800 bg-slate-900/40 opacity-40'
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
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 border border-blue-500/30 hover:border-blue-400/50 px-2 py-0.5 rounded-lg transition">
                            <span>{rs.appLabel}</span><ExternalLink size={10} />
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{rs.desc}</p>
                      {recoveryStep > idx && (
                        <p className="text-xs font-mono text-emerald-400 mt-1.5 bg-emerald-950/30 px-2 py-1 rounded-lg inline-block">{rs.detail}</p>
                      )}
                      {recoveryStep === idx && (
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full animate-pulse w-3/4" />
                          </div>
                          <span className="text-xs text-blue-400">Running...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STAGE 6: RECOVERED */}
          {stage === 'recovered' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-6 text-center">
                <div className="text-5xl mb-2">✅</div>
                <h2 className="text-2xl font-bold text-emerald-400">Revenue Recovered!</h2>
                <p className="text-sm text-gray-300 mt-1">{product.icon} {product.name} — ₹{product.price.toLocaleString()} saved</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Recovery Time', value: '47 sec', color: 'text-blue-400', icon: <Zap size={14} /> },
                  { label: 'Revenue Saved', value: `₹${product.price.toLocaleString()}`, color: 'text-emerald-400', icon: <ShieldCheck size={14} /> },
                  { label: 'PolicyGuard', value: 'PASSED ✓', color: 'text-emerald-400', icon: <BarChart3 size={14} /> },
                ].map(c => (
                  <div key={c.label} className="bg-slate-900 border border-gray-800 rounded-xl p-3 text-center">
                    <div className={`flex justify-center mb-1 ${c.color}`}>{c.icon}</div>
                    <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                    <p className={`text-sm font-bold ${c.color}`}>{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Links to real app pages */}
              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Explore the App — See It Live</p>
                <div className="space-y-2">
                  {[
                    { href: '/war-room', icon: '⚡', label: 'War Room', desc: 'See this recovery event in live dashboard' },
                    { href: '/voice', icon: '🎙️', label: 'Voice Engine', desc: 'Try the AI voice agent yourself' },
                    { href: '/command-center', icon: '🛡️', label: 'Command Center', desc: 'View PolicyGuard rules that approved this' },
                    { href: '/batch-evaluation', icon: '📊', label: 'Recovery Analytics', desc: 'See revenue recovered across all orders' },
                  ].map(item => (
                    <Link key={item.href} href={item.href}
                      className="flex items-center space-x-3 border border-gray-700/50 hover:border-blue-500/40 bg-slate-800/30 hover:bg-slate-800/60 rounded-xl px-3 py-2.5 transition group">
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-blue-300">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <ExternalLink size={13} className="text-gray-600 group-hover:text-blue-400" />
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
                      <p className="text-sm font-bold text-white">Google Pay</p>
                      <p className="text-xs text-gray-400">rajesh@okhdfc</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{product.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">ShopEase (Razorpay)</p>
                          <p className="text-xs text-emerald-400 font-medium">✓ AI Recovered</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-400">− ₹{product.price.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Just now</p>
                      </div>
                    </div>
                    {UPI_HISTORY.map(t => (
                      <div key={t.name} className="bg-slate-800/50 border border-gray-700/40 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{t.icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-white">{t.name}</p>
                            <p className="text-xs text-gray-500">{t.date}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-bold ${t.type === 'sent' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {t.type === 'sent' ? '−' : '+'} ₹{t.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={reset}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-gray-700 text-gray-300 text-sm rounded-xl transition">
                🔄 Try with a Different Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
