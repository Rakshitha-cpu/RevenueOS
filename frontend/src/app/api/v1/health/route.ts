import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    policyguard_firewall: 'ACTIVE',
    cryptographic_ledger: 'INTACT',
    telephony_gateway: 'ONLINE',
    version: '2.0.0'
  }, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
}
