import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, UtensilsCrossed, Users, MessageSquare } from 'lucide-react';

export default function PortalSelection() {
  const { permissions, loading } = useUserPermissions();
  const navigate = useNavigate();

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

  if (accessiblePortals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have access to any portals. Please contact your administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const portals = [
    {
      key: 'facilities',
      title: 'Facilities Management',
      description: 'Work orders, maintenance, and facility operations',
      icon: Wrench,
      href: '/dashboard',
      available: permissions.canAccessFacilities
    },
    {
      key: 'catering',
      title: 'Catering Operations',
      description: 'Menu management, food safety, and catering logistics',
      icon: UtensilsCrossed,
      href: '/catering',
      available: permissions.canAccessCatering
    },
    {
      key: 'hr',
      title: 'Human Resources',
      description: 'Employee management, scheduling, and HR operations',
      icon: Users,
      href: '/hr',
      available: permissions.canAccessHr
    },
    {
      key: 'guest-feedback',
      title: 'Guest Feedback',
      description: 'Customer reviews, surveys, and feedback management',
      icon: MessageSquare,
      href: '/guest-feedback',
      available: permissions.canAccessGuestFeedback
    }
  ];

  const availablePortals = portals.filter(portal => portal.available);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-4xl mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">ATLAS Portal Selection</h1>
          <p className="text-muted-foreground">Select the portal you'd like to access</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availablePortals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Card key={portal.key} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{portal.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {portal.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    disabled={!portal.available}
                    onClick={() => navigate(portal.href)}
                  >
                    Access {portal.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}