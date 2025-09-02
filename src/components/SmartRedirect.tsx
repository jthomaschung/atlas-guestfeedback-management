import { Navigate } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { sessionTokenUtils } from '@/utils/sessionToken';
import { useEffect, useState } from 'react';

export function SmartRedirect() {
  const { permissions, loading } = useUserPermissions();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      if (loading || redirecting) return;

      // Count accessible portals
      const accessiblePortals = [];
      if (permissions.canAccessFacilities) accessiblePortals.push('facilities');
      if (permissions.canAccessCatering) accessiblePortals.push('catering');
      if (permissions.canAccessHr) accessiblePortals.push('hr');
      if (permissions.canAccessGuestFeedback) accessiblePortals.push('guest-feedback');

      // If user has guest feedback access, redirect to guest feedback app with session tokens
      if (permissions.canAccessGuestFeedback) {
        setRedirecting(true);
        try {
          const authenticatedUrl = await sessionTokenUtils.createAuthenticatedUrl(
            'https://preview--atlas-guestfeedback-management.lovable.app'
          );
          window.location.href = authenticatedUrl;
        } catch (error) {
          console.error('Error creating authenticated URL:', error);
          // Fallback to direct navigation
          window.location.href = 'https://preview--atlas-guestfeedback-management.lovable.app';
        }
      }
    };

    handleRedirect();
  }, [permissions, loading, redirecting]);

  if (loading || redirecting) {
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