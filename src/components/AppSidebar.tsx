import { useState } from "react";
import { LayoutDashboard, BarChart3, Users, Settings, MessageSquare, Archive, UserCheck, TrendingUp, Shield, Target, BookOpen, Mail, ChevronDown, LayoutGrid } from "lucide-react";
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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const guestFeedbackItems = [
  { title: "Accuracy", url: "/accuracy", icon: Target },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Feedback Reporting", url: "/feedback-reporting", icon: TrendingUp },
  { title: "Summary", url: "/summary", icon: BarChart3 },
];

const executiveItems = [
  { title: "Executive Oversight", url: "/executive-oversight", icon: Shield },
];

const supportItems = [
  { title: "Training & Help", url: "/training", icon: BookOpen },
];

const adminItems = [
  { title: "User Management", url: "/user-hierarchy", icon: Users },
  { title: "GFM (Guest Feedback Manager)", url: "/gfm", icon: UserCheck },
  { title: "Email Templates", url: "/email-templates", icon: Mail },
  { title: "Internal Feedback", url: "/internal-feedback", icon: MessageSquare },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();

  // Check if any route in a group is active to auto-expand
  const isGuestFeedbackActive = guestFeedbackItems.some(item => currentPath === item.url);
  const isExecutiveActive = executiveItems.some(item => currentPath === item.url);
  const isSupportActive = supportItems.some(item => currentPath === item.url);
  const isArchiveActive = currentPath === '/feedback-archive';
  const isAdminActive = adminItems.some(item => currentPath === item.url);

  const [guestFeedbackOpen, setGuestFeedbackOpen] = useState(true);
  const [executiveOpen, setExecutiveOpen] = useState(true);
  const [supportOpen, setSupportOpen] = useState(true);
  const [archiveOpen, setArchiveOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  // Hide navigation on portal selection page
  if (currentPath === '/portal-selection') {
    return (
      <Sidebar collapsible="icon" className="border-r border-slate-200 bg-slate-50">
        <SidebarContent className="bg-slate-50">
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="p-4 text-sm text-slate-600">
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
      ? `${base} bg-white text-slate-800 font-medium shadow-sm border border-slate-200` 
      : `${base} text-slate-600 hover:bg-slate-50 hover:text-slate-900`;
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className={`border-r border-slate-200 bg-slate-50 ${isMobile ? "mobile-safe-area" : ""}`}
    >
      <SidebarContent className={`pt-4 bg-slate-50 ${isMobile ? "mobile-scroll" : ""}`}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              
              {/* Guest Feedback Group */}
              <Collapsible open={guestFeedbackOpen || isGuestFeedbackActive} onOpenChange={setGuestFeedbackOpen} className="transition-all duration-300">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between bg-white hover:bg-slate-100 rounded-xl py-3 px-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <LayoutGrid className="h-5 w-5 text-slate-700" />
                        </div>
                        {state !== "collapsed" && <span className="font-semibold text-base text-slate-800">Guest Feedback</span>}
                      </div>
                      {state !== "collapsed" && (
                        <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${guestFeedbackOpen || isGuestFeedbackActive ? "" : "-rotate-90"}`} />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                
                {state !== "collapsed" && (
                  <CollapsibleContent>
                    <SidebarMenu className="ml-6 mt-1 space-y-1">
                      {guestFeedbackItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild className={`py-3 px-4 ${isMobile ? "mobile-touch-target" : ""}`}>
                            <NavLink to={item.url} end className={getNavCls}>
                              <item.icon className="mr-3 h-5 w-5" />
                              <span className="text-base">{item.title}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>

              {/* Spacer */}
              <div className="h-4" />

              {/* Executive Group */}
              <Collapsible open={executiveOpen || isExecutiveActive} onOpenChange={setExecutiveOpen} className="transition-all duration-300">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between bg-white hover:bg-slate-100 rounded-xl py-3 px-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <Shield className="h-5 w-5 text-slate-700" />
                        </div>
                        {state !== "collapsed" && <span className="font-semibold text-base text-slate-800">Executive</span>}
                      </div>
                      {state !== "collapsed" && (
                        <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${executiveOpen || isExecutiveActive ? "" : "-rotate-90"}`} />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                
                {state !== "collapsed" && (
                  <CollapsibleContent>
                    <SidebarMenu className="ml-6 mt-1 space-y-1">
                      {executiveItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild className={`py-3 px-4 ${isMobile ? "mobile-touch-target" : ""}`}>
                            <NavLink to={item.url} end className={getNavCls}>
                              <item.icon className="mr-3 h-5 w-5" />
                              <span className="text-base">{item.title}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>

              {/* Spacer */}
              <div className="h-4" />

              {/* Support Group */}
              <Collapsible open={supportOpen || isSupportActive} onOpenChange={setSupportOpen} className="transition-all duration-300">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between bg-white hover:bg-slate-100 rounded-xl py-3 px-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <BookOpen className="h-5 w-5 text-slate-700" />
                        </div>
                        {state !== "collapsed" && <span className="font-semibold text-base text-slate-800">Support</span>}
                      </div>
                      {state !== "collapsed" && (
                        <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${supportOpen || isSupportActive ? "" : "-rotate-90"}`} />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                
                {state !== "collapsed" && (
                  <CollapsibleContent>
                    <SidebarMenu className="ml-6 mt-1 space-y-1">
                      {supportItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild className={`py-3 px-4 ${isMobile ? "mobile-touch-target" : ""}`}>
                            <NavLink to={item.url} end className={getNavCls}>
                              <item.icon className="mr-3 h-5 w-5" />
                              <span className="text-base">{item.title}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>

              {/* Spacer */}
              <div className="h-4" />

              {/* Archive Group */}
              <Collapsible open={archiveOpen || isArchiveActive} onOpenChange={setArchiveOpen} className="transition-all duration-300">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between bg-white hover:bg-slate-100 rounded-xl py-3 px-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <Archive className="h-5 w-5 text-slate-700" />
                        </div>
                        {state !== "collapsed" && <span className="font-semibold text-base text-slate-800">Archive</span>}
                      </div>
                      {state !== "collapsed" && (
                        <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${archiveOpen || isArchiveActive ? "" : "-rotate-90"}`} />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                
                {state !== "collapsed" && (
                  <CollapsibleContent>
                    <SidebarMenu className="ml-6 mt-1 space-y-1">
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className={`py-3 px-4 ${isMobile ? "mobile-touch-target" : ""}`}>
                          <NavLink to="/feedback-archive" end className={getNavCls}>
                            <Archive className="mr-3 h-5 w-5" />
                            <span className="text-base">Feedback Archive</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </Collapsible>

              {/* Spacer */}
              <div className="h-4" />

              {/* Administration Group */}
              <Collapsible open={adminOpen || isAdminActive} onOpenChange={setAdminOpen} className="transition-all duration-300">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between bg-white hover:bg-slate-100 rounded-xl py-3 px-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <Settings className="h-5 w-5 text-slate-700" />
                        </div>
                        {state !== "collapsed" && <span className="font-semibold text-base text-slate-800">Administration</span>}
                      </div>
                      {state !== "collapsed" && (
                        <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${adminOpen || isAdminActive ? "" : "-rotate-90"}`} />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                
                {state !== "collapsed" && (
                  <CollapsibleContent>
                    <SidebarMenu className="ml-6 mt-1 space-y-1">
                      {adminItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild className={`py-3 px-4 ${isMobile ? "mobile-touch-target" : ""}`}>
                            <NavLink to={item.url} end className={getNavCls}>
                              <item.icon className="mr-3 h-5 w-5" />
                              <span className="text-base">{item.title}</span>
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