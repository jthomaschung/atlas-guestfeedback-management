import { useState, useEffect } from "react";
import { LayoutDashboard, BarChart3, Users, Settings, MessageSquare, Archive, UserCheck, TrendingUp, Shield, Target, BookOpen, Mail, Star, ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Guest Feedback items (collapsible group)
const guestFeedbackItems = [
  { title: "Accuracy", url: "/accuracy", icon: Target },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Feedback Reporting", url: "/feedback-reporting", icon: TrendingUp },
  { title: "Praise Board", url: "/praise-board", icon: Star },
  { title: "Summary", url: "/summary", icon: BarChart3 },
];

// Executive items (collapsible group)
const executiveItems = [
  { title: "Executive Oversight", url: "/executive-oversight", icon: Shield },
];

// Support items (collapsible group)
const supportItems = [
  { title: "Training & Help", url: "/training", icon: BookOpen },
];

// Archive items (collapsible group)
const archiveItems = [
  { title: "Feedback Archive", url: "/feedback-archive", icon: Archive },
];

// Administration items (collapsible group)
const adminItems = [
  { title: "User Management", url: "/user-hierarchy", icon: Users },
  { title: "GFM", url: "/gfm", icon: UserCheck },
  { title: "Email Templates", url: "/email-templates", icon: Mail },
  { title: "Internal Feedback", url: "/internal-feedback", icon: MessageSquare },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const isCollapsed = state === "collapsed";

  // State for collapsible groups
  const [guestFeedbackOpen, setGuestFeedbackOpen] = useState(true);
  const [executiveOpen, setExecutiveOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Smart expand logic - auto-expand group containing active route
  useEffect(() => {
    const isInGuestFeedback = guestFeedbackItems.some(item => item.url === currentPath);
    const isInExecutive = executiveItems.some(item => item.url === currentPath);
    const isInSupport = supportItems.some(item => item.url === currentPath);
    const isInArchive = archiveItems.some(item => item.url === currentPath);
    const isInAdmin = adminItems.some(item => item.url === currentPath);

    if (isInGuestFeedback) setGuestFeedbackOpen(true);
    if (isInExecutive) setExecutiveOpen(true);
    if (isInSupport) setSupportOpen(true);
    if (isInArchive) setArchiveOpen(true);
    if (isInAdmin) setAdminOpen(true);
  }, [currentPath]);

  // Hide navigation on portal selection page
  if (currentPath === '/portal-selection') {
    return (
      <Sidebar collapsible="icon" className="border-r-0 bg-sidebar">
        <SidebarContent className="pt-4 bg-sidebar">
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="p-4 text-sm text-sidebar-foreground">
                Select a portal to view navigation options
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Active state with left accent rail
  const getNavCls = ({ isActive }: { isActive: boolean }) => {
    return isActive 
      ? "sidebar-nav-active text-sidebar-accent-foreground font-medium h-11"
      : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground h-11";
  };

  // Render navigation item with optional tooltip
  const renderNavItem = (item: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }) => {
    const Icon = item.icon;
    const isActive = currentPath === item.url;
    
    const navContent = (
      <NavLink to={item.url} end className={getNavCls}>
        <Icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span className="text-sm">{item.title}</span>}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.title}>
          <TooltipTrigger asChild>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="justify-center">
                {navContent}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-sidebar-accent text-sidebar-accent-foreground">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          {navContent}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  // Render collapsible group header
  const renderGroupHeader = (
    icon: React.ComponentType<{ className?: string }>,
    title: string,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
  ) => {
    const Icon = icon;
    
    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton className="w-full justify-center h-11 text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground">
              <Icon className="h-5 w-5" />
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-sidebar-accent text-sidebar-accent-foreground">
            {title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <CollapsibleTrigger asChild>
        <SidebarMenuButton className="w-full justify-between h-11 px-3 text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            <span className="font-semibold text-sm">{title}</span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 text-sidebar-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </SidebarMenuButton>
      </CollapsibleTrigger>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className={`bg-sidebar border-r-0 ${isMobile ? "mobile-safe-area" : ""}`}
      style={{ "--sidebar-width": "17.5rem", "--sidebar-width-icon": "4.75rem" } as React.CSSProperties}
    >
      {/* ATLAS Branding Header */}
      <div className={cn(
        "bg-sidebar h-16 flex items-center border-b border-sidebar-border",
        isCollapsed ? "justify-center px-2" : "px-4"
      )}>
        {!isCollapsed ? (
          <div>
            <h2 className="font-bold text-lg text-sidebar-accent-foreground tracking-wide">ATLAS</h2>
            <p className="text-xs text-sidebar-muted">Guest Feedback Portal</p>
          </div>
        ) : (
          <span className="font-bold text-sm text-sidebar-accent-foreground">A</span>
        )}
      </div>

      <SidebarContent className={`bg-sidebar pt-2 ${isMobile ? "mobile-scroll" : ""}`}>
        {/* Guest Feedback - Collapsible Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={guestFeedbackOpen} onOpenChange={setGuestFeedbackOpen}>
                {renderGroupHeader(MessageSquare, "Guest Feedback", guestFeedbackOpen, setGuestFeedbackOpen)}
                {!isCollapsed && (
                  <CollapsibleContent>
                    <SidebarMenu className="mt-1 space-y-0.5">
                      {guestFeedbackItems.map(renderNavItem)}
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Executive - Collapsible Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={executiveOpen} onOpenChange={setExecutiveOpen}>
                {renderGroupHeader(Shield, "Executive", executiveOpen, setExecutiveOpen)}
                {!isCollapsed && (
                  <CollapsibleContent>
                    <SidebarMenu className="mt-1 space-y-0.5">
                      {executiveItems.map(renderNavItem)}
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support - Collapsible Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
                {renderGroupHeader(BookOpen, "Support", supportOpen, setSupportOpen)}
                {!isCollapsed && (
                  <CollapsibleContent>
                    <SidebarMenu className="mt-1 space-y-0.5">
                      {supportItems.map(renderNavItem)}
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Archive - Collapsible Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={archiveOpen} onOpenChange={setArchiveOpen}>
                {renderGroupHeader(Archive, "Archive", archiveOpen, setArchiveOpen)}
                {!isCollapsed && (
                  <CollapsibleContent>
                    <SidebarMenu className="mt-1 space-y-0.5">
                      {archiveItems.map(renderNavItem)}
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administration - Collapsible Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                {renderGroupHeader(Settings, "Administration", adminOpen, setAdminOpen)}
                {!isCollapsed && (
                  <CollapsibleContent>
                    <SidebarMenu className="mt-1 space-y-0.5">
                      {adminItems.map(renderNavItem)}
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
