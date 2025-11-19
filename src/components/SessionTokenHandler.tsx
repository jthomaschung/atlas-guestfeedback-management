import { useEffect } from 'react';
import { extractTokensFromUrl, authenticateWithTokens, cleanUrlFromTokens, hasAuthTokensInUrl } from '@/utils/sessionToken';
import { useAuth } from '@/hooks/useAuth';

export function SessionTokenHandler() {
  const { user, setIsProcessingTokens } = useAuth();

  useEffect(() => {
    const handleIncomingTokens = async () => {
      console.log('GUESTFEEDBACK SessionTokenHandler: Checking for tokens...', { 
        hasUser: !!user, 
        hasTokensInUrl: hasAuthTokensInUrl(),
        currentUrl: window.location.href,
        searchParams: window.location.search
      });

      // Only process tokens if user is not already authenticated and tokens are present
      if (!user && hasAuthTokensInUrl()) {
        const tokens = extractTokensFromUrl();
        
        if (tokens) {
          setIsProcessingTokens(true);
          console.log('GUESTFEEDBACK SessionTokenHandler: Processing incoming session tokens...', {
            hasAccessToken: !!tokens.accessToken,
            hasRefreshToken: !!tokens.refreshToken,
            accessTokenLength: tokens.accessToken?.length,
            refreshTokenLength: tokens.refreshToken?.length
          });
          
          const success = await authenticateWithTokens(tokens);
          
          if (success) {
            console.log('GUESTFEEDBACK SessionTokenHandler: Successfully authenticated with incoming tokens');
            // Clean the URL after successful authentication
            cleanUrlFromTokens();
            // Keep processing state active briefly to allow auth state to update
            setTimeout(() => setIsProcessingTokens(false), 500);
          } else {
            console.error('GUESTFEEDBACK SessionTokenHandler: Failed to authenticate with incoming tokens');
            // Still clean the URL even if authentication failed
            cleanUrlFromTokens();
            setIsProcessingTokens(false);
          }
        }
      } else if (hasAuthTokensInUrl()) {
        // If user is already authenticated or tokens are invalid, clean the URL
        console.log('GUESTFEEDBACK SessionTokenHandler: User already authenticated, cleaning URL tokens');
        cleanUrlFromTokens();
      }
    };

    // Process tokens on component mount
    handleIncomingTokens();
  }, [user, setIsProcessingTokens]);

  // This component doesn't render anything
  return null;
}
