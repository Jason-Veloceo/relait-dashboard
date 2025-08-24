import { NextRequest, NextResponse } from 'next/server';
import { SocksClient } from 'socks';

export async function GET() {
  try {
    // Test 1: Check if FIXIE_SOCKS_HOST is available
    const fixieHost = process.env.FIXIE_SOCKS_HOST;
    if (!fixieHost) {
      return NextResponse.json({
        success: false,
        error: 'FIXIE_SOCKS_HOST environment variable not found',
        environment: process.env.NODE_ENV
      });
    }

    // Test 2: Parse Fixie URL
    const [auth, hostPort] = fixieHost.split('@');
    const [username, password] = auth.split(':');
    const [proxyHost, proxyPort] = hostPort.split(':');

    const result = {
      success: true,
      fixieConfigured: true,
      proxyHost: proxyHost,
      proxyPort: proxyPort,
      username: username,
      hasPassword: !!password,
      environment: process.env.NODE_ENV,
      databaseHost: process.env.UAT_DB_HOST || process.env.DB_HOST,
      databasePort: process.env.UAT_DB_PORT || process.env.DB_PORT,
    };

    // Test 3: Try to connect through SOCKS proxy to database
    try {
      const dbHost = process.env.UAT_DB_HOST || process.env.DB_HOST;
      const dbPort = parseInt(process.env.UAT_DB_PORT || process.env.DB_PORT || '5432');

      const socksConnection = await SocksClient.createConnection({
        proxy: {
          host: proxyHost,
          port: parseInt(proxyPort),
          type: 5,
          userId: username,
          password: password
        },
        command: 'connect',
        destination: {
          host: dbHost!,
          port: dbPort
        }
      });

      // If we get here, SOCKS connection worked
      socksConnection.socket.destroy();
      
      return NextResponse.json({
        ...result,
        socksConnectionTest: 'SUCCESS - SOCKS proxy connection established',
        message: 'Fixie SOCKS proxy is working correctly'
      });

    } catch (socksError: any) {
      return NextResponse.json({
        ...result,
        socksConnectionTest: 'FAILED',
        socksError: socksError.message,
        message: 'SOCKS proxy connection failed'
      });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
