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

interface PraiseEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  feedbackText?: string;
  storeAddress: string;
  guestFeedbackManager?: string;
}

export const PraiseEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  feedbackText,
  storeAddress,
  guestFeedbackManager = 'Karine',
}: PraiseEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for your kind words!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thank You for Your Kind Words!</Heading>
        
        <Text style={text}>
          Dear {customerName || 'Valued Customer'},
        </Text>
        
        <Text style={text}>
          Thank you for sharing your experience. My name is {guestFeedbackManager}, and I am the Guest Feedback Manager of the Jimmy John's at {storeAddress} that you gave the praise for.
        </Text>

        <Text style={text}>
          Thanks for giving the team a shout out! I'll make sure the kind words are shared with the entire team!
        </Text>

        {feedbackText && (
          <Section style={praiseBox}>
            <Text style={praiseText}>"{feedbackText}"</Text>
          </Section>
        )}

        <Text style={text}>
          We look forward to seeing you again!
        </Text>

        <Hr style={hr} />
        
        <Text style={footer}>
          With sincere gratitude,<br />
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

export default PraiseEmail

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
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
}

const praiseBox = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #0ea5e9',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const praiseText = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '12px 0',
  fontStyle: 'italic',
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
