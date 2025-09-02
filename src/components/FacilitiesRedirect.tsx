import { Navigate } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import Index from '@/pages/Index';

export function FacilitiesRedirect() {
  const { permissions, loading } = useUserPermissions();

  if (loading) {
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