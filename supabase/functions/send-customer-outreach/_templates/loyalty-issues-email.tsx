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

interface LoyaltyIssuesEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  storeAddress: string;
  guestFeedbackManager?: string;
}

export const LoyaltyIssuesEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  storeAddress,
  guestFeedbackManager = 'Karine',
}: LoyaltyIssuesEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for reporting the loyalty program issue</Preview>
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
          Thank you for letting us know about the loyalty program issue you encountered. Our Freaky Fast Rewards® program should make your experience better, not frustrating, and I apologize for the inconvenience.
        </Text>

        <Text style={text}>
          I'll escalate this to our rewards support team and our corporate office to get this resolved for you. If you'd like, please reply with your rewards account information (phone number or email), and I'll personally follow up to ensure the issue is fixed.
        </Text>

        <Text style={text}>
          Thank you for your patience, and we appreciate your loyalty!
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

export default LoyaltyIssuesEmail

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
