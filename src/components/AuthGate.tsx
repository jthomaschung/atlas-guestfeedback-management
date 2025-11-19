import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { extractTokensFromUrl, authenticateWithTokens, cleanUrlFromTokens } from '@/utils/sessionToken';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { PortalSwitcher } from '@/components/PortalSwitcher';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, loading: authLoading, signOut } = useAuth();
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
          const tokens = extractTokensFromUrl();
          if (tokens) {
            console.log('🚀 AUTHGATE: Processing tokens...');
            const success = await authenticateWithTokens(tokens);
            if (success) {
              console.log('✅ AUTHGATE: Token authentication successful');
              cleanUrlFromTokens();
              setIsProcessingTokens(false);
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
    } else if (!hasTokens || user) {
      // Reset processing state if no tokens or user is already authenticated
      setIsProcessingTokens(false);
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

  // If we have a user, render the protected content with layout
  if (user) {
    console.log('✅ AUTHGATE: User authenticated, rendering app');
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 sm:h-16 flex items-center justify-between bg-atlas-dark border-b border-atlas-dark px-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <SidebarTrigger className="text-atlas-dark-foreground hover:bg-atlas-red/10 hover:text-atlas-red transition-colors sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center" />
                <div className="text-atlas-dark-foreground">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide">ATLAS</span>
                  <span className="hidden sm:inline ml-2 text-xs sm:text-sm text-atlas-dark-foreground/80">Guest Feedback Portal</span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <PortalSwitcher />
                <NotificationBell />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="text-atlas-dark-foreground hover:text-atlas-red hover:bg-atlas-red/10 p-2 sm:min-h-[44px] sm:min-w-[44px]"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </header>
            <main className="flex-1 overflow-auto bg-background p-2 sm:p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Fallback - should not reach here
  console.log('⚠️ AUTHGATE: Fallback state reached');
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600">Loading...</div>
    </div>
  );
}