export interface TraceEvent {
  time: string;
  agent: string;
  action: string;
  iconName: string;
  color: string;
  bg: string;
}

export interface BatchMetrics {
  totalSimulated: number;
  valueAtRisk: number;
  upliftPercentage: number;
  baselinePercentage: number;
  totalRecovered: number;
}

export interface BankDowntimeInfo {
  bank: string;
  instrument: string;
  status: string;
  rerouteAction: string;
}

export type ScenarioType = 'BANK_OUTAGE' | 'VIP_RECOVERY' | 'FRAUD_BLOCK';
