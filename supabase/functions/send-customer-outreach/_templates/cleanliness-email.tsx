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

interface CleanlinessEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  storeAddress: string;
  managerName: string;
}

export const CleanlinessEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  storeAddress,
  managerName,
}: CleanlinessEmailProps) => (
  <Html>
    <Head />
    <Preview>We apologize for the cleanliness issue</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>We're Sorry About the Cleanliness</Heading>
        
        <Text style={text}>
          Thank you for sharing your experience.
        </Text>
        
        <Text style={text}>
          My name is {managerName}, and I'm the Manager of the Jimmy John's at {storeAddress} that you visited.
        </Text>

        <Text style={text}>
          We pride ourselves on being Hospital Clean®—cleanliness is one of our core values, and an unclean store is absolutely unacceptable. I sincerely apologize for failing to meet this standard during your visit.
        </Text>

        <Text style={text}>
          I'll be working with my team immediately to address this issue and ensure we exceed our cleanliness standards moving forward. I'd also like to make it up to you by adding a credit to your account for a free original sandwich. This credit is store-specific, so please call in your order or visit us in-store to redeem it.
        </Text>

        <Text style={text}>
          If you have any additional questions or concerns, please reply to this email—I'd be happy to discuss this further. I hope we can earn back your trust and see you again soon.
        </Text>

        <Hr style={hr} />
        
        <Text style={footer}>
          Best regards,<br />
          {managerName}<br />
          Store Manager<br />
          <Link href="mailto:guestfeedback@atlaswe.com" style={link}>
            guestfeedback@atlaswe.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default CleanlinessEmail

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
