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

interface SandwichWrongEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  storeAddress: string;
  managerName: string;
  whatWeMissed?: string;
}

export const SandwichWrongEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  storeAddress,
  managerName,
  whatWeMissed = 'did not prepare your sandwich correctly',
}: SandwichWrongEmailProps) => (
  <Html>
    <Head />
    <Preview>We apologize for making your sandwich incorrectly</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>We're Sorry We Got Your Order Wrong</Heading>
        
        <Text style={text}>
          Hi {customerName || 'Valued Customer'},
        </Text>
        
        <Text style={text}>
          My name is {managerName}, and I help manage the Jimmy John's located at {storeAddress}.
        </Text>

        <Text style={text}>
          I'm truly sorry that we {whatWeMissed}. Serving Freaky Fast® sandwiches is only meaningful if your sandwich is made perfectly every single time! I completely understand your frustration, and I want to make it right.
        </Text>

        <Text style={text}>
          I'll add a credit to your account for a free original sandwich on your next visit. This credit is store-specific, so please call in your order or visit us in-store to redeem it.
        </Text>

        <Text style={text}>
          If you have any other questions or concerns, please don't hesitate to reply to this email. I hope we'll see you again soon and can show you the Jimmy John's experience you deserve.
        </Text>

        <Hr style={hr} />
        
        <Text style={footer}>
          Best regards,<br />
          {managerName}<br />
          Jimmy John's - {storeAddress}<br />
          <Link href="mailto:guestfeedback@atlaswe.com" style={link}>
            guestfeedback@atlaswe.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SandwichWrongEmail

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
