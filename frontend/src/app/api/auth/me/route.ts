import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth-session');

    if (!sessionCookie) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    const session = JSON.parse(sessionCookie.value);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      const response = NextResponse.json({ user: null, authenticated: false });
      response.cookies.delete('auth-session');
      return response;
    }

    return NextResponse.json({
      user: session.user,
      authenticated: true,
      expiresAt: session.expiresAt,
    });

  } catch (error) {
    console.error('Error getting user session:', error);
    return NextResponse.json({ user: null, authenticated: false });
  }
}
