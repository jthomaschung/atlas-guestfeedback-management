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

interface MissingItemEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  storeAddress: string;
  storeManager: string;
}

export const MissingItemEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  storeAddress,
  storeManager,
}: MissingItemEmailProps) => (
  <Html>
    <Head />
    <Preview>We apologize for the missing item in your order</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>We're Sorry About Your Missing Item</Heading>
        
        <Text style={text}>
          Thank you for taking the time to complete our survey and share your experience.
        </Text>
        
        <Text style={text}>
          My name is {storeManager}, and I manage the Jimmy John's at {storeAddress}. I sincerely apologize for missing items from your order. Missing items are unacceptable, and I understand how frustrating that must have been.
        </Text>

        <Text style={text}>
          I'd like to make it up to you by adding a credit to your account for a free original sandwich. We will use your phone number to add the credit and this credit is only applicable at the store where your original purchase was made.
        </Text>

        <Text style={text}>
          If you have any additional questions or concerns, feel free to reply to this email—I'd be happy to help. I hope we can regain your trust and see you again soon.
        </Text>

        <Hr style={hr} />
        
        <Text style={footer}>
          Best regards,<br />
          {storeManager}<br />
          Store Manager<br />
          <Link href="mailto:guestfeedback@atlaswe.com" style={link}>
            guestfeedback@atlaswe.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MissingItemEmail

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
