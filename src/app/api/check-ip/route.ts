import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get Vercel's outbound IP by calling an external service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    
    return NextResponse.json({
      vercel_ip: data.ip,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get IP' },
      { status: 500 }
    );
  }
}
