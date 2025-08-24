export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    // Test direct database connection WITHOUT proxy
    const directConfig = {
      host: process.env.UAT_DB_HOST || process.env.DB_HOST,
      user: process.env.UAT_DB_USER || process.env.DB_USER,
      password: process.env.UAT_DB_PASSWORD || process.env.DB_PASSWORD,
      database: process.env.UAT_DB_DATABASE || process.env.DB_DATABASE,
      port: parseInt(process.env.UAT_DB_PORT || process.env.DB_PORT || '5432'),
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000, // 10 second timeout
    };

    const pool = new Pool(directConfig);
    
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as db_version');
      client.release();
      await pool.end();

      return NextResponse.json({
        success: true,
        message: 'Direct database connection successful',
        config: {
          host: directConfig.host,
          port: directConfig.port,
          database: directConfig.database,
          user: directConfig.user,
        },
        testResult: result.rows[0],
        environment: process.env.NODE_ENV
      });

    } catch (dbError: any) {
      await pool.end();
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        message: dbError.message,
        config: {
          host: directConfig.host,
          port: directConfig.port,
          database: directConfig.database,
          user: directConfig.user,
        }
      });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Test setup failed',
      message: error.message
    });
  }
}
