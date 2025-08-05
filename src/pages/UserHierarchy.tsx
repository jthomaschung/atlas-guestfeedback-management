import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, Save, Settings, Bell, Map, Store, UserCheck, Shield, Network, X } from 'lucide-react';

const markets = [
  'AZ1', 'AZ2', 'AZ3', 'AZ4', 'AZ5', 'IE/LA', 'OC', 
  'MN1', 'MN2', 'NE1', 'NE2', 'NE3', 'NE4', 
  'FL1', 'FL2', 'FL3', 'PA'
];

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

const roles = ['Store Level', 'DM', 'GM/DM', 'Director', 'Admin'];

interface UserProfile {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
}

interface UserHierarchyData {
  id?: string;
  user_id: string;
  manager_id?: string;
  director_id?: string;
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

interface CombinedUserData {
  profile: UserProfile;
  hierarchy?: UserHierarchyData;
  notifications?: NotificationPreferences;
  permissions?: UserPermissions;
}

export default function UserHierarchy() {
  const [users, setUsers] = useState<CombinedUserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<CombinedUserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states for the selected user
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    role: 'Store Level',
    manager_id: '',
    director_id: '',
    email_on_completion: true,
    email_on_tagged: true,
    email_on_assignment: true,
    markets: [] as string[],
    stores: [] as string[]
  });
  
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadAllUsers();
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

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      // Load all users with their related data
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name');

      const { data: hierarchyData } = await supabase
        .from('user_hierarchy')
        .select('*');

      const { data: notificationData } = await supabase
        .from('notification_preferences')
        .select('*');

      const { data: permissionData } = await supabase
        .from('user_permissions')
        .select('*');

      // Combine all user data
      const combinedUsers: CombinedUserData[] = (profiles || []).map(profile => ({
        profile,
        hierarchy: hierarchyData?.find(h => h.user_id === profile.user_id),
        notifications: notificationData?.find(n => n.user_id === profile.user_id),
        permissions: permissionData?.find(p => p.user_id === profile.user_id)
      }));

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (profile: UserProfile) => {
    if (profile.display_name) return profile.display_name;
    const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    return name || profile.email;
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'No Manager';
    const manager = users.find(u => u.profile.user_id === managerId);
    return manager ? getUserDisplayName(manager.profile) : 'Unknown Manager';
  };

  const openUserDialog = (userData: CombinedUserData) => {
    setSelectedUser(userData);
    setFormData({
      display_name: userData.profile.display_name || '',
      email: userData.profile.email || '',
      role: userData.hierarchy?.role || 'Store Level',
      manager_id: userData.hierarchy?.manager_id || '',
      director_id: userData.hierarchy?.director_id || '',
      email_on_completion: userData.notifications?.email_on_completion ?? true,
      email_on_tagged: userData.notifications?.email_on_tagged ?? true,
      email_on_assignment: userData.notifications?.email_on_assignment ?? true,
      markets: userData.permissions?.markets || [],
      stores: userData.permissions?.stores || []
    });
    setSelectedMarket('');
    setSelectedStore('');
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const userId = selectedUser.profile.user_id;

      // Update profile
      console.log('Updating profile for user:', userId, formData.display_name);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name.trim(),
          email: formData.email.trim()
        })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Update or insert hierarchy
      if (selectedUser.hierarchy) {
        const { error: hierarchyError } = await supabase
          .from('user_hierarchy')
          .update({
            role: formData.role,
            manager_id: formData.manager_id || null,
            director_id: formData.director_id || null
          })
          .eq('user_id', userId);

        if (hierarchyError) {
          console.error('Hierarchy update error:', hierarchyError);
          throw hierarchyError;
        }
      } else {
        const { error: hierarchyError } = await supabase
          .from('user_hierarchy')
          .insert({
            user_id: userId,
            role: formData.role,
            manager_id: formData.manager_id || null,
            director_id: formData.director_id || null
          });

        if (hierarchyError) {
          console.error('Hierarchy insert error:', hierarchyError);
          throw hierarchyError;
        }
      }

      // Update or insert notifications
      if (selectedUser.notifications) {
        const { error: notificationError } = await supabase
          .from('notification_preferences')
          .update({
            email_on_completion: formData.email_on_completion,
            email_on_tagged: formData.email_on_tagged,
            email_on_assignment: formData.email_on_assignment
          })
          .eq('user_id', userId);

        if (notificationError) {
          console.error('Notification update error:', notificationError);
          throw notificationError;
        }
      } else {
        const { error: notificationError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: userId,
            email_on_completion: formData.email_on_completion,
            email_on_tagged: formData.email_on_tagged,
            email_on_assignment: formData.email_on_assignment
          });

        if (notificationError) {
          console.error('Notification insert error:', notificationError);
          throw notificationError;
        }
      }

      // Update or insert permissions
      if (selectedUser.permissions) {
        const { error: permissionError } = await supabase
          .from('user_permissions')
          .update({
            markets: formData.markets,
            stores: formData.stores
          })
          .eq('user_id', userId);

        if (permissionError) {
          console.error('Permission update error:', permissionError);
          throw permissionError;
        }
      } else {
        const { error: permissionError } = await supabase
          .from('user_permissions')
          .insert({
            user_id: userId,
            markets: formData.markets,
            stores: formData.stores
          });

        if (permissionError) {
          console.error('Permission insert error:', permissionError);
          throw permissionError;
        }
      }

      toast({
        title: "Success",
        description: "User updated successfully"
      });

      setIsDialogOpen(false);
      await loadAllUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMessage = error?.message || 'Failed to save user';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addMarket = () => {
    if (selectedMarket && !formData.markets.includes(selectedMarket)) {
      if (formData.role === 'Store Level') {
        setFormData(prev => ({ ...prev, markets: [selectedMarket] }));
      } else {
        setFormData(prev => ({ ...prev, markets: [...prev.markets, selectedMarket] }));
      }
      setSelectedMarket('');
    }
  };

  const removeMarket = (market: string) => {
    setFormData(prev => ({
      ...prev,
      markets: prev.markets.filter(m => m !== market)
    }));
  };

  const addStore = () => {
    if (selectedStore && !formData.stores.includes(selectedStore)) {
      if (formData.role === 'Store Level') {
        setFormData(prev => ({ ...prev, stores: [selectedStore] }));
      } else {
        setFormData(prev => ({ ...prev, stores: [...prev.stores, selectedStore] }));
      }
      setSelectedStore('');
    }
  };

  const removeStore = (store: string) => {
    setFormData(prev => ({
      ...prev,
      stores: prev.stores.filter(s => s !== store)
    }));
  };

  const filteredUsers = users.filter(userData => {
    const displayName = getUserDisplayName(userData.profile).toLowerCase();
    const email = userData.profile.email.toLowerCase();
    const role = userData.hierarchy?.role || '';
    const search = searchTerm.toLowerCase();
    
    return displayName.includes(search) || email.includes(search) || role.toLowerCase().includes(search);
  });

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
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              You need administrator privileges to access the User Management System.
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-3xl font-bold">User Management System</h1>
          <Badge variant="secondary" className="ml-2">Admin Only</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={loadAllUsers} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((userData) => (
              <Card key={userData.profile.user_id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-base">
                        {getUserDisplayName(userData.profile)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {userData.profile.email}
                      </div>
                    </div>
                    <Badge variant={userData.hierarchy?.role === 'Admin' ? 'destructive' : 'secondary'}>
                      {userData.hierarchy?.role || 'Store Level'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Network className="h-3 w-3" />
                      Manager: {getManagerName(userData.hierarchy?.manager_id)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Map className="h-3 w-3" />
                      Markets: {userData.permissions?.markets?.length || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Store className="h-3 w-3" />
                      Stores: {userData.permissions?.stores?.length || 0}
                    </div>
                  </div>

                  <Button 
                    onClick={() => openUserDialog(userData)}
                    className="w-full"
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage User
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage User: {selectedUser ? getUserDisplayName(selectedUser.profile) : ''}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="hierarchy">Role & Manager</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Name for tagging (@mentions)"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email for notifications"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hierarchy" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border">
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  {/* DM Selection for Store Level Users */}
                  {formData.role === 'Store Level' && (
                    <div>
                      <Label>District Manager (DM)</Label>
                      <Select 
                        value={formData.manager_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, manager_id: value === 'none' ? '' : value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select DM" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border">
                          <SelectItem value="none">No DM</SelectItem>
                          {users
                            .filter(u => u.profile.user_id !== selectedUser?.profile.user_id && u.hierarchy?.role === 'DM')
                            .map((userData) => (
                              <SelectItem key={userData.profile.user_id} value={userData.profile.user_id}>
                                {getUserDisplayName(userData.profile)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Director Selection for Store Level and DM Level Users */}
                  {(formData.role === 'Store Level' || formData.role === 'DM') && (
                    <div>
                      <Label>Director</Label>
                      <Select 
                        value={formData.director_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, director_id: value === 'none' ? '' : value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Director" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border">
                          <SelectItem value="none">No Director</SelectItem>
                          {users
                            .filter(u => u.profile.user_id !== selectedUser?.profile.user_id && u.hierarchy?.role === 'Director')
                            .map((userData) => (
                              <SelectItem key={userData.profile.user_id} value={userData.profile.user_id}>
                                {getUserDisplayName(userData.profile)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* General Manager Selection for other roles */}
                  {formData.role !== 'Store Level' && formData.role !== 'DM' && formData.role !== 'Admin' && (
                    <div>
                      <Label>Manager</Label>
                      <Select 
                        value={formData.manager_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, manager_id: value === 'none' ? '' : value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Manager" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border">
                          <SelectItem value="none">No Manager</SelectItem>
                          {users
                            .filter(u => u.profile.user_id !== selectedUser?.profile.user_id)
                            .map((userData) => (
                              <SelectItem key={userData.profile.user_id} value={userData.profile.user_id}>
                                {getUserDisplayName(userData.profile)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email_completion"
                    checked={formData.email_on_completion}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, email_on_completion: checked as boolean }))
                    }
                  />
                  <Label htmlFor="email_completion">Email on work order completion</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email_tagged"
                    checked={formData.email_on_tagged}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, email_on_tagged: checked as boolean }))
                    }
                  />
                  <Label htmlFor="email_tagged">Email when tagged in notes</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email_assignment"
                    checked={formData.email_on_assignment}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, email_on_assignment: checked as boolean }))
                    }
                  />
                  <Label htmlFor="email_assignment">Email on work order assignment</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-6">
                {/* Markets */}
                <div>
                  <Label className="text-sm font-medium">
                    Markets {formData.role === 'Store Level' ? '(Single Selection)' : '(Multiple Allowed)'}
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select market" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border">
                        {markets.map((market) => (
                          <SelectItem key={market} value={market}>
                            {market}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addMarket} size="sm" disabled={!selectedMarket}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.markets.map((market) => (
                      <Badge key={market} variant="secondary" className="flex items-center gap-1">
                        {market}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeMarket(market)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stores */}
                <div>
                  <Label className="text-sm font-medium">
                    Stores {formData.role === 'Store Level' ? '(Single Selection)' : '(Multiple Allowed)'}
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={selectedStore} onValueChange={setSelectedStore}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select store" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border">
                        {storeNumbers.map((store) => (
                          <SelectItem key={store} value={store}>
                            {store}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addStore} size="sm" disabled={!selectedStore}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.stores.map((store) => (
                      <Badge key={store} variant="secondary" className="flex items-center gap-1">
                        {store}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeStore(store)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Admin role users have access to all stores and markets regardless of permissions set here. 
                    Empty permissions for other roles means access to all locations.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}