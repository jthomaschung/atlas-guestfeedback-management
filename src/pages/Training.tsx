import { useState } from "react";
import { BookOpen, Search, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NotificationCard } from "@/components/training/NotificationCard";
import { WorkflowDiagram } from "@/components/training/WorkflowDiagram";
import { QuickReference } from "@/components/training/QuickReference";
import { FAQSection } from "@/components/training/FAQSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUserPermissions } from "@/hooks/useUserPermissions";

export default function Training() {
  const [searchQuery, setSearchQuery] = useState("");
  const { permissions } = useUserPermissions();
  const isDirector = permissions?.role === "Director" || permissions?.role === "VP" || permissions?.role === "CEO";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Training & Help Center</h1>
          </div>
          <p className="text-muted-foreground">
            Complete guide to using the Guest Feedback Portal
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          Print Guide
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search training content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="portal">Using Portal</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
          <TabsTrigger value="quick-ref">Quick Ref</TabsTrigger>
        </TabsList>

        {/* Getting Started Tab */}
        <TabsContent value="getting-started" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Welcome to the Guest Feedback Portal</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                The Guest Feedback Portal is your centralized hub for managing customer feedback, tracking performance, and ensuring exceptional guest experiences across all ATLAS locations.
              </p>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Your Role & Access</h3>
                {permissions?.role && (
                  <Badge variant="secondary" className="text-sm">
                    Current Role: {permissions.role}
                  </Badge>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  {isDirector 
                    ? "As a Director or Executive, you have access to regional oversight, executive approval workflows, and advanced analytics."
                    : "As a Manager, you can view and manage feedback for your assigned stores, respond to customers, and track team performance."}
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="first-login">
                  <AccordionTrigger>First Time Login Guide</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Access the portal through your email invitation link</li>
                      <li>Review your assigned stores/regions in the Settings page</li>
                      <li>Familiarize yourself with the Dashboard layout</li>
                      <li>Check your Slack DM channel for notification setup</li>
                      <li>Review pending feedback items requiring your attention</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="navigation">
                  <AccordionTrigger>Understanding the Navigation</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong className="text-primary">Accuracy:</strong> View store performance metrics and accuracy scores
                      </div>
                      <div>
                        <strong className="text-primary">Red Carpet Leaders:</strong> Leaderboard showing top-performing stores and managers
                      </div>
                      <div>
                        <strong className="text-primary">Summary:</strong> High-level overview of feedback metrics and trends
                      </div>
                      <div>
                        <strong className="text-primary">Dashboard:</strong> Detailed feedback management interface
                      </div>
                      <div>
                        <strong className="text-primary">Feedback Reporting:</strong> Advanced analytics and custom reports
                      </div>
                      {isDirector && (
                        <div>
                          <strong className="text-primary">Executive Oversight:</strong> Critical feedback approval and escalation management
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </Card>
        </TabsContent>

        {/* Using Portal Tab */}
        <TabsContent value="portal" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Managing Customer Feedback</h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="viewing">
                <AccordionTrigger>Viewing & Filtering Feedback</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm">The Dashboard provides multiple ways to filter and view feedback:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>By Store:</strong> Select specific store numbers from the filter dropdown</li>
                    <li><strong>By Date Range:</strong> Filter feedback by submission date</li>
                    <li><strong>By Priority:</strong> Low, Medium, High, Critical</li>
                    <li><strong>By Status:</strong> Pending, In Progress, Resolved, Escalated</li>
                    <li><strong>By Category:</strong> Praise, Product Quality, Service, Cleanliness, etc.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="priorities">
                <AccordionTrigger>Understanding Priority Levels</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="destructive">Critical</Badge>
                      <div className="text-sm">
                        <p className="font-medium">Auto-escalated to executives</p>
                        <p className="text-muted-foreground">Food safety, health violations, severe service failures</p>
                        <p className="text-muted-foreground">SLA: 48 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="destructive" className="bg-orange-500">High</Badge>
                      <div className="text-sm">
                        <p className="font-medium">Requires immediate attention</p>
                        <p className="text-muted-foreground">Wrong orders, missing items, rude staff</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="bg-yellow-500 text-black">Medium</Badge>
                      <div className="text-sm">
                        <p className="font-medium">Standard response timeline</p>
                        <p className="text-muted-foreground">Product quality concerns, slow service</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline">Low</Badge>
                      <div className="text-sm">
                        <p className="font-medium">Minor issues or suggestions</p>
                        <p className="text-muted-foreground">Suggestions, minor complaints</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="default" className="bg-green-600">Praise</Badge>
                      <div className="text-sm">
                        <p className="font-medium">Positive feedback</p>
                        <p className="text-muted-foreground">Compliments, excellent service recognition</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="responding">
                <AccordionTrigger>Responding to Customers</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm">Steps to send customer outreach:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Open the feedback item from your Dashboard</li>
                    <li>Click "Send Customer Outreach" button</li>
                    <li>Select appropriate email template based on complaint category</li>
                    <li>Personalize the message (templates are pre-populated)</li>
                    <li>Review and send - customer will receive email within minutes</li>
                    <li>Track customer response in the "Email Conversation" view</li>
                  </ol>
                  <p className="text-sm text-muted-foreground mt-2">
                    💡 Tip: Response within 2 days of feedback improves your feedback score!
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="assignments">
                <AccordionTrigger>Assigning Feedback & Using @Mentions</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm">Collaborate with your team:</p>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><strong>Assign to Team Member:</strong> Use the "Assignee" dropdown to delegate feedback</li>
                    <li><strong>@Mention in Notes:</strong> Type @ followed by a colleague's name to tag them in a note</li>
                    <li><strong>Notifications:</strong> Tagged users receive instant Slack DM notifications</li>
                    <li><strong>Tracking:</strong> View all notes and assignments in the feedback history</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="escalation">
                <AccordionTrigger>When to Escalate</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm">Escalate feedback to executives when:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Food safety or health concerns are reported</li>
                    <li>Customer threatens legal action or social media exposure</li>
                    <li>Issue requires compensation beyond your approval limit</li>
                    <li>Multiple similar complaints from one store (pattern)</li>
                    <li>SLA deadline is approaching and issue isn't resolved</li>
                  </ul>
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Critical priority feedback auto-escalates to CEO, VP, Director, and DM for approval
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Workflow Diagrams */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Workflow Diagrams</h3>
            <div className="space-y-6">
              <WorkflowDiagram type="feedback-handling" />
              <WorkflowDiagram type="escalation" />
              <WorkflowDiagram type="customer-outreach" />
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Notification System Guide</h2>
            <p className="text-muted-foreground mb-6">
              All notifications are delivered via Slack Direct Messages (DMs) to ensure you never miss critical feedback.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  Managers (DMs) Receive:
                  <Badge variant="secondary">7 Notification Types</Badge>
                </h3>
                <div className="grid gap-4">
                  <NotificationCard
                    type="new-feedback"
                    role="manager"
                    title="New Feedback Alert"
                    description="Instant notification when new feedback is submitted for your assigned stores"
                    example={{
                      storeName: "Store #1234",
                      category: "Slow service",
                      priority: "Medium",
                      customerName: "John Doe"
                    }}
                  />
                  <NotificationCard
                    type="tagged"
                    role="manager"
                    title="Tagged in Note"
                    description="Notification when a colleague @mentions you in a feedback note"
                    example={{
                      taggerName: "Sarah Johnson",
                      caseNumber: "FB-2024-001",
                      note: "Please review this customer's loyalty account"
                    }}
                  />
                  <NotificationCard
                    type="sla-warning"
                    role="manager"
                    title="SLA Deadline Warning"
                    description="Alert sent 12 hours before SLA deadline expires"
                    example={{
                      caseNumber: "FB-2024-002",
                      hoursRemaining: 12,
                      priority: "High"
                    }}
                  />
                  <NotificationCard
                    type="sla-exceeded"
                    role="manager"
                    title="SLA Deadline Exceeded"
                    description="Critical alert when SLA deadline has passed"
                    example={{
                      caseNumber: "FB-2024-003",
                      hoursOverdue: 6
                    }}
                  />
                  <NotificationCard
                    type="customer-response"
                    role="manager"
                    title="Customer Response Received"
                    description="Notification when customer replies to your outreach email"
                    example={{
                      customerName: "Jane Smith",
                      sentiment: "Positive",
                      caseNumber: "FB-2024-004"
                    }}
                  />
                  <NotificationCard
                    type="store-alert"
                    role="manager"
                    title="Store Performance Alert"
                    description="Warning when store receives 3+ critical feedback items in one day"
                    example={{
                      storeNumber: "1234",
                      criticalCount: 4,
                      date: "today"
                    }}
                  />
                  <NotificationCard
                    type="weekly-summary"
                    role="manager"
                    title="Weekly Performance Summary"
                    description="Sent every Monday at 8 AM with previous week's metrics"
                    example={{
                      totalFeedback: 45,
                      avgResponseTime: "18 hours",
                      topCategory: "Praise (12)"
                    }}
                  />
                </div>
              </div>

              {isDirector && (
                <div>
                  <Separator className="my-6" />
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    Directors Receive (Additional):
                    <Badge variant="secondary">10 Notification Types</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Directors receive all Manager notifications PLUS regional oversight alerts:
                  </p>
                  <div className="grid gap-4">
                    <NotificationCard
                      type="regional-feedback"
                      role="director"
                      title="New Regional Feedback"
                      description="All new feedback across your assigned market/region"
                      example={{
                        market: "Southeast",
                        totalToday: 8,
                        criticalCount: 1
                      }}
                    />
                    <NotificationCard
                      type="critical-escalation"
                      role="director"
                      title="Critical Feedback Auto-Escalation"
                      description="Immediate alert for Critical priority feedback requiring executive approval"
                      example={{
                        caseNumber: "FB-2024-CRIT-001",
                        category: "Food poisoning claim",
                        requiresApproval: true
                      }}
                    />
                    <NotificationCard
                      type="daily-summary"
                      role="director"
                      title="Daily Regional Summary"
                      description="Daily overview of previous day's feedback metrics for your region"
                      example={{
                        date: "Yesterday",
                        totalFeedback: 67,
                        resolved: 52,
                        pending: 15
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Best Practices Tab */}
        <TabsContent value="best-practices" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="response-time">
                <AccordionTrigger>Response Time Excellence</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Aim to respond to all feedback within 24 hours</li>
                    <li>Critical feedback requires same-day response</li>
                    <li>Responding within 2 days improves your store's feedback score</li>
                    <li>Set aside dedicated time daily to review new feedback</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tone">
                <AccordionTrigger>Communication Tone & Language</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Always remain professional, empathetic, and solution-focused</li>
                    <li>Acknowledge the customer's experience before explaining</li>
                    <li>Avoid defensive language or making excuses</li>
                    <li>Use templates as a starting point, but personalize each response</li>
                    <li>End with a clear next step or invitation to return</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="documentation">
                <AccordionTrigger>Documentation Standards</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Add detailed notes for every feedback action taken</li>
                    <li>Document customer calls/conversations in the notes section</li>
                    <li>Include resolution details for future reference</li>
                    <li>Tag relevant team members using @mentions</li>
                    <li>Update resolution status promptly when issues are resolved</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="patterns">
                <AccordionTrigger>Identifying & Preventing Patterns</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Use Feedback Reporting to spot recurring issues</li>
                    <li>Review category trends weekly to identify training needs</li>
                    <li>Escalate systemic issues to regional leadership</li>
                    <li>Share positive feedback with your team for reinforcement</li>
                    <li>Address negative patterns with coaching and retraining</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="score">
                <AccordionTrigger>Improving Your Feedback Score</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm">Your feedback score is calculated based on:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Praise:</strong> +5 points per praise feedback</li>
                    <li><strong>Low Priority:</strong> -1 point</li>
                    <li><strong>Medium Priority:</strong> -2 points</li>
                    <li><strong>High Priority:</strong> -3 points</li>
                    <li><strong>Critical:</strong> -5 points</li>
                    <li><strong>Quick Response Bonus:</strong> Negative scores are halved if you respond within 2 days</li>
                    <li><strong>Positive Customer Response:</strong> +3 points if customer replies positively</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    💡 Strategy: Respond quickly and seek positive resolutions to maximize your score!
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          <FAQSection />
        </TabsContent>

        {/* Quick Reference Tab */}
        <TabsContent value="quick-ref">
          <QuickReference />
        </TabsContent>
      </Tabs>
    </div>
  );
}
