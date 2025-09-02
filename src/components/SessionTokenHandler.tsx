import { useEffect } from 'react';
import { sessionTokenUtils } from '@/utils/sessionToken';
import { useAuth } from '@/hooks/useAuth';

export function SessionTokenHandler() {
  const { user } = useAuth();

  useEffect(() => {
    const handleIncomingTokens = async () => {
      console.log('🔍 SessionTokenHandler: Starting token check');
      console.log('🔍 Current URL:', window.location.href);
      console.log('🔍 User authenticated:', !!user);
      
      // Only process tokens if user is not already authenticated
      if (user) {
        console.log('✅ User already authenticated, cleaning URL');
        sessionTokenUtils.cleanUrl();
        return;
      }

      const tokens = sessionTokenUtils.extractTokensFromUrl();
      console.log('🔍 Extracted tokens:', tokens ? '✅ Found' : '❌ Not found');
      
      if (!tokens) {
        console.log('❌ No tokens found in URL');
        return;
      }

      console.log('🔍 Token details:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiresAt: tokens.expires_at
      });

      // Check if tokens are still valid
      if (!sessionTokenUtils.areTokensValid(tokens)) {
        console.warn('⚠️ Received expired tokens');
        sessionTokenUtils.cleanUrl();
        return;
      }

      try {
        console.log('🚀 Attempting to authenticate with tokens...');
        const success = await sessionTokenUtils.authenticateWithTokens(tokens);
        console.log('🔍 Authentication result:', success ? '✅ Success' : '❌ Failed');
        
        if (success) {
          console.log('✅ Successfully authenticated with session tokens');
          // Clean up URL after successful authentication
          setTimeout(() => {
            console.log('🧹 Cleaning URL...');
            sessionTokenUtils.cleanUrl();
          }, 1000);
        } else {
          console.error('❌ Failed to authenticate with session tokens');
          sessionTokenUtils.cleanUrl();
        }
      } catch (error) {
        console.error('💥 Error processing session tokens:', error);
        sessionTokenUtils.cleanUrl();
      }
    };

    handleIncomingTokens();
  }, [user]);

  return null; // This component doesn't render anything
}