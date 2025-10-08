import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Key, Plus, Store, Mail } from 'lucide-react';
import { MarketOverview } from '@/components/settings/MarketOverview';
import { StoreTable } from '@/components/settings/StoreTable';
import { StoreFilters } from '@/components/settings/StoreFilters';
import { StoreManagementDialog } from '@/components/settings/StoreManagementDialog';
import { ManageMarketsDialog } from '@/components/settings/ManageMarketsDialog';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Store management state
  const [stores, setStores] = useState<any[]>([]);
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [markets, setMarkets] = useState<{ market: string; count: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [marketDialogOpen, setMarketDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [storesLoading, setStoresLoading] = useState(false);
  const [sendingSummary, setSendingSummary] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch stores
  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('store_number');

      if (error) throw error;

      setStores(data || []);
      
      // Calculate market statistics
      const marketStats = (data || []).reduce((acc: any, store: any) => {
        const market = store.region || 'Unassigned';
        if (!acc[market]) {
          acc[market] = 0;
        }
        if (store.is_active) {
          acc[market]++;
        }
        return acc;
      }, {});

      const marketArray = Object.entries(marketStats).map(([market, count]) => ({
        market,
        count: count as number
      }));

      setMarkets(marketArray);
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stores',
        variant: 'destructive'
      });
    } finally {
      setStoresLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Filter stores
  useEffect(() => {
    let filtered = stores;

    if (selectedMarket !== 'all') {
      filtered = filtered.filter(store => store.region === selectedMarket);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(store =>
        store.store_number?.toLowerCase().includes(query) ||
        store.store_name?.toLowerCase().includes(query) ||
        store.manager?.toLowerCase().includes(query)
      );
    }

    setFilteredStores(filtered);
  }, [stores, selectedMarket, searchQuery]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error", 
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Password updated successfully"
      });

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStore = (store: any) => {
    setSelectedStore(store);
    setStoreDialogOpen(true);
  };

  const handleDeleteStore = async (storeId: number) => {
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('store_id', storeId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Store deleted successfully'
      });

      fetchStores();
    } catch (error: any) {
      console.error('Error deleting store:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete store',
        variant: 'destructive'
      });
    }
  };

  const handleViewDetails = (store: any) => {
    setSelectedStore(store);
    setStoreDialogOpen(true);
  };

  const handleAddStore = () => {
    setSelectedStore(null);
    setStoreDialogOpen(true);
  };

  const handleTestDailySummary = async () => {
    setSendingSummary(true);
    try {
      const { error } = await supabase.functions.invoke('send-daily-summary', {
        body: { test: true }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Test daily summary emails sent successfully'
      });
    } catch (error: any) {
      console.error('Error sending test summary:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send test summary',
        variant: 'destructive'
      });
    } finally {
      setSendingSummary(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and system configuration
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="stores">Store Management</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your current account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input value={user?.email || ''} disabled className="mt-1" />
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-6">
          <MarketOverview 
            markets={markets} 
            onManageMarkets={() => setMarketDialogOpen(true)} 
          />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Store Management
                  </CardTitle>
                  <CardDescription>Manage stores across all markets</CardDescription>
                </div>
                <Button onClick={handleAddStore}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Store
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <StoreFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedMarket={selectedMarket}
                onMarketChange={setSelectedMarket}
                markets={markets.map(m => m.market)}
              />

              {storesLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading stores...
                </div>
              ) : (
                <StoreTable
                  stores={filteredStores}
                  onEdit={handleEditStore}
                  onDelete={handleDeleteStore}
                  onViewDetails={handleViewDetails}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Daily Summary Emails
              </CardTitle>
              <CardDescription>
                Test the automated daily summary email system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Email Recipients:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• CEO and VP: Company-wide summary</li>
                  <li>• Directors: Regional summaries for their markets</li>
                </ul>
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Schedule:</h4>
                <p className="text-sm text-muted-foreground">
                  Automated emails sent daily at 6:00 AM
                </p>
              </div>
              <Button 
                onClick={handleTestDailySummary} 
                disabled={sendingSummary}
                className="w-full"
              >
                {sendingSummary ? "Sending..." : "Send Test Summary Now"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StoreManagementDialog
        open={storeDialogOpen}
        onOpenChange={setStoreDialogOpen}
        store={selectedStore}
        markets={markets.map(m => m.market)}
        onSave={fetchStores}
      />

      <ManageMarketsDialog
        open={marketDialogOpen}
        onOpenChange={setMarketDialogOpen}
        markets={markets}
        onRefresh={fetchStores}
      />
    </div>
  );
};

export default Settings;