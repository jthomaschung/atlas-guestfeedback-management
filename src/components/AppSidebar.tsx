import { useState, useEffect } from "react";
import { LayoutDashboard, BarChart3, Users, Settings, MessageSquare, Archive, UserCheck, TrendingUp, Shield, Target, BookOpen, Mail, Clock, FileText, CheckCircle, FileX, LayoutGrid, ChevronDown, Headphones } from "lucide-react";
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

// Guest Feedback items (collapsible group)
const guestFeedbackItems = [
  { title: "Accuracy", url: "/accuracy", icon: Target },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Feedback Reporting", url: "/feedback-reporting", icon: TrendingUp },
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
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar-background">
        <SidebarContent className="pt-4">
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

  const getNavCls = ({ isActive }: { isActive: boolean }) => {
    const base = "transition-all duration-200 rounded-lg";
    return isActive 
      ? `${base} bg-sidebar-active text-sidebar-accent-foreground font-medium shadow-sm`
      : `${base} text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground`;
  };

  return (
    <Sidebar
      collapsible="icon"
      className={`bg-sidebar-background border-r-0 ${isMobile ? "mobile-safe-area" : ""}`}
      style={{ "--sidebar-width": "240px", "--sidebar-width-icon": "48px" } as React.CSSProperties}
    >
      {/* ATLAS Branding Header with dark background */}
      <div className={cn(
        "relative bg-atlas-dark text-white h-16 flex items-center justify-center",
        "after:absolute after:top-0 after:right-0 after:w-1 after:h-full after:bg-atlas-dark",
        state === "expanded" && "px-4 justify-start"
      )}>
        {/* Red accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
        
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/9faa62d6-a114-492a-88df-c8401b255bd5.png" 
            alt="Atlas Logo" 
            className="w-8 h-8"
          />
          {state === "expanded" && (
            <div>
              <h2 className="font-bold text-sm tracking-wide">ATLAS</h2>
              <p className="text-xs text-gray-400">Guest Feedback</p>
            </div>
          )}
        </div>
      </div>
      <SidebarContent className={`pt-3 ${isMobile ? "mobile-scroll" : ""}`}>

        {/* Guest Feedback - Collapsible Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={guestFeedbackOpen} onOpenChange={setGuestFeedbackOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className={cn(
                    "w-full bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-xl py-3 px-4 shadow-sm transition-all duration-200",
                    state === "expanded" ? "justify-between" : "justify-center px-2"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="bg-sidebar-active p-2 rounded-lg shadow-sm">
                        <MessageSquare className="h-5 w-5 text-sidebar-foreground" />
                      </div>
                      {state === "expanded" && (
                        <span className="font-semibold text-sm text-sidebar-accent-foreground whitespace-nowrap">Guest Feedback</span>
                      )}
                    </div>
                    {state === "expanded" && (
                      <ChevronDown className={cn("h-4 w-4 text-sidebar-accent-foreground transition-transform duration-200", guestFeedbackOpen && "transform rotate-180")} />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {state === "expanded" && (
                  <CollapsibleContent>
          <SidebarMenu className="ml-6 mt-0.5 space-y-0">
            {guestFeedbackItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="py-3 px-4">
                  <NavLink to={item.url} end className={getNavCls}>
                    <div className="bg-sidebar-active p-2 rounded-lg shadow-sm">
                      <item.icon className="h-5 w-5 text-sidebar-foreground" />
                    </div>
                    {state === "expanded" && <span>{item.title}</span>}
                  </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="h-4" />

        {/* Executive - Collapsible Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={executiveOpen} onOpenChange={setExecutiveOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className={cn(
                    "w-full bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-xl py-3 px-4 shadow-sm transition-all duration-200",
                    state === "expanded" ? "justify-between" : "justify-center px-2"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="bg-sidebar-active p-2 rounded-lg shadow-sm">
                        <Shield className="h-5 w-5 text-sidebar-foreground" />
                      </div>
                      {state === "expanded" && (
                        <span className="font-semibold text-sm text-sidebar-accent-foreground whitespace-nowrap">Executive</span>
                      )}
                    </div>
                    {state === "expanded" && (
                      <ChevronDown className={cn("h-4 w-4 text-sidebar-accent-foreground transition-transform duration-200", executiveOpen && "transform rotate-180")} />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {state === "expanded" && (
                  <CollapsibleContent>
          <SidebarMenu className="ml-6 mt-0.5 space-y-0">
            {executiveItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="py-3 px-4">
                  <NavLink to={item.url} end className={getNavCls}>
                    <div className="bg-sidebar-active p-2 rounded-lg shadow-sm">
                      <item.icon className="h-5 w-5 text-sidebar-foreground" />
                    </div>
                    {state === "expanded" && <span>{item.title}</span>}
                  </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="h-4" />

        {/* Support - Collapsible Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className={cn(
                    "w-full bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-xl py-3 px-4 shadow-sm transition-all duration-200",
                    state === "expanded" ? "justify-between" : "justify-center px-2"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="bg-sidebar-active p-2 rounded-lg shadow-sm">
                        <BookOpen className="h-5 w-5 text-sidebar-foreground" />
                      </div>
                      {state === "expanded" && (
                        <span className="font-semibold text-sm text-sidebar-accent-foreground whitespace-nowrap">Support</span>
                      )}
                    </div>
                    {state === "expanded" && (
                      <ChevronDown className={cn("h-4 w-4 text-sidebar-accent-foreground transition-transform duration-200", supportOpen && "transform rotate-180")} />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {state === "expanded" && (
                  <CollapsibleContent>
          <SidebarMenu className="ml-6 mt-0.5 space-y-0">
            {supportItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="py-3 px-4">
                  <NavLink to={item.url} end className={getNavCls}>
                    <div className="bg-sidebar-active p-2 rounded-lg shadow-sm">
                      <item.icon className="h-5 w-5 text-sidebar-foreground" />
                    </div>
                    {state === "expanded" && <span>{item.title}</span>}
                  </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="h-4" />

        {/* Archive - Collapsible Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={archiveOpen} onOpenChange={setArchiveOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className={cn(
                    "w-full bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-xl py-3 px-4 shadow-sm transition-all duration-200",
                    state === "expanded" ? "justify-between" : "justify-center px-2"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="bg-sidebar-active p-2 rounded-lg shadow-sm">
                        <Archive className="h-5 w-5 text-sidebar-foreground" />
                      </div>
                      {state === "expanded" && (
                        <span className="font-semibold text-sm text-sidebar-accent-foreground whitespace-nowrap">Archive</span>
                      )}
                    </div>
                    {state === "expanded" && (
                      <ChevronDown className={cn("h-4 w-4 text-sidebar-accent-foreground transition-transform duration-200", archiveOpen && "transform rotate-180")} />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {state === "expanded" && (
                  <CollapsibleContent>
          <SidebarMenu className="ml-6 mt-0.5 space-y-0">
            {archiveItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="py-3 px-4">
                  <NavLink to={item.url} end className={getNavCls}>
                    <div className="bg-sidebar-active p-2 rounded-lg shadow-sm">
                      <item.icon className="h-5 w-5 text-sidebar-foreground" />
                    </div>
                    {state === "expanded" && <span>{item.title}</span>}
                  </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="h-4" />

        {/* Administration - Collapsible Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className={cn(
                    "w-full bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-xl py-3 px-4 shadow-sm transition-all duration-200",
                    state === "expanded" ? "justify-between" : "justify-center px-2"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="bg-sidebar-active p-2 rounded-lg shadow-sm">
                        <Settings className="h-5 w-5 text-sidebar-foreground" />
                      </div>
                      {state === "expanded" && (
                        <span className="font-semibold text-sm text-sidebar-accent-foreground whitespace-nowrap">Administration</span>
                      )}
                    </div>
                    {state === "expanded" && (
                      <ChevronDown className={cn("h-4 w-4 text-sidebar-accent-foreground transition-transform duration-200", adminOpen && "transform rotate-180")} />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {state === "expanded" && (
                  <CollapsibleContent>
          <SidebarMenu className="ml-6 mt-0.5 space-y-0">
            {adminItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="py-3 px-4">
                  <NavLink to={item.url} end className={getNavCls}>
                    <div className="bg-sidebar-active p-2 rounded-lg shadow-sm">
                      <item.icon className="h-5 w-5 text-sidebar-foreground" />
                    </div>
                    {state === "expanded" && <span>{item.title}</span>}
                  </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
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
