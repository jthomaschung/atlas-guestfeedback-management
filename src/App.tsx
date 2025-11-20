import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { SessionTokenHandler } from '@/components/SessionTokenHandler';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppSidebar } from '@/components/AppSidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { FeedbackButton } from '@/components/FeedbackButton';
import { PortalSwitcher } from '@/components/PortalSwitcher';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Welcome from '@/pages/Welcome';
import Index from '@/pages/Index';
import UserHierarchy from '@/pages/UserHierarchy';
import ExecutiveOversight from '@/pages/ExecutiveOversight';

import GFM from '@/pages/GFM';
import FeedbackArchive from '@/pages/FeedbackArchive';
import Settings from '@/pages/Settings';
import PortalSelection from '@/pages/PortalSelection';
import FeedbackReporting from '@/pages/FeedbackReporting';
import RedCarpetLeaders from '@/pages/RedCarpetLeaders';
import Summary from '@/pages/Summary';
import InternalFeedback from '@/pages/InternalFeedback';
import Accuracy from '@/pages/Accuracy';
import Training from '@/pages/Training';
import EmailTemplates from '@/pages/EmailTemplates';
import { AuthGate } from '@/components/AuthGate';

import { SmartRedirect } from '@/components/SmartRedirect';
import { FeedbackUpdater } from '@/components/FeedbackUpdater';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, isProcessingTokens, signOut } = useAuth();
  const { permissions, loading: permissionsLoading } = useUserPermissions();

  // Show loading while auth or permissions are loading, or while processing tokens
  if (authLoading || permissionsLoading || isProcessingTokens) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">
          {isProcessingTokens ? 'Authenticating...' : 'Loading...'}
        </div>
      </div>
    );
  }

  // Failsafe: Don't redirect if tokens are in URL (they're being processed)
  const urlParams = new URLSearchParams(window.location.search);
  const hasTokensInUrl = urlParams.has('access_token') && urlParams.has('refresh_token');

  // Redirect to welcome if no user and no tokens in URL
  if (!user && !hasTokensInUrl) {
    return <Navigate to="/welcome" replace />;
  }

  // Render the protected content with layout
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
            <FeedbackButton />
          </main>
        </div>
      </div>
    </SidebarProvider>
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SessionTokenHandler />
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
                 path="/executive-oversight" 
                 element={
                   <ProtectedRoute>
                     <ExecutiveOversight />
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
                path="/internal-feedback" 
                element={
                  <ProtectedRoute>
                    <InternalFeedback />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/accuracy" 
                element={
                  <ProtectedRoute>
                    <Accuracy />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/training" 
                element={
                  <ProtectedRoute>
                    <Training />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/email-templates" 
                element={
                  <ProtectedRoute>
                    <EmailTemplates />
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