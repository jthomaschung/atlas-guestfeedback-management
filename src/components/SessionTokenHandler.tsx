import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sessionTokenUtils } from '@/utils/sessionToken';

export function SessionTokenHandler() {
  const { setIsProcessingTokens } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lovableToken = urlParams.get('__lovable_token');
    const legacyAccessToken = urlParams.get('access_token');
    
    console.log('🔍 GUESTFEEDBACK SessionTokenHandler: Checking for tokens...', {
      hasLovableToken: !!lovableToken,
      hasLegacyTokens: !!legacyAccessToken,
      currentUrl: window.location.href,
      searchParams: window.location.search
    });

    // If we have either type of token, process them
    if (lovableToken || legacyAccessToken) {
      console.log('🚀 GUESTFEEDBACK SessionTokenHandler: Processing incoming session tokens...');
      setIsProcessingTokens(true);

      const processTokens = async () => {
        try {
          // Try to extract tokens from either __lovable_token or legacy parameters
          const tokens = sessionTokenUtils.extractTokensFromLovableToken();
          
          if (tokens) {
            console.log('✅ GUESTFEEDBACK SessionTokenHandler: Tokens extracted successfully', {
              hasAccessToken: !!tokens.access_token,
              hasRefreshToken: !!tokens.refresh_token,
              expiresAt: tokens.expires_at,
              tokenType: lovableToken ? '__lovable_token (JWT)' : 'legacy tokens'
            });

            if (sessionTokenUtils.areTokensValid(tokens)) {
              console.log('✅ GUESTFEEDBACK SessionTokenHandler: Tokens are valid, authenticating...');
              
              const success = await sessionTokenUtils.authenticateWithTokens(tokens);
              
              if (success) {
                console.log('✅ GUESTFEEDBACK SessionTokenHandler: Authentication successful, cleaning URL...');
                sessionTokenUtils.cleanUrl();
                console.log('✅ GUESTFEEDBACK SessionTokenHandler: Process complete');
              } else {
                console.error('❌ GUESTFEEDBACK SessionTokenHandler: Authentication failed');
              }
            } else {
              console.error('❌ GUESTFEEDBACK SessionTokenHandler: Tokens are invalid or expired');
            }
          } else {
            console.error('❌ GUESTFEEDBACK SessionTokenHandler: Failed to extract tokens from URL');
          }
        } catch (error) {
          console.error('❌ GUESTFEEDBACK SessionTokenHandler: Error processing tokens:', error);
        } finally {
          setIsProcessingTokens(false);
        }
      };

      processTokens();
    } else {
      console.log('⏭️ GUESTFEEDBACK SessionTokenHandler: No tokens found in URL, skipping');
    }
  }, []); // Only run once on mount

  return null;
}
