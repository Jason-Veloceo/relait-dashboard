import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const businessIds = searchParams.get('businessIds')?.split(',').map(Number);

    const businessFilter = businessIds?.length 
      ? 'AND business_id = ANY($2)'
      : '';

    // Query to get daily counts of all valuable moments
    const query = `
      WITH date_series AS (
        SELECT d::date as date
        FROM generate_series(
          CURRENT_DATE - INTERVAL '1 day' * $1,
          CURRENT_DATE,
          INTERVAL '1 day'
        ) d
      ),
      daily_data AS (
        -- Emails
        SELECT 
          DATE(created_on) as date,
          COUNT(*) as count,
          'email' as type
        FROM emails
        WHERE created_on >= CURRENT_DATE - INTERVAL '1 day' * $1
        ${businessFilter}
        GROUP BY DATE(created_on)
        
        UNION ALL
        
        -- Questions
        SELECT 
          DATE(answer_date) as date,
          COUNT(*) as count,
          'question' as type
        FROM questions
        WHERE answer_date >= CURRENT_DATE - INTERVAL '1 day' * $1
        AND status = 'ANSWERED'
        ${businessFilter}
        GROUP BY DATE(answer_date)
        
        UNION ALL
        
        -- Social Posts
        SELECT 
          DATE(created_on) as date,
          COUNT(*) as count,
          'social' as type
        FROM social_post
        WHERE created_on >= CURRENT_DATE - INTERVAL '1 day' * $1
        AND status = 'POSTED'
        ${businessFilter}
        GROUP BY DATE(created_on)
        
        UNION ALL
        
        -- Content
        SELECT 
          DATE(created_on) as date,
          COUNT(*) as count,
          'content' as type
        FROM content_page
        WHERE created_on >= CURRENT_DATE - INTERVAL '1 day' * $1
        AND types IN ('PDF', 'YOUTUBE', 'CONTENT')
        AND headline_id IS NULL
        ${businessFilter}
        GROUP BY DATE(created_on)
      ),
      daily_totals AS (
        SELECT 
          ds.date,
          COALESCE(SUM(dd.count), 0) as total_moments
        FROM date_series ds
        LEFT JOIN daily_data dd ON ds.date = dd.date
        GROUP BY ds.date
      )
      SELECT 
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        total_moments,
        SUM(total_moments) OVER (
          ORDER BY date ASC 
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) as cumulative_total
      FROM daily_totals
      ORDER BY date ASC;
    `;

    const params = businessIds?.length ? [days, businessIds] : [days];
    
    try {
      console.log('Executing query with params:', { days, businessIds: businessIds || [] });
      const result = await pool.query(query, params);
      console.log('Query executed successfully');
      return NextResponse.json({
        success: true,
        data: result.rows
      });
    } catch (dbError: any) {
      console.error('Database error details:', {
        message: dbError?.message,
        code: dbError?.code,
        detail: dbError?.detail,
        where: dbError?.where,
        hint: dbError?.hint
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database error', 
          details: dbError?.message || String(dbError),
          code: dbError?.code,
          hint: dbError?.hint
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in daily valuable moments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch daily valuable moments', details: error?.message || String(error) },
      { status: 500 }
    );
  }
} 