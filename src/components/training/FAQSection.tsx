import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FAQSection() {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="faq-1">
          <AccordionTrigger>Why didn't I receive a Slack notification for new feedback?</AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Check the following:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Verify you're assigned to that store/region in Settings</li>
              <li>Ensure Slack DM notifications are enabled in your Slack preferences</li>
              <li>Check if the feedback was manually created (not from a customer)</li>
              <li>Contact support if notifications continue to fail</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq-2">
          <AccordionTrigger>How do I respond to a customer who doesn't have an email?</AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>If customer email is not available:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use the phone number to call the customer directly</li>
              <li>Document the phone conversation in the notes section</li>
              <li>Mark the feedback as "Customer Called" in the details</li>
              <li>Update resolution status after the call</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq-3">
          <AccordionTrigger>What happens if I miss an SLA deadline?</AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>When SLA deadlines are exceeded:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You'll receive an immediate "SLA Exceeded" Slack notification</li>
              <li>The violation is logged in the escalation log</li>
              <li>Your Regional Director is automatically notified</li>
              <li>It may impact your store's performance metrics</li>
              <li>Focus on resolving the issue immediately and documenting the delay reason</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq-4">
          <AccordionTrigger>Can I edit or delete a feedback entry?</AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Feedback integrity rules:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Admins can edit feedback details (correcting errors only)</li>
              <li>Managers cannot delete feedback entries</li>
              <li>You can add notes and update status/priority</li>
              <li>Contact your Regional Director for corrections needed</li>
              <li>All changes are logged in the feedback history</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq-5">
          <AccordionTrigger>How do I see all feedback for my region (Directors)?</AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Regional viewing options:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Dashboard: Filter by your assigned market/region</li>
              <li>Feedback Reporting: Select market filter for analytics</li>
              <li>Executive Oversight: View critical items across all regions</li>
              <li>Daily Summary: Check email/Slack for regional performance</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq-6">
          <AccordionTrigger>What's the difference between Priority and Status?</AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Key differences:</p>
            <div className="space-y-2">
              <div>
                <strong>Priority:</strong> Urgency level of the complaint
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Set automatically based on category and keywords</li>
                  <li>Can be updated by managers if incorrectly categorized</li>
                  <li>Determines SLA deadline and escalation rules</li>
                </ul>
              </div>
              <div>
                <strong>Status:</strong> Current state of resolution
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Pending, In Progress, Resolved, Escalated</li>
                  <li>Updated as you work through the feedback</li>
                  <li>Tracks workflow progress</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq-7">
          <AccordionTrigger>How do I know if a customer responded to my email?</AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Tracking customer responses:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You'll receive an instant Slack DM notification</li>
              <li>The feedback item will show "Customer Responded" badge</li>
              <li>Click "View Email Conversation" to see full thread</li>
              <li>Response sentiment (Positive/Neutral/Negative) is auto-detected</li>
              <li>Positive responses add +3 points to your feedback score</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq-8">
          <AccordionTrigger>What email templates are available?</AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Pre-built templates by category:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Acknowledgment:</strong> Initial response thanking customer</li>
              <li><strong>Product Quality:</strong> Food quality issues (bread, ingredients)</li>
              <li><strong>Missing Item:</strong> Incomplete orders</li>
              <li><strong>Sandwich Wrong:</strong> Incorrect sandwich made</li>
              <li><strong>Slow Service:</strong> Wait time complaints</li>
              <li><strong>Cleanliness:</strong> Store hygiene concerns</li>
              <li><strong>Food Poisoning:</strong> Health-related claims (Critical)</li>
              <li><strong>Loyalty Issues:</strong> Rewards program problems</li>
              <li><strong>Credit Card Issue:</strong> Payment processing</li>
              <li><strong>Praise Response:</strong> Thank you for positive feedback</li>
              <li><strong>Resolution:</strong> Final resolution confirmation</li>
              <li><strong>Escalation:</strong> Executive review notification</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq-9">
          <AccordionTrigger>Who can see the feedback I'm working on?</AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Access levels:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Store Managers:</strong> See feedback for their assigned stores only</li>
              <li><strong>District Managers:</strong> See all feedback in their assigned stores</li>
              <li><strong>Regional Directors:</strong> See all feedback in their market/region</li>
              <li><strong>VPs & CEO:</strong> See all feedback company-wide</li>
              <li><strong>Admins:</strong> Full access to all feedback and settings</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq-10">
          <AccordionTrigger>How often should I check the portal?</AccordionTrigger>
          <AccordionContent className="text-sm space-y-2">
            <p>Recommended check-in schedule:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Daily:</strong> Review new feedback (morning and afternoon)</li>
              <li><strong>When notified:</strong> Respond to Slack alerts immediately for Critical items</li>
              <li><strong>Weekly:</strong> Review your store's performance trends and Red Carpet Leaders ranking</li>
              <li><strong>Monthly:</strong> Analyze category trends to identify training needs</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              💡 Pro tip: Set aside 15 minutes each morning and afternoon to check the portal
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq-11">
          <AccordionTrigger>Can customers see my internal notes?</AccordionTrigger>
          <AccordionContent className="text-sm">
            <p><strong>No.</strong> All notes, tags, and internal communications are private and only visible to ATLAS team members with portal access. Customers only see:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Email responses you send them</li>
              <li>No access to internal notes or discussions</li>
              <li>No visibility into priority levels or assignments</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
