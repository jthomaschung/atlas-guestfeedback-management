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

  // If user has guest feedback access, redirect to guest feedback app
  if (permissions.canAccessGuestFeedback) {
    window.location.href = 'https://preview--atlas-guestfeedback-management.lovable.app';
    return null;
  }

  // If user has no access, show access denied message
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have access to any portals. Please contact your administrator.
        </p>
      </div>
    </div>
  );
}