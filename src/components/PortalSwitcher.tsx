import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Wrench, UtensilsCrossed, Users, MessageSquare, BarChart3 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createAuthenticatedUrl } from '@/utils/sessionToken';

const portals = [
  {
    key: 'facilities',
    title: 'Facilities',
    icon: Wrench,
    externalUrl: 'https://atlasfacilities.co/'
  },
  {
    key: 'catering',
    title: 'Catering',
    icon: UtensilsCrossed,
    href: '/catering',
    externalUrl: 'https://atlas-catering-operations.lovable.app' // Update with actual URL
  },
  {
    key: 'hr',
    title: 'Human Resources',
    icon: Users,
    href: '/hr',
    externalUrl: 'https://atlas-hr-management.lovable.app' // Update with actual URL
  },
  {
    key: 'training',
    title: 'Training Dashboard',
    icon: Users,
    href: '/training',
    externalUrl: 'https://preview--trainingportal.lovable.app/welcome'
  },
  {
    key: 'guest-feedback',
    title: 'Guest Feedback',
    icon: MessageSquare,
    href: '/dashboard',
    externalUrl: 'https://preview--atlas-guestfeedback-management.lovable.app/dashboard'
  },
  {
    key: 'kpi-dashboard',
    title: 'KPI Dashboard',
    icon: BarChart3,
    href: '/kpi-dashboard',
    externalUrl: 'https://atlas-kpis.lovable.app'
  }
];

export function PortalSwitcher() {
  const { permissions } = useUserPermissions();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current portal based on route
  const getCurrentPortal = () => {
    if (location.pathname.startsWith('/catering')) return 'catering';
    if (location.pathname.startsWith('/hr')) return 'hr';
    // Default to guest-feedback for this app
    return 'guest-feedback';
  };

  // Handle portal navigation
  const handlePortalNavigation = async (portal: typeof portals[0]) => {
    console.log('🚀 Portal navigation started:', {
      targetPortal: portal.key,
      currentPortal: getCurrentPortal(),
      externalUrl: portal.externalUrl,
      hasExternalUrl: !!portal.externalUrl,
      permissions: permissions
    });

    // If it's the current portal or has no external URL, use internal navigation
    if (portal.key === getCurrentPortal() || !portal.externalUrl) {
      console.log('🔄 Using internal navigation');
      navigate(portal.href);
      return;
    }

    console.log('🌐 Starting external portal navigation...');
    try {
      // For external portals, create authenticated URL and navigate
      console.log('🔐 Creating authenticated URL...');
      
      // For facilities app, try to send directly to root with a hash to bypass welcome page
      let targetUrl = portal.externalUrl;
      if (portal.key === 'facilities') {
        // Try sending to root with a hash fragment to potentially bypass welcome redirect
        targetUrl = portal.externalUrl + '#authenticated';
        console.log('🏢 Facilities-specific URL modification:', targetUrl);
      }
      
      const authenticatedUrl = await createAuthenticatedUrl(targetUrl);
      console.log('✅ Authenticated URL created:', {
        originalUrl: portal.externalUrl,
        targetUrl,
        authenticatedUrl: authenticatedUrl.substring(0, 100) + '...',
        hasTokens: authenticatedUrl.includes('access_token')
      });
      
      console.log('🚀 Redirecting to authenticated URL...');
      window.location.href = authenticatedUrl;
    } catch (error) {
      console.error('❌ Error creating authenticated URL:', error);
      // Fallback to direct navigation
      console.log('🔄 Falling back to direct navigation');
      window.location.href = portal.externalUrl;
    }
  };

  // Check if user has access to multiple portals
  const accessiblePortals = portals.filter(portal => {
    switch (portal.key) {
      case 'facilities':
        return permissions.canAccessFacilities;
      case 'catering':
        return permissions.canAccessCatering;
      case 'hr':
        return permissions.canAccessHr;
      case 'training':
        return permissions.canAccessFacilities; // Use facilities permission for now
      case 'guest-feedback':
        return permissions.canAccessGuestFeedback;
      case 'kpi-dashboard':
        return true; // KPI Dashboard accessible to all authenticated users
      default:
        return false;
    }
  });

  // Don't show switcher if user only has access to one portal
  if (accessiblePortals.length <= 1) return null;

  const currentPortal = portals.find(p => p.key === getCurrentPortal());
  const CurrentIcon = currentPortal?.icon || Wrench;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 text-foreground/80 hover:bg-muted hover:text-foreground transition-all duration-200 min-h-[44px] px-3 rounded-lg">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentPortal?.title}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {accessiblePortals.map((portal) => {
          const Icon = portal.icon;
          const isCurrent = portal.key === getCurrentPortal();
          
          return (
            <DropdownMenuItem
              key={portal.key}
              onClick={() => handlePortalNavigation(portal)}
              className={isCurrent ? "bg-accent" : ""}
            >
              <Icon className="mr-2 h-4 w-4" />
              {portal.title}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}