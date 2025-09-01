/**
 * Auth0 configuration and types
 */

export interface Auth0Config {
  domain: string;
  clientId: string;
  clientSecret: string;
  audience?: string;
  scope: string;
  redirectUri: string;
  logoutUri: string;
}

export const auth0Config: Auth0Config = {
  domain: process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '') || '',
  clientId: process.env.AUTH0_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  scope: 'openid profile email',
  redirectUri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
  logoutUri: `${process.env.AUTH0_BASE_URL}`,
};

export interface UserProfile {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  nickname?: string;
  email_verified?: boolean;
  roles?: string[];
}

export interface AuthSession {
  user: UserProfile;
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number;
}
