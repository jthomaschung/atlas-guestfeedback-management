import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppSidebar } from '@/components/AppSidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Welcome from '@/pages/Welcome';
import Index from '@/pages/Index';
import SubmitWorkOrder from '@/pages/SubmitWorkOrder';
import DailySummary from '@/pages/DailySummary';
import PendingApproval from '@/pages/PendingApproval';
import OnHold from '@/pages/OnHold';
import Completed from '@/pages/Completed';
import Reporting from '@/pages/Reporting';
import UserHierarchy from '@/pages/UserHierarchy';
import Settings from '@/pages/Settings';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between bg-atlas-dark border-b border-atlas-dark px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger className="text-atlas-dark-foreground hover:bg-atlas-red/10 hover:text-atlas-red transition-colors" />
              <div className="text-atlas-dark-foreground">
                <span className="text-xl sm:text-2xl font-bold tracking-wide">ATLAS</span>
                <span className="hidden sm:inline ml-2 text-sm text-atlas-dark-foreground/80">Facilities Management Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationBell />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="text-atlas-dark-foreground hover:text-atlas-red hover:bg-atlas-red/10 p-2"
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
                path="/dashboard" 
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
                path="/daily-summary" 
                element={
                  <ProtectedRoute>
                    <DailySummary />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pending-approval" 
                element={
                  <ProtectedRoute>
                    <PendingApproval />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/on-hold" 
                element={
                  <ProtectedRoute>
                    <OnHold />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/completed" 
                element={
                  <ProtectedRoute>
                    <Completed />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reporting" 
                element={
                  <ProtectedRoute>
                    <Reporting />
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
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
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