import { ScenarioType, TraceEvent } from '../types';

export const SCENARIO_EVENTS: Record<ScenarioType, TraceEvent[]> = {
  BANK_OUTAGE: [
    { time: "10:14:01", agent: "Webhook Guard", action: "Ingested Razorpay event payment.downtime.started (HDFC)", iconName: "Shield", color: "text-amber-400", bg: "bg-amber-900" },
    { time: "10:14:02", agent: "Downtime Engine", action: "HDFC Netbanking degraded (98% timeout rate)", iconName: "Cpu", color: "text-red-400", bg: "bg-red-900" },
    { time: "10:14:03", agent: "Policy Guard", action: "Evaluated Rule 9 (Bank Outage Reroute) -> PASS", iconName: "Shield", color: "text-emerald-400", bg: "bg-emerald-900" },
    { time: "10:14:04", agent: "Reroute Orchestrator", action: "Trip wire activated: Rerouted 42 checkout sessions to ICICI/UPI rail", iconName: "Zap", color: "text-blue-400", bg: "bg-blue-900" },
    { time: "10:14:05", agent: "Execution Guard", action: "Generated 1-tap UPI payment links for 42 pending orders", iconName: "CreditCard", color: "text-emerald-400", bg: "bg-emerald-900" },
    { time: "10:14:06", agent: "Ledger", action: "Committed event to Cryptographic Audit Trail (Block #8921)", iconName: "CheckCircle", color: "text-purple-400", bg: "bg-purple-900" }
  ],
  VIP_RECOVERY: [
    { time: "11:20:00", agent: "Webhook Guard", action: "Captured high-value checkout drop (₹8,500 - AirPods Pro)", iconName: "Shield", color: "text-amber-400", bg: "bg-amber-900" },
    { time: "11:20:01", agent: "Risk Engine", action: "Customer classified as VIP Tier 1 (LTV ₹92,000, 0% fraud risk)", iconName: "Cpu", color: "text-blue-400", bg: "bg-blue-900" },
    { time: "11:20:02", agent: "Policy Guard", action: "Evaluated Rule 2 (Max Discount Cap 5.0% = ₹425) -> APPROVED", iconName: "Shield", color: "text-emerald-400", bg: "bg-emerald-900" },
    { time: "11:20:03", agent: "Voice Engine", action: "Dispatched Vernacular Voice Call in Hindi / Kannada (Sub-400ms SLA)", iconName: "Zap", color: "text-purple-400", bg: "bg-purple-900" },
    { time: "11:20:05", agent: "WhatsApp Bridge", action: "Delivered 1-Tap UPI deep link to WhatsApp (+91 98450 XXXXX)", iconName: "CreditCard", color: "text-emerald-400", bg: "bg-emerald-900" },
    { time: "11:20:08", agent: "Ledger", action: "Verified customer 2FA confirmation; Revenue recovered successfully", iconName: "CheckCircle", color: "text-emerald-400", bg: "bg-emerald-900" }
  ],
  FRAUD_BLOCK: [
    { time: "14:05:12", agent: "Webhook Guard", action: "Ingested high-velocity transaction spike (12 attempts / min)", iconName: "Shield", color: "text-amber-400", bg: "bg-amber-900" },
    { time: "14:05:13", agent: "Risk Engine", action: "Calculated Fraud Score: 94/100 (Blacklisted IP & Device Fingerprint)", iconName: "Cpu", color: "text-red-400", bg: "bg-red-900" },
    { time: "14:05:14", agent: "Policy Guard", action: "🚨 RULE 4 TRIPPED: Velocity & Fraud Ceiling Exceeded (>85)", iconName: "Shield", color: "text-red-400", bg: "bg-red-900" },
    { time: "14:05:15", agent: "Execution Guard", action: "Halted automated recovery; Revoked discount authorization", iconName: "Zap", color: "text-amber-400", bg: "bg-amber-900" },
    { time: "14:05:16", agent: "Ledger", action: "Logged Security Incident #SEC-9042 with SHA-256 Proof of Interception", iconName: "CheckCircle", color: "text-purple-400", bg: "bg-purple-900" }
  ]
};
