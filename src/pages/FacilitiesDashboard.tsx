import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Wrench, ClipboardList, CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";

const FacilitiesDashboard = () => {
  const { user, profile } = useAuth();
  const { permissions } = useUserPermissions();

  // Mock data for facilities dashboard
  const [stats, setStats] = useState({
    totalWorkOrders: 42,
    openWorkOrders: 15,
    completedToday: 8,
    urgentIssues: 3,
    avgResolutionTime: "2.4 days"
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        {/* Welcome Message */}
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Welcome, {profile?.display_name || profile?.first_name || user?.email?.split('@')[0] || 'User'}!
              </h2>
              <p className="text-sm text-muted-foreground">
                {permissions.isAdmin ? (
                  "Administrator Access - All Facilities"
                ) : permissions.markets.length > 0 ? (
                  `Market Access: ${permissions.markets.join(', ')}`
                ) : permissions.stores.length > 0 ? (
                  `Store Access: ${permissions.stores.join(', ')}`
                ) : (
                  "Loading access permissions..."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Facilities Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Monitor work orders, maintenance requests, and facility operations
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkOrders}</div>
              <p className="text-xs text-muted-foreground">
                +2 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Work Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openWorkOrders}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">
                Great progress!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.urgentIssues}</div>
              <p className="text-xs text-muted-foreground">
                Immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResolutionTime}</div>
              <p className="text-xs text-muted-foreground">
                -0.3 days improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used tools and functions</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Wrench className="h-6 w-6" />
              <span>New Work Order</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <ClipboardList className="h-6 w-6" />
              <span>View All Orders</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <AlertTriangle className="h-6 w-6" />
              <span>Emergency Report</span>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest work orders and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">HVAC Repair - Store #1234</p>
                  <p className="text-sm text-muted-foreground">Submitted 2 hours ago</p>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Lighting Replacement - Store #5678</p>
                  <p className="text-sm text-muted-foreground">Completed 4 hours ago</p>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Plumbing Issue - Store #9012</p>
                  <p className="text-sm text-muted-foreground">In progress - Started yesterday</p>
                </div>
                <Badge variant="secondary">In Progress</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacilitiesDashboard;