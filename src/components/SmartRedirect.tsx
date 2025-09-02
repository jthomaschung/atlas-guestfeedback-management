import { Navigate } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';

export function SmartRedirect() {
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

  // If user only has facilities access, go straight to dashboard (existing behavior)
  if (accessiblePortals.length === 1 && accessiblePortals[0] === 'facilities') {
    return <Navigate to="/dashboard" replace />;
  }

  // If user has multiple portal access, show portal selection
  if (accessiblePortals.length > 1) {
    return <Navigate to="/portal-selection" replace />;
  }

  // If user has no portal access, still show portal selection (it will handle the access denied case)
  return <Navigate to="/portal-selection" replace />;
}