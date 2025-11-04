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

interface OutOfProductBreadEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  storeAddress: string;
  managerName: string;
  managerPosition: string;
}

export const OutOfProductBreadEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  storeAddress,
  managerName,
  managerPosition,
}: OutOfProductBreadEmailProps) => (
  <Html>
    <Head />
    <Preview>We apologize for being out of bread</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>We're Sorry We Ran Out of Bread</Heading>
        
        <Text style={text}>
          Thank you for sharing your experience.
        </Text>
        
        <Text style={text}>
          My name is {managerName}, and I'm the {managerPosition} at the Jimmy John's located at {storeAddress} that you attempted to order from.
        </Text>

        <Text style={text}>
          Perfect Bread® is our #1 rule at Jimmy John's, and not having any available is completely unacceptable. I would like to personally apologize for this failure. This should never happen, and I'm taking immediate steps to address it with our team.
        </Text>

        <Text style={text}>
          I'll add a credit to your account for a free original sandwich. We will use your phone number to add the credit and this credit is only applicable at the store where your original purchase was made.
        </Text>

        <Text style={text}>
          If you have any additional questions or concerns, please reply to this email—I'd be happy to discuss this further. I genuinely hope we can earn another chance to serve you.
        </Text>

        <Hr style={hr} />
        
        <Text style={footer}>
          Best regards,<br />
          {managerName}<br />
          {managerPosition}<br />
          <Link href="mailto:guestfeedback@atlaswe.com" style={link}>
            guestfeedback@atlaswe.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default OutOfProductBreadEmail

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
