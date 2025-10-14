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

interface SlowServiceEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  storeAddress: string;
  guestFeedbackManager?: string;
}

export const SlowServiceEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  storeAddress,
  guestFeedbackManager = 'Karine',
}: SlowServiceEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for your feedback - We apologize for the slow delivery</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>We're Sorry About Your Experience</Heading>
        
        <Text style={text}>
          Thank you for taking the time to complete our survey and share your experience. My name is {guestFeedbackManager}, and I'm the Guest Feedback Manager for Jimmy John's located at {storeAddress}.
        </Text>

        <Text style={text}>
          I sincerely apologize that your order wasn't delivered as quickly as it should have been. At Jimmy John's, we're known for Freaky Fast® service, and we fell short of that promise to you. Whether it was traffic, a rush of orders, or something else, there's no excuse for not meeting your expectations.
        </Text>

        <Text style={text}>
          I'd love to make it right. If you have a Freaky Fast Rewards® account, I'll add a free original sandwich to your account right away. Just confirm the phone number associated with your rewards account, and it's yours.
        </Text>

        <Text style={text}>
          If you have any additional questions or concerns, feel free to reply to this email—I'd be happy to chat more. We hope to earn back your trust and see you again soon.
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

export default SlowServiceEmail

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
