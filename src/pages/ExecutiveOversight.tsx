import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { supabase } from '@/integrations/supabase/client';
import { ExecutiveDashboard } from '@/components/feedback/ExecutiveDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, Users, Clock } from 'lucide-react';

export default function ExecutiveOversight() {
  const { user } = useAuth();
  const { permissions, loading } = useUserPermissions();
  const [userRole, setUserRole] = useState<string>('');
  const [isExecutive, setIsExecutive] = useState(false);

  useEffect(() => {
    const checkExecutiveStatus = async () => {
      if (!user) return;

      try {
        const { data: hierarchy, error } = await supabase
          .from('user_hierarchy')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking user role:', error);
          return;
        }

        const role = hierarchy?.role?.toLowerCase() || '';
        setUserRole(role);
        
        // Check if user has executive privileges
        const executiveRoles = ['admin', 'director', 'vp', 'ceo'];
        setIsExecutive(executiveRoles.includes(role));
      } catch (error) {
        console.error('Error in checkExecutiveStatus:', error);
      }
    };

    if (user && !loading) {
      checkExecutiveStatus();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isExecutive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Access Restricted</CardTitle>
            <CardDescription>Executive-Level Access Required</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              This page is restricted to executive leadership only. You need one of the following roles to access this dashboard:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• CEO</li>
                <li>• VP (Vice President)</li>
                <li>• Director</li>
                <li>• Admin</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">
              Your current role: <span className="font-medium">{userRole || 'User'}</span>
            </p>
            <p className="text-sm text-gray-500">
              Contact your administrator if you believe you should have access to this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Executive Oversight</h1>
                <p className="text-sm text-gray-600">
                  Critical customer feedback requiring {userRole.toUpperCase()} attention
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {userRole.toUpperCase()} Level Access
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-red-50 border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Executive Alert System Active</p>
                <p className="mt-1">
                  This dashboard shows critical customer feedback that has been escalated to executive level. 
                  These issues require immediate attention and oversight from senior leadership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto">
        <ExecutiveDashboard userRole={userRole} />
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <Users className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Escalation Hierarchy</p>
                <p>Critical issues are automatically escalated to VP → Director → CEO based on severity and market access.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">SLA Management</p>
                <p>Critical issues have 2-hour SLA deadlines. Violations trigger additional executive notifications.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Executive Actions</p>
                <p>Add oversight notes, mark as reviewed, and track escalation history for audit purposes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}