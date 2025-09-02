import { useEffect } from 'react';
import { sessionTokenUtils } from '@/utils/sessionToken';
import { useAuth } from '@/hooks/useAuth';

export function SessionTokenHandler() {
  const { user } = useAuth();

  useEffect(() => {
    const handleIncomingTokens = async () => {
      // Only process tokens if user is not already authenticated
      if (user) {
        sessionTokenUtils.cleanUrl();
        return;
      }

      const tokens = sessionTokenUtils.extractTokensFromUrl();
      
      if (!tokens) return;

      // Check if tokens are still valid
      if (!sessionTokenUtils.areTokensValid(tokens)) {
        console.warn('Received expired tokens');
        sessionTokenUtils.cleanUrl();
        return;
      }

      try {
        const success = await sessionTokenUtils.authenticateWithTokens(tokens);
        
        if (success) {
          console.log('Successfully authenticated with session tokens');
          // Clean up URL after successful authentication
          setTimeout(() => {
            sessionTokenUtils.cleanUrl();
          }, 1000);
        } else {
          console.error('Failed to authenticate with session tokens');
          sessionTokenUtils.cleanUrl();
        }
      } catch (error) {
        console.error('Error processing session tokens:', error);
        sessionTokenUtils.cleanUrl();
      }
    };

    handleIncomingTokens();
  }, [user]);

  return null; // This component doesn't render anything
}