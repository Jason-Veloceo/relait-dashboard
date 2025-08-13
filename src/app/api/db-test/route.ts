import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await testConnection();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 