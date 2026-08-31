import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LayoutDashboard, Users, Zap, Mic, Terminal, Shield, RotateCcw, Database, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RevenueOS | AI Recovery Orchestrator',
  description: 'Autonomous AI Payment Recovery & Telecalling Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 flex h-screen overflow-hidden`}>
        {/* Global SaaS Sidebar */}
        <aside className="w-64 bg-slate-950 text-white hidden md:flex flex-col shadow-2xl border-r border-slate-800 z-20">
          
          <Link href="/" className="p-6 flex items-center space-x-3 hover:opacity-90 transition">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30">
              R
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">RevenueOS</span>
          </Link>
          
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Orchestration</p>
            <Link href="/demo" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 transition text-orange-300 hover:text-orange-200 group mb-3">
              <ShoppingCart size={18} className="group-hover:text-orange-300 transition-colors" /> <span className="font-bold">▶ Live Demo</span>
              <span className="ml-auto text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold">NEW</span>
            </Link>
            <Link href="/war-room" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 transition text-slate-300 hover:text-white group">
              <LayoutDashboard size={18} className="group-hover:text-blue-400 transition-colors" /> <span className="font-medium">War Room</span>
            </Link>
            <Link href="/batch-evaluation" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 transition text-slate-300 hover:text-white group">
              <Database size={18} className="group-hover:text-emerald-400 transition-colors" /> <span className="font-medium">Recovery Analytics</span>
            </Link>
            <Link href="/customer" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 transition text-slate-300 hover:text-white group">
              <Users size={18} className="group-hover:text-blue-400 transition-colors" /> <span className="font-medium">Customer Profile</span>
            </Link>
            
            <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mt-8 mb-3">AI Agents & Modules</p>
            <Link href="/simulator" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 transition text-slate-300 hover:text-white group">
              <Zap size={18} className="group-hover:text-yellow-400 transition-colors" /> <span className="font-medium">What-If Simulator</span>
            </Link>
            <Link href="/voice" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 transition text-slate-300 hover:text-white group">
              <Mic size={18} className="group-hover:text-red-400 transition-colors" /> <span className="font-medium">Voice Engine</span>
            </Link>
            <Link href="/refunds" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 transition text-slate-300 hover:text-white group">
              <RotateCcw size={18} className="group-hover:text-emerald-400 transition-colors" /> <span className="font-medium">Instant Refunds</span>
            </Link>
            <Link href="/command-center" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 transition text-slate-300 hover:text-white group">
              <Terminal size={18} className="group-hover:text-emerald-400 transition-colors" /> <span className="font-medium">Command Center</span>
            </Link>
          </nav>
          
          <div className="p-6 border-t border-slate-900">
            <div className="flex items-center space-x-3 bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-inner">
               <Shield size={16} className="text-emerald-400" />
               <span className="text-xs text-slate-300 font-medium">Policy Guard: <span className="text-emerald-400 font-bold ml-1">ACTIVE</span></span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
          <div className="relative z-10 p-0">
            {children}
          </div>
        </main>
        
        {/* Floating Global Chat Widget */}
        <ChatWidget />
      </body>
    </html>
  );
}
