export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - socksjs has no types
import SocksConnection from 'socksjs';

export async function GET() {
  try {
    const fixieHost = process.env.FIXIE_SOCKS_HOST;
    if (!fixieHost) {
      return NextResponse.json({
        success: false,
        error: 'FIXIE_SOCKS_HOST not configured'
      });
    }

    // Parse Fixie URL
    const [auth, hostPort] = fixieHost.split('@');
    const [username, password] = auth.split(':');
    const [proxyHost, proxyPort] = hostPort.split(':');

    // Database config with SOCKS proxy
    const dbHost = process.env.UAT_DB_HOST || process.env.DB_HOST;
    const dbPort = parseInt(process.env.UAT_DB_PORT || process.env.DB_PORT || '5432');

    const config: any = {
      host: dbHost,
      user: process.env.UAT_DB_USER || process.env.DB_USER,
      password: process.env.UAT_DB_PASSWORD || process.env.DB_PASSWORD,
      database: process.env.UAT_DB_DATABASE || process.env.DB_DATABASE,
      port: dbPort,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 15000, // 15 second timeout
      // Add SOCKS proxy stream (factory function returning Duplex)
      stream: () => new (SocksConnection as any)({ host: dbHost!, port: dbPort }, {
        user: username,
        pass: password,
        host: proxyHost,
        port: parseInt(proxyPort, 10)
      })
    };

    const pool = new Pool(config);
    
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as db_version, inet_server_addr() as server_ip');
      client.release();
      await pool.end();

      return NextResponse.json({
        success: true,
        message: 'Database connection via Fixie SOCKS proxy successful',
        config: {
          proxyHost: proxyHost,
          proxyPort: proxyPort,
          databaseHost: dbHost,
          databasePort: dbPort,
          database: config.database,
          user: config.user,
        },
        testResult: result.rows[0],
        environment: process.env.NODE_ENV
      });

    } catch (dbError: any) {
      await pool.end();
      return NextResponse.json({
        success: false,
        error: 'Database connection via Fixie failed',
        message: dbError.message,
        code: dbError.code,
        config: {
          proxyHost: proxyHost,
          proxyPort: proxyPort,
          databaseHost: dbHost,
          databasePort: dbPort,
        }
      });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Test setup failed',
      message: error.message,
      stack: error.stack
    });
  }
}
