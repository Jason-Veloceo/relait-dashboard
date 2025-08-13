import { NextResponse } from 'next/server';
import { getBusinesses } from '@/lib/queries/business';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const businesses = await getBusinesses();
    return NextResponse.json({ success: true, data: businesses });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 