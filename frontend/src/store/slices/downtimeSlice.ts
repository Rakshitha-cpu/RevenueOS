import { BankDowntimeInfo } from '../types';

export const INITIAL_DOWNTIMES: BankDowntimeInfo[] = [
  { bank: "HDFC Bank", instrument: "Netbanking", status: "DEGRADED (98% timeout)", rerouteAction: "Rerouted to UPI / ICICI" },
  { bank: "State Bank of India", instrument: "UPI / IMPS", status: "HEALTHY (99.4% success)", rerouteAction: "Primary Active Rail" },
  { bank: "ICICI Bank", instrument: "Credit Cards", status: "HEALTHY", rerouteAction: "Active Fallback" }
];
