'use client';

import React, { useState } from 'react';
import { User, AlertTriangle, TrendingUp, CreditCard, Clock, Activity, Cpu, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerProfile() {
  const router = useRouter();
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      router.push('/command-center');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Rahul Sharma</h1>
            <p className="text-gray-500">Customer ID: CUST-98214 • Since Aug 2024</p>
          </div>
        </div>
        <div className="text-right bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-semibold text-red-500 uppercase tracking-wide">Revenue At Risk</p>
          <h2 className="text-3xl font-bold text-gray-900">₹7,999</h2>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl">
        
        {/* Left Column - Metrics */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium flex items-center"><AlertTriangle size={16} className="mr-2 text-red-500"/> Revenue Risk</span>
              <span className="text-2xl font-bold text-red-600">87%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium flex items-center"><TrendingUp size={16} className="mr-2 text-green-500"/> Recovery Prob.</span>
              <span className="text-2xl font-bold text-green-600">82%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-5">
            <div>
              <p className="text-sm text-gray-500 mb-1">Preferred Method</p>
              <p className="font-semibold flex items-center text-gray-900"><CreditCard size={16} className="mr-2 text-blue-500"/> UPI (Razorpay)</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Previous Retry Success</p>
              <p className="font-semibold text-green-600 text-lg">73%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Best Contact Time</p>
              <p className="font-semibold flex items-center text-gray-900"><Clock size={16} className="mr-2 text-purple-500"/> 7:00 PM – 9:00 PM</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-3">Payment History</p>
              <div className="flex space-x-1.5 items-end h-8">
                {/* ████████████░░ visual representation */}
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                  <div key={i} className="h-full w-4 bg-green-500 rounded-sm"></div>
                ))}
                <div className="h-full w-4 bg-red-400 rounded-sm animate-pulse border-2 border-red-500"></div>
                <div className="h-full w-4 bg-gray-200 rounded-sm"></div>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">12 success • 1 failed • 1 pending</p>
            </div>
          </div>
        </div>

        {/* Right Column - AI Diagnosis & Recommendation */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
              <Activity size={18} className="mr-2"/> AI Diagnosis
            </h3>
            <p className="text-xl font-medium text-gray-800 leading-relaxed">
              Payment-method friction. Customer's saved credit card is consistently failing, but historical signals show high intent to pay via UPI.
            </p>
          </div>

          <div className="bg-blue-600 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 opacity-10">
              <Cpu size={220} />
            </div>
            
            <h3 className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-4 relative z-10">AI Recommendation</h3>
            <h2 className="text-3xl font-bold mb-8 relative z-10 leading-tight">Use UPI payment link instead of another card retry.</h2>
            
            <div className="bg-blue-700/40 rounded-xl p-6 border border-blue-500/30 relative z-10">
              <p className="font-semibold text-blue-100 mb-4 uppercase tracking-wider text-xs">Reasoning Engine</p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-blue-300 mr-3 mt-0.5 shrink-0" />
                  <span className="text-blue-50">Customer historically prefers UPI for transactions over ₹5,000.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-blue-300 mr-3 mt-0.5 shrink-0" />
                  <span className="text-blue-50">Previous background card attempts failed due to bank network limits.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-blue-300 mr-3 mt-0.5 shrink-0" />
                  <span className="text-blue-50">Generates the lowest customer friction under current policy limits.</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-8 flex flex-col space-y-3 relative z-10">
              <div className="flex items-center text-sm font-semibold text-blue-200 mb-2">
                <span className="flex h-2 w-2 relative mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                AUTOPILOT ACTIVE: THIS STRATEGY WAS EXECUTED AUTONOMOUSLY
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-50 transition shadow-sm hover:scale-[1.02] disabled:opacity-75 disabled:cursor-wait"
                >
                  {isExecuting ? "TRACE GENERATING..." : "VIEW EXECUTION TRACE"}
                </button>
                <button 
                  onClick={() => router.push('/simulator')}
                  className="px-6 py-3 bg-blue-700/60 text-white font-medium rounded-lg hover:bg-blue-800 transition border border-blue-500/30"
                >
                  WHAT-IF SIMULATOR
                </button>
              </div>
            </div>
          </div>

          {/* WhatsApp Last-Mile Preview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between text-white">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold overflow-hidden mr-3">
                  <span className="text-xs">RS</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Rahul Sharma</p>
                  <p className="text-xs text-green-100 opacity-80">WhatsApp Business API</p>
                </div>
              </div>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Message Sent by AI</span>
            </div>
            <div className="p-6 bg-[#EFEAE2] relative" style={{backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover', opacity: 0.95}}>
              <div className="flex justify-end relative z-10">
                <div className="bg-[#DCF8C6] rounded-xl rounded-tr-none p-3 max-w-[85%] shadow-sm text-sm text-gray-800">
                  <p className="mb-1 text-[10px] font-bold text-gray-500 tracking-wider">🤖 REVENUEOS AUTOPILOT</p>
                  <p className="leading-relaxed">
                    Hi Rahul! We noticed your recent payment of <b>₹7,999</b> on your saved card failed.<br/><br/>
                    To secure your subscription without interruption, you can quickly complete it via UPI using this secure Razorpay link:<br/>
                  </p>
                  <a href="#" className="text-blue-600 underline font-medium block mt-2 hover:text-blue-800">https://rzp.io/i/7xF81Lm</a>
                  <div className="flex justify-end items-center mt-1">
                    <p className="text-[10px] text-gray-500 mr-1">10:42 AM</p>
                    <span className="text-blue-500 text-[10px]">✓✓</span>
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
