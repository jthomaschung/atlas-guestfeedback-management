import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  Wrench,
  UtensilsCrossed,
  Users,
  MessageSquare,
  BarChart3,
  Calculator,
  GraduationCap,
  ClipboardList,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createAuthenticatedUrl } from '@/utils/sessionToken';

type PortalMeta = {
  key: string;
  title: string;
  icon: LucideIcon;
  href?: string;
  externalUrl: string;
};

// Canonical portal metadata, keyed by the DB `portals.key` value.
const PORTAL_META: Record<string, PortalMeta> = {
  facilities: {
    key: 'facilities',
    title: 'Facilities',
    icon: Wrench,
    externalUrl: 'https://atlasfacilities.co/',
  },
  catering: {
    key: 'catering',
    title: 'Catering',
    icon: UtensilsCrossed,
    externalUrl: 'https://atlas-catering-operations.lovable.app',
  },
  hr: {
    key: 'hr',
    title: 'Human Resources',
    icon: Users,
    externalUrl: 'https://atlas-hr-management.lovable.app',
  },
  training: {
    key: 'training',
    title: 'Training Dashboard',
    icon: GraduationCap,
    externalUrl: 'https://preview--trainingportal.lovable.app/welcome',
  },
  guest_feedback: {
    key: 'guest_feedback',
    title: 'Guest Feedback',
    icon: MessageSquare,
    href: '/dashboard',
    externalUrl: 'https://guestfeedback.atlasteam.app/dashboard',
  },
  kpi: {
    key: 'kpi',
    title: 'KPI Dashboard',
    icon: BarChart3,
    externalUrl: 'https://atlas-kpis.lovable.app',
  },
  accounting: {
    key: 'accounting',
    title: 'Accounting',
    icon: Calculator,
    externalUrl: 'https://accounting.atlasteam.app',
  },
  incident_reporting: {
    key: 'incident_reporting',
    title: 'HR Dashboard',
    icon: ClipboardList,
    // TODO: confirm production URL for HR Dashboard (incident_reporting)
    externalUrl: 'https://atlas-hr-management.lovable.app',
  },
  manager_payroll_dashboard: {
    key: 'manager_payroll_dashboard',
    title: 'Manager Payroll',
    icon: DollarSign,
    // TODO: confirm production URL for Manager Payroll Dashboard
    externalUrl: 'https://atlas-hr-management.lovable.app',
  },
};

export function PortalSwitcher() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [accessibleKeys, setAccessibleKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchAccess = async () => {
      if (!user?.id) {
        setAccessibleKeys([]);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('user_portal_access')
          .select('portals!inner(key)')
          .eq('user_id', user.id);

        if (error) throw error;
        if (cancelled) return;

        const keys = (data ?? [])
          .map((row: any) => row?.portals?.key)
          .filter((k: unknown): k is string => typeof k === 'string');
        setAccessibleKeys(keys);
      } catch (err) {
        console.error('PortalSwitcher: failed to load portal access', err);
        if (!cancelled) setAccessibleKeys([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAccess();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Determine current portal based on route. This app is the Guest Feedback portal.
  const getCurrentPortal = () => {
    if (location.pathname.startsWith('/catering')) return 'catering';
    if (location.pathname.startsWith('/hr')) return 'hr';
    return 'guest_feedback';
  };

  const handlePortalNavigation = async (portal: PortalMeta) => {
    // Internal navigation if it's the current portal and we have a local route.
    if (portal.key === getCurrentPortal() && portal.href) {
      navigate(portal.href);
      return;
    }

    try {
      const targetUrl =
        portal.key === 'facilities' ? `${portal.externalUrl}#authenticated` : portal.externalUrl;
      const authenticatedUrl = await createAuthenticatedUrl(targetUrl);
      window.location.href = authenticatedUrl;
    } catch (error) {
      console.error('PortalSwitcher: error creating authenticated URL', error);
      window.location.href = portal.externalUrl;
    }
  };

  const accessiblePortals = accessibleKeys
    .map((key) => PORTAL_META[key])
    .filter((p): p is PortalMeta => Boolean(p));

  if (loading || accessiblePortals.length <= 1) return null;

  const currentPortal = PORTAL_META[getCurrentPortal()];
  const CurrentIcon = currentPortal?.icon || Wrench;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 text-foreground/80 hover:bg-muted hover:text-foreground transition-all duration-200 min-h-[44px] px-3 rounded-lg"
        >
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
              className={isCurrent ? 'bg-accent' : ''}
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
