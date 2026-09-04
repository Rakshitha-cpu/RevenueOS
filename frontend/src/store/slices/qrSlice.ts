export interface QRState {
  qrSecondsRemaining: number;
  qrStatus: 'ACTIVE' | 'PAID' | 'EXPIRED';
}

export const INITIAL_QR_STATE: QRState = {
  qrSecondsRemaining: 300,
  qrStatus: 'ACTIVE'
};
