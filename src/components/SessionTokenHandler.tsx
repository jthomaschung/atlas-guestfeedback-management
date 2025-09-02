import { useEffect } from 'react';
import { sessionTokenUtils } from '@/utils/sessionToken';
import { useAuth } from '@/hooks/useAuth';

export function SessionTokenHandler() {
  const { user } = useAuth();

  useEffect(() => {
    const handleIncomingTokens = async () => {
      console.log('SessionTokenHandler: Checking for tokens, user:', !!user);
      
      // Only process tokens if user is not already authenticated
      if (user) {
        console.log('SessionTokenHandler: User already authenticated, cleaning URL');
        sessionTokenUtils.cleanUrl();
        return;
      }

      const tokens = sessionTokenUtils.extractTokensFromUrl();
      console.log('SessionTokenHandler: Extracted tokens:', !!tokens);
      
      if (!tokens) return;

      // Check if tokens are still valid
      if (!sessionTokenUtils.areTokensValid(tokens)) {
        console.warn('SessionTokenHandler: Received expired tokens');
        sessionTokenUtils.cleanUrl();
        return;
      }

      try {
        console.log('SessionTokenHandler: Attempting to authenticate with tokens');
        const success = await sessionTokenUtils.authenticateWithTokens(tokens);
        
        if (success) {
          console.log('SessionTokenHandler: Successfully authenticated with session tokens');
          // Clean up URL after successful authentication
          setTimeout(() => {
            sessionTokenUtils.cleanUrl();
          }, 1000);
        } else {
          console.error('SessionTokenHandler: Failed to authenticate with session tokens');
          sessionTokenUtils.cleanUrl();
        }
      } catch (error) {
        console.error('SessionTokenHandler: Error processing session tokens:', error);
        sessionTokenUtils.cleanUrl();
      }
    };

    handleIncomingTokens();
  }, [user]);

  return null; // This component doesn't render anything
}