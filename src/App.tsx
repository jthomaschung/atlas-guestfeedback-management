import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppSidebar } from '@/components/AppSidebar';
import Welcome from '@/pages/Welcome';
import Index from '@/pages/Index';
import SubmitWorkOrder from '@/pages/SubmitWorkOrder';

import PendingApproval from '@/pages/PendingApproval';
import Completed from '@/pages/Completed';
import Reporting from '@/pages/Reporting';
import UserHierarchy from '@/pages/UserHierarchy';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
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
          <header className="h-16 flex items-center justify-between bg-atlas-dark border-b border-atlas-dark px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-atlas-dark-foreground hover:text-atlas-red" />
              <div className="text-atlas-dark-foreground">
                <span className="text-2xl font-bold tracking-wide">ATLAS</span>
                <span className="ml-2 text-sm text-atlas-dark-foreground/80">Facilities Management Portal</span>
              </div>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <span className="text-atlas-dark-foreground/80 hover:text-atlas-red cursor-pointer transition-colors">
                Atlas Management Portal
              </span>
              <span className="text-atlas-dark-foreground/80 hover:text-atlas-red cursor-pointer transition-colors">
                Atlas Team Members
              </span>
              <span className="text-atlas-dark-foreground/80 hover:text-atlas-red cursor-pointer transition-colors">
                Account
              </span>
            </nav>
          </header>
          <main className="flex-1 overflow-auto bg-background">
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
                path="/pending-approval" 
                element={
                  <ProtectedRoute>
                    <PendingApproval />
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