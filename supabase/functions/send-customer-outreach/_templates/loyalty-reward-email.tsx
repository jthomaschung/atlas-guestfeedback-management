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

interface LoyaltyRewardEmailProps {
  customerName?: string;
  caseNumber: string;
  feedbackDate: string;
  feedbackText?: string;
  storeNumber: string;
  category: string;
  rewardDetails?: string;
}

export const LoyaltyRewardEmail = ({
  customerName,
  caseNumber,
  feedbackDate,
  feedbackText,
  storeNumber,
  category,
  rewardDetails = '1 Free Regular Sub',
}: LoyaltyRewardEmailProps) => (
  <Html>
    <Head />
    <Preview>We're sorry - Here's a free sub on us!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>We Sincerely Apologize</Heading>
        
        <Text style={text}>
          Dear {customerName || 'Valued Customer'},
        </Text>
        
        <Text style={text}>
          We sincerely apologize for your recent experience at our Store #{storeNumber}. 
          Your feedback is incredibly important to us, and we're truly sorry we didn't meet 
          your expectations.
        </Text>

        <Section style={rewardBox}>
          <Text style={rewardTitle}>🎁 Thank You for Your Feedback</Text>
          <Text style={rewardText}>
            As a token of our appreciation for bringing this to our attention, 
            <strong style={rewardHighlight}> we've added a FREE SUB to your loyalty account!</strong>
          </Text>
          <Text style={rewardDetails}>
            <strong>Reward:</strong> {rewardDetails}
          </Text>
          <Text style={rewardInstructions}>
            To redeem your free sub, simply visit any of our locations and provide your 
            phone number or email address at checkout. Your reward is ready and waiting!
          </Text>
        </Section>

        <Section style={infoBox}>
          <Text style={infoTitle}>Feedback Details:</Text>
          <Text style={infoItem}><strong>Case Number:</strong> {caseNumber}</Text>
          <Text style={infoItem}><strong>Store Number:</strong> {storeNumber}</Text>
          <Text style={infoItem}><strong>Date:</strong> {new Date(feedbackDate).toLocaleDateString()}</Text>
          <Text style={infoItem}><strong>Category:</strong> {category}</Text>
          {feedbackText && (
            <Text style={infoItem}><strong>Your Feedback:</strong> {feedbackText}</Text>
          )}
        </Section>

        <Text style={text}>
          We've shared your feedback with our team, and we're committed to doing better. 
          We hope you'll give us another chance to provide you with the quality experience 
          you deserve.
        </Text>

        <Text style={text}>
          If you have any questions or would like to discuss your experience further, 
          please don't hesitate to reach out to us.
        </Text>

        <Hr style={hr} />
        
        <Text style={footer}>
          With our sincerest apologies,<br />
          Guest Feedback Team<br />
          <Link href="mailto:guestfeedback@atlaswe.com" style={link}>
            guestfeedback@atlaswe.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default LoyaltyRewardEmail

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
  backgroundColor: '#e8f5e9',
  border: '2px solid #4caf50',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const rewardTitle = {
  color: '#2e7d32',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const rewardText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '12px 0',
}

const rewardHighlight = {
  color: '#2e7d32',
  fontSize: '18px',
}

const rewardDetails = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '16px 0',
  padding: '12px',
  backgroundColor: '#fff',
  borderRadius: '4px',
}

const rewardInstructions = {
  color: '#555',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '12px 0',
  fontStyle: 'italic' as const,
}

const infoBox = {
  backgroundColor: '#f6f9fc',
  border: '1px solid #e1e5e9',
  borderRadius: '5px',
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
