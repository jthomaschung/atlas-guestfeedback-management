import { supabase } from '@/integrations/supabase/client';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Extract current session tokens from Supabase
 */
export async function getCurrentSessionTokens(): Promise<SessionTokens | null> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token || !session?.refresh_token) {
    return null;
  }
  
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token
  };
}

/**
 * Create authenticated URL with session tokens
 */
export async function createAuthenticatedUrl(baseUrl: string): Promise<string> {
  const tokens = await getCurrentSessionTokens();
  
  if (!tokens) {
    return baseUrl;
  }
  
  const url = new URL(baseUrl);
  url.searchParams.set('access_token', tokens.accessToken);
  url.searchParams.set('refresh_token', tokens.refreshToken);
  
  return url.toString();
}

/**
 * Extract tokens from URL parameters
 */
export function extractTokensFromUrl(): SessionTokens | null {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token');
  
  if (!accessToken || !refreshToken) {
    return null;
  }
  
  return {
    accessToken,
    refreshToken
  };
}

/**
 * Authenticate with incoming tokens
 */
export async function authenticateWithTokens(tokens: SessionTokens): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });
    
    return !error && !!data.session;
  } catch (error) {
    console.error('Error authenticating with tokens:', error);
    return false;
  }
}

/**
 * Clean authentication tokens from URL
 */
export function cleanUrlFromTokens(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('access_token');
  url.searchParams.delete('refresh_token');
  
  // Replace current history entry to clean the URL
  window.history.replaceState({}, document.title, url.toString());
}

/**
 * Check if URL contains authentication tokens
 */
export function hasAuthTokensInUrl(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('access_token') && urlParams.has('refresh_token');
}
