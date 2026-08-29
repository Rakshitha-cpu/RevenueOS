'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, ArrowRight, ShieldCheck, Phone, RefreshCw, BarChart3, Lock, 
  ChevronRight, Sparkles, CheckCircle2, Globe, Cpu, Smartphone, 
  Mail, KeyRound, Shield, Check, Star, Play, Terminal, ArrowUpRight
} from 'lucide-react';

export default function LandingAndAuthPage() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'OTP_VERIFY'>('LOGIN');
  
  // Auth Form State
  const [authMethod, setAuthMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // 3 Professional Animated Feature Showcase Slides
  const SLIDES = [
    {
      badge: "Autonomous Telecaller & Speech AI",
      title: "Human-Grade Vernacular Voice Agent Priya",
      desc: "Answers customer queries in 6 Indian languages (Kannada, Hindi, English, Tamil, Telugu, Malayalam), probes cancellation motives with zero blind assumptions, and executes seamless manager escalation.",
      stat: "42.8% Recovery Uplift",
      icon: Phone,
      color: "from-blue-500 via-indigo-600 to-purple-600",
      targetUrl: "/voice"
    },
    {
      badge: "T+0 Instant Reversals",
      title: "2.18s Instant Refund & 5% Goodwill Engine",
      desc: "Resolves double-debits in sub-3-seconds through direct Razorpay refund APIs with automated NPCI UTR audit trails, or issues 5% bonus store credits to save the cart.",
      stat: "2.18s Settlement Speed",
      icon: RefreshCw,
      color: "from-emerald-500 via-teal-600 to-cyan-600",
      targetUrl: "/refunds"
    },
    {
      badge: "Executive Strategy Simulator",
      title: "Monte Carlo Revenue What-If Sandbox",
      desc: "Simulate recovery gain vs. brand fatigue trade-offs across aggressive, balanced, and policy-guarded strategies before deploying to live production.",
      stat: "₹12.4L Daily Risk Managed",
      icon: BarChart3,
      color: "from-amber-500 via-orange-600 to-rose-600",
      targetUrl: "/simulator"
    }
  ];

  // Auto-advance sliding animation every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setAuthMode('OTP_VERIFY');
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setAuthSuccess(true);
      setTimeout(() => {
        router.push('/war-room');
      }, 1000);
    }, 1000);
  };

  const handleOAuthLogin = (provider: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setAuthSuccess(true);
      setTimeout(() => {
        router.push('/war-room');
      }, 800);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Professional Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-slate-800/80 relative z-20">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-xl text-white shadow-xl shadow-blue-500/30">
            R
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              RevenueOS
            </span>
            <span className="hidden sm:inline-block ml-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
              v2.5 Production
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { setAuthMode('LOGIN'); setShowAuthModal(true); }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
          >
            Sign In
          </button>
          
          <button
            onClick={() => { setAuthMode('REGISTER'); setShowAuthModal(true); }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition hover:scale-105 flex items-center"
          >
            Get Started Free <ArrowRight size={14} className="ml-1.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-20 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-semibold mb-6 shadow-inner animate-pulse">
            <Sparkles size={13} className="text-yellow-400" />
            <span>Autonomous AI Recovery & Vernacular Telecalling</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
            Stop Losing 40% of Cart Revenue to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Failed Checkouts
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8">
            RevenueOS autonomously inspects gateway errors, speaks to customers in their mother tongue with zero blind assumptions, sends 1-tap WhatsApp UPI links, and issues T+0 refunds in 2.18 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { setAuthMode('REGISTER'); setShowAuthModal(true); }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition hover:scale-105 flex items-center justify-center"
            >
              Open Revenue War Room <ArrowRight size={16} className="ml-2" />
            </button>
            <Link
              href="/voice"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition flex items-center justify-center"
            >
              <Phone size={15} className="mr-2 text-blue-400" /> Test Live Voice AI (Priya)
            </Link>
          </div>
        </div>

        {/* Dynamic Animated Sliding Showcase */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Slider Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
                {SLIDES[activeSlide].badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {SLIDES[activeSlide].title}
              </h2>
            </div>
            
            {/* Slide Navigation Dots */}
            <div className="flex items-center space-x-2">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeSlide === idx ? 'w-8 bg-blue-500' : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Slide Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {SLIDES[activeSlide].desc}
              </p>

              <div className="inline-flex items-center space-x-2 bg-black/50 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-emerald-400">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Impact Metric: <strong>{SLIDES[activeSlide].stat}</strong></span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => { setAuthMode('REGISTER'); setShowAuthModal(true); }}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center shadow-lg transition hover:scale-105"
                >
                  Launch This Module <ChevronRight size={15} className="ml-1" />
                </button>
              </div>
            </div>

            {/* Interactive Preview Mock */}
            <div className="lg:col-span-5 bg-black/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3 mb-4">
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2"></span>
                  Live Telemetry Pipeline
                </span>
                <span className="font-mono text-blue-400">Razorpay Rails</span>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Customer Dossier</span>
                  <span className="font-bold text-white">Rajesh Kumar • Apple AirPods Pro (₹4,650)</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Agent State</span>
                    <span className="font-bold text-blue-400">Priya (Dialect: Kannada/Hindi/Eng)</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-[10px]">
                    Verified
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Autonomous Action</span>
                  <span className="font-bold text-emerald-400">T+0 Instant Reversal • UTR #904288192014</span>
                </div>
              </div>
            </div>

          </div>

        </section>

      </main>

      {/* Professional Authentication Modal (Login / Register / OTP) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-slate-100">
            
            {/* Close Button */}
            <button
              onClick={() => { setShowAuthModal(false); setAuthSuccess(false); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-xs font-mono p-1"
            >
              ✕ CLOSE
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/30 mb-3">
                R
              </div>
              <h3 className="text-xl font-bold text-white">
                {authSuccess 
                  ? 'Authentication Successful!'
                  : authMode === 'OTP_VERIFY' 
                    ? 'Enter 6-Digit Verification Code' 
                    : authMode === 'REGISTER' 
                      ? 'Create Merchant Account' 
                      : 'Sign in to RevenueOS'}
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                {authSuccess
                  ? 'Redirecting to Revenue War Room...'
                  : authMode === 'OTP_VERIFY'
                    ? `We sent a security code to ${emailOrPhone}`
                    : 'Access your autonomous revenue recovery workspace'}
              </p>
            </div>

            {/* Success Animation */}
            {authSuccess ? (
              <div className="py-8 text-center space-y-3 animate-fade-in">
                <div className="w-14 h-14 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check size={28} />
                </div>
                <p className="text-xs text-slate-300 font-medium">Session initialized. Opening War Room...</p>
              </div>
            ) : authMode === 'OTP_VERIFY' ? (
              
              /* OTP Form */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2 text-center">
                    Verification OTP
                  </label>
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        defaultValue={idx === 0 ? "7" : idx === 1 ? "4" : idx === 2 ? "2" : idx === 3 ? "9" : idx === 4 ? "0" : "1"}
                        className="w-10 h-12 text-center text-lg font-bold bg-black border border-slate-800 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-center text-slate-500 mt-2">
                    Demo OTP autofilled: <strong>742901</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {isVerifying ? 'Verifying Code...' : 'Verify & Enter Workspace'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('LOGIN')}
                    className="text-[11px] text-slate-400 hover:text-blue-400 transition"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>

            ) : (

              /* Login / Register Form */
              <div className="space-y-4">
                
                {/* Google & SSO Quick OAuth Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleOAuthLogin('Google')}
                    className="py-2.5 px-3 rounded-xl bg-black border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-200 flex items-center justify-center transition"
                  >
                    <Globe size={14} className="mr-2 text-red-400" />
                    Google SSO
                  </button>
                  <button
                    onClick={() => handleOAuthLogin('Razorpay')}
                    className="py-2.5 px-3 rounded-xl bg-black border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-200 flex items-center justify-center transition"
                  >
                    <ShieldCheck size={14} className="mr-2 text-blue-400" />
                    Razorpay SSO
                  </button>
                </div>

                <div className="flex items-center my-3">
                  <div className="flex-1 border-t border-slate-800"></div>
                  <span className="px-3 text-[10px] uppercase font-mono text-slate-500">Or continue with</span>
                  <div className="flex-1 border-t border-slate-800"></div>
                </div>

                {/* Email / Phone Toggle */}
                <div className="flex bg-black p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setAuthMethod('EMAIL')}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                      authMethod === 'EMAIL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mail size={12} className="inline mr-1" /> Work Email
                  </button>
                  <button
                    onClick={() => setAuthMethod('PHONE')}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                      authMethod === 'PHONE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone size={12} className="inline mr-1" /> Mobile Number
                  </button>
                </div>

                <form onSubmit={handleSendCode} className="space-y-3">
                  {authMode === 'REGISTER' && (
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Full Name / Merchant Organization
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-black border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      {authMethod === 'EMAIL' ? 'Work Email Address' : '10-Digit Mobile Number'}
                    </label>
                    <input
                      type={authMethod === 'EMAIL' ? 'email' : 'tel'}
                      required
                      placeholder={authMethod === 'EMAIL' ? 'name@company.com' : '+91 98450 XXXXX'}
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full bg-black border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center justify-center mt-2"
                  >
                    {isVerifying ? 'Sending Security Code...' : 'Send Verification OTP →'}
                  </button>
                </form>

                {/* Switch Login / Register */}
                <div className="text-center pt-2 text-xs text-slate-400">
                  {authMode === 'LOGIN' ? (
                    <p>
                      Don't have an account?{' '}
                      <button
                        onClick={() => setAuthMode('REGISTER')}
                        className="text-blue-400 hover:underline font-semibold"
                      >
                        Register Free
                      </button>
                    </p>
                  ) : (
                    <p>
                      Already registered?{' '}
                      <button
                        onClick={() => setAuthMode('LOGIN')}
                        className="text-blue-400 hover:underline font-semibold"
                      >
                        Sign In
                      </button>
                    </p>
                  )}
                </div>

              </div>

            )}

          </div>

        </div>
      )}

    </div>
  );
}
