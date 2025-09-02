import { Navigate } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { sessionTokenUtils } from '@/utils/sessionToken';
import { useEffect, useState } from 'react';

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

  // If user has guest feedback access, stay in this app and go to dashboard
  if (permissions.canAccessGuestFeedback) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user has facilities access but not guest feedback, redirect to facilities app
  if (permissions.canAccessFacilities) {
    window.location.href = 'https://atlas-facilities-management.lovable.app';
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