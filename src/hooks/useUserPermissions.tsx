import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserPermissions {
  markets: string[];
  stores: string[];
  isAdmin: boolean;
  canAccessFacilities: boolean;
  canAccessCatering: boolean;
  canAccessHr: boolean;
  canAccessGuestFeedback: boolean;
  isDevelopmentUser: boolean;
  role?: string; // Add role information
  isDirectorOrAbove?: boolean; // Helper flag for Director, VP, Admin
}

export function useUserPermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>({
    markets: [],
    stores: [],
    isAdmin: false,
    canAccessFacilities: true, // Default for existing users
    canAccessCatering: false,
    canAccessHr: false,
    canAccessGuestFeedback: false,
    isDevelopmentUser: false,
    role: undefined,
    isDirectorOrAbove: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPermissions();
    } else {
      setPermissions({ 
        markets: [], 
        stores: [], 
        isAdmin: false,
        canAccessFacilities: true,
        canAccessCatering: false,
        canAccessHr: false,
        canAccessGuestFeedback: false,
        isDevelopmentUser: false,
        role: undefined,
        isDirectorOrAbove: false
      });
      setLoading(false);
    }
  }, [user]);

  const fetchPermissions = async () => {
    if (!user) return;
    
    try {
      // Check if user is admin
      const { data: adminCheck } = await supabase
        .rpc('is_admin', { user_id: user.id });

      let userPermissions = { 
        markets: [], 
        stores: [], 
        isAdmin: adminCheck || false,
        canAccessFacilities: true, // Default for existing users
        canAccessCatering: false,
        canAccessHr: false,
        canAccessGuestFeedback: false,
        isDevelopmentUser: false,
        role: undefined,
        isDirectorOrAbove: false
      };

      // Fetch user role from hierarchy
      const { data: hierarchyData } = await supabase
        .from('user_hierarchy')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (hierarchyData?.role) {
        userPermissions.role = hierarchyData.role;
        // Set director or above flag - include CEO and VP (case-insensitive)
        userPermissions.isDirectorOrAbove = ['admin', 'director', 'vp', 'ceo'].includes(hierarchyData.role?.toLowerCase()) || adminCheck;
      } else {
        userPermissions.isDirectorOrAbove = adminCheck || false;
      }

      // NOTE: legacy `user_permissions` table was removed. Market/store permissions
      // now live in `user_market_permissions`; access flags are derived from role
      // via `user_hierarchy`. We no longer query the deprecated table here because
      // it caused the permissions hook to hang on pages like /executive-oversight.
      const { data: marketPerms } = await supabase
        .from('user_market_permissions')
        .select('market')
        .eq('user_id', user.id);

      if (marketPerms && marketPerms.length > 0) {
        userPermissions.markets = marketPerms.map((m: any) => m.market).filter(Boolean);
      }

      // Guest Feedback access is granted to anyone with a hierarchy role or admin.
      userPermissions.canAccessGuestFeedback = !!hierarchyData?.role || !!adminCheck;

      setPermissions(userPermissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setPermissions({ 
        markets: [], 
        stores: [], 
        isAdmin: false,
        canAccessFacilities: true,
        canAccessCatering: false,
        canAccessHr: false,
        canAccessGuestFeedback: false,
        isDevelopmentUser: false,
        role: undefined,
        isDirectorOrAbove: false
      });
    } finally {
      setLoading(false);
    }
  };

  const canAccessWorkOrder = (workOrder: { market: string; store_number: string }) => {
    console.log('canAccessWorkOrder check:', {
      workOrder: { market: workOrder.market, store_number: workOrder.store_number },
      permissions,
      isAdmin: permissions.isAdmin,
      hasMarkets: permissions.markets.length > 0,
      hasStores: permissions.stores.length > 0
    });

    // Admin can access everything
    if (permissions.isAdmin) {
      console.log('User is admin, access granted');
      return true;
    }

    // If user has market permissions, they can see work orders in those markets
    if (permissions.markets.length > 0) {
      const hasMarketAccess = permissions.markets.includes(workOrder.market);
      console.log('Market check:', { userMarkets: permissions.markets, workOrderMarket: workOrder.market, hasAccess: hasMarketAccess });
      return hasMarketAccess;
    }

    // If user has no market permissions but has store permissions, 
    // they can only see work orders for their specific stores
    if (permissions.stores.length > 0) {
      const hasStoreAccess = permissions.stores.includes(workOrder.store_number);
      console.log('Store check:', { userStores: permissions.stores, workOrderStore: workOrder.store_number, hasAccess: hasStoreAccess });
      return hasStoreAccess;
    }

    // No permissions = no access
    console.log('No permissions found, access denied');
    return false;
  };

  return {
    permissions,
    loading,
    canAccessWorkOrder,
    refetch: fetchPermissions
  };
}