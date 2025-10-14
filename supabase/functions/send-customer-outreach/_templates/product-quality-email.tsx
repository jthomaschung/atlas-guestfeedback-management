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
          Dear {customerName || 'Valued Customer'},
        </Text>
        
        <Text style={text}>
          Thank you for sending in feedback. All our products are sliced, baked, and prepped fresh daily to avoid situations like yours as much as possible.
        </Text>

        <Text style={text}>
          This time we fell short of the product quality we strive for at Jimmy John's. I will address this with our team, so this does not happen again.
        </Text>

        <Section style={rewardBox}>
          <Text style={rewardTitle}>Let Us Make It Right</Text>
          <Text style={rewardText}>
            If you have Rewards, I can add a <strong>free original sandwich</strong> to your account. I just need you to confirm the number associated with your loyalty account.
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
