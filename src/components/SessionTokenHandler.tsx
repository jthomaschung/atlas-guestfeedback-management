import { useEffect, useState } from 'react';
import { extractTokensFromUrl, authenticateWithTokens, cleanUrlFromTokens, hasAuthTokensInUrl } from '@/utils/sessionToken';
import { useAuth } from '@/hooks/useAuth';

export function SessionTokenHandler() {
  const { user, isProcessingTokens, setIsProcessingTokens } = useAuth();

  // Synchronously detect tokens on mount
  const [hasDetectedTokens] = useState(() => hasAuthTokensInUrl());

  // Clear processing flag once user is authenticated
  useEffect(() => {
    if (isProcessingTokens && user) {
      console.log('GUESTFEEDBACK SessionTokenHandler: Auth state updated, clearing processing flag');
      setIsProcessingTokens(false);
    }
  }, [user, isProcessingTokens, setIsProcessingTokens]);

  useEffect(() => {
    // If tokens detected and no user, set processing flag immediately (synchronously)
    if (hasDetectedTokens && !user) {
      setIsProcessingTokens(true);
    }

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
            console.log('GUESTFEEDBACK SessionTokenHandler: Session authenticated and verified in database');
            // Clean the URL after successful authentication
            cleanUrlFromTokens();
            // Don't clear isProcessingTokens here - let the useEffect handle it when user state updates
          } else {
            console.error('GUESTFEEDBACK SessionTokenHandler: Session verification failed');
            // Still clean the URL even if authentication failed
            cleanUrlFromTokens();
            setIsProcessingTokens(false);  // Only clear on failure
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
