import { useState, useEffect } from "react";
import { LayoutDashboard, BarChart3, Users, Settings, MessageSquare, Archive, UserCheck, TrendingUp, Shield, Target, BookOpen, Mail, Clock, FileText, CheckCircle, FileX, LayoutGrid, ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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

// Dashboard (standalone)
const dashboardItem = { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard };

// Status items (collapsible group)
const statusItems = [
  { title: "Accuracy", url: "/accuracy", icon: Target },
  { title: "Summary", url: "/summary", icon: BarChart3 },
];

// Reports items (collapsible group)
const reportsItems = [
  { title: "Feedback Reporting", url: "/feedback-reporting", icon: TrendingUp },
  { title: "Executive Oversight", url: "/executive-oversight", icon: Shield },
];

// Administration items (collapsible group)
const adminItems = [
  { title: "User Management", url: "/user-hierarchy", icon: Users },
  { title: "GFM (Guest Feedback Manager)", url: "/gfm", icon: UserCheck },
  { title: "Email Templates", url: "/email-templates", icon: Mail },
  { title: "Internal Feedback", url: "/internal-feedback", icon: MessageSquare },
  { title: "Settings", url: "/settings", icon: Settings },
];

// Support & Archive (standalone)
const supportItems = [
  { title: "Training & Help", url: "/training", icon: BookOpen },
  { title: "Feedback Archive", url: "/feedback-archive", icon: Archive },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();

  // State for collapsible groups
  const [statusOpen, setStatusOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Smart expand logic - auto-expand group containing active route
  useEffect(() => {
    const isInStatus = statusItems.some(item => item.url === currentPath);
    const isInReports = reportsItems.some(item => item.url === currentPath);
    const isInAdmin = adminItems.some(item => item.url === currentPath);

    if (isInStatus) setStatusOpen(true);
    if (isInReports) setReportsOpen(true);
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
      className={`border-r border-sidebar-border bg-sidebar-background ${isMobile ? "mobile-safe-area" : ""}`}
    >
      <SidebarContent className={`pt-4 ${isMobile ? "mobile-scroll" : ""}`}>
        {/* Dashboard - Standalone */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="py-3 px-4">
                  <NavLink to={dashboardItem.url} end className={getNavCls}>
                    <dashboardItem.icon className="mr-3 h-5 w-5" />
                    {state !== "collapsed" && <span className="text-base">{dashboardItem.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="h-4" />

        {/* Status - Collapsible Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={statusOpen} onOpenChange={setStatusOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-xl py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/80 p-2 rounded-lg shadow-sm">
                        <LayoutGrid className="h-5 w-5 text-sidebar-foreground" />
                      </div>
                      {state !== "collapsed" && (
                        <span className="font-bold text-base text-sidebar-foreground">Status</span>
                      )}
                    </div>
                    {state !== "collapsed" && (
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${statusOpen ? "" : "-rotate-90"}`} />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-6 mt-1 space-y-1">
                    {statusItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className="py-3 px-4">
                          <NavLink to={item.url} end className={getNavCls}>
                            <item.icon className="mr-3 h-5 w-5" />
                            {state !== "collapsed" && <span className="text-base">{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="h-4" />

        {/* Reports - Collapsible Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={reportsOpen} onOpenChange={setReportsOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-xl py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/80 p-2 rounded-lg shadow-sm">
                        <FileText className="h-5 w-5 text-sidebar-foreground" />
                      </div>
                      {state !== "collapsed" && (
                        <span className="font-bold text-base text-sidebar-foreground">Reports</span>
                      )}
                    </div>
                    {state !== "collapsed" && (
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${reportsOpen ? "" : "-rotate-90"}`} />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-6 mt-1 space-y-1">
                    {reportsItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className="py-3 px-4">
                          <NavLink to={item.url} end className={getNavCls}>
                            <item.icon className="mr-3 h-5 w-5" />
                            {state !== "collapsed" && <span className="text-base">{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
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
                  <SidebarMenuButton className="w-full justify-between bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-xl py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/80 p-2 rounded-lg shadow-sm">
                        <Settings className="h-5 w-5 text-sidebar-foreground" />
                      </div>
                      {state !== "collapsed" && (
                        <span className="font-bold text-base text-sidebar-foreground">Administration</span>
                      )}
                    </div>
                    {state !== "collapsed" && (
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${adminOpen ? "" : "-rotate-90"}`} />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-6 mt-1 space-y-1">
                    {adminItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className="py-3 px-4">
                          <NavLink to={item.url} end className={getNavCls}>
                            <item.icon className="mr-3 h-5 w-5" />
                            {state !== "collapsed" && <span className="text-base">{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="h-4" />

        {/* Support & Archive - Standalone Items */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="py-3 px-4">
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-3 h-5 w-5" />
                      {state !== "collapsed" && <span className="text-base">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
