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

  // If user has multiple portal access, redirect to portal selection
  if (accessiblePortals.length > 1) {
    return <Navigate to="/portal-selection" replace />;
  }

  // If user only has facilities access or no access, show the facilities dashboard
  return <Index />;
}