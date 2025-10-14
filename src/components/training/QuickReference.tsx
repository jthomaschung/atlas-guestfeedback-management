import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function QuickReference() {
  return (
    <Card className="p-6 print:shadow-none">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Guest Feedback Portal - Quick Reference</h2>
          <p className="text-sm text-muted-foreground">Essential Information at a Glance</p>
        </div>

        <Separator />

        {/* Priority Levels */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Priority Levels & SLA</h3>
          <div className="grid gap-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Critical</Badge>
                <span className="text-sm">Food safety, health violations, severe failures</span>
              </div>
              <span className="text-sm font-medium">48 hours</span>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="bg-orange-500">High</Badge>
                <span className="text-sm">Wrong orders, missing items, rude staff</span>
              </div>
              <span className="text-sm font-medium">TBD</span>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-500 text-black">Medium</Badge>
                <span className="text-sm">Product quality, slow service</span>
              </div>
              <span className="text-sm font-medium">TBD</span>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Low</Badge>
                <span className="text-sm">Minor complaints, suggestions</span>
              </div>
              <span className="text-sm font-medium">TBD</span>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-600">Praise</Badge>
                <span className="text-sm">Compliments, excellent service</span>
              </div>
              <span className="text-sm font-medium">No SLA</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Notification Types (via Slack DM)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">All Managers Receive:</h4>
              <ul className="space-y-1 text-sm list-disc list-inside">
                <li>New feedback in assigned stores</li>
                <li>@Mention tags in notes</li>
                <li>SLA warnings (12h before deadline)</li>
                <li>SLA exceeded alerts</li>
                <li>Customer email responses</li>
                <li>Store performance alerts (3+ critical/day)</li>
                <li>Weekly summary (Mondays 8 AM)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Directors Also Receive:</h4>
              <ul className="space-y-1 text-sm list-disc list-inside">
                <li>All regional feedback notifications</li>
                <li>Critical auto-escalations</li>
                <li>Regional SLA warnings</li>
                <li>Regional store alerts</li>
                <li>Daily regional summary</li>
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* Feedback Score */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Feedback Score Calculation</h3>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
              <span>Praise feedback</span>
              <span className="font-medium text-green-600">+5 points</span>
            </div>
            <div className="flex justify-between p-2 bg-red-50 dark:bg-red-950 rounded">
              <span>Critical feedback</span>
              <span className="font-medium text-red-600">-5 points</span>
            </div>
            <div className="flex justify-between p-2 bg-orange-50 dark:bg-orange-950 rounded">
              <span>High priority</span>
              <span className="font-medium text-orange-600">-3 points</span>
            </div>
            <div className="flex justify-between p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
              <span>Medium priority</span>
              <span className="font-medium text-yellow-600">-2 points</span>
            </div>
            <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded">
              <span>Low priority</span>
              <span className="font-medium text-blue-600">-1 point</span>
            </div>
            <div className="flex justify-between p-2 bg-primary/10 rounded">
              <span>Respond within 2 days (bonus)</span>
              <span className="font-medium text-primary">Negative score ÷ 2</span>
            </div>
            <div className="flex justify-between p-2 bg-primary/10 rounded">
              <span>Positive customer response</span>
              <span className="font-medium text-primary">+3 points</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Common Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Common Actions Quick Guide</h3>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between p-2 border-l-4 border-primary pl-3">
              <span className="font-medium">View new feedback</span>
              <span className="text-muted-foreground">Dashboard → Filter by date/status</span>
            </div>
            <div className="flex justify-between p-2 border-l-4 border-primary pl-3">
              <span className="font-medium">Send customer email</span>
              <span className="text-muted-foreground">Open feedback → Send Customer Outreach</span>
            </div>
            <div className="flex justify-between p-2 border-l-4 border-primary pl-3">
              <span className="font-medium">Tag a colleague</span>
              <span className="text-muted-foreground">Add note → Type @name</span>
            </div>
            <div className="flex justify-between p-2 border-l-4 border-primary pl-3">
              <span className="font-medium">Assign feedback</span>
              <span className="text-muted-foreground">Open feedback → Select assignee</span>
            </div>
            <div className="flex justify-between p-2 border-l-4 border-primary pl-3">
              <span className="font-medium">Mark resolved</span>
              <span className="text-muted-foreground">Update status → Add resolution notes</span>
            </div>
            <div className="flex justify-between p-2 border-l-4 border-primary pl-3">
              <span className="font-medium">Escalate to executives</span>
              <span className="text-muted-foreground">Change priority to Critical</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* When to Escalate */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-destructive">⚠️ When to Escalate</h3>
          <ul className="space-y-1 text-sm list-disc list-inside">
            <li>Food safety or health concerns reported</li>
            <li>Customer threatens legal action or social media</li>
            <li>Compensation beyond your approval limit needed</li>
            <li>Pattern of similar complaints from one store</li>
            <li>SLA deadline approaching with no resolution</li>
          </ul>
        </div>

        <Separator />

        {/* Support Contacts */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Support & Contacts</h3>
          <div className="grid gap-2 text-sm">
            <div>
              <span className="font-medium">Portal Support:</span>
              <span className="ml-2 text-muted-foreground">Use the feedback button in the bottom right</span>
            </div>
            <div>
              <span className="font-medium">Training Questions:</span>
              <span className="ml-2 text-muted-foreground">Contact your Regional Director</span>
            </div>
            <div>
              <span className="font-medium">Technical Issues:</span>
              <span className="ml-2 text-muted-foreground">Submit internal feedback ticket</span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground print:block hidden mt-6">
          ATLAS Guest Feedback Portal - Quick Reference Guide
        </div>
      </div>
    </Card>
  );
}
