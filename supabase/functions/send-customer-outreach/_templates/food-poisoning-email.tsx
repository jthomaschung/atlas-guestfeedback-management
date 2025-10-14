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

interface FoodPoisoningEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  managerName: string;
  managerPosition: string;
  marketOrRegion: string;
}

export const FoodPoisoningEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  managerName,
  managerPosition,
  marketOrRegion,
}: FoodPoisoningEmailProps) => (
  <Html>
    <Head />
    <Preview>We take food safety very seriously</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thank You for Reaching Out</Heading>
        
        <Text style={text}>
          Dear {customerName || 'Valued Customer'},
        </Text>
        
        <Text style={text}>
          Thank you for reaching out. I'm {managerName}, the {managerPosition} for {marketOrRegion}.
        </Text>

        <Section style={urgentBox}>
          <Text style={urgentTitle}>We Take This Very Seriously</Text>
          <Text style={urgentText}>
            We take feedback regarding possible food poisoning very seriously. I'd like to reach out and learn more about your experience so we can do additional research on our side.
          </Text>
        </Section>

        <Text style={text}>
          Please provide a good number to reach you at, and I will contact you as soon as possible to discuss this matter further.
        </Text>

        <Text style={text}>
          Your health and safety are our top priorities, and we want to ensure we address this properly.
        </Text>

        <Hr style={hr} />
        
        <Text style={footer}>
          With urgent attention,<br />
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

export default FoodPoisoningEmail

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

const urgentBox = {
  backgroundColor: '#fef2f2',
  border: '2px solid #dc2626',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const urgentTitle = {
  color: '#991b1b',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const urgentText = {
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
