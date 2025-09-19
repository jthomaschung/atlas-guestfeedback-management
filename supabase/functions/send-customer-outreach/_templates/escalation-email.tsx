import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface EscalationEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  feedbackText?: string;
  storeNumber: string;
  category: string;
  escalationReason?: string;
  managerContact?: string;
}

export const EscalationEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  feedbackText,
  storeNumber,
  category,
  escalationReason,
  managerContact,
}: EscalationEmailProps) => (
  <Html>
    <Head />
    <Preview>Important: Your feedback has been escalated to management</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your Feedback Has Been Escalated</Heading>
        
        <Text style={text}>
          Dear {customerName || 'Valued Customer'},
        </Text>
        
        <Text style={text}>
          Thank you for bringing your concerns to our attention. Due to the serious nature of your feedback, we have escalated your case to our management team for immediate review and action.
        </Text>

        <Section style={urgentBox}>
          <Text style={urgentTitle}>⚠️ Priority Case Information:</Text>
          <Text style={infoItem}><strong>Case Number:</strong> {caseNumber}</Text>
          <Text style={infoItem}><strong>Store Number:</strong> {storeNumber}</Text>
          <Text style={infoItem}><strong>Date:</strong> {new Date(feedbackDate).toLocaleDateString()}</Text>
          <Text style={infoItem}><strong>Category:</strong> {category}</Text>
          <Text style={infoItem}><strong>Priority Level:</strong> High Priority - Management Review</Text>
          {feedbackText && (
            <Text style={infoItem}><strong>Your Concerns:</strong> {feedbackText}</Text>
          )}
        </Section>

        {escalationReason && (
          <Section style={reasonBox}>
            <Text style={infoTitle}>Escalation Reason:</Text>
            <Text style={text}>{escalationReason}</Text>
          </Section>
        )}

        <Text style={text}>
          <strong>What happens next:</strong>
        </Text>
        <Text style={text}>
          • A member of our management team will personally review your case within 2 business hours<br />
          • We will conduct a thorough investigation of the situation<br />
          • You will receive a follow-up communication within 24 hours with our findings and action plan<br />
          • We are committed to resolving this matter to your satisfaction
        </Text>

        {managerContact && (
          <Section style={contactBox}>
            <Text style={infoTitle}>Direct Management Contact:</Text>
            <Text style={text}>{managerContact}</Text>
          </Section>
        )}

        <Text style={text}>
          We sincerely apologize for any inconvenience you experienced and appreciate your patience as we work to make this right. Your feedback is invaluable in helping us maintain our high standards of service.
        </Text>

        <Hr style={hr} />
        
        <Text style={footer}>
          Sincerely,<br />
          Management Team<br />
          <Link href="mailto:guestfeedback@atlaswe.com" style={link}>
            guestfeedback@atlaswe.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EscalationEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#dc2626',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
}

const urgentBox = {
  backgroundColor: '#fee2e2',
  border: '2px solid #dc2626',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const urgentTitle = {
  color: '#dc2626',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const reasonBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '5px',
  padding: '20px',
  margin: '20px 0',
}

const contactBox = {
  backgroundColor: '#e8f5e8',
  border: '1px solid #4caf50',
  borderRadius: '5px',
  padding: '20px',
  margin: '20px 0',
}

const infoTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const infoItem = {
  color: '#555',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}

const hr = {
  borderColor: '#e1e5e9',
  margin: '20px 0',
}

const link = {
  color: '#2754C5',
  textDecoration: 'underline',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
}