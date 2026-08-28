'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { AlertTriangle, TrendingUp, Shield, ArrowUpRight, Zap, Target, User } from 'lucide-react';

const mockChartData = [
  { time: '09:00', recovered: 12000, lost: 45000 },
  { time: '10:00', recovered: 25000, lost: 42000 },
  { time: '11:00', recovered: 48000, lost: 38000 },
  { time: '12:00', recovered: 85000, lost: 35000 },
  { time: '13:00', recovered: 112000, lost: 30000 },
  { time: '14:00', recovered: 145000, lost: 28000 },
  { time: '15:00', recovered: 180000, lost: 25000 },
];

export default function Dashboard() {
  return (
    <div className="font-sans max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Revenue War Room</h1>
          <p className="text-slate-500 font-medium">Real-time overview of failed payments and AI-driven recovery.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <span className="flex h-3 w-3 relative mr-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-semibold text-slate-700">AI Agents Active</span>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-800 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Target size={120} />
          </div>
          <p className="text-slate-400 font-medium mb-1">Total Revenue At Risk</p>
          <h2 className="text-4xl font-black text-white mb-2">₹12.4L</h2>
          <p className="text-sm text-red-400 flex items-center font-medium">
            <TrendingUp size={16} className="mr-1" /> +14% vs yesterday
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-blue-600/20 border border-blue-500 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Zap size={120} />
          </div>
          <p className="text-blue-200 font-medium mb-1">AI Recovered (Today)</p>
          <h2 className="text-4xl font-black text-white mb-2">₹4.2L</h2>
          <p className="text-sm text-blue-100 flex items-center font-medium">
            <ArrowUpRight size={16} className="mr-1" /> 182 successful interventions
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
           <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-slate-900">
            <Shield size={120} />
          </div>
          <p className="text-slate-500 font-medium mb-1">Policy Guard Blocks</p>
          <h2 className="text-4xl font-black text-slate-900 mb-2">24</h2>
          <p className="text-sm text-emerald-600 flex items-center font-medium">
            <Shield size={16} className="mr-1" /> AI actions safely blocked
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-200 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-xl text-slate-800">Recovery Trajectory</h3>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500">
              <option>Today</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="recovered" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRecovered)" />
                <Line type="monotone" dataKey="lost" stroke="#cbd5e1" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Action Priority List */}
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-slate-800 flex items-center">
              <AlertTriangle className="mr-2 text-amber-500" size={20} />
              Policy Guard Escalations
            </h3>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-md">HUMAN REQUIRED</span>
          </div>
          <div className="space-y-4">
            
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-900">Enterprise Corp</span>
                <span className="font-bold text-red-600">₹8.4L</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">Autopilot blocked: Threshold exceeded (₹50k limit).</p>
              <button className="text-sm font-semibold text-amber-700 bg-amber-100/50 hover:bg-amber-200 px-3 py-1.5 rounded-lg w-full transition-colors">
                Manually Approve
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-900">TechCorp India</span>
                <span className="font-bold text-red-600">₹1.2L</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">AI Confidence Low (42%). Customer sentiment is angry. Handoff requested.</p>
              <button className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg w-full transition-colors flex justify-center items-center">
                <User size={16} className="mr-2" /> Take Over (Human)
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-900">Rahul Sharma</span>
                <span className="font-bold text-emerald-600">₹7,999</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">Autopilot executing: Razorpay UPI link generated.</p>
              <div className="flex space-x-2">
                <button className="text-sm font-semibold text-emerald-700 bg-emerald-100/50 px-3 py-1.5 rounded-lg w-full cursor-default">
                  Processing...
                </button>
                <button className="text-sm font-semibold text-slate-500 bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded-lg transition-colors">
                  Halt
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-900">Priya Desai</span>
                <span className="font-bold text-emerald-600">₹12,500</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">Autopilot executing: Follow-up scheduled for tomorrow.</p>
              <button className="text-sm font-semibold text-emerald-700 bg-emerald-100/50 px-3 py-1.5 rounded-lg w-full cursor-default">
                Scheduled
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
