import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LayoutDashboard, Users, Zap, Mic, Terminal, Shield } from 'lucide-react';
import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RevenueOS | AI Recovery Orchestrator',
  description: 'Built for Razorpay Hackathon',
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
          
          <div className="p-6 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30">
              R
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">RevenueOS</span>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Orchestration</p>
            <Link href="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 transition text-slate-300 hover:text-white group">
              <LayoutDashboard size={18} className="group-hover:text-blue-400 transition-colors" /> <span className="font-medium">War Room</span>
            </Link>
            <Link href="/customer" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 transition text-slate-300 hover:text-white group">
              <Users size={18} className="group-hover:text-blue-400 transition-colors" /> <span className="font-medium">Customer Profile</span>
            </Link>
            
            <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mt-8 mb-3">AI Agents</p>
            <Link href="/simulator" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 transition text-slate-300 hover:text-white group">
              <Zap size={18} className="group-hover:text-yellow-400 transition-colors" /> <span className="font-medium">What-If Simulator</span>
            </Link>
            <Link href="/voice" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 transition text-slate-300 hover:text-white group">
              <Mic size={18} className="group-hover:text-red-400 transition-colors" /> <span className="font-medium">Voice Engine</span>
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
          {/* Subtle top gradient accent for SaaS feel */}
          <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 p-4 md:p-8">
            {children}
          </div>
        </main>
        
        {/* Global Ask AI Chatbot Component */}
        <ChatWidget />
      </body>
    </html>
  );
}
