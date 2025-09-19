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

interface PraiseResponseEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  feedbackText?: string;
  storeNumber: string;
  storeTeam?: string;
}

export const PraiseResponseEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  feedbackText,
  storeNumber,
  storeTeam,
}: PraiseResponseEmailProps) => (
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
          Thank you so much for taking the time to share your positive experience with us! Your kind words truly brighten our day and motivate our team to continue providing excellent service.
        </Text>

        <Section style={praiseBox}>
          <Text style={infoTitle}>Your Feedback:</Text>
          <Text style={infoItem}><strong>Case Number:</strong> {caseNumber}</Text>
          <Text style={infoItem}><strong>Store Number:</strong> {storeNumber}</Text>
          <Text style={infoItem}><strong>Date:</strong> {new Date(feedbackDate).toLocaleDateString()}</Text>
          {feedbackText && (
            <Text style={praiseText}><strong>Your Message:</strong> "{feedbackText}"</Text>
          )}
        </Section>

        <Text style={text}>
          We've shared your wonderful feedback with {storeTeam || 'our store team'}, and they're thrilled to hear about your positive experience. Feedback like yours helps us recognize our team members who are going above and beyond to serve our customers.
        </Text>

        <Text style={text}>
          We're so grateful for customers like you who take the time to share their experiences. Your feedback helps us continue to improve and maintain the high standards we strive for.
        </Text>

        <Text style={text}>
          We look forward to serving you again soon!
        </Text>

        <Hr style={hr} />
        
        <Text style={footer}>
          With sincere gratitude,<br />
          Customer Service Team<br />
          <Link href="mailto:guestfeedback@atlaswe.com" style={link}>
            guestfeedback@atlaswe.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default PraiseResponseEmail

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

const infoTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const infoItem = {
  color: '#555',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
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