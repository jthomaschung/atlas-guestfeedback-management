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

interface BreadQualityEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  storeAddress: string;
  guestFeedbackManager?: string;
}

export const BreadQualityEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  storeAddress,
  guestFeedbackManager = 'Karine',
}: BreadQualityEmailProps) => (
  <Html>
    <Head />
    <Preview>We apologize for the bread quality issue</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>We're Sorry About the Bread Quality</Heading>
        
        <Text style={text}>
          Thank you for submitting our survey and sharing your experience.
        </Text>
        
        <Text style={text}>
          My name is {guestFeedbackManager}, and I'm the Guest Feedback Manager for Jimmy John's at {storeAddress}. Perfect Bread® is one of the cornerstones of our brand—we bake it fresh throughout the day to ensure every bite is perfect. I understand that stale or hard bread can quickly ruin your meal, and I'm truly sorry we didn't meet that standard.
        </Text>

        <Text style={text}>
          I hope you'll give us another opportunity to earn back your business. If you have a Freaky Fast Rewards® account, I'd be happy to add a free original sandwich to your account. Just confirm the phone number associated with your loyalty account.
        </Text>

        <Text style={text}>
          If you have any additional questions or concerns, please reply to this email—I'd love to chat more. We hope to see you again soon.
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

export default BreadQualityEmail

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

const rewardBox = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #0ea5e9',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const rewardTitle = {
  color: '#0369a1',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const rewardText = {
  color: '#333',
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
