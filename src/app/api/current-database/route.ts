import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const currentDb = process.env.ACTIVE_DB || 'UAT';
    return NextResponse.json({
      success: true,
      database: currentDb as 'UAT' | 'PROD'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
 