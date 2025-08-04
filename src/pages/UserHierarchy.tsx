import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, Save, UserCheck, Bell, Map, Store } from 'lucide-react';

const markets = [
  'AZ1', 'AZ2', 'AZ3', 'AZ4', 'AZ5', 'IE/LA', 'OC', 
  'MN1', 'MN2', 'NE1', 'NE2', 'NE3', 'NE4', 
  'FL1', 'FL2', 'FL3', 'PA'
];

// Define the specific store numbers
const storeNumbers = [
  '522', '746', '799', '833', '838', '877', '930', '965', '1002', '1018',
  '1019', '1061', '1111', '1127', '1206', '1261', '1307', '1337', '1342', '1355',
  '1440', '1441', '1554', '1556', '1562', '1635', '1694', '1695', '1696', '1762',
  '1779', '1789', '1955', '1956', '1957', '2006', '2021', '2176', '2178', '2180',
  '2391', '2500', '2501', '2502', '2503', '2504', '2601', '2682', '2683', '2711',
  '2712', '2749', '2807', '2808', '2811', '2812', '2821', '2873', '2874', '2876',
  '2883', '2884', '3029', '3030', '3187', '3260', '3391', '3612', '3613', '3635',
  '3686', '3972', '4018', '4022', '4024', '4105', '4330', '4358', '4586'
].map(num => `#${num}`);

interface UserProfile {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface UserHierarchyData {
  id?: string;
  user_id: string;
  manager_id?: string;
  role: string;
}

interface NotificationPreferences {
  id?: string;
  user_id: string;
  email_on_completion: boolean;
  email_on_tagged: boolean;
  email_on_assignment: boolean;
}

interface UserPermissions {
  id?: string;
  user_id: string;
  markets: string[];
  stores: string[];
}

export default function UserHierarchy() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [hierarchy, setHierarchy] = useState<UserHierarchyData[]>([]);
  const [notifications, setNotifications] = useState<NotificationPreferences[]>([]);
  const [permissions, setPermissions] = useState<UserPermissions[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('Store Level');
  const [managingUser, setManagingUser] = useState<string>('');
  const [userNotifications, setUserNotifications] = useState<NotificationPreferences>({
    user_id: '',
    email_on_completion: true,
    email_on_tagged: true,
    email_on_assignment: true
  });
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    user_id: '',
    markets: [],
    stores: []
  });
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) {
      setCheckingAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const loadData = async () => {
    try {
      // Load all users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name')
        .order('first_name');

      if (usersData) {
        setUsers(usersData);
      }

      // Load hierarchy data
      const { data: hierarchyData } = await supabase
        .from('user_hierarchy')
        .select('*');

      if (hierarchyData) {
        setHierarchy(hierarchyData);
      }

      // Load notification preferences
      const { data: notificationData } = await supabase
        .from('notification_preferences')
        .select('*');

      if (notificationData) {
        setNotifications(notificationData);
      }

      // Load user permissions
      const { data: permissionData } = await supabase
        .from('user_permissions')
        .select('*');

      if (permissionData) {
        setPermissions(permissionData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    }
  };

  const handleSaveHierarchy = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const hierarchyData = {
        user_id: selectedUser,
        manager_id: selectedManager === 'none' ? null : selectedManager || null,
        role: selectedRole
      };

      const existingHierarchy = hierarchy.find(h => h.user_id === selectedUser);

      if (existingHierarchy) {
        // Update existing
        const { error } = await supabase
          .from('user_hierarchy')
          .update(hierarchyData)
          .eq('user_id', selectedUser);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('user_hierarchy')
          .insert(hierarchyData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "User hierarchy updated successfully",
      });

      // Reload data
      await loadData();
      
      // Reset form
      setSelectedUser('');
      setSelectedManager('');
      setSelectedRole('Store Level');

    } catch (error) {
      console.error('Error saving hierarchy:', error);
      toast({
        title: "Error",
        description: "Failed to save hierarchy",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: UserProfile) => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || user.email;
  };

  const getCurrentHierarchy = (userId: string) => {
    return hierarchy.find(h => h.user_id === userId);
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'No Manager';
    const manager = users.find(u => u.user_id === managerId);
    return manager ? getUserDisplayName(manager) : 'Unknown Manager';
  };

  const handleManageUser = (userId: string) => {
    setManagingUser(userId);
    
    // Load user's current notification preferences
    const userNotif = notifications.find(n => n.user_id === userId);
    if (userNotif) {
      setUserNotifications(userNotif);
    } else {
      setUserNotifications({
        user_id: userId,
        email_on_completion: true,
        email_on_tagged: true,
        email_on_assignment: true
      });
    }

    // Load user's current permissions
    const userPerm = permissions.find(p => p.user_id === userId);
    if (userPerm) {
      setUserPermissions(userPerm);
    } else {
      setUserPermissions({
        user_id: userId,
        markets: [],
        stores: []
      });
    }

    // Reset dropdown selections
    setSelectedMarket('');
    setSelectedStore('');
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      const existingNotification = notifications.find(n => n.user_id === managingUser);
      
      if (existingNotification) {
        const { error } = await supabase
          .from('notification_preferences')
          .update({
            email_on_completion: userNotifications.email_on_completion,
            email_on_tagged: userNotifications.email_on_tagged,
            email_on_assignment: userNotifications.email_on_assignment
          })
          .eq('user_id', managingUser);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .insert(userNotifications);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Notification preferences updated successfully"
      });

      await loadData();
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    setLoading(true);
    try {
      const existingPermission = permissions.find(p => p.user_id === managingUser);
      
      if (existingPermission) {
        const { error } = await supabase
          .from('user_permissions')
          .update({
            markets: userPermissions.markets,
            stores: userPermissions.stores
          })
          .eq('user_id', managingUser);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_permissions')
          .insert(userPermissions);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "User permissions updated successfully"
      });

      await loadData();
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Error",
        description: "Failed to save user permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addMarket = () => {
    if (selectedMarket && !userPermissions.markets.includes(selectedMarket)) {
      const managingUserRole = hierarchy.find(h => h.user_id === managingUser)?.role || 'Store Level';
      
      if (managingUserRole === 'Store Level') {
        // Store Level users can only have one market
        setUserPermissions(prev => ({
          ...prev,
          markets: [selectedMarket]
        }));
      } else {
        // Directors and DMs can have multiple markets
        setUserPermissions(prev => ({
          ...prev,
          markets: [...prev.markets, selectedMarket]
        }));
      }
      setSelectedMarket('');
    }
  };

  const removeMarket = (market: string) => {
    setUserPermissions(prev => ({
      ...prev,
      markets: prev.markets.filter(m => m !== market)
    }));
  };

  const addStore = () => {
    if (selectedStore && !userPermissions.stores.includes(selectedStore)) {
      const managingUserRole = hierarchy.find(h => h.user_id === managingUser)?.role || 'Store Level';
      
      if (managingUserRole === 'Store Level') {
        // Store Level users can only have one store
        setUserPermissions(prev => ({
          ...prev,
          stores: [selectedStore]
        }));
      } else {
        // Directors and DMs can have multiple stores
        setUserPermissions(prev => ({
          ...prev,
          stores: [...prev.stores, selectedStore]
        }));
      }
      setSelectedStore('');
    }
  };

  const removeStore = (store: string) => {
    setUserPermissions(prev => ({
      ...prev,
      stores: prev.stores.filter(s => s !== store)
    }));
  };

  if (checkingAdmin) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              You need administrator privileges to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact your system administrator if you believe you should have access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">User Management System</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Edit Hierarchy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Set User Hierarchy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>User</Label>
              <Select value={selectedUser} onValueChange={(value) => {
                setSelectedUser(value);
                const currentHierarchy = getCurrentHierarchy(value);
                if (currentHierarchy) {
                  setSelectedManager(currentHierarchy.manager_id || 'none');
                  setSelectedRole(currentHierarchy.role);
                } else {
                  setSelectedManager('none');
                  setSelectedRole('Store Level');
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {getUserDisplayName(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Manager (Optional)</Label>
              <Select value={selectedManager} onValueChange={setSelectedManager}>
                <SelectTrigger>
                  <SelectValue placeholder="Select manager (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Manager</SelectItem>
                  {users.filter(u => u.user_id !== selectedUser).map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {getUserDisplayName(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Store Level">Store Level</SelectItem>
                  <SelectItem value="DM">DM</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSaveHierarchy} 
              disabled={loading || !selectedUser}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Hierarchy'}
            </Button>
          </CardContent>
        </Card>

        {/* User List with Management Actions */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => {
                const userHierarchy = getCurrentHierarchy(user.user_id);
                const userNotif = notifications.find(n => n.user_id === user.user_id);
                const userPerm = permissions.find(p => p.user_id === user.user_id);
                
                return (
                  <div key={user.user_id} className="p-3 border rounded-md bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{getUserDisplayName(user)}</div>
                        <div className="text-sm text-muted-foreground">
                          Role: {userHierarchy?.role || 'Store Level'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Manager: {getManagerName(userHierarchy?.manager_id)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Markets: {userPerm?.markets?.length || 0} | Stores: {userPerm?.stores?.length || 0}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageUser(user.user_id)}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Panel */}
      {managingUser && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Managing: {getUserDisplayName(users.find(u => u.user_id === managingUser)!)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email_completion"
                  checked={userNotifications.email_on_completion}
                  onCheckedChange={(checked) => 
                    setUserNotifications(prev => ({ ...prev, email_on_completion: checked as boolean }))
                  }
                />
                <Label htmlFor="email_completion" className="text-sm">
                  Email on work order completion
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email_tagged"
                  checked={userNotifications.email_on_tagged}
                  onCheckedChange={(checked) => 
                    setUserNotifications(prev => ({ ...prev, email_on_tagged: checked as boolean }))
                  }
                />
                <Label htmlFor="email_tagged" className="text-sm">
                  Email when tagged in notes
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email_assignment"
                  checked={userNotifications.email_on_assignment}
                  onCheckedChange={(checked) => 
                    setUserNotifications(prev => ({ ...prev, email_on_assignment: checked as boolean }))
                  }
                />
                <Label htmlFor="email_assignment" className="text-sm">
                  Email on work order assignment
                </Label>
              </div>

              <Button onClick={handleSaveNotifications} disabled={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Market & Store Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Access Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Markets */}
              <div>
                <Label className="text-sm font-medium">
                  Markets {hierarchy.find(h => h.user_id === managingUser)?.role === 'Store Level' ? '(Single Selection)' : '(Multiple Allowed)'}
                </Label>
                <div className="flex gap-2 mt-1">
                  <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select market" />
                    </SelectTrigger>
                    <SelectContent>
                      {markets.map((market) => (
                        <SelectItem key={market} value={market}>
                          {market}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addMarket} size="sm" disabled={!selectedMarket}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {userPermissions.markets.map((market) => (
                    <div key={market} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs flex items-center gap-1">
                      {market}
                      <button
                        onClick={() => removeMarket(market)}
                        className="text-xs hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stores */}
              <div>
                <Label className="text-sm font-medium">
                  Store Number {hierarchy.find(h => h.user_id === managingUser)?.role === 'Store Level' ? '(Single Selection)' : '(Multiple Allowed)'}
                </Label>
                <div className="flex gap-2 mt-1">
                  <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {storeNumbers.map((store) => (
                        <SelectItem key={store} value={store}>
                          {store}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addStore} size="sm" disabled={!selectedStore}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {userPermissions.stores.map((store) => (
                    <div key={store} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs flex items-center gap-1">
                      {store}
                      <button
                        onClick={() => removeStore(store)}
                        className="text-xs hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSavePermissions} disabled={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Permissions
              </Button>

              <Button 
                variant="outline" 
                onClick={() => setManagingUser('')} 
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
            <h4 className="font-medium mb-2">Email Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Completion notifications are sent up the management hierarchy. Tagged notifications go directly to mentioned users.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-md">
            <h4 className="font-medium mb-2">Access Permissions</h4>
            <p className="text-sm text-muted-foreground">
              Market and store permissions control which work orders users can view. Empty permissions = access to all.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-md">
            <h4 className="font-medium mb-2">Tagging Users</h4>
            <p className="text-sm text-muted-foreground">
              Tag users in notes using @user@email.com format (e.g., @john@company.com).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}