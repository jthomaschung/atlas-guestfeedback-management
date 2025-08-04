import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, Save, UserCheck } from 'lucide-react';

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

export default function UserHierarchy() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [hierarchy, setHierarchy] = useState<UserHierarchyData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

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
        manager_id: selectedManager || null,
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
      setSelectedRole('user');

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">User Hierarchy Management</h1>
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
                  setSelectedManager(currentHierarchy.manager_id || '');
                  setSelectedRole(currentHierarchy.role);
                } else {
                  setSelectedManager('');
                  setSelectedRole('user');
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
                  <SelectItem value="">No Manager</SelectItem>
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
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
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

        {/* Current Hierarchy Display */}
        <Card>
          <CardHeader>
            <CardTitle>Current Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => {
                const userHierarchy = getCurrentHierarchy(user.user_id);
                return (
                  <div key={user.user_id} className="p-3 border rounded-md bg-muted/50">
                    <div className="font-medium">{getUserDisplayName(user)}</div>
                    <div className="text-sm text-muted-foreground">
                      Role: {userHierarchy?.role || 'user'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Manager: {getManagerName(userHierarchy?.manager_id)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Email Notifications Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
            <h4 className="font-medium mb-2">Completion Notifications</h4>
            <p className="text-sm text-muted-foreground">
              When a work order is completed, email notifications are sent to:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
              <li>The original work order creator</li>
              <li>Their direct manager (if assigned)</li>
              <li>The manager's manager (if assigned)</li>
              <li>Up the hierarchy chain until no more managers</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-md">
            <h4 className="font-medium mb-2">Tag Notifications</h4>
            <p className="text-sm text-muted-foreground">
              When adding notes to work orders, you can tag users by typing @user@email.com in your note. 
              Tagged users will receive an email notification with the note content.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}