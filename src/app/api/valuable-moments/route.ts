import { NextRequest, NextResponse } from 'next/server';
import { getAllValuableMoments } from '@/lib/queries/valuable-moments';

export const dynamic = 'force-dynamic';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const businessIds = url.searchParams.get('businessIds');
    const days = parseInt(url.searchParams.get('days') || '30');

    // Parse business IDs
    const parsedBusinessIds = businessIds 
      ? businessIds.split(',').map(id => parseInt(id))
      : null;

    // Calculate date range
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const metrics = await getAllValuableMoments(parsedBusinessIds, {
      startDate,
      endDate
    });

    const totalVMAll = metrics.reduce((sum, m) => sum + (m.totalVM || 0), 0);
    const avgVMPerCompany = metrics.length ? totalVMAll / metrics.length : 0;

    return NextResponse.json({ success: true, data: metrics, totals: { totalVMAll, avgVMPerCompany } });
  } catch (error) {
    console.error('Error fetching valuable moments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 