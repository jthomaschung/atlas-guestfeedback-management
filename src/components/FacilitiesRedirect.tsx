import { Navigate } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useAuth } from '@/hooks/useAuth';
import Index from '@/pages/Index';

export function FacilitiesRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { permissions, loading } = useUserPermissions();

  // Wait for both auth and permissions to load
  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Count accessible portals
  const accessiblePortals = [];
  if (permissions.canAccessFacilities) accessiblePortals.push('facilities');
  if (permissions.canAccessCatering) accessiblePortals.push('catering');
  if (permissions.canAccessHr) accessiblePortals.push('hr');
  if (permissions.canAccessGuestFeedback) accessiblePortals.push('guest-feedback');

  // Check if user has guest feedback access - if so, redirect to guest feedback management
  if (permissions.canAccessGuestFeedback) {
    return <Navigate to="/guest-feedback-management" replace />;
  }

  // Check if user has facilities access
  if (!permissions.canAccessFacilities) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have access to facilities management. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Show the facilities dashboard
  return <Index />;
}