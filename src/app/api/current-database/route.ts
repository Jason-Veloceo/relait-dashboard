import { NextResponse } from 'next/server';
import { getCurrentDatabase } from '@/lib/db';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      database: getCurrentDatabase()
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
 