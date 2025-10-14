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

interface CreditCardIssueEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  storeAddress: string;
  guestFeedbackManager?: string;
}

export const CreditCardIssueEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  storeAddress,
  guestFeedbackManager = 'Karine',
}: CreditCardIssueEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for reporting the credit card issue</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thank You for Letting Us Know</Heading>
        
        <Text style={text}>
          Thank you for sharing your experience.
        </Text>
        
        <Text style={text}>
          My name is {guestFeedbackManager}, and I'm the Guest Feedback Manager for Jimmy John's at {storeAddress}.
        </Text>

        <Text style={text}>
          Thank you for letting us know about the credit card issue you encountered. Payment problems are incredibly frustrating, and I apologize for the inconvenience. We'll be sure to address this with our payment processor and our team right away to prevent this from happening again.
        </Text>

        <Text style={text}>
          If you experienced any charges or issues that need to be resolved, please reply to this email with details, and I'll personally ensure it gets handled.
        </Text>

        <Text style={text}>
          Thank you for your patience, and we hope to see you again soon.
        </Text>

        <Hr style={hr} />
        
        <Text style={footer}>
          Best regards,<br />
          {guestFeedbackManager}<br />
          Guest Feedback Manager<br />
          <Link href="mailto:guestfeedback@atlaswe.com" style={link}>
            guestfeedback@atlaswe.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default CreditCardIssueEmail

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

const infoText = {
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
