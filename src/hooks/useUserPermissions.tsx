import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserPermissions {
  markets: string[];
  stores: string[];
  isAdmin: boolean;
}

export function useUserPermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>({
    markets: [],
    stores: [],
    isAdmin: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPermissions();
    } else {
      setPermissions({ markets: [], stores: [], isAdmin: false });
      setLoading(false);
    }
  }, [user]);

  const fetchPermissions = async () => {
    if (!user) return;
    
    try {
      // Check if user is admin
      const { data: adminCheck } = await supabase
        .rpc('is_admin', { user_id: user.id });

      let userPermissions = { markets: [], stores: [], isAdmin: adminCheck || false };

      // If not admin, fetch specific permissions
      if (!adminCheck) {
        const { data: permissions } = await supabase
          .from('user_permissions')
          .select('markets, stores')
          .eq('user_id', user.id)
          .maybeSingle();

        if (permissions) {
          userPermissions.markets = permissions.markets || [];
          userPermissions.stores = permissions.stores || [];
        }
      }

      setPermissions(userPermissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setPermissions({ markets: [], stores: [], isAdmin: false });
    } finally {
      setLoading(false);
    }
  };

  const canAccessWorkOrder = (workOrder: { market: string; store_number: string }) => {
    // Admin can access everything
    if (permissions.isAdmin) return true;

    // If user has market permissions, they can see work orders in those markets
    if (permissions.markets.length > 0) {
      return permissions.markets.includes(workOrder.market);
    }

    // If user has no market permissions but has store permissions, 
    // they can only see work orders for their specific stores
    if (permissions.stores.length > 0) {
      return permissions.stores.includes(workOrder.store_number);
    }

    // No permissions = no access
    return false;
  };

  return {
    permissions,
    loading,
    canAccessWorkOrder,
    refetch: fetchPermissions
  };
}