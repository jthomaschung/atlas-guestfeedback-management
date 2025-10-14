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

interface ProductQualityEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  storeAddress: string;
  guestFeedbackManager?: string;
}

export const ProductQualityEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  storeAddress,
  guestFeedbackManager = 'Karine',
}: ProductQualityEmailProps) => (
  <Html>
    <Head />
    <Preview>We apologize for the product quality issue</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>We're Sorry About the Product Quality</Heading>
        
        <Text style={text}>
          Thank you for sending in your feedback.
        </Text>
        
        <Text style={text}>
          All of our products are sliced, baked, and prepped fresh daily to avoid situations like yours. This time, we fell short of the product quality we strive for at Jimmy John's, and I sincerely apologize.
        </Text>

        <Text style={text}>
          I'll address this with our team immediately to ensure it doesn't happen again. If you have a Freaky Fast Rewards® account, I'd be happy to add a free original sandwich to your account. Just confirm the phone number associated with your loyalty account.
        </Text>

        <Text style={text}>
          If you have any additional questions or concerns, please reply to this email—I'd be happy to help make this right. We hope to see you again soon.
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

export default ProductQualityEmail

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
