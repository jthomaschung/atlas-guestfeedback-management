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

interface AcknowledgmentEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  feedbackText?: string;
  storeNumber: string;
  category: string;
  priority: string;
}

export const AcknowledgmentEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  feedbackText,
  storeNumber,
  category,
  priority,
}: AcknowledgmentEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for your feedback - We've received your message</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thank You for Your Feedback</Heading>
        
        <Text style={text}>
          Dear {customerName || 'Valued Customer'},
        </Text>
        
        <Text style={text}>
          Thank you for taking the time to share your feedback with us. We have received your message and want to assure you that we take all customer feedback seriously.
        </Text>

        <Section style={infoBox}>
          <Text style={infoTitle}>Feedback Details:</Text>
          <Text style={infoItem}><strong>Case Number:</strong> {caseNumber}</Text>
          <Text style={infoItem}><strong>Store Number:</strong> {storeNumber}</Text>
          <Text style={infoItem}><strong>Date:</strong> {new Date(feedbackDate).toLocaleDateString()}</Text>
          <Text style={infoItem}><strong>Category:</strong> {category}</Text>
          {feedbackText && (
            <Text style={infoItem}><strong>Your Message:</strong> {feedbackText}</Text>
          )}
        </Section>

        <Text style={text}>
          {priority === 'Critical' || priority === 'High' 
            ? 'Your feedback has been marked as high priority and will be reviewed by our management team within 24 hours.'
            : 'We will review your feedback and respond appropriately based on the nature of your concerns.'
          }
        </Text>

        <Text style={text}>
          If you have any immediate concerns or questions, please don't hesitate to contact us directly.
        </Text>

        <Hr style={hr} />
        
        <Text style={footer}>
          Best regards,<br />
          Customer Service Team<br />
          <Link href="mailto:guestfeedback@atlaswe.com" style={link}>
            guestfeedback@atlaswe.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default AcknowledgmentEmail

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
  color: '#333',
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

const infoBox = {
  backgroundColor: '#f6f9fc',
  border: '1px solid #e1e5e9',
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