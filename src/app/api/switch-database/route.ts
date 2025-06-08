import { NextRequest, NextResponse } from 'next/server';
import { switchDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { database } = await request.json();
    
    if (database !== 'UAT' && database !== 'PROD') {
      return NextResponse.json(
        { success: false, error: 'Invalid database selection' },
        { status: 400 }
      );
    }

    const result = await switchDatabase(database);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 