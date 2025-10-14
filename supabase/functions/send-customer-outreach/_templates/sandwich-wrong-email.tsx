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
          My name is {managerName} and I help manage the local Jimmy John's located on {storeAddress}.
        </Text>

        <Text style={text}>
          I am sorry the team {whatWeMissed}. Serving fast sandwiches is only great if your sandwich is made perfect every time! I understand your frustration and I want to make up for our mistake with a free sandwich at your next visit.
        </Text>

        <Section style={rewardBox}>
          <Text style={rewardTitle}>Your Free Sandwich is Ready</Text>
          <Text style={rewardText}>
            I'll add a credit to your account at the store for a <strong>free original sandwich</strong>. The credit is store-specific, so you will want to call in your order or visit us in-store to redeem.
          </Text>
        </Section>

        <Text style={text}>
          If you have any additional questions or concerns, feel free to reply to this email and I would be happy to chat more.
        </Text>

        <Text style={text}>
          I hope we see you again soon.
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
