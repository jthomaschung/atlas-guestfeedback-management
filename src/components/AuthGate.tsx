import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { sessionTokenUtils } from '@/utils/sessionToken';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, loading: authLoading } = useAuth();
  const { permissions, loading: permissionsLoading } = useUserPermissions();
  const [isProcessingTokens, setIsProcessingTokens] = useState(false);

  // Check for tokens immediately (synchronous)
  const hasTokensInUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('access_token') && urlParams.has('refresh_token');
  };

  const hasTokens = hasTokensInUrl();

  useEffect(() => {
    console.log('🚀 AUTHGATE: Starting token processing check', {
      hasTokens,
      user: !!user,
      url: window.location.href
    });

    if (hasTokens && !user) {
      setIsProcessingTokens(true);
      
      const processTokens = async () => {
        try {
          const tokens = sessionTokenUtils.extractTokensFromUrl();
          if (tokens && sessionTokenUtils.areTokensValid(tokens)) {
            console.log('🚀 AUTHGATE: Processing tokens...');
            const success = await sessionTokenUtils.authenticateWithTokens(tokens);
            if (success) {
              console.log('✅ AUTHGATE: Token authentication successful');
              setTimeout(() => {
                sessionTokenUtils.cleanUrl();
                setIsProcessingTokens(false);
              }, 1000);
            } else {
              console.error('❌ AUTHGATE: Token authentication failed');
              setIsProcessingTokens(false);
            }
          } else {
            console.error('❌ AUTHGATE: Invalid tokens');
            setIsProcessingTokens(false);
          }
        } catch (error) {
          console.error('💥 AUTHGATE: Error processing tokens:', error);
          setIsProcessingTokens(false);
        }
      };

      processTokens();
    }
  }, [hasTokens, user]);

  // Show loading while auth or permissions are loading, or while processing tokens
  // Also wait for permissions to actually be loaded (not just loading=false)
  const permissionsLoaded = !permissionsLoading && permissions && (
    permissions.isAdmin || 
    permissions.markets.length > 0 || 
    permissions.stores.length > 0 ||
    permissions.canAccessFacilities ||
    permissions.canAccessCatering ||
    permissions.canAccessHr ||
    permissions.canAccessGuestFeedback
  );

  if (authLoading || permissionsLoading || isProcessingTokens || (user && !permissionsLoaded)) {
    console.log('🔍 AUTHGATE: Showing loading state', {
      authLoading,
      permissionsLoading,
      isProcessingTokens,
      hasTokens,
      user: !!user,
      permissionsLoaded,
      permissions: permissions ? {
        isAdmin: permissions.isAdmin,
        markets: permissions.markets?.length || 0,
        stores: permissions.stores?.length || 0,
        canAccessGuestFeedback: permissions.canAccessGuestFeedback
      } : null
    });
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">
          {isProcessingTokens ? 'Authenticating...' : 'Loading...'}
        </div>
      </div>
    );
  }

  // Redirect to welcome if no user and no tokens to process
  if (!user && !hasTokens) {
    console.log('🚨 AUTHGATE: Redirecting to welcome - no user, no tokens');
    return <Navigate to="/welcome" replace />;
  }

  // If we have a user, render the protected content
  if (user) {
    console.log('✅ AUTHGATE: User authenticated, rendering app');
    return <>{children}</>;
  }

  // Fallback - should not reach here
  console.log('⚠️ AUTHGATE: Fallback state reached');
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600">Loading...</div>
    </div>
  );
}