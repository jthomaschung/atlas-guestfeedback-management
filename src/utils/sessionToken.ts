import { supabase } from '@/integrations/supabase/client';

export interface SessionTokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export const sessionTokenUtils = {
  // Extract current session tokens
  getCurrentSessionTokens: async (): Promise<SessionTokenData | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return null;
    
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at || 0
    };
  },

  // Create an authenticated URL with session tokens
  createAuthenticatedUrl: async (baseUrl: string): Promise<string> => {
    const tokens = await sessionTokenUtils.getCurrentSessionTokens();
    
    if (!tokens) {
      console.warn('No session tokens available for URL creation');
      return baseUrl;
    }

    const url = new URL(baseUrl);
    url.searchParams.set('access_token', tokens.access_token);
    url.searchParams.set('refresh_token', tokens.refresh_token);
    url.searchParams.set('expires_at', tokens.expires_at.toString());
    
    return url.toString();
  },

  // Extract tokens from URL parameters
  extractTokensFromUrl: (): SessionTokenData | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const access_token = urlParams.get('access_token');
    const refresh_token = urlParams.get('refresh_token');
    const expires_at = urlParams.get('expires_at');

    if (!access_token || !refresh_token) {
      return null;
    }

    return {
      access_token,
      refresh_token,
      expires_at: expires_at ? parseInt(expires_at) : 0
    };
  },

  // Authenticate with tokens from URL
  authenticateWithTokens: async (tokens: SessionTokenData): Promise<boolean> => {
    console.log('🔐 GUEST FEEDBACK sessionTokenUtils.authenticateWithTokens: Starting authentication...', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresAt: tokens.expires_at,
      accessTokenLength: tokens.access_token?.length,
      refreshTokenLength: tokens.refresh_token?.length
    });

    try {
      const { data: { session }, error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      });

      if (error) {
        console.error('❌ GUEST FEEDBACK sessionTokenUtils.authenticateWithTokens: Error setting session:', error);
        return false;
      }

      if (!session) {
        console.error('❌ GUEST FEEDBACK sessionTokenUtils.authenticateWithTokens: No session returned after setting tokens');
        return false;
      }

      console.log('✅ GUEST FEEDBACK sessionTokenUtils.authenticateWithTokens: Successfully authenticated with session tokens', {
        sessionId: session.access_token?.substring(0, 20) + '...',
        userId: session.user?.id,
        userEmail: session.user?.email
      });
      return true;
    } catch (error) {
      console.error('❌ GUEST FEEDBACK sessionTokenUtils.authenticateWithTokens: Exception during token authentication:', error);
      return false;
    }
  },

  // Clean URL from session tokens and redirect to root
  cleanUrl: (): void => {
    const currentUrl = window.location.href;
    console.log('🧹 GUEST FEEDBACK sessionTokenUtils.cleanUrl: Starting URL cleanup...', {
      currentUrl,
      pathname: window.location.pathname,
      search: window.location.search
    });

    const url = new URL(window.location.href);
    url.searchParams.delete('access_token');
    url.searchParams.delete('refresh_token');
    url.searchParams.delete('expires_at');
    
    // Always redirect to root path to avoid /welcome flash
    url.pathname = '/';
    
    console.log('🔄 GUEST FEEDBACK sessionTokenUtils.cleanUrl: Redirecting to clean URL...', {
      from: currentUrl,
      to: url.toString()
    });

    window.history.replaceState({}, '', url.toString());
    
    console.log('✅ GUEST FEEDBACK sessionTokenUtils.cleanUrl: URL cleanup complete', {
      newUrl: window.location.href,
      newPathname: window.location.pathname,
      newSearch: window.location.search
    });
  },

  // Check if tokens are still valid
  areTokensValid: (tokens: SessionTokenData): boolean => {
    // If no expires_at was provided in URL, let Supabase handle validation
    if (!tokens.expires_at || tokens.expires_at === 0) {
      return true;
    }
    
    const now = Date.now() / 1000;
    return tokens.expires_at > now;
  }
};