import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Get admin credentials from environment variables (server-side only)
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not configured in environment variables');
      return NextResponse.json(
        { success: false, error: 'Authentication not configured' },
        { status: 500 }
      );
    }
    
    if (email === adminEmail && password === adminPassword) {
      return NextResponse.json({
        success: true,
        message: 'Authentication successful'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
