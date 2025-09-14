import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { subDays, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get('businessId');
    const days = searchParams.get('days');
    const type = searchParams.get('type'); // 'emails', 'questions', 'social', 'content'

    console.log('Received request:', {
      businessId,
      days,
      type,
      searchParams: Object.fromEntries(searchParams.entries())
    });

    if (!businessId || !days || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = subDays(endDate, parseInt(days));
    const formattedStartDate = format(startDate, 'yyyy-MM-dd HH:mm:ss');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd HH:mm:ss');
    
    console.log('Date range:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      daysRequested: days
    });
    
    let sqlQuery = '';
    const params = [parseInt(businessId), formattedStartDate, formattedEndDate];

    switch (type) {
      case 'emails':
        sqlQuery = `
          SELECT 
            TO_CHAR(e.created_on, 'DD/MM/YYYY') as date,
            e.subject as content
          FROM users u
          JOIN emails e ON e.business_id = u.id
          WHERE u.id = $1
            AND u.user_type = 'BUSINESS'
            AND u.deleted IS NOT TRUE
            AND u.active = TRUE
            AND e.status = 'SENT'
            AND e.created_on >= $2::timestamp
            AND e.created_on <= $3::timestamp
          ORDER BY e.created_on DESC
        `;
        break;

      case 'questions':
        sqlQuery = `
          SELECT 
            TO_CHAR(q.answer_date, 'DD/MM/YYYY') as date,
            q.question as content
          FROM users u
          JOIN questions q ON q.business_id = u.id
          WHERE u.id = $1
            AND u.user_type = 'BUSINESS'
            AND u.deleted IS NOT TRUE
            AND u.active = TRUE
            AND q.status = 'ANSWERED'
            AND q.answer_date >= $2::timestamp
            AND q.answer_date <= $3::timestamp
          ORDER BY q.answer_date DESC
        `;
        break;

      case 'social':
        sqlQuery = `
          SELECT 
            TO_CHAR(sp.posted_date, 'DD/MM/YYYY') as date,
            cp.headline as content
          FROM social_post sp
          JOIN content_page cp ON cp.id = sp.content_id
          WHERE sp.business_id = $1
            AND sp.status = 'POSTED'
            AND sp.posted_date >= $2::timestamp
            AND sp.posted_date <= $3::timestamp
          ORDER BY sp.posted_date DESC
        `;
        break;

      case 'content':
        sqlQuery = `
          SELECT 
            TO_CHAR(created_on, 'DD/MM/YYYY') as date,
            headline as content,
            types as type
          FROM content_page
          WHERE business_id = $1
            AND types IN ('PDF', 'YOUTUBE', 'CONTENT')
            AND created_on >= $2::timestamp
            AND created_on <= $3::timestamp
            AND headline_id IS NULL
          ORDER BY created_on DESC
        `;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    try {
      console.log('Executing query:', {
        type,
        query: sqlQuery.replace(/\s+/g, ' ').trim(),
        params
      });

      // First, check if the user exists and is valid
      const userCheck = await query(
        `SELECT id FROM users WHERE id = $1 AND user_type = 'BUSINESS' AND deleted IS NOT TRUE AND active = TRUE`,
        [parseInt(businessId)]
      );

      if (userCheck.length === 0) {
        console.log(`No valid business found for ID: ${businessId}`);
        return NextResponse.json({
          success: false,
          error: 'Invalid business ID'
        }, { status: 404 });
      }

      // Now execute the main query
      const result = await query<{ date: string; content: string; type?: string }>(sqlQuery, params);
      
      console.log('Query results:', {
        type,
        count: result.length,
        firstRow: result[0],
        allRows: result
      });

      return NextResponse.json({
        success: true,
        data: result
      });
    } catch (queryError) {
      console.error(`Database error for ${type}:`, queryError);
      throw queryError;
    }
  } catch (error) {
    console.error(`Error in valuable-moments/details:`, error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 