import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { sessionTokenUtils } from '@/utils/sessionToken';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppSidebar } from '@/components/AppSidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { PortalSwitcher } from '@/components/PortalSwitcher';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Welcome from '@/pages/Welcome';
import Index from '@/pages/Index';
import FacilitiesDashboard from '@/pages/FacilitiesDashboard';
import SubmitWorkOrder from '@/pages/SubmitWorkOrder';
import UserHierarchy from '@/pages/UserHierarchy';

import GFM from '@/pages/GFM';
import FeedbackArchive from '@/pages/FeedbackArchive';
import Settings from '@/pages/Settings';
import PortalSelection from '@/pages/PortalSelection';
import FeedbackReporting from '@/pages/FeedbackReporting';
import RedCarpetLeaders from '@/pages/RedCarpetLeaders';
import Summary from '@/pages/Summary';
import { AuthGate } from '@/components/AuthGate';

import { SmartRedirect } from '@/components/SmartRedirect';
import { FacilitiesRedirect } from '@/components/FacilitiesRedirect';
import { FeedbackUpdater } from '@/components/FeedbackUpdater';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const { permissions, loading: permissionsLoading } = useUserPermissions();
  
  // Check for tokens immediately during render (synchronous)
  const urlParams = new URLSearchParams(window.location.search);
  const hasTokens = urlParams.has('access_token') && urlParams.has('refresh_token');
  
  console.log('🔍 GUEST FEEDBACK ProtectedRoute: State check', {
    hasTokens,
    hasUser: !!user,
    authLoading,
    permissionsLoading,
    currentUrl: window.location.href,
    searchParams: window.location.search
  });
  
  const [isProcessingTokens, setIsProcessingTokens] = useState(() => {
    // If we have tokens in URL, we're processing them
    const shouldProcess = hasTokens;
    console.log('🔄 GUEST FEEDBACK ProtectedRoute: Initial token processing state', {
      hasTokens,
      shouldProcess,
      user: !!user
    });
    return shouldProcess;
  });

  useEffect(() => {
    console.log('🔄 GUEST FEEDBACK ProtectedRoute: useEffect triggered', {
      hasTokens,
      hasUser: !!user,
      isProcessingTokens
    });

    if (hasTokens && !user) {
      console.log('🚀 GUEST FEEDBACK ProtectedRoute: Starting token processing...');
      
      const processTokens = async () => {
        try {
          console.log('🔐 GUEST FEEDBACK ProtectedRoute: Extracting tokens from URL...');
          const tokens = sessionTokenUtils.extractTokensFromUrl();
          
          if (tokens && sessionTokenUtils.areTokensValid(tokens)) {
            console.log('✅ GUEST FEEDBACK ProtectedRoute: Tokens valid, authenticating...', {
              hasAccessToken: !!tokens.access_token,
              hasRefreshToken: !!tokens.refresh_token,
              expiresAt: tokens.expires_at
            });
            
            const success = await sessionTokenUtils.authenticateWithTokens(tokens);
            
            if (success) {
              console.log('✅ GUEST FEEDBACK ProtectedRoute: Authentication successful, cleaning URL...');
              sessionTokenUtils.cleanUrl();
            } else {
              console.log('❌ GUEST FEEDBACK ProtectedRoute: Authentication failed');
            }
          } else {
            console.log('❌ GUEST FEEDBACK ProtectedRoute: Tokens invalid or missing');
          }
        } catch (error) {
          console.error('❌ GUEST FEEDBACK ProtectedRoute: Token processing error:', error);
        } finally {
          console.log('🏁 GUEST FEEDBACK ProtectedRoute: Token processing complete');
          setIsProcessingTokens(false);
        }
      };

      processTokens();
    } else if (!hasTokens) {
      console.log('⏭️ GUEST FEEDBACK ProtectedRoute: No tokens, stopping processing');
      setIsProcessingTokens(false);
    }
  }, [hasTokens, user]);

  // Show loading while auth or permissions are loading, or while processing tokens
  if (authLoading || permissionsLoading || isProcessingTokens) {
    console.log('⏳ GUEST FEEDBACK ProtectedRoute: Showing loading state', {
      authLoading,
      permissionsLoading,
      isProcessingTokens
    });
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">
          {isProcessingTokens ? 'Authenticating...' : 'Loading...'}
        </div>
      </div>
    );
  }

  // Redirect to welcome if no user and no tokens to process AND not currently loading auth
  if (!user && !authLoading && !isProcessingTokens) {
    console.log('🔄 GUEST FEEDBACK ProtectedRoute: No user and not loading, redirecting to welcome', {
      hasUser: !!user,
      authLoading,
      hasTokens,
      isProcessingTokens
    });
    return <Navigate to="/welcome" replace />;
  }

  console.log('✅ GUEST FEEDBACK ProtectedRoute: User authenticated, rendering protected content', {
    userId: user.id,
    email: user.email,
    permissions: {
      canAccessFacilities: permissions.canAccessFacilities,
      canAccessGuestFeedback: permissions.canAccessGuestFeedback,
      isAdmin: permissions.isAdmin
    }
  });

  // If we have a user, render the protected content with layout
  if (user) {
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
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600">Loading...</div>
    </div>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  // Immediate token detection - synchronous check before any React rendering
  const urlParams = new URLSearchParams(window.location.search);
  const hasTokens = urlParams.has('access_token') && urlParams.has('refresh_token');
  
  const [isInitializing, setIsInitializing] = useState(() => {
    // If we have tokens in URL, show loading immediately
    return hasTokens;
  });

  useEffect(() => {
    if (hasTokens) {
      const processTokensImmediately = async () => {
        try {
          const tokens = sessionTokenUtils.extractTokensFromUrl();
          if (tokens && sessionTokenUtils.areTokensValid(tokens)) {
            await sessionTokenUtils.authenticateWithTokens(tokens);
            sessionTokenUtils.cleanUrl();
          }
        } catch (error) {
          console.error('Immediate token processing error:', error);
        } finally {
          setIsInitializing(false);
        }
      };

      processTokensImmediately();
    } else {
      setIsInitializing(false);
    }
  }, [hasTokens]);

  // Show loading immediately if we have tokens
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Authenticating...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <FeedbackUpdater />
            <Router>
            <Routes>
              <Route 
                path="/welcome" 
                element={
                  <PublicRoute>
                    <Welcome />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/summary" 
                element={
                  <ProtectedRoute>
                    <Summary />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
               <Route 
                path="/facilities" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/submit" 
                element={
                  <ProtectedRoute>
                    <SubmitWorkOrder />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/feedback-reporting" 
                element={
                  <ProtectedRoute>
                    <FeedbackReporting />
                  </ProtectedRoute>
                } 
               />
               <Route 
                 path="/red-carpet-leaders" 
                 element={
                   <ProtectedRoute>
                     <RedCarpetLeaders />
                   </ProtectedRoute>
                 } 
               />
               <Route
                path="/user-hierarchy" 
                element={
                  <ProtectedRoute>
                    <UserHierarchy />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gfm" 
                element={
                  <ProtectedRoute>
                    <GFM />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/feedback-archive" 
                element={
                  <ProtectedRoute>
                    <FeedbackArchive />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
               <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    {(() => {
                      console.log('🏠 ROOT PATH: Rendering Index component for root path');
                      return <Index />;
                    })()}
                  </ProtectedRoute>
                } 
               />
              <Route 
                path="*" 
                element={
                  <ProtectedRoute>
                    <SmartRedirect />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster />
            <Sonner />
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;