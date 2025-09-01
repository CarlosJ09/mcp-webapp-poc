import { NextRequest, NextResponse } from 'next/server';

const AUTH0_DOMAIN = process.env.AUTH0_ISSUER_BASE_URL?.replace(/^https?:\/\//, '');
const CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const BASE_URL = process.env.AUTH0_BASE_URL;

function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auth0: string[] }> }
) {
  const resolvedParams = await params;
  const auth0Route = resolvedParams.auth0[0];

  switch (auth0Route) {
    case 'login':
      return handleLogin();
    case 'logout':
      return handleLogout(request);
    case 'callback':
      return handleCallback(request);
    default:
      return NextResponse.json({ error: 'Invalid auth route' }, { status: 404 });
  }
}

function handleLogin() {
  console.log('Handling login request');
  console.log('BASE_URL:', BASE_URL);
  console.log('AUTH0_DOMAIN:', AUTH0_DOMAIN);
  console.log('Callback URL:', `${BASE_URL}/callback`);
  
  const searchParams = new URLSearchParams({
    client_id: CLIENT_ID || '',
    scope: 'openid profile email',
    response_type: 'code',
    redirect_uri: `${BASE_URL}/callback`,
    state: generateState()
  });

  const authorizeUrl = `https://${AUTH0_DOMAIN}/authorize?${searchParams}`;
  console.log('Redirecting to:', authorizeUrl);
  
  return NextResponse.redirect(authorizeUrl);
}

function handleLogout(request: NextRequest) {
  const logoutUrl = new URL(`https://${AUTH0_DOMAIN}/v2/logout`);
  logoutUrl.searchParams.set('client_id', CLIENT_ID || '');
  logoutUrl.searchParams.set('returnTo', BASE_URL || '');

  // Clear session cookie
  const response = NextResponse.redirect(logoutUrl);
  response.cookies.delete('auth-session');
  
  return response;
}

async function handleCallback(request: NextRequest) {
  console.log('Handling callback request');
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  console.log('Callback params:', { code: !!code, state, error });

  if (error) {
    console.error('Auth0 callback error:', error);
    return NextResponse.redirect(`${BASE_URL}?error=${error}`);
  }

  if (!code) {
    console.error('No code in callback');
    return NextResponse.redirect(`${BASE_URL}?error=no_code`);
  }

  try {
    console.log('Exchanging code for tokens...');
    // Exchange code for tokens
    const tokenResponse = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: `${BASE_URL}/callback`,
      }),
    });

    console.log('Token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();
    console.log('Got tokens successfully');

    // Get user info
    const userResponse = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const user = await userResponse.json();
    console.log('Got user info successfully');

    // Create session
    const session = {
      user,
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000)
    };

    // Set session cookie
    const response = NextResponse.redirect(`${BASE_URL}/dashboard`);
    response.cookies.set('auth-session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in
    });

    return response;

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(`${BASE_URL}?error=auth_failed`);
  }
}
