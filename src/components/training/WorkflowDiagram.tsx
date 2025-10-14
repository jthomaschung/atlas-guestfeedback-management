interface WorkflowDiagramProps {
  type: "feedback-handling" | "escalation" | "customer-outreach" | "sla-management";
}

export function WorkflowDiagram({ type }: WorkflowDiagramProps) {
  const diagrams = {
    "feedback-handling": `
graph TD
    A[New Feedback Received] --> B{Priority Level?}
    B -->|Critical| C[Auto-Escalate to Executives]
    B -->|High/Medium/Low| D[Notify Assigned Manager]
    C --> E[Executive Review & Approval]
    D --> F[Manager Reviews Feedback]
    F --> G{Action Needed?}
    G -->|Customer Outreach| H[Send Personalized Email]
    G -->|Internal Action| I[Add Notes & Assign]
    G -->|No Action| J[Mark as Reviewed]
    H --> K[Track Customer Response]
    I --> L[Team Member Resolves]
    E --> M[Execute Approved Resolution]
    K --> N[Update Status to Resolved]
    L --> N
    M --> N
    J --> N
`,
    "escalation": `
graph TD
    A[Manager Identifies Issue] --> B{Escalation Criteria?}
    B -->|Food Safety| C[Mark as Critical]
    B -->|Legal Threat| C
    B -->|Multiple Complaints| C
    B -->|High Compensation| C
    B -->|SLA Approaching| D[Add Escalation Note]
    C --> E[Auto-Notify: CEO, VP, Director, DM]
    D --> F[Notify Regional Director]
    E --> G[Executive Reviews in 24h]
    F --> H[Director Provides Guidance]
    G --> I{Approved?}
    I -->|Yes| J[Execute Resolution Plan]
    I -->|No| K[Request Additional Info]
    H --> L[Manager Implements Solution]
    K --> G
    J --> M[Close Escalation]
    L --> M
`,
    "customer-outreach": `
graph TD
    A[Open Feedback Item] --> B[Click Send Customer Outreach]
    B --> C{Customer Email Available?}
    C -->|No| D[Skip Outreach / Add Note]
    C -->|Yes| E[Select Email Template]
    E --> F{Template Type}
    F -->|Acknowledgment| G[Thank you message]
    F -->|Resolution| H[Explain fix + apology]
    F -->|Escalation| I[Executive review message]
    G --> J[Personalize Message]
    H --> J
    I --> J
    J --> K[Send Email]
    K --> L[Log in Outreach History]
    L --> M{Customer Responds?}
    M -->|Yes| N[Notification Sent to Manager]
    M -->|No| O[Monitor for 7 days]
    N --> P[View Conversation Thread]
    O --> Q{Response Received?}
    Q -->|Yes| N
    Q -->|No| R[Mark Outreach Complete]
    P --> S[Continue Conversation or Close]
`,
    "sla-management": `
graph TD
    A[Feedback Created] --> B{Priority Level}
    B -->|Critical| C[Set SLA: 48 hours]
    B -->|High| D[Set SLA: TBD]
    B -->|Medium| E[Set SLA: TBD]
    B -->|Low| F[Set SLA: TBD]
    C --> G[Start SLA Timer]
    D --> G
    E --> G
    F --> G
    G --> H{12 Hours Before Deadline}
    H -->|Yes| I[Send Warning to Manager]
    H -->|No| J[Continue Monitoring]
    I --> K{Resolved Before Deadline?}
    J --> K
    K -->|Yes| L[Stop Timer - Success]
    K -->|No| M[SLA Deadline Reached]
    M --> N[Send Exceeded Alert]
    N --> O[Log SLA Violation]
    O --> P[Escalate to Director]
    P --> Q[Director Reviews & Resolves]
    L --> R[Update Metrics]
    Q --> R
`,
  };

  const titles = {
    "feedback-handling": "Standard Feedback Handling Workflow",
    "escalation": "Escalation Workflow",
    "customer-outreach": "Customer Outreach Workflow",
    "sla-management": "SLA Management Process",
  };

  return (
    <div className="space-y-3">
      <h4 className="text-md font-semibold">{titles[type]}</h4>
      <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
        <div className="min-w-[600px]">
          <pre className="text-xs text-muted-foreground whitespace-pre">
{`Mermaid diagram visualization:
(In production, this would render as an interactive flowchart)

${diagrams[type]}
`}
          </pre>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Note: This is a text representation. The production version will display as an interactive diagram.
          </p>
        </div>
      </div>
    </div>
  );
}
