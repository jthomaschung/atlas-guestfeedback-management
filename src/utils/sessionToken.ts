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
    // Step 1: Set the session in the frontend
    const { data, error } = await supabase.auth.setSession({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });
    
    if (error || !data.session) {
      console.error('Failed to set session:', error);
      return false;
    }
    
    console.log('Frontend session set, verifying database session...');
    
    // Step 2: Wait for the database to recognize the session
    // Try up to 5 times with 200ms delays (1 second total)
    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify database can see our session by checking auth.uid()
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', data.session.user.id)
        .limit(1);
      
      // If we get a result (or even an empty result), the session is working
      // If we get an RLS error (PGRST301), the session isn't ready yet
      if (!testError || testError.code !== 'PGRST301') {
        console.log('Database session verified after', (attempt + 1) * 200, 'ms');
        return true;
      }
      
      console.log('Database session not ready, attempt', attempt + 1, 'of 5');
    }
    
    console.warn('Database session verification timed out, proceeding anyway');
    return true; // Proceed anyway after timeout
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
