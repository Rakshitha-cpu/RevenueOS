'use client';

import React, { useState } from 'react';
import { ShoppingCart, CreditCard, AlertTriangle, Phone, ArrowRight, RefreshCw, ChevronRight } from 'lucide-react';

type Stage = 'cart' | 'checkout' | 'payment_failed' | 'agent_calling' | 'recovered';

const PRODUCT = {
  name: 'Apple AirPods Pro (2nd Generation)',
  price: 4650,
  originalPrice: 5999,
  discount: 22,
  image: '🎧',
  rating: 4.8,
  reviews: 12847,
  seller: 'Apple Authorized Store',
  delivery: 'Free delivery by Tomorrow, 2 PM',
  emi: '₹775/month x 6 months',
  offer: '5% cashback with HDFC Bank cards'
};

const UPI_HISTORY = [
  { id: 'T1', type: 'sent', name: 'Swiggy', amount: 342, date: 'Today, 7:45 PM', icon: '🍔', upi: 'pay@swiggy' },
  { id: 'T2', type: 'received', name: 'Rahul Sharma', amount: 500, date: 'Today, 3:12 PM', icon: '👤', upi: 'rahul@okaxis' },
  { id: 'T3', type: 'sent', name: 'Rapido', amount: 89, date: 'Today, 1:55 PM', icon: '🛵', upi: 'pay@rapido' },
  { id: 'T4', type: 'sent', name: 'BESCOM Bill', amount: 1240, date: 'Yesterday, 6:30 PM', icon: '⚡', upi: 'bescom@hdfcbank' },
  { id: 'T5', type: 'sent', name: 'BookMyShow', amount: 468, date: 'Yesterday, 2:10 PM', icon: '🎬', upi: 'bms@paytm' },
];

export default function DemoPage() {
  const [stage, setStage] = useState<Stage>('cart');
  const [paying, setPaying] = useState(false);
  const [callerProgress, setCallerProgress] = useState(0);
  const [showUpiHistory, setShowUpiHistory] = useState(false);
  const [recoveredTxn, setRecoveredTxn] = useState(false);

  const simulatePayment = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setStage('payment_failed');
    }, 2500);
  };

  const simulateAgentCall = () => {
    setStage('agent_calling');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setCallerProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setStage('recovered');
          setRecoveredTxn(true);
        }, 500);
      }
    }, 320);
  };

  const reset = () => {
    setStage('cart');
    setPaying(false);
    setCallerProgress(0);
    setShowUpiHistory(false);
    setRecoveredTxn(false);
  };

  const STEPS = [
    { key: 'cart', label: '1. Cart', icon: '🛒' },
    { key: 'checkout', label: '2. Checkout', icon: '💳' },
    { key: 'payment_failed', label: '3. Payment Failed', icon: '❌' },
    { key: 'agent_calling', label: '4. AI Recovery', icon: '📞' },
    { key: 'recovered', label: '5. Revenue Saved!', icon: '✅' },
  ];
  const stageIndex = STEPS.findIndex(s => s.key === stage);

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
      {/* Header */}
      <div className="bg-slate-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-bold text-blue-400">🛒 ShopEase</span>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Powered by Razorpay</span>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowUpiHistory(!showUpiHistory)}
            className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition flex items-center space-x-1">
            <span>📱</span><span>UPI History</span>
          </button>
          <button onClick={reset} className="text-xs text-gray-400 hover:text-white flex items-center transition">
            <RefreshCw size={13} className="mr-1" /> Reset Demo
          </button>
        </div>
      </div>

      {/* Stage Progress Bar */}
      <div className="bg-slate-900/60 border-b border-gray-800 px-6 py-2 flex items-center space-x-1 overflow-x-auto">
        {STEPS.map((step, idx) => (
          <div key={step.key} className="flex items-center flex-shrink-0">
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
              stage === step.key ? 'bg-blue-600 text-white' :
              stageIndex > idx ? 'bg-emerald-600/20 text-emerald-400' : 'text-gray-500'
            }`}>
              <span>{step.icon}</span><span>{step.label}</span>
            </div>
            {idx < 4 && <ChevronRight size={13} className="text-gray-700 mx-0.5" />}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6 max-w-3xl">

          {/* CART */}
          {stage === 'cart' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Your Shopping Cart</h2>
              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-5 flex gap-5">
                <div className="text-7xl leading-none">{PRODUCT.image}</div>
                <div className="flex-1">
                  <p className="text-xs text-blue-400 font-medium mb-1">{PRODUCT.seller}</p>
                  <h3 className="text-lg font-bold text-white">{PRODUCT.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-sm text-white font-medium">{PRODUCT.rating}</span>
                    <span className="text-xs text-gray-500">({PRODUCT.reviews.toLocaleString()} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-2xl font-bold text-white">₹{PRODUCT.price.toLocaleString()}</span>
                    <span className="text-gray-500 line-through text-sm">₹{PRODUCT.originalPrice.toLocaleString()}</span>
                    <span className="text-emerald-400 text-sm font-semibold">{PRODUCT.discount}% off</span>
                  </div>
                  <p className="text-xs text-emerald-400 mt-1">✓ {PRODUCT.delivery}</p>
                  <p className="text-xs text-gray-400 mt-0.5">💳 {PRODUCT.emi}</p>
                  <p className="text-xs text-blue-300 mt-0.5">🎁 {PRODUCT.offer}</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-400"><span>Price (1 item)</span><span>₹{PRODUCT.price.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-emerald-400"><span>Discount</span><span>- ₹{(PRODUCT.originalPrice - PRODUCT.price).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-gray-400"><span>Delivery</span><span className="text-emerald-400">FREE</span></div>
                <div className="flex justify-between font-bold text-lg text-white border-t border-gray-700 pt-3 mt-2"><span>Total</span><span>₹{PRODUCT.price.toLocaleString()}</span></div>
                <p className="text-xs text-emerald-400">You save ₹{(PRODUCT.originalPrice - PRODUCT.price).toLocaleString()} on this order!</p>
              </div>

              <button onClick={() => setStage('checkout')}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg rounded-2xl transition flex items-center justify-center space-x-2">
                <span>Proceed to Checkout</span><ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* CHECKOUT */}
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
                    <p className="text-xs text-gray-400">+91 98450 XXXXX</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Choose Payment Method</p>
                <div className="bg-blue-600/10 border-2 border-blue-500 rounded-xl p-3 flex items-center space-x-3">
                  <span className="text-2xl">🏦</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">HDFC Bank Visa Credit Card</p>
                    <p className="text-xs text-gray-400">•••• •••• •••• 4521 | Expires 09/27</p>
                    <p className="text-xs text-blue-300 mt-0.5">5% cashback applied automatically</p>
                  </div>
                  <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>
                <div className="border border-gray-700 rounded-xl p-3 flex items-center space-x-3 opacity-40">
                  <span className="text-2xl">📱</span>
                  <p className="text-sm text-gray-300">UPI / Google Pay / PhonePe</p>
                </div>
                <div className="border border-gray-700 rounded-xl p-3 flex items-center space-x-3 opacity-40">
                  <span className="text-2xl">🏧</span>
                  <p className="text-sm text-gray-300">Net Banking</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Order Total</p>
                  <p className="text-2xl font-bold text-white">₹4,650</p>
                </div>
                <button onClick={simulatePayment} disabled={paying}
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold rounded-2xl transition flex items-center space-x-2">
                  {paying
                    ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Processing...</span></>
                    : <><CreditCard size={18} /><span>Pay ₹4,650</span></>
                  }
                </button>
              </div>

              {paying && (
                <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-blue-300 animate-pulse">🔐 Securing your payment via Razorpay... Do not close this window.</p>
                </div>
              )}
            </div>
          )}

          {/* PAYMENT FAILED */}
          {stage === 'payment_failed' && (
            <div className="space-y-4">
              <div className="bg-red-950/40 border-2 border-red-500/50 rounded-2xl p-6 text-center">
                <div className="text-5xl mb-3">❌</div>
                <h2 className="text-2xl font-bold text-red-400 mb-1">Payment Failed</h2>
                <p className="text-gray-300 text-sm mb-3">Your transaction could not be processed.</p>
                <div className="bg-red-950/60 rounded-xl p-3 inline-block">
                  <p className="text-xs text-red-300 font-mono">Error Code: E_504_GATEWAY_TIMEOUT</p>
                  <p className="text-xs text-gray-400 mt-1">HDFC Bank gateway timed out. No amount was debited.</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Transaction Details</p>
                {[
                  ['Order ID', '#RZP-8921'],
                  ['Amount', '₹4,650'],
                  ['Payment Method', 'HDFC Visa •••• 4521'],
                  ['Status', 'Failed — Gateway Timeout'],
                  ['Time', '31 Aug 2026, 8:47 PM'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-400">{k}</span>
                    <span className={k === 'Status' ? 'text-red-400 font-semibold' : 'text-white font-mono'}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-950/30 border border-amber-600/40 rounded-2xl p-4 flex items-start space-x-2">
                <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">Your AirPods Pro is still reserved!</p>
                  <p className="text-xs text-gray-400 mt-0.5">Stock is limited. Your cart is saved for 30 minutes.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setStage('checkout')}
                  className="py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition text-sm">
                  Retry Payment
                </button>
                <button className="py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium rounded-xl transition text-sm border border-gray-700">
                  Try UPI Instead
                </button>
              </div>

              <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-5 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
                  <p className="text-sm font-bold text-blue-300">RevenueOS Detected This Failure</p>
                </div>
                <p className="text-xs text-gray-400 mb-4">Our AI agent will attempt to recover this sale for the merchant automatically — in under 60 seconds.</p>
                <button onClick={simulateAgentCall}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition flex items-center space-x-2 mx-auto">
                  <Phone size={14} /><span>▶ Watch AI Recovery in Action</span>
                </button>
              </div>
            </div>
          )}

          {/* AI CALLING */}
          {stage === 'agent_calling' && (
            <div className="bg-slate-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-center mb-5">
                <div className="relative inline-block mb-3">
                  <div className="h-20 w-20 rounded-full bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center text-4xl mx-auto animate-pulse">📞</div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white animate-ping" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white">RevenueOS AI Agent Calling...</h3>
                <p className="text-sm text-gray-400 mt-1">Rajesh Kumar • +91 98450 XXXXX</p>
                <p className="text-xs text-blue-300 mt-1">Speaking in: English (auto-detected from order history)</p>
              </div>

              <div className="space-y-3 mb-5">
                {callerProgress >= 10 && (
                  <div className="bg-slate-800 rounded-xl p-3 flex items-start space-x-2 text-xs">
                    <span className="text-blue-400 flex-shrink-0 mt-0.5">🤖</span>
                    <span className="text-gray-300"><b className="text-white">Agent:</b> Hello Rajesh! This is Razorpay Support. Your Order #RZP-8921 (Apple AirPods Pro – ₹4,650) could not go through. Am I speaking with Rajesh Kumar?</span>
                  </div>
                )}
                {callerProgress >= 30 && (
                  <div className="bg-blue-600 rounded-xl p-3 flex items-start space-x-2 text-xs">
                    <span className="flex-shrink-0 mt-0.5">👤</span>
                    <span className="text-white"><b>Rajesh:</b> Yes, speaking. What happened to my payment?</span>
                  </div>
                )}
                {callerProgress >= 50 && (
                  <div className="bg-slate-800 rounded-xl p-3 flex items-start space-x-2 text-xs">
                    <span className="text-blue-400 flex-shrink-0 mt-0.5">🤖</span>
                    <span className="text-gray-300"><b className="text-white">Agent:</b> Your HDFC card timed out at the gateway — no money was deducted from your account. I am sending a secure 1-Tap WhatsApp UPI link right now. You can pay safely in one click via Google Pay or PhonePe.</span>
                  </div>
                )}
                {callerProgress >= 70 && (
                  <div className="bg-blue-600 rounded-xl p-3 flex items-start space-x-2 text-xs">
                    <span className="flex-shrink-0 mt-0.5">👤</span>
                    <span className="text-white"><b>Rajesh:</b> Okay, I got the link. Done! I paid via Google Pay.</span>
                  </div>
                )}
                {callerProgress >= 90 && (
                  <div className="bg-emerald-600/20 border border-emerald-500/40 rounded-xl p-3 flex items-start space-x-2 text-xs">
                    <span className="text-emerald-400 flex-shrink-0 mt-0.5">🤖</span>
                    <span className="text-emerald-200"><b>Agent:</b> ✓ Payment of ₹4,650 confirmed! Order #RZP-8921 approved for Priority Express Dispatch. Tax receipt sent to WhatsApp. Thank you Rajesh, enjoy your AirPods! 🎧</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-800 rounded-xl p-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>🛡️ PolicyGuard Monitoring Recovery</span>
                  <span className="text-white font-bold">{callerProgress}%</span>
                </div>
                <div className="bg-slate-700 rounded-full h-2.5">
                  <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${callerProgress}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">All AI actions verified by deterministic policy firewall before execution.</p>
              </div>
            </div>
          )}

          {/* RECOVERED */}
          {stage === 'recovered' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-6 text-center">
                <div className="text-5xl mb-3">✅</div>
                <h2 className="text-2xl font-bold text-emerald-400">Revenue Recovered!</h2>
                <p className="text-gray-300 text-sm mt-1">Order #RZP-8921 is confirmed and dispatching today.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Recovery Time', value: '47 sec', color: 'text-blue-400' },
                  { label: 'Revenue Saved', value: '₹4,650', color: 'text-emerald-400' },
                  { label: 'PolicyGuard', value: 'PASSED ✓', color: 'text-emerald-400' },
                ].map(c => (
                  <div key={c.label} className="bg-slate-900 border border-gray-800 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                    <p className={`text-base font-bold ${c.color}`}>{c.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase font-medium tracking-wider">Verified Recovery Record</p>
                {[
                  ['Recovery Method', 'AI Voice Agent + 1-Tap WhatsApp UPI'],
                  ['NPCI UTR Reference', '#904288192014'],
                  ['Payment Rail', 'Google Pay → HDFC Merchant Account'],
                  ['PolicyGuard Verdict', '✓ AUTHORIZED — No flags raised'],
                  ['Merchant Revenue', '₹4,650 credited instantly'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-400">{k}</span>
                    <span className="text-white font-medium text-right max-w-xs">{v}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowUpiHistory(true)}
                className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold rounded-xl transition flex items-center justify-center space-x-2">
                <span>📱</span><span>View Payment in Google Pay / PhonePe History</span>
              </button>

              <button onClick={reset}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-gray-700 text-gray-300 text-sm rounded-xl transition">
                🔄 Run Demo Again
              </button>
            </div>
          )}
        </div>

        {/* UPI HISTORY SIDE PANEL */}
        {showUpiHistory && (
          <div className="w-80 bg-slate-900 border-l border-gray-800 p-4 flex flex-col min-h-screen">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="text-sm font-bold text-white">Google Pay</p>
                  <p className="text-xs text-gray-400">rajesh@okhdfc</p>
                </div>
              </div>
              <button onClick={() => setShowUpiHistory(false)} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
            </div>

            <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold text-white mt-0.5">₹24,830.00</p>
              <p className="text-xs text-emerald-400 mt-1">+5% cashback credited: ₹232.50</p>
            </div>

            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Recent Transactions</p>

            <div className="space-y-2 overflow-y-auto flex-1">
              {recoveredTxn && (
                <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-xl p-3 animate-pulse-once">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🎧</span>
                      <div>
                        <p className="text-sm font-semibold text-white">ShopEase (Razorpay)</p>
                        <p className="text-xs text-gray-400">pay@razorpay</p>
                        <p className="text-xs text-emerald-400 font-medium">✓ AI Recovered</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">- ₹4,650</p>
                      <p className="text-xs text-gray-500">Just now</p>
                      <p className="text-xs text-emerald-400">Success ✓</p>
                    </div>
                  </div>
                </div>
              )}

              {UPI_HISTORY.map(txn => (
                <div key={txn.id} className="bg-slate-800/60 border border-gray-700/50 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{txn.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{txn.name}</p>
                        <p className="text-xs text-gray-400">{txn.upi}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${txn.type === 'sent' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {txn.type === 'sent' ? '−' : '+'} ₹{txn.amount}
                      </p>
                      <p className="text-xs text-gray-500">{txn.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
