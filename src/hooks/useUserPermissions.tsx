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
    isDevelopmentUser: false
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
        isDevelopmentUser: false
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
        isDevelopmentUser: false
      };

      // Fetch user permissions (both admin and non-admin users can have specific permissions)
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('markets, stores, can_access_facilities_dev, can_access_catering_dev, can_access_hr_dev, can_access_guest_feedback_dev, is_development_user')
        .eq('user_id', user.id)
        .maybeSingle();

      if (permissions) {
        userPermissions.markets = permissions.markets || [];
        userPermissions.stores = permissions.stores || [];
        userPermissions.canAccessFacilities = permissions.can_access_facilities_dev ?? true;
        userPermissions.canAccessCatering = permissions.can_access_catering_dev ?? false;
        userPermissions.canAccessHr = permissions.can_access_hr_dev ?? false;
        userPermissions.canAccessGuestFeedback = permissions.can_access_guest_feedback_dev ?? false;
        userPermissions.isDevelopmentUser = permissions.is_development_user ?? false;
      }

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
        isDevelopmentUser: false
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