import { Navigate } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useAuth } from '@/hooks/useAuth';
import { sessionTokenUtils } from '@/utils/sessionToken';
import { useEffect, useState } from 'react';
import Index from '@/pages/Index';

export function SmartRedirect() {
  const { user } = useAuth();
  const { permissions, loading } = useUserPermissions();

  console.log('🔍 SmartRedirect: Current state', {
    hasUser: !!user,
    loading,
    url: window.location.href
  });

  // Check if there are session tokens in the URL that need to be processed
  const urlParams = new URLSearchParams(window.location.search);
  const hasSessionTokens = urlParams.has('access_token') && urlParams.has('refresh_token');

  console.log('🔍 SmartRedirect: Session tokens check', {
    hasSessionTokens,
    hasUser: !!user
  });

  // If we have session tokens but no user yet, wait for authentication
  if (hasSessionTokens && !user) {
    console.log('⏳ Waiting for authentication with session tokens...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Authenticating...</div>
      </div>
    );
  }

  if (loading) {
    console.log('⏳ Loading permissions...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  console.log('🔍 SmartRedirect: Permissions loaded', permissions);

  // Count accessible portals
  const accessiblePortals = [];
  if (permissions.canAccessFacilities) accessiblePortals.push('facilities');
  if (permissions.canAccessCatering) accessiblePortals.push('catering');
  if (permissions.canAccessHr) accessiblePortals.push('hr');
  if (permissions.canAccessGuestFeedback) accessiblePortals.push('guest-feedback');

  // If user has guest feedback access, show the main guest feedback dashboard
  if (permissions.canAccessGuestFeedback) {
    return <Index />;
  }

  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    // If user has facilities access but not guest feedback, redirect to facilities app
    if (permissions.canAccessFacilities && !permissions.canAccessGuestFeedback && !isRedirecting) {
      setIsRedirecting(true);
      const redirectToFacilities = async () => {
        try {
          const authenticatedUrl = await sessionTokenUtils.createAuthenticatedUrl('https://facilities.lovable.app');
          window.location.href = authenticatedUrl;
        } catch (error) {
          console.error('Error creating authenticated URL:', error);
          window.location.href = 'https://facilities.lovable.app';
        }
      };
      redirectToFacilities();
    }
  }, [permissions.canAccessFacilities, permissions.canAccessGuestFeedback, isRedirecting]);

  // If user has facilities access but not guest feedback, show redirecting message
  if (permissions.canAccessFacilities && !permissions.canAccessGuestFeedback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Redirecting to Facilities...</div>
      </div>
    );
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