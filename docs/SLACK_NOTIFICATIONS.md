# Slack Notification System

## Overview
Comprehensive Slack notification system for customer feedback management with real-time alerts for all stakeholders.

## Implemented Features

### ✅ Core Requirements

1. **New Feedback Notifications**
   - **CEO & VP**: Receive Slack DM for ANY feedback company-wide
   - **Directors**: Receive Slack DM for feedback in their assigned markets/regions
   - **District Managers (DMs)**: Receive Slack DM for feedback in their districts
   - **Trigger**: Automatic via database trigger when new feedback is inserted

2. **Tagged Notifications**
   - Anyone tagged with `@Name` in feedback notes/resolution notes receives instant Slack DM
   - Includes context about the case and who tagged them
   - Works for all roles

### ✅ Additional Implemented Features

3. **SLA Deadline Warnings**
   - **12-hour warning**: Sent to assigned user, their manager, and directors
   - **Exceeded deadline**: URGENT alert when SLA deadline is missed
   - **Trigger**: Automatic when feedback is updated with SLA approaching or exceeded

4. **Critical Feedback Auto-Escalation**
   - Sent to: CEO, VP, relevant Director, and relevant DM
   - **Trigger**: When feedback is auto-escalated to Critical priority
   - Includes 48-hour SLA deadline information

5. **Customer Response Received**
   - Sent to: Assigned user and their manager
   - Includes sentiment analysis (positive/negative/neutral)
   - **Trigger**: When customer replies to outreach email

6. **Store Performance Alerts**
   - Sent to: DM and Director for the market
   - **Trigger**: When a store receives 3+ critical feedback items in a single day
   - Immediate action required notification

7. **Weekly Performance Summary**
   - Sent to: All Directors and DMs every Monday at 8 AM
   - Includes:
     - Total feedback for the week
     - Critical issues count
     - Praise received
     - Resolution rate
     - Top complaint categories
     - Store-by-store breakdown
   - **Trigger**: Scheduled weekly via test button (cron setup commented in migration)

## Edge Functions

### 1. `send-feedback-slack-notification`
**Location**: `supabase/functions/send-feedback-slack-notification/index.ts`

Handles all real-time Slack notifications for feedback events.

**Notification Types**:
- `new_feedback` - New feedback received
- `tagged` - User tagged in notes
- `sla_warning` - 12 hours before deadline
- `sla_exceeded` - SLA deadline missed
- `critical_escalation` - Critical auto-escalation
- `customer_response` - Customer replied
- `store_alert` - 3+ critical in one day

**Request Format**:
```typescript
{
  type: 'new_feedback' | 'tagged' | 'sla_warning' | 'sla_exceeded' | 'critical_escalation' | 'customer_response' | 'store_alert',
  feedbackId: string,
  taggedDisplayName?: string, // For 'tagged' type
  note?: string, // For 'tagged' type
  hoursRemaining?: number // For 'sla_warning' type
}
```

### 2. `send-weekly-performance-summary`
**Location**: `supabase/functions/send-weekly-performance-summary/index.ts`

Sends weekly performance summaries to all Directors and DMs.

**Schedule**: Every Monday at 8 AM (via test button currently)

**Features**:
- Auto-calculates last week's date range
- Filters feedback by each manager's assigned markets
- Generates comprehensive metrics
- Sends personalized Slack DMs

## Database Triggers

### 1. `on_feedback_created`
**Table**: `customer_feedback`
**Event**: `AFTER INSERT`
**Function**: `notify_feedback_stakeholders()`

Automatically sends new feedback notifications to:
- CEO & VP (all feedback)
- Directors (their markets only)
- DMs (their districts only)

### 2. `on_feedback_updated`
**Table**: `customer_feedback`
**Event**: `AFTER UPDATE`
**Function**: `check_feedback_alerts()`

Monitors for:
- Critical escalations
- SLA warnings (12 hours before)
- SLA violations (deadline exceeded)
- Store alerts (3+ critical in a day)

### 3. `on_customer_response_received`
**Table**: `customer_outreach_log`
**Event**: `AFTER INSERT` (when direction = 'inbound')
**Function**: `notify_customer_response()`

Sends notification when customer responds to outreach email.

## Frontend Integration

### Updated Hooks

**`useFeedbackNotifications.tsx`**:
- Added `sendTaggedSlackNotification()` method
- Automatically called when @mentions are detected in notes
- Sends Slack DM to tagged user

### Test UI

**`TestDailySummary.tsx`** component on Executive Oversight page:
- **Test Daily Summary**: Sends yesterday's feedback summary
- **Test Weekly Summary**: Sends last week's performance summary

## Slack Message Formats

### New Feedback
```
🚨 New Customer Feedback
━━━━━━━━━━━━━━━━━━━━━━
📍 Store: #2500 (AZ1)
⭐ Priority: Critical
📝 Category: Slow service
📧 Channel: Email

Customer: John Doe
Email: john@example.com

📄 Feedback:
"Service was extremely slow..."

[View Details →]
```

### Tagged
```
🏷️ You've Been Tagged
━━━━━━━━━━━━━━━━━━━━━━
in Customer Feedback Case #CF-123456

📍 Store: #2500 (AZ1)
⭐ Priority: High

💬 Note from James Chung:
"@Santa Tall please follow up..."

[View Feedback →]
```

### SLA Warning
```
⏰ SLA Deadline Approaching
Case CF-123456 deadline in 8 hours

📍 Store: #2500 (AZ1)
⭐ Priority: Critical
📝 Category: Food Quality
⏱️ Deadline: 10/15/2025, 3:00 PM

[Resolve Now →]
```

### Critical Escalation
```
🚨 CRITICAL FEEDBACK AUTO-ESCALATED
Case CF-123456 has been automatically escalated

📍 Store: #2500 (AZ1)
📝 Category: Food poisoning
⏱️ SLA Deadline: 10/15/2025, 3:00 PM

Customer Feedback:
"Got food poisoning from..."

[Review Immediately →]
```

### Store Alert
```
🚨 STORE PERFORMANCE ALERT
Store #2500 (AZ1) has received 3 critical feedback items today

Immediate Action Required:
• Review all critical cases
• Contact store manager
• Identify root causes
• Implement corrective actions

[Review All Cases →]
```

## Configuration

### Required Secrets
- `SLACK_BOT_TOKEN` - Already configured in Supabase

### Supabase Extensions
- `pg_net` - Enabled for async HTTP calls from triggers

### Edge Function Settings
All notification functions are configured with `verify_jwt = false` in `supabase/config.toml`

## Testing

Use the test buttons on the Executive Oversight page:
1. **Test Daily Summary** - Sends Slack DMs to CEO/VP
2. **Test Weekly Summary** - Sends Slack DMs to all Directors/DMs

## Future Enhancements (Not Implemented)

### Training Completion Notifications
Could add notifications when:
- R2R training deadlines approach
- Employee completes required training
- Store falls behind on training completion

### Approval Workflow Enhancements
- Reminder notifications for pending approvals
- Escalation if approvals not received within timeframe

## Monitoring

### Check Logs
- Edge function logs: [View Logs](https://supabase.com/dashboard/project/frmjdxziwwlfpgevszga/functions/send-feedback-slack-notification/logs)
- Database logs for trigger execution

### Notification Log
All notifications are tracked in:
- Edge function console logs
- User Slack DMs
- Can add `slack_notifications_log` table if needed

## Security Notes

1. **Service Role Key**: Triggers use `current_setting('app.settings.service_role_key')` which is securely set by Supabase
2. **Slack User IDs**: Cached in `profiles.slack_user_id` to minimize API calls
3. **Email Lookup**: Falls back to Slack API if user ID not cached
4. **RLS**: All database operations respect existing RLS policies

## Troubleshooting

### No Slack DM Received
1. Check edge function logs for errors
2. Verify user's email matches their Slack workspace email
3. Ensure `SLACK_BOT_TOKEN` has `users:read.email` and `chat:write` permissions
4. Check if Slack user ID was successfully looked up and cached

### Trigger Not Firing
1. Check database logs for trigger execution
2. Verify `pg_net` extension is enabled
3. Check if service role key is properly set
4. Review edge function response in logs

### Wrong Recipients
1. Verify user hierarchy and permissions in database
2. Check `get_executive_hierarchy` RPC function
3. Ensure markets are properly assigned in `user_permissions`

## Links
- [Daily Summary Edge Function](https://supabase.com/dashboard/project/frmjdxziwwlfpgevszga/functions/send-daily-summary)
- [Feedback Slack Notifications](https://supabase.com/dashboard/project/frmjdxziwwlfpgevszga/functions/send-feedback-slack-notification)
- [Weekly Summary](https://supabase.com/dashboard/project/frmjdxziwwlfpgevszga/functions/send-weekly-performance-summary)
