import { useEffect } from 'react';
import { sessionTokenUtils } from '@/utils/sessionToken';
import { useAuth } from '@/hooks/useAuth';
import { useTokenProcessing } from '@/hooks/useTokenProcessing';

export function SessionTokenHandler() {
  const { user } = useAuth();
  const { setIsProcessingTokens } = useTokenProcessing();

  useEffect(() => {
    console.log('🚀 SessionTokenHandler: Component mounted');
    console.log('🚀 User state:', !!user);
    console.log('🚀 Current URL:', window.location.href);
    
    // Check if we have tokens in URL immediately
    const urlParams = new URLSearchParams(window.location.search);
    const hasTokens = urlParams.has('access_token') && urlParams.has('refresh_token');
    
    console.log('🔍 SessionTokenHandler: Initial check', {
      hasTokens,
      user: !!user,
      currentUrl: window.location.href
    });
    
    if (hasTokens && !user) {
      console.log('🚀 SessionTokenHandler: Setting processing state to true');
      setIsProcessingTokens(true);
    }
    
    const handleIncomingTokens = async () => {
      console.log('🔍 SessionTokenHandler: Starting token check');
      console.log('🔍 Current URL:', window.location.href);
      console.log('🔍 User authenticated:', !!user);
      
      // Only process tokens if user is not already authenticated
      if (user) {
        console.log('✅ User already authenticated, cleaning URL');
        sessionTokenUtils.cleanUrl();
        setIsProcessingTokens(false);
        return;
      }

      const tokens = sessionTokenUtils.extractTokensFromUrl();
      console.log('🔍 Extracted tokens:', tokens ? '✅ Found' : '❌ Not found');
      
      if (!tokens) {
        console.log('❌ No tokens found in URL');
        setIsProcessingTokens(false);
        return;
      }

      setIsProcessingTokens(true);

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
            setIsProcessingTokens(false);
          }, 1000);
        } else {
          console.error('❌ Failed to authenticate with session tokens');
          sessionTokenUtils.cleanUrl();
          setIsProcessingTokens(false);
        }
      } catch (error) {
        console.error('💥 Error processing session tokens:', error);
        sessionTokenUtils.cleanUrl();
        setIsProcessingTokens(false);
      }
    };

    handleIncomingTokens();
  }, [user]);

  return null; // This component doesn't render anything
}