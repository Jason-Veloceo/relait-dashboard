import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get multiple IP detection methods
    const [ipify, ipapi, whatsmyip] = await Promise.allSettled([
      fetch('https://api.ipify.org?format=json').then(r => r.json()),
      fetch('https://ipapi.co/json/').then(r => r.json()),
      fetch('https://api.myip.com').then(r => r.json())
    ]);

    // Also try to connect to the database and log the error details
    let dbError = null;
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        host: process.env.UAT_DB_HOST,
        port: process.env.UAT_DB_PORT || 5432,
        database: process.env.UAT_DB_NAME,
        user: process.env.UAT_DB_USER,
        password: process.env.UAT_DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      
      await pool.query('SELECT NOW()');
      await pool.end();
    } catch (error: any) {
      dbError = {
        message: error?.message || 'Unknown error',
        code: error?.code,
        errno: error?.errno,
        syscall: error?.syscall,
        address: error?.address,
        port: error?.port
      };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      vercel_region: process.env.VERCEL_REGION || 'unknown',
      ips: {
        ipify: ipify.status === 'fulfilled' ? ipify.value : ipify.reason,
        ipapi: ipapi.status === 'fulfilled' ? ipapi.value : ipapi.reason,
        whatsmyip: whatsmyip.status === 'fulfilled' ? whatsmyip.value : whatsmyip.reason
      },
      db_config: {
        host: process.env.UAT_DB_HOST,
        port: process.env.UAT_DB_PORT || 5432,
        database: process.env.UAT_DB_NAME,
        user: process.env.UAT_DB_USER ? '***' : 'NOT_SET'
      },
      db_error: dbError,
      headers: {
        'x-forwarded-for': undefined, // Will be populated by Vercel
        'x-real-ip': undefined,
        'cf-connecting-ip': undefined
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Failed to get debug info',
        message: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
