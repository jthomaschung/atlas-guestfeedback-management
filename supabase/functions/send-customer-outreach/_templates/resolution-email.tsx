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

interface ResolutionEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  feedbackText?: string;
  storeNumber: string;
  category: string;
  resolutionNotes?: string;
  actionTaken?: string;
}

export const ResolutionEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  feedbackText,
  storeNumber,
  category,
  resolutionNotes,
  actionTaken,
}: ResolutionEmailProps) => (
  <Html>
    <Head />
    <Preview>Update on your feedback - We've taken action</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Update on Your Feedback</Heading>
        
        <Text style={text}>
          Dear {customerName || 'Valued Customer'},
        </Text>
        
        <Text style={text}>
          Thank you for bringing your concerns to our attention. We want to update you on the actions we've taken to address your feedback.
        </Text>

        <Section style={infoBox}>
          <Text style={infoTitle}>Case Information:</Text>
          <Text style={infoItem}><strong>Case Number:</strong> {caseNumber}</Text>
          <Text style={infoItem}><strong>Store Number:</strong> {storeNumber}</Text>
          <Text style={infoItem}><strong>Original Feedback Date:</strong> {new Date(feedbackDate).toLocaleDateString()}</Text>
          <Text style={infoItem}><strong>Category:</strong> {category}</Text>
          {feedbackText && (
            <Text style={infoItem}><strong>Your Original Message:</strong> {feedbackText}</Text>
          )}
        </Section>

        {actionTaken && (
          <Section style={actionBox}>
            <Text style={infoTitle}>Action Taken:</Text>
            <Text style={text}>{actionTaken}</Text>
          </Section>
        )}

        {resolutionNotes && (
          <Section style={resolutionBox}>
            <Text style={infoTitle}>Resolution Details:</Text>
            <Text style={text}>{resolutionNotes}</Text>
          </Section>
        )}

        <Text style={text}>
          We value your feedback and appreciate you giving us the opportunity to make things right. Your input helps us improve our service for all customers.
        </Text>

        <Text style={text}>
          If you have any questions about this resolution or would like to discuss this further, please don't hesitate to contact us.
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

export default ResolutionEmail

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

const actionBox = {
  backgroundColor: '#e8f5e8',
  border: '1px solid #4caf50',
  borderRadius: '5px',
  padding: '20px',
  margin: '20px 0',
}

const resolutionBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
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