'use client';

import React, { useState } from 'react';
import { CheckCircle, Zap, ShieldAlert, Play } from 'lucide-react';

export default function WhatIfSimulator() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const strategies = [
    { name: "Immediate retry", expected: "₹6.4L", risk: "Low", color: "bg-green-100 text-green-700" },
    { name: "Email + link", expected: "₹7.3L", risk: "Low", color: "bg-green-100 text-green-700" },
    { name: "Payment link", expected: "₹8.1L", risk: "Low", color: "bg-green-100 text-green-700", recommended: true },
    { name: "Voice + UPI", expected: "₹9.3L", risk: "Medium", color: "bg-yellow-100 text-yellow-700" },
    { name: "Human escalation", expected: "₹5.9L", risk: "Low", color: "bg-green-100 text-green-700" },
  ];

  const handleDeploy = () => {
    setIsDeploying(true);
    // Simulate the policy check and execution delay
    setTimeout(() => {
      setIsDeploying(false);
      setDeployed(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">What-If Simulator</h1>
        <p className="text-gray-500 mt-1">Compare AI recovery strategies and simulate financial impact.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Strategy Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Revenue Opportunity</p>
              <h2 className="text-3xl font-bold text-gray-900">₹10.0L</h2>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Zap size={24} />
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-4 font-semibold text-sm text-gray-500">Strategy</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Expected Recovery</th>
                <th className="p-4 font-semibold text-sm text-gray-500">Risk Profile</th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((s, idx) => (
                <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 transition ${s.recommended ? 'bg-blue-50/20' : ''}`}>
                  <td className="p-4 flex items-center font-medium">
                    {s.recommended && <CheckCircle size={16} className="text-blue-500 mr-2" />}
                    {s.name}
                  </td>
                  <td className="p-4 font-bold">{s.expected}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${s.color}`}>
                      {s.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column - Recommendation & Deploy */}
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Zap size={120} />
            </div>
            <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-1">AI Recommendation</h3>
            <h2 className="text-2xl font-bold mb-4">Payment Link</h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-6 relative z-10">
              <strong>Voice + UPI</strong> has higher expected recovery, but <strong>Payment Link</strong> achieves a better recovery/friction tradeoff under the current merchant policy (Max 2 contacts).
            </p>
            
            <button 
              onClick={handleDeploy}
              disabled={isDeploying || deployed}
              className={`relative z-10 w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-bold transition shadow-sm ${
                deployed 
                  ? 'bg-green-500 text-white cursor-default'
                  : isDeploying
                    ? 'bg-blue-700 text-blue-200 cursor-wait'
                    : 'bg-white text-blue-600 hover:bg-gray-50 hover:scale-[1.02]'
              }`}
            >
              {deployed ? (
                <>
                  <CheckCircle size={18} />
                  <span>PLAN DEPLOYED</span>
                </>
              ) : isDeploying ? (
                <span>AUTHORIZING...</span>
              ) : (
                <>
                  <Play size={18} />
                  <span>DEPLOY PLAN</span>
                </>
              )}
            </button>
          </div>

          {/* Policy Guard Check UI */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
             <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
               <ShieldAlert size={16} className="mr-2 text-gray-500" />
               Pre-Flight Policy Check
             </h3>
             <ul className="space-y-3 text-sm">
               <li className="flex items-center text-green-700 font-medium">
                 <CheckCircle size={14} className="mr-2" /> Fraud score within limits
               </li>
               <li className="flex items-center text-green-700 font-medium">
                 <CheckCircle size={14} className="mr-2" /> Value under ₹50k threshold
               </li>
               <li className="flex items-center text-green-700 font-medium">
                 <CheckCircle size={14} className="mr-2" /> Customer contact limits OK
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
