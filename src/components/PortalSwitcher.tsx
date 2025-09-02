import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Wrench, UtensilsCrossed, Users, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const portals = [
  {
    key: 'facilities',
    title: 'Facilities',
    icon: Wrench,
    href: '/dashboard'
  },
  {
    key: 'catering',
    title: 'Catering',
    icon: UtensilsCrossed,
    href: '/catering'
  },
  {
    key: 'hr',
    title: 'Human Resources',
    icon: Users,
    href: '/hr'
  },
  {
    key: 'guest-feedback',
    title: 'Guest Feedback',
    icon: MessageSquare,
    href: '/guest-feedback'
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
    if (location.pathname.startsWith('/guest-feedback')) return 'guest-feedback';
    return 'facilities'; // default
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
      case 'guest-feedback':
        return permissions.canAccessGuestFeedback;
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
        <Button variant="ghost" className="gap-2 text-atlas-dark-foreground hover:bg-atlas-red/10 hover:text-atlas-red">
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
              onClick={() => navigate(portal.href)}
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