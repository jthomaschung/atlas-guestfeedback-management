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
      expires_at: session.expires_at || Date.now() / 1000 + 3600 // fallback 1 hour
    };
  },

  // Create URL with session tokens
  createAuthenticatedUrl: async (baseUrl: string): Promise<string> => {
    const tokens = await sessionTokenUtils.getCurrentSessionTokens();
    
    if (!tokens) return baseUrl;
    
    const url = new URL(baseUrl);
    url.searchParams.set('auth_token', tokens.access_token);
    url.searchParams.set('refresh_token', tokens.refresh_token);
    url.searchParams.set('expires_at', tokens.expires_at.toString());
    
    return url.toString();
  },

  // Extract tokens from URL parameters
  extractTokensFromUrl: (): SessionTokenData | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const access_token = urlParams.get('auth_token');
    const refresh_token = urlParams.get('refresh_token');
    const expires_at = urlParams.get('expires_at');
    
    if (!access_token || !refresh_token || !expires_at) return null;
    
    return {
      access_token,
      refresh_token,
      expires_at: parseInt(expires_at)
    };
  },

  // Authenticate with tokens from URL
  authenticateWithTokens: async (tokens: SessionTokenData): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      });
      
      return !error;
    } catch (error) {
      console.error('Error authenticating with tokens:', error);
      return false;
    }
  },

  // Clean URL parameters after authentication
  cleanUrl: () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('auth_token');
    url.searchParams.delete('refresh_token');
    url.searchParams.delete('expires_at');
    
    window.history.replaceState({}, document.title, url.toString());
  },

  // Check if tokens are still valid
  areTokensValid: (tokens: SessionTokenData): boolean => {
    const now = Date.now() / 1000;
    return tokens.expires_at > now + 60; // Valid if expires in more than 1 minute
  }
};