import { useState, useEffect, useRef, useCallback } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { GuestFeedbackNote } from "@/types/guestFeedbackNote";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MentionsTextarea } from "@/components/ui/mentions-textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Star, MapPin, Phone, Mail, MessageSquare, Clock, AlertTriangle, Store, Edit, Save, X, Heart, CheckCircle, ExternalLink, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useFeedbackNotifications } from "@/hooks/useFeedbackNotifications";
import { EmailConversationDialog } from "./EmailConversationDialog";

interface FeedbackDetailsDialogProps {
  feedback: CustomerFeedback | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const statusColors = {
  unopened: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
  responded: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  resolved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  escalated: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  processing: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
};

const priorityColors = {
  Praise: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400',
  Low: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
  High: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
  Critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400',
};

const categoryLabels = {
  'Sandwich Made Wrong': 'Sandwich Made Wrong',
  'Slow Service': 'Slow Service',
  'Rude Service': 'Rude Service',
  'Product Issue': 'Product Issue',
  'Closed Early': 'Closed Early',
  'Praise': 'Praise',
  'Missing Items': 'Missing Items',
  'Credit Card Issue': 'Credit Card Issue',
  'Bread Quality': 'Bread Quality',
  'Out of Product': 'Out of Product',
  'Other': 'Other',
  'Cleanliness': 'Cleanliness',
  'Food Quality': 'Food Quality',
  'Staff Service': 'Staff Service',
  'Delivery Service': 'Delivery Service',
  'Store Appearance': 'Store Appearance',
  'Wait Time': 'Wait Time',
  'Order Accuracy': 'Order Accuracy',
  'Temperature': 'Temperature',
  'Quantity': 'Quantity',
  'Experience': 'Experience',
  'Multiple Issues': 'Multiple Issues',
  'Manager/Supervisor Contact Request': 'Manager/Supervisor Contact Request',
  'Training': 'Training',
  'Appreciation': 'Appreciation'
};

const channelLabels = {
  'Digital Guest Contact': 'Digital Contact',
  'Point of Sale': 'POS',
  'social media': 'Social Media',
  'email': 'Email',
  'phone': 'Phone',
  'survey': 'Survey',
  'website': 'Website'
};

// Helper function to determine assignee based on category, store, and market
const getAssigneeForFeedback = async (storeNumber: string, market: string, category: string): Promise<string> => {
  console.log('🔍 ASSIGNMENT: Looking up assignee for', { storeNumber, market, category });

  try {
    // Get the store manager first
    const { data: storeData } = await supabase
      .from('stores')
      .select('manager')
      .eq('store_number', storeNumber)
      .maybeSingle();

    const storeManager = storeData?.manager;
    console.log('🏪 ASSIGNMENT: Store manager found:', storeManager);

    // Special handling for Praise category - assign to store manager if available
    if (category === 'Praise') {
      if (storeManager && storeManager.trim() !== '') {
        console.log('👏 ASSIGNMENT: Assigning praise to store manager:', storeManager);
        return storeManager;
      }
    }

    // Categories that should go to store managers
    const storeManagerCategories = [
      'Sandwich Made wrong', 'Slow Service', 'Rude Service', 'Missing Item',
      'Cleanliness', 'Food Quality', 'Staff Service', 'Store Appearance',
      'Wait Time', 'Order Accuracy', 'Temperature', 'Quantity', 'Experience',
      'Training', 'Manager/Supervisor Contact Request'
    ];

    if (storeManagerCategories.includes(category)) {
      if (storeManager && storeManager.trim() !== '') {
        console.log('🏪 ASSIGNMENT: Assigning to store manager for category:', category);
        return storeManager;
      }
    }

    // Categories that should go to DMs
    const dmCategories = [
      'Product Issue', 'Closed Early', 'Credit Card Issue', 'Bread Quality',
      'Out of Product', 'Other', 'Multiple Issues', 'Delivery Service'
    ];

    if (dmCategories.includes(category)) {
      console.log('📊 ASSIGNMENT: Looking for DM for category:', category);
      
      // Look up DM for the market - simplified approach
      const { data: dmUsers } = await supabase
        .from('user_permissions')
        .select('user_id')
        .contains('markets', [market]);

      if (dmUsers && dmUsers.length > 0) {
        // Get the profile for the first DM user
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', dmUsers[0].user_id)
          .single();

        if (profileData?.display_name) {
          console.log('📊 ASSIGNMENT: Found DM:', profileData.display_name);
          return profileData.display_name;
        }
      }
    }

    // Fallback to store manager if no specific assignment found
    if (storeManager && storeManager.trim() !== '') {
      console.log('🔄 ASSIGNMENT: Fallback to store manager:', storeManager);
      return storeManager;
    }

  } catch (error) {
    console.error('❌ ASSIGNMENT: Error looking up assignee:', error);
  }

  console.log('⚠️ ASSIGNMENT: No assignment found, defaulting to Unassigned');
  return 'Unassigned';
};

export function FeedbackDetailsDialog({ feedback, isOpen, onClose, onUpdate }: FeedbackDetailsDialogProps) {
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [assignee, setAssignee] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [storeNumber, setStoreNumber] = useState<string>('');
  const [market, setMarket] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [showEmailConversation, setShowEmailConversation] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('acknowledgment');
  const [emailResolutionNotes, setEmailResolutionNotes] = useState("");
  const [emailActionTaken, setEmailActionTaken] = useState("");
  const [customerCalled, setCustomerCalled] = useState<boolean>(false);
  const [isUpdatingCalled, setIsUpdatingCalled] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [emailPlaceholders, setEmailPlaceholders] = useState({
    managerName: '',
    managerPosition: '',
    productName: '',
    storeManager: ''
  });
  const [editableEmailContent, setEditableEmailContent] = useState<string>('');
  
  // New state for immutable notes system
  const [notes, setNotes] = useState<GuestFeedbackNote[]>([]);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [noteTypeToAdd, setNoteTypeToAdd] = useState<'resolution' | 'executive' | 'general'>('resolution');
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { permissions, loading: permissionsLoading } = useUserPermissions();
  const { sendAssignmentNotification, sendTaggedSlackNotification } = useFeedbackNotifications();
  const processedFeedbackId = useRef<string | null>(null);

  const isAdmin = permissions?.role?.toLowerCase() === 'admin' || permissions?.role?.toLowerCase() === 'dm' || permissions?.isAdmin || permissions?.isDirectorOrAbove;

  // Fetch notes when feedback changes
  const fetchNotes = useCallback(async () => {
    if (!feedback?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('guest_feedback_notes')
        .select('*')
        .eq('feedback_id', feedback.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notes:', error);
        return;
      }
      
      setNotes((data || []) as GuestFeedbackNote[]);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }, [feedback?.id]);

  // Extract @mentions from text
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
    const matches = text.matchAll(mentionRegex);
    const mentions: string[] = [];
    for (const match of matches) {
      const displayName = match[1].trim();
      if (displayName) {
        mentions.push(displayName);
      }
    }
    return mentions;
  };

  // Handle saving a new note with confirmation
  const handleConfirmSaveNote = async () => {
    if (!feedback?.id || !user?.id || !newNoteText.trim()) {
      toast({
        title: "Error",
        description: "Note text cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get user display name
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      const displayName = profileData?.display_name || 'Unknown User';
      
      // Extract mentions
      const mentions = extractMentions(newNoteText);

      // Insert the note
      const { data: noteData, error } = await supabase
        .from('guest_feedback_notes')
        .insert({
          feedback_id: feedback.id,
          note_text: newNoteText,
          note_type: noteTypeToAdd,
          created_by_user_id: user.id,
          created_by_name: displayName,
          mentioned_users: mentions.length > 0 ? mentions : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Send @mention notifications
      let mentionCount = 0;
      let failedMentions = 0;
      
      for (const mentionedName of mentions) {
        try {
          await sendTaggedSlackNotification(feedback.id, mentionedName, newNoteText);
          mentionCount++;
          console.log(`✅ Slack notification sent for @${mentionedName}`);
        } catch (notificationError) {
          console.error(`❌ Error sending Slack notification for @${mentionedName}:`, notificationError);
          failedMentions++;
        }
      }

      toast({
        title: "Note Saved",
        description: `Note saved successfully${mentionCount > 0 ? `. ${mentionCount} user(s) tagged and notified.` : '.'}`,
      });

      if (failedMentions > 0) {
        toast({
          variant: "destructive",
          title: "Warning",
          description: `${failedMentions} mention(s) could not be matched to users`,
        });
      }

      // Refresh notes
      await fetchNotes();
      
      // Clear the form
      setNewNoteText('');
      setShowAddNote(false);
      setShowConfirmDialog(false);
      
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shouldShowCMXLink = (feedback: CustomerFeedback): boolean => {
    return (
      feedback.complaint_category === 'Product Issue' &&
      feedback.resolution_notes?.toLowerCase().includes('cmx')
    );
  };

  // Check acknowledgment status - use useCallback to memoize
  const checkAcknowledgmentStatus = useCallback(async () => {
    if (!feedback?.id || !user?.id) {
      console.log('❌ ACK CHECK: Missing data', { feedbackId: feedback?.id, userId: user?.id });
      return;
    }
    
    try {
      console.log('🔍 ACK CHECK: Starting check...', { feedbackId: feedback.id, userId: user.id });
      
      const { data, error } = await supabase
        .from('critical_feedback_approvals')
        .select('*')
        .eq('feedback_id', feedback.id)
        .eq('approver_user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('❌ ACK CHECK: Error', error);
        return;
      }
      
      console.log('✅ ACK CHECK: Result', { hasData: !!data, data });
      setHasAcknowledged(!!data);
    } catch (error) {
      console.error('❌ ACK CHECK: Exception', error);
    }
  }, [feedback?.id, user?.id]);

  // Generate email content based on template
  const generateEmailContent = (template: string) => {
    if (!feedback) return '';
    
    const lines: string[] = [`Dear ${feedback.customer_name || 'Valued Customer'},`, ''];
    
    switch (template) {
      case 'slow_service':
        lines.push(
          "Thank you for taking the time to complete our survey and share your experience. My name is Karine, and I'm the Guest Feedback Manager for Jimmy John's.",
          "",
          "I sincerely apologize that your order wasn't delivered as quickly as it should have been. At Jimmy John's, we're known for Freaky Fast® service, and we fell short of that promise to you. Whether it was traffic, a rush of orders, or something else, there's no excuse for not meeting your expectations.",
          "",
          "I'd love to make it right. If you have a Freaky Fast Rewards® account, I'll add a free original sandwich to your account right away. Just confirm the phone number associated with your rewards account, and it's yours.",
          "",
          "If you have any additional questions or concerns, feel free to reply to this email—I'd be happy to chat more. We hope to earn back your trust and see you again soon."
        );
        break;
      case 'sandwich_wrong':
        lines.push(
          `Hi ${feedback.customer_name || 'Valued Customer'},`,
          "",
          `My name is ${emailPlaceholders.managerName || '[Manager Name]'}, and I help manage the Jimmy John's you recently visited.`,
          "",
          "I'm truly sorry that we did not prepare your sandwich correctly. Serving Freaky Fast® sandwiches is only meaningful if your sandwich is made perfectly every single time! I completely understand your frustration, and I want to make it right.",
          "",
          "I'll add a credit to your account for a free original sandwich on your next visit. This credit is store-specific, so please call in your order or visit us in-store to redeem it.",
          "",
          "If you have any other questions or concerns, please don't hesitate to reply to this email. I hope we'll see you again soon and can show you the Jimmy John's experience you deserve."
        );
        break;
      case 'missing_item':
        lines.push(
          "Thank you for taking the time to complete our survey and share your experience.",
          "",
          `My name is ${emailPlaceholders.managerName || '[Store Manager]'}, and I manage the Jimmy John's that you visited. I sincerely apologize for missing items from your order. Missing items are unacceptable, and I understand how frustrating that must have been.`,
          "",
          "I'd like to make it up to you by adding a credit to your account for a free original sandwich. This credit is store-specific, so you'll want to call in your order or visit us in-store to redeem it.",
          "",
          "If you have any additional questions or concerns, feel free to reply to this email—I'd be happy to help. I hope we can regain your trust and see you again soon."
        );
        break;
      case 'bread_quality':
        lines.push(
          "Thank you for submitting our survey and sharing your experience.",
          "",
          "My name is Karine, and I'm the Guest Feedback Manager for Jimmy John's. Perfect Bread® is one of the cornerstones of our brand—we bake it fresh throughout the day to ensure every bite is perfect. I understand that stale or hard bread can quickly ruin your meal, and I'm truly sorry we didn't meet that standard.",
          "",
          "I hope you'll give us another opportunity to earn back your business. If you have a Freaky Fast Rewards® account, I'd be happy to add a free original sandwich to your account. Just confirm the phone number associated with your loyalty account.",
          "",
          "If you have any additional questions or concerns, please reply to this email—I'd love to chat more. We hope to see you again soon."
        );
        break;
      case 'product_quality':
        lines.push(
          "Thank you for sending in your feedback.",
          "",
          "All of our products are sliced, baked, and prepped fresh daily to avoid situations like yours. This time, we fell short of the product quality we strive for at Jimmy John's, and I sincerely apologize.",
          "",
          "I'll address this with our team immediately to ensure it doesn't happen again. If you have a Freaky Fast Rewards® account, I'd be happy to add a free original sandwich to your account. Just confirm the phone number associated with your loyalty account.",
          "",
          "If you have any additional questions or concerns, please reply to this email—I'd be happy to help make this right. We hope to see you again soon."
        );
        break;
      case 'out_of_bread':
        lines.push(
          "Thank you for sharing your experience.",
          "",
          `My name is ${emailPlaceholders.managerName || '[Name]'}, and I'm the ${emailPlaceholders.managerPosition || '[Position]'} at the Jimmy John's that you attempted to order from.`,
          "",
          "Perfect Bread® is our #1 rule at Jimmy John's, and not having any available is completely unacceptable. I would like to personally apologize for this failure. This should never happen, and I'm taking immediate steps to address it with our team.",
          "",
          "I'll add a credit to your account for a free original sandwich. This credit is store-specific, so please call in your order or visit us in-store to redeem it.",
          "",
          "If you have any additional questions or concerns, please reply to this email—I'd be happy to discuss this further. I genuinely hope we can earn another chance to serve you."
        );
        break;
      case 'out_of_product':
        lines.push(
          "Thank you for sharing your experience.",
          "",
          `My name is ${emailPlaceholders.managerName || '[Name]'}, and I'm the ${emailPlaceholders.managerPosition || '[Position]'} at the Jimmy John's that you attempted to order from.`,
          "",
          `Not having ${emailPlaceholders.productName || '[Product]'} available is unacceptable, and I sincerely apologize for the inconvenience. Our customers should be able to count on us to have what they need, and we let you down.`,
          "",
          "I'll add a credit to your account for a free original sandwich. This credit is store-specific, so please call in your order or visit us in-store to redeem it.",
          "",
          "If you have any additional questions or concerns, please reply to this email—I'm here to help. We hope to see you again soon."
        );
        break;
      case 'closed_early':
        lines.push(
          "Thank you for sharing your experience.",
          "",
          `My name is ${emailPlaceholders.managerName || '[Name]'}, and I'm the ${emailPlaceholders.managerPosition || '[Position]'} at the Jimmy John's that you attempted to visit.`,
          "",
          "Closing early is completely unacceptable and goes against everything we stand for. I sincerely apologize that you made the trip to see us, only to find us closed. This should never have happened, and I'm addressing it with my team immediately.",
          "",
          "I'll add a credit to your account for a free original sandwich to make it right. This credit is store-specific, so please call in your order or visit us in-store to redeem it.",
          "",
          "If you have any additional questions or concerns, please reply to this email. I hope we can earn back your trust and serve you again soon."
        );
        break;
      case 'credit_card':
        lines.push(
          "Thank you for sharing your experience.",
          "",
          "My name is Karine, and I'm the Guest Feedback Manager for Jimmy John's.",
          "",
          "Thank you for letting us know about the credit card issue you encountered. Payment problems are incredibly frustrating, and I apologize for the inconvenience. We'll be sure to address this with our payment processor and our team right away to prevent this from happening again.",
          "",
          "If you experienced any charges or issues that need to be resolved, please reply to this email with details, and I'll personally ensure it gets handled.",
          "",
          "Thank you for your patience, and we hope to see you again soon."
        );
        break;
      case 'cleanliness':
        lines.push(
          "Thank you for sharing your experience.",
          "",
          `My name is ${emailPlaceholders.managerName || '[Name]'}, and I'm the Manager of the Jimmy John's that you visited.`,
          "",
          "We pride ourselves on being Hospital Clean®—cleanliness is one of our core values, and an unclean store is absolutely unacceptable. I sincerely apologize for failing to meet this standard during your visit.",
          "",
          "I'll be working with my team immediately to address this issue and ensure we exceed our cleanliness standards moving forward. I'd also like to make it up to you by adding a credit to your account for a free original sandwich. This credit is store-specific, so please call in your order or visit us in-store to redeem it.",
          "",
          "If you have any additional questions or concerns, please reply to this email—I'd be happy to discuss this further. I hope we can earn back your trust and see you again soon."
        );
        break;
      case 'loyalty_issues':
        lines.push(
          "Thank you for sharing your experience.",
          "",
          "My name is Karine, and I'm the Guest Feedback Manager for Jimmy John's.",
          "",
          "Thank you for letting us know about the loyalty program issue you encountered. Our Freaky Fast Rewards® program should make your experience better, not frustrating, and I apologize for the inconvenience.",
          "",
          "I'll escalate this to our rewards support team and our corporate office to get this resolved for you. If you'd like, please reply with your rewards account information (phone number or email), and I'll personally follow up to ensure the issue is fixed.",
          "",
          "Thank you for your patience, and we appreciate your loyalty!"
        );
        break;
      case 'food_poisoning':
        lines.push(
          "Thank you for reaching out.",
          "",
          `My name is ${emailPlaceholders.managerName || '[Name]'}, and I'm the ${emailPlaceholders.managerPosition || '[Position]'} for ${feedback.market || '[Market/Region]'}. We take any feedback regarding possible food poisoning extremely seriously, and I'm very sorry to hear about your experience.`,
          "",
          "I'd like to speak with you directly to learn more about what happened so we can conduct a thorough investigation on our end. Your health and safety are our top priority, and we need to understand the situation fully to prevent this from happening to anyone else.",
          "",
          "Please provide a good phone number where I can reach you at your earliest convenience. I'll personally follow up to discuss this matter further.",
          "",
          "Thank you for bringing this to our attention."
        );
        break;
      case 'acknowledgment':
        lines.push(
          "Thank you for taking the time to share your feedback with us. We have received your message and want to assure you that we take all customer feedback seriously.",
          "",
          "Feedback Details:",
          `Case Number: ${feedback.case_number}`,
          `Store Number: ${feedback.store_number}`,
          `Date: ${new Date(feedback.feedback_date).toLocaleDateString()}`,
          `Category: ${feedback.complaint_category}`,
          "",
          feedback.priority === 'Critical' || feedback.priority === 'High'
            ? 'Your feedback has been marked as high priority and will be reviewed by our management team within 24 hours.'
            : 'We will review your feedback and respond appropriately based on the nature of your concerns.'
        );
        break;
      case 'praise':
        lines.push(
          "Thank you so much for taking the time to share your positive experience with us! Feedback like yours truly makes our day and motivates our team to continue providing excellent service.",
          "",
          `We've shared your kind words with the team at Store #${feedback.store_number}. They will be thrilled to hear that their hard work made a positive impact on your visit.`,
          "",
          "We look forward to serving you again soon!"
        );
        break;
      case 'resolution':
        lines.push(
          `Thank you for bringing this matter to our attention. I wanted to update you on the resolution of your concern regarding your visit on ${new Date(feedback.feedback_date).toLocaleDateString()}.`,
          ""
        );
        if (emailActionTaken) {
          lines.push("Action Taken:", emailActionTaken, "");
        }
        if (emailResolutionNotes) {
          lines.push("Resolution Details:", emailResolutionNotes, "");
        }
        lines.push(
          "We appreciate your patience and understanding as we worked to address your concerns. If you have any questions about this resolution, please don't hesitate to reach out."
        );
        break;
      case 'escalation':
        lines.push(
          "We wanted to inform you that your feedback has been escalated to our senior management team for immediate attention.",
          "",
          "Escalation Details:",
          `Case Number: ${feedback.case_number}`,
          `Store Number: ${feedback.store_number}`,
          `Priority: ${feedback.priority}`,
          "",
          "A member of our management team will contact you within 24 hours to discuss this matter and work towards a resolution."
        );
        break;
      case 'custom':
        return emailMessage;
      default:
        return emailMessage;
    }
    
    lines.push(
      "",
      "Best regards,",
      "Customer Service Team",
      "guestfeedback@atlaswe.com"
    );
    
    return lines.join('\n');
  };

  // Auto-select template based on feedback category
  useEffect(() => {
    if (feedback?.complaint_category) {
      const category = feedback.complaint_category.toLowerCase();
      
      if (category === 'praise') {
        setSelectedTemplate('praise');
      } else if (category === 'slow service') {
        setSelectedTemplate('slow_service');
      } else if (category === 'sandwich made wrong') {
        setSelectedTemplate('sandwich_wrong');
      } else if (category === 'missing item' || category === 'missing items') {
        setSelectedTemplate('missing_item');
      } else if (category.includes('bread')) {
        setSelectedTemplate('bread_quality');
      } else if (category.includes('product quality') || category.includes('food quality')) {
        setSelectedTemplate('product_quality');
      } else if (category.includes('out of product') && category.includes('bread')) {
        setSelectedTemplate('out_of_bread');
      } else if (category.includes('out of product')) {
        setSelectedTemplate('out_of_product');
      } else if (category.includes('closed early')) {
        setSelectedTemplate('closed_early');
      } else if (category.includes('credit card')) {
        setSelectedTemplate('credit_card');
      } else if (category.includes('cleanliness')) {
        setSelectedTemplate('cleanliness');
      } else if (category.includes('loyalty')) {
        setSelectedTemplate('loyalty_issues');
      } else if (category.includes('food poisoning')) {
        setSelectedTemplate('food_poisoning');
      } else {
        setSelectedTemplate('acknowledgment');
      }
    }
  }, [feedback?.complaint_category]);

  // Update editable email content when template or placeholders change
  useEffect(() => {
    if (feedback) {
      const content = generateEmailContent(selectedTemplate);
      setEditableEmailContent(content);
    }
  }, [selectedTemplate, emailPlaceholders, emailMessage, emailActionTaken, emailResolutionNotes, feedback]);

  // Update local state when feedback changes
  useEffect(() => {
    if (feedback) {
      setStatus(feedback.resolution_status);
      setPriority(feedback.priority);
      setAssignee(feedback.assignee || '');
      setCategory(feedback.complaint_category || '');
      setResolutionNotes(feedback.resolution_notes || '');
      setStoreNumber(feedback.store_number || '');
      setMarket(feedback.market || '');
      setCustomerCalled(feedback.customer_called || false);
      
      // Fetch notes for this feedback
      fetchNotes();
      
      // Set default email message
      setEmailMessage(`Dear ${feedback.customer_name || 'Valued Customer'},

Thank you for taking the time to share your feedback regarding your recent visit to our store #${feedback.store_number}.

We take all customer feedback seriously and are committed to providing excellent service. Your feedback helps us improve our operations and better serve our customers.

${feedback.feedback_text ? `We have reviewed your specific concern: "${feedback.feedback_text}"` : ''}

We would like to follow up with you to ensure your concerns are addressed. Please don't hesitate to contact us if you have any questions or would like to discuss this further.

Thank you for choosing us and giving us the opportunity to serve you better.

Best regards,
Customer Service Team`);
    }
  }, [feedback, fetchNotes]);

  // Check acknowledgment when feedback or user changes
  useEffect(() => {
    console.log('🔄 ACK EFFECT: Triggered', { isOpen, feedbackId: feedback?.id, userId: user?.id, hasAcknowledged });
    if (feedback?.id && user?.id && isOpen) {
      checkAcknowledgmentStatus();
    }
  }, [feedback?.id, user?.id, isOpen, checkAcknowledgmentStatus]);

  // Auto-mark as viewed and change status when dialog opens
  useEffect(() => {
    if (feedback && isOpen && feedback.id !== processedFeedbackId.current) {
      console.log('🔍 FEEDBACK DIALOG: Auto-update check', {
        feedbackId: feedback.id,
        currentStatus: feedback.resolution_status,
        isViewed: feedback.viewed,
        processedId: processedFeedbackId.current
      });

      const shouldUpdate = !feedback.viewed || feedback.resolution_status === 'unopened';
      
      if (shouldUpdate) {
        console.log('🔄 FEEDBACK DIALOG: Performing auto-update');
        
        // Mark this feedback as processed to prevent multiple updates
        processedFeedbackId.current = feedback.id;
        
        const updateFeedback = async () => {
          try {
            const updates: any = {
              viewed: true,
              updated_at: new Date().toISOString(),
            };

            // Only change status if it's currently 'unopened'
            if (feedback.resolution_status === 'unopened') {
              updates.resolution_status = 'opened';
              setStatus('opened');
            }

            const { error } = await supabase
              .from('customer_feedback')
              .update(updates)
              .eq('id', feedback.id);

            if (error) {
              console.error('❌ FEEDBACK DIALOG: Error auto-updating feedback:', error);
            } else {
              console.log('✅ FEEDBACK DIALOG: Auto-update successful');
            }
          } catch (error) {
            console.error('❌ FEEDBACK DIALOG: Exception during auto-update:', error);
          }
        };

        updateFeedback();
      } else {
        console.log('⏭️ FEEDBACK DIALOG: No auto-update needed');
      }
    }
  }, [feedback, isOpen]);

  // Reset processedFeedbackId when dialog closes
  useEffect(() => {
    if (!isOpen) {
      processedFeedbackId.current = null;
    }
  }, [isOpen]);

// Priority mapping based on category (same as ingest-feedback function)
  const getPriorityForCategory = (category: string): string => {
    const normalizedCategory = category.toLowerCase();
    
    const priorityMap: Record<string, string> = {
      'sandwich made wrong': 'High',
      'slow service': 'Medium',
      'rude service': 'Critical',
      'product issue': 'Low',
      'closed early': 'High',
      'praise': 'Praise',
      'missing item': 'High',
      'missing items': 'High',
      'credit card issue': 'Low',
      'bread quality': 'Medium',
      'out of product': 'Critical',
      'other': 'Low',
      'cleanliness': 'Medium',
      'possible food poisoning': 'Critical',
      'food poisoning': 'Critical',
      'loyalty program issues': 'Low',
      'loyalty issues': 'Low',
      'food quality': 'Medium',
      'staff service': 'Medium',
      'delivery service': 'Low',
      'store appearance': 'Medium',
      'wait time': 'Medium',
      'order accuracy': 'High',
      'temperature': 'Medium',
      'quantity': 'Medium',
      'experience': 'Low',
      'multiple issues': 'High',
      'manager/supervisor contact request': 'Medium',
      'training': 'Low',
      'appreciation': 'Praise'
    };
    
    return priorityMap[normalizedCategory] || 'Low';
  };

  // Check if all 4 executive approvals exist for this feedback
  const checkAllApprovalsComplete = async (feedbackId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('critical_feedback_approvals')
        .select('approver_role')
        .eq('feedback_id', feedbackId);
      
      if (error) {
        console.error('Error checking approvals:', error);
        return false;
      }
      
      const roles = new Set(data?.map(a => a.approver_role) || []);
      const hasAllApprovals = roles.has('ceo') && roles.has('vp') && roles.has('director') && roles.has('dm');
      
      console.log('🔍 Approval check:', { feedbackId, roles: Array.from(roles), hasAllApprovals });
      return hasAllApprovals;
    } catch (error) {
      console.error('Error checking approvals:', error);
      return false;
    }
  };

  const handleCategoryChange = async (newCategory: string) => {
    setCategory(newCategory);
    
    // Calculate new priority based on category
    const newPriority = getPriorityForCategory(newCategory);
    const wasCritical = priority === 'Critical';
    const isNowCritical = newPriority === 'Critical';
    
    setPriority(newPriority);
    
    // Auto-assign based on the new category and current store/market
    if (feedback && storeNumber && market) {
      try {
        const newAssignee = await getAssigneeForFeedback(storeNumber, market, newCategory);
        setAssignee(newAssignee);
        
        // Prepare update object
        const updates: any = {
          complaint_category: newCategory,
          priority: newPriority,
          assignee: newAssignee,
          updated_at: new Date().toISOString(),
        };
        
        // If downgrading from Critical to non-Critical
        if (wasCritical && !isNowCritical) {
          console.log('🔽 Downgrading from Critical to', newPriority);
          
          // Check if all 4 approvals exist
          const hasAllApprovals = await checkAllApprovalsComplete(feedback.id);
          
          if (hasAllApprovals) {
            // All approvals exist - auto-resolve
            updates.resolution_status = 'resolved';
            updates.resolution_notes = `Auto-resolved: Category changed from Critical to "${newCategory}" after all executive approvals were obtained.`;
            setStatus('resolved');
            setResolutionNotes(updates.resolution_notes);
            
            console.log('✅ Auto-resolving: All approvals complete and category changed');
            
            toast({
              title: "Feedback Auto-Resolved",
              description: `Category changed to "${newCategory}" with priority "${newPriority}". Since all executive approvals were complete, this feedback has been automatically resolved.`,
            });
          } else {
            // No approvals or incomplete - just downgrade status
            if (status === 'escalated') {
              updates.resolution_status = 'opened';
              setStatus('opened');
            }
            
            // Clear escalation fields
            updates.escalated_at = null;
            updates.escalated_by = null;
            updates.sla_deadline = null;
            updates.auto_escalated = null;
            
            console.log('🔽 Downgrading status from escalated to opened');
            
            toast({
              title: "Priority Downgraded",
              description: `Category changed to "${newCategory}". Priority updated to "${newPriority}" and escalation cleared.`,
            });
          }
        } else if (!wasCritical && isNowCritical) {
          // Upgrading to Critical - escalate
          updates.resolution_status = 'escalated';
          updates.escalated_at = new Date().toISOString();
          updates.escalated_by = user?.email || 'system';
          
          // Calculate SLA deadline (24 hours for Critical)
          const slaDeadline = new Date();
          slaDeadline.setHours(slaDeadline.getHours() + 24);
          updates.sla_deadline = slaDeadline.toISOString();
          
          setStatus('escalated');
          
          console.log('🔺 Upgrading to Critical - auto-escalating');
          
          toast({
            title: "Escalated to Critical",
            description: `Category changed to "${newCategory}". Priority upgraded to Critical and feedback has been escalated.`,
            variant: "destructive",
          });
        } else {
          // Just a normal category change
          toast({
            title: "Category Updated",
            description: `Category changed to "${newCategory}". Priority: "${newPriority}". Assignee: ${newAssignee}.`,
          });
        }
        
        // Update the database immediately
        const { error } = await supabase
          .from('customer_feedback')
          .update(updates)
          .eq('id', feedback.id);
        
        if (error) {
          console.error('Error updating feedback:', error);
          toast({
            title: "Error",
            description: "Failed to update feedback in database.",
            variant: "destructive",
          });
        } else {
          console.log('✅ Feedback updated successfully');
          onUpdate(); // Refresh the data
        }
        
      } catch (error) {
        console.error('Error in handleCategoryChange:', error);
        toast({
          title: "Error",
          description: "Failed to process category change.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStoreNumberChange = async (newStoreNumber: string) => {
    setStoreNumber(newStoreNumber);
    
    if (newStoreNumber && newStoreNumber !== feedback?.store_number) {
      try {
        // Lookup market for the new store number
        const { data: storeData } = await supabase
          .from('stores')
          .select('region')
          .eq('store_number', newStoreNumber)
          .maybeSingle();

        if (storeData?.region) {
          const newMarket = storeData.region;
          setMarket(newMarket);
          
          // Auto-assign based on new store and category
          const newAssignee = await getAssigneeForFeedback(newStoreNumber, newMarket, category);
          setAssignee(newAssignee);
          
          toast({
            title: "Store Updated",
            description: `Updated to store ${newStoreNumber} in ${newMarket}. Assignee updated to ${newAssignee}.`,
          });
        } else {
          toast({
            title: "Store Not Found",
            description: `Store ${newStoreNumber} not found in database.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error looking up store:', error);
        toast({
          title: "Error",
          description: "Failed to lookup store information.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSendOutreach = async () => {
    if (!feedback?.customer_email) {
      toast({
        title: "Error",
        description: "No customer email available for outreach.",
        variant: "destructive",
      });
      return;
    }

    if (!editableEmailContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email message before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const requestBody: any = {
        feedbackId: feedback.id,
        method: 'email',
        templateType: 'custom', // Always send as custom since user can edit
        messageContent: editableEmailContent, // Send the edited content
      };

      const { error } = await supabase.functions.invoke('send-customer-outreach', {
        body: requestBody
      });

      if (error) throw error;

      toast({
        title: "Outreach Email Sent",
        description: "Customer outreach email has been sent successfully.",
      });

      setShowEmailComposer(false);
      setEmailMessage("");
      setEmailActionTaken("");
      setEmailResolutionNotes("");
      setEditableEmailContent("");
      onUpdate();
    } catch (error) {
      console.error('Error sending outreach:', error);
      toast({
        title: "Error",
        description: "Failed to send outreach email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotifications = async () => {
    if (!feedback || !assignee || assignee === 'Unassigned') {
      toast({
        title: "Error",
        description: "Please assign this feedback to someone before testing notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Test the notification system
      await sendAssignmentNotification(feedback.id, assignee);
      
      toast({
        title: "Test Notification Sent",
        description: `Test notification emails sent for assignee: ${assignee}`,
      });
    } catch (error) {
      console.error('Error testing notifications:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test notifications. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalledChange = async (checked: boolean) => {
    if (!feedback) return;
    
    setIsUpdatingCalled(true);
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({ customer_called: checked })
        .eq('id', feedback.id);

      if (error) throw error;

      setCustomerCalled(checked);
      toast({
        title: checked ? "Marked as Called" : "Unmarked as Called",
        description: checked ? "Customer has been marked as called." : "Customer call status cleared.",
      });
    } catch (error) {
      console.error('Error updating called status:', error);
      toast({
        title: "Error",
        description: "Failed to update called status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingCalled(false);
    }
  };

  const handleAcknowledgeCritical = async () => {
    if (!feedback) return;
    
    setIsLoading(true);
    try {
      // Get user role
      const userRole = permissions?.role?.toLowerCase();
      
      if (!userRole || !['dm', 'director', 'vp', 'ceo', 'admin'].includes(userRole)) {
        toast({
          title: "Error",
          description: "You don't have permission to acknowledge critical feedback.",
          variant: "destructive",
        });
        return;
      }

      console.log('💾 ACK SAVE: Inserting acknowledgment...', { feedbackId: feedback.id, userId: user?.id, role: userRole });

      // Insert approval record (ignore if already exists)
      const { error } = await supabase
        .from('critical_feedback_approvals')
        .upsert({
          feedback_id: feedback.id,
          approver_user_id: user?.id,
          approver_role: userRole,
        }, {
          onConflict: 'feedback_id,approver_user_id',
          ignoreDuplicates: true
        });

      if (error) {
        console.error('❌ ACK SAVE: Insert error:', error);
        throw error;
      }

      console.log('✅ ACK SAVE: Successfully inserted, setting state to true');
      setHasAcknowledged(true);
      
      toast({
        title: "Critical Feedback Acknowledged",
        description: `You have acknowledged this critical feedback as ${userRole.toUpperCase()}.`,
      });
      
      // Don't re-check - we already know it succeeded
      onUpdate();
    } catch (error) {
      console.error('Error acknowledging critical feedback:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge critical feedback.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!feedback) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({
          resolution_status: status,
          priority: priority,
          assignee: assignee || null,
          complaint_category: category,
          store_number: storeNumber,
          market: market,
          updated_at: new Date().toISOString(),
        })
        .eq('id', feedback.id);

      if (error) throw error;

      toast({
        title: "Feedback Updated",
        description: "The feedback has been successfully updated.",
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: "Error",
        description: "Failed to update feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!feedback) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Details - Case #{feedback.case_number}
          </DialogTitle>
          <DialogDescription>
            View and manage customer feedback details, status, and resolution notes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Header Info */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-medium">
              Store #{storeNumber}
            </Badge>
            <Badge variant="secondary">{market}</Badge>
            <Badge 
              variant={status === 'resolved' ? 'default' : status === 'escalated' ? 'destructive' : 'secondary'}
            >
              {status}
            </Badge>
            <Badge variant="outline" className={`${
              priority === 'Critical' ? 'border-red-500 text-red-500' :
              priority === 'High' ? 'border-orange-500 text-orange-500' :
              priority === 'Medium' ? 'border-yellow-500 text-yellow-500' :
              priority === 'Low' ? 'border-blue-500 text-blue-500' :
              'border-green-500 text-green-500'
            }`}>
              {priority} Priority
            </Badge>
            {feedback.outreach_sent_at && (
              <Badge variant="outline" className="border-green-500 text-green-500">
                <Mail className="h-3 w-3 mr-1" />
                Email Sent
              </Badge>
            )}
          </div>

          {/* Customer Outreach Section */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Customer Outreach
            </h3>
            
            {feedback.customer_email ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{feedback.customer_email}</span>
                </div>
                
                {feedback.outreach_sent_at ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Outreach sent:</span>
                      <span>{new Date(feedback.outreach_sent_at).toLocaleDateString()} at {new Date(feedback.outreach_sent_at).toLocaleTimeString()}</span>
                    </div>
                    {feedback.customer_response_sentiment && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Response sentiment:</span>
                        <Badge variant={
                          feedback.customer_response_sentiment === 'positive' ? 'default' :
                          feedback.customer_response_sentiment === 'negative' ? 'destructive' : 'secondary'
                        }>
                          {feedback.customer_response_sentiment}
                        </Badge>
                      </div>
                    )}
                    <Button 
                      onClick={() => setShowEmailConversation(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Email Conversation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {!showEmailComposer ? (
                        <>
                          <Button 
                            onClick={() => setShowEmailComposer(true)}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Compose Email to Customer
                          </Button>
                          <Button 
                            onClick={() => setShowEmailConversation(true)}
                            variant="outline"
                            disabled={isLoading}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            View Conversation
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-3 w-full">
                          {/* Template Selection */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                            <div className="space-y-2">
                              <Label htmlFor="template-select">Email Template</Label>
                              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select template" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                                  <SelectItem value="slow_service">Slow Service</SelectItem>
                                  <SelectItem value="sandwich_wrong">Sandwich Made Wrong</SelectItem>
                                  <SelectItem value="missing_item">Missing Item</SelectItem>
                                  <SelectItem value="bread_quality">Bread Quality</SelectItem>
                                  <SelectItem value="product_quality">Product Quality</SelectItem>
                                  <SelectItem value="out_of_bread">Out of Bread</SelectItem>
                                  <SelectItem value="out_of_product">Out of Product</SelectItem>
                                  <SelectItem value="closed_early">Closed Early</SelectItem>
                                  <SelectItem value="praise">Praise</SelectItem>
                                  <SelectItem value="credit_card">Credit Card Issue</SelectItem>
                                  <SelectItem value="cleanliness">Cleanliness</SelectItem>
                                  <SelectItem value="loyalty_issues">Loyalty Program Issues</SelectItem>
                                  <SelectItem value="food_poisoning">Possible Food Poisoning</SelectItem>
                                  <SelectItem value="resolution">Resolution Update</SelectItem>
                                  <SelectItem value="escalation">Escalation Notice</SelectItem>
                                  <SelectItem value="custom">Custom Message</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Template-specific fields */}
                            {selectedTemplate === 'resolution' && (
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label htmlFor="action-taken">Action Taken</Label>
                                  <Textarea
                                    id="action-taken"
                                    value={emailActionTaken}
                                    onChange={(e) => setEmailActionTaken(e.target.value)}
                                    placeholder="Describe what action was taken..."
                                    rows={2}
                                    className="resize-none text-sm"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="resolution-notes">Resolution Notes</Label>
                                  <Textarea
                                    id="resolution-notes"
                                    value={emailResolutionNotes}
                                    onChange={(e) => setEmailResolutionNotes(e.target.value)}
                                    placeholder="Additional resolution details..."
                                    rows={2}
                                    className="resize-none text-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Email Preview */}
                          <Card className="p-4 bg-muted/30 border-2">
                            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email Preview
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium">Subject: </span>
                                <span className="text-muted-foreground">
                                  {selectedTemplate === 'slow_service' && `We're Sorry About Your Wait - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'sandwich_wrong' && `We're Sorry We Got Your Order Wrong - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'missing_item' && `We're Sorry About Your Missing Item - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'bread_quality' && `We're Sorry About the Bread Quality - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'product_quality' && `We're Sorry About the Product Quality - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'out_of_bread' && `We're Sorry We Ran Out of Bread - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'out_of_product' && `We're Sorry We Ran Out - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'closed_early' && `We're Sorry We Were Closed - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'praise' && `Thank You for Your Kind Words! - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'credit_card' && `Thank You for Reporting the Issue - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'cleanliness' && `We're Sorry About the Cleanliness - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'loyalty_issues' && `Thank You for Reporting the Loyalty Issue - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'food_poisoning' && `We Take This Very Seriously - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'acknowledgment' && `Thank you for your feedback - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'resolution' && `Resolution Update for Case #${feedback.case_number}`}
                                  {selectedTemplate === 'escalation' && `URGENT: Your feedback has been escalated - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'custom' && `Regarding your feedback - Case #${feedback.case_number}`}
                                </span>
                              </div>
                              <Separator />
                              <div className="space-y-2 text-muted-foreground max-h-60 overflow-y-auto">
                                <p>Dear {feedback.customer_name || 'Valued Customer'},</p>
                                
                                {/* Editable placeholders section */}
                                {(selectedTemplate === 'sandwich_wrong' || selectedTemplate === 'missing_item' || 
                                  selectedTemplate === 'out_of_bread' || selectedTemplate === 'out_of_product' || 
                                  selectedTemplate === 'closed_early' || selectedTemplate === 'cleanliness' || 
                                  selectedTemplate === 'food_poisoning') && (
                                  <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded space-y-2">
                                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-400 mb-2">Edit Template Placeholders:</p>
                                    {(selectedTemplate === 'sandwich_wrong' || selectedTemplate === 'missing_item' || 
                                      selectedTemplate === 'out_of_bread' || selectedTemplate === 'out_of_product' || 
                                      selectedTemplate === 'closed_early' || selectedTemplate === 'cleanliness' || 
                                      selectedTemplate === 'food_poisoning') && (
                                      <div className="space-y-1.5">
                                        <div className="flex gap-2 items-center">
                                          <Label className="text-xs min-w-[80px]">Manager Name:</Label>
                                          <Input
                                            value={emailPlaceholders.managerName}
                                            onChange={(e) => setEmailPlaceholders({...emailPlaceholders, managerName: e.target.value})}
                                            placeholder="Enter manager name"
                                            className="h-7 text-xs"
                                          />
                                        </div>
                                        {(selectedTemplate === 'out_of_bread' || selectedTemplate === 'out_of_product' || 
                                          selectedTemplate === 'closed_early' || selectedTemplate === 'food_poisoning') && (
                                          <div className="flex gap-2 items-center">
                                            <Label className="text-xs min-w-[80px]">Position:</Label>
                                            <Input
                                              value={emailPlaceholders.managerPosition}
                                              onChange={(e) => setEmailPlaceholders({...emailPlaceholders, managerPosition: e.target.value})}
                                              placeholder="e.g., Store Manager, District Manager"
                                              className="h-7 text-xs"
                                            />
                                          </div>
                                        )}
                                        {selectedTemplate === 'out_of_product' && (
                                          <div className="flex gap-2 items-center">
                                            <Label className="text-xs min-w-[80px]">Product:</Label>
                                            <Input
                                              value={emailPlaceholders.productName}
                                              onChange={(e) => setEmailPlaceholders({...emailPlaceholders, productName: e.target.value})}
                                              placeholder="e.g., lettuce, tomatoes"
                                              className="h-7 text-xs"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {selectedTemplate === 'slow_service' && (
                                  <>
                                    <p>Thank you for taking the time to complete our survey and share your experience. My name is Karine, and I'm the Guest Feedback Manager for Jimmy John's.</p>
                                    <p>I sincerely apologize that your order wasn't delivered as quickly as it should have been. At Jimmy John's, we're known for Freaky Fast® service, and we fell short of that promise to you. Whether it was traffic, a rush of orders, or something else, there's no excuse for not meeting your expectations.</p>
                                    <p>I'd love to make it right. If you have a Freaky Fast Rewards® account, I'll add a free original sandwich to your account right away. Just confirm the phone number associated with your rewards account, and it's yours.</p>
                                    <p>If you have any additional questions or concerns, feel free to reply to this email—I'd be happy to chat more. We hope to earn back your trust and see you again soon.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'sandwich_wrong' && (
                                  <>
                                    <p>Hi {feedback.customer_name || 'Valued Customer'},</p>
                                    <p>My name is <span className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-semibold">{emailPlaceholders.managerName || '[Manager Name]'}</span>, and I help manage the Jimmy John's you recently visited.</p>
                                    <p>I'm truly sorry that we did not prepare your sandwich correctly. Serving Freaky Fast® sandwiches is only meaningful if your sandwich is made perfectly every single time! I completely understand your frustration, and I want to make it right.</p>
                                    <p>I'll add a credit to your account for a free original sandwich on your next visit. This credit is store-specific, so please call in your order or visit us in-store to redeem it.</p>
                                    <p>If you have any other questions or concerns, please don't hesitate to reply to this email. I hope we'll see you again soon and can show you the Jimmy John's experience you deserve.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'missing_item' && (
                                  <>
                                    <p>Thank you for taking the time to complete our survey and share your experience.</p>
                                    <p>My name is <span className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-semibold">{emailPlaceholders.managerName || '[Store Manager]'}</span>, and I manage the Jimmy John's that you visited. I sincerely apologize for missing items from your order. Missing items are unacceptable, and I understand how frustrating that must have been.</p>
                                    <p>I'd like to make it up to you by adding a credit to your account for a free original sandwich. This credit is store-specific, so you'll want to call in your order or visit us in-store to redeem it.</p>
                                    <p>If you have any additional questions or concerns, feel free to reply to this email—I'd be happy to help. I hope we can regain your trust and see you again soon.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'bread_quality' && (
                                  <>
                                    <p>Thank you for submitting our survey and sharing your experience.</p>
                                    <p>My name is Karine, and I'm the Guest Feedback Manager for Jimmy John's. Perfect Bread® is one of the cornerstones of our brand—we bake it fresh throughout the day to ensure every bite is perfect. I understand that stale or hard bread can quickly ruin your meal, and I'm truly sorry we didn't meet that standard.</p>
                                    <p>I hope you'll give us another opportunity to earn back your business. If you have a Freaky Fast Rewards® account, I'd be happy to add a free original sandwich to your account. Just confirm the phone number associated with your loyalty account.</p>
                                    <p>If you have any additional questions or concerns, please reply to this email—I'd love to chat more. We hope to see you again soon.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'product_quality' && (
                                  <>
                                    <p>Thank you for sending in your feedback.</p>
                                    <p>All of our products are sliced, baked, and prepped fresh daily to avoid situations like yours. This time, we fell short of the product quality we strive for at Jimmy John's, and I sincerely apologize.</p>
                                    <p>I'll address this with our team immediately to ensure it doesn't happen again. If you have a Freaky Fast Rewards® account, I'd be happy to add a free original sandwich to your account. Just confirm the phone number associated with your loyalty account.</p>
                                    <p>If you have any additional questions or concerns, please reply to this email—I'd be happy to help make this right. We hope to see you again soon.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'out_of_bread' && (
                                  <>
                                    <p>Thank you for sharing your experience.</p>
                                    <p>My name is <span className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-semibold">{emailPlaceholders.managerName || '[Name]'}</span>, and I'm the <span className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-semibold">{emailPlaceholders.managerPosition || '[Position]'}</span> at the Jimmy John's that you attempted to order from.</p>
                                    <p>Perfect Bread® is our #1 rule at Jimmy John's, and not having any available is completely unacceptable. I would like to personally apologize for this failure. This should never happen, and I'm taking immediate steps to address it with our team.</p>
                                    <p>I'll add a credit to your account for a free original sandwich. This credit is store-specific, so please call in your order or visit us in-store to redeem it.</p>
                                    <p>If you have any additional questions or concerns, please reply to this email—I'd be happy to discuss this further. I genuinely hope we can earn another chance to serve you.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'out_of_product' && (
                                  <>
                                    <p>Thank you for sharing your experience.</p>
                                    <p>My name is <span className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-semibold">{emailPlaceholders.managerName || '[Name]'}</span>, and I'm the <span className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-semibold">{emailPlaceholders.managerPosition || '[Position]'}</span> at the Jimmy John's that you attempted to order from.</p>
                                    <p>Not having <span className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-semibold">{emailPlaceholders.productName || '[Product]'}</span> available is unacceptable, and I sincerely apologize for the inconvenience. Our customers should be able to count on us to have what they need, and we let you down.</p>
                                    <p>I'll add a credit to your account for a free original sandwich. This credit is store-specific, so please call in your order or visit us in-store to redeem it.</p>
                                    <p>If you have any additional questions or concerns, please reply to this email—I'm here to help. We hope to see you again soon.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'closed_early' && (
                                  <>
                                    <p>Thank you for sharing your experience.</p>
                                    <p>My name is <span className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-semibold">{emailPlaceholders.managerName || '[Name]'}</span>, and I'm the <span className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-semibold">{emailPlaceholders.managerPosition || '[Position]'}</span> at the Jimmy John's that you attempted to visit.</p>
                                    <p>Closing early is completely unacceptable and goes against everything we stand for. I sincerely apologize that you made the trip to see us, only to find us closed. This should never have happened, and I'm addressing it with my team immediately.</p>
                                    <p>I'll add a credit to your account for a free original sandwich to make it right. This credit is store-specific, so please call in your order or visit us in-store to redeem it.</p>
                                    <p>If you have any additional questions or concerns, please reply to this email. I hope we can earn back your trust and serve you again soon.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'credit_card' && (
                                  <>
                                    <p>Thank you for sharing your experience.</p>
                                    <p>My name is Karine, and I'm the Guest Feedback Manager for Jimmy John's.</p>
                                    <p>Thank you for letting us know about the credit card issue you encountered. Payment problems are incredibly frustrating, and I apologize for the inconvenience. We'll be sure to address this with our payment processor and our team right away to prevent this from happening again.</p>
                                    <p>If you experienced any charges or issues that need to be resolved, please reply to this email with details, and I'll personally ensure it gets handled.</p>
                                    <p>Thank you for your patience, and we hope to see you again soon.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'cleanliness' && (
                                  <>
                                    <p>Thank you for sharing your experience.</p>
                                    <p>My name is <span className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-semibold">{emailPlaceholders.managerName || '[Name]'}</span>, and I'm the Manager of the Jimmy John's that you visited.</p>
                                    <p>We pride ourselves on being Hospital Clean®—cleanliness is one of our core values, and an unclean store is absolutely unacceptable. I sincerely apologize for failing to meet this standard during your visit.</p>
                                    <p>I'll be working with my team immediately to address this issue and ensure we exceed our cleanliness standards moving forward. I'd also like to make it up to you by adding a credit to your account for a free original sandwich. This credit is store-specific, so please call in your order or visit us in-store to redeem it.</p>
                                    <p>If you have any additional questions or concerns, please reply to this email—I'd be happy to discuss this further. I hope we can earn back your trust and see you again soon.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'loyalty_issues' && (
                                  <>
                                    <p>Thank you for sharing your experience.</p>
                                    <p>My name is Karine, and I'm the Guest Feedback Manager for Jimmy John's.</p>
                                    <p>Thank you for letting us know about the loyalty program issue you encountered. Our Freaky Fast Rewards® program should make your experience better, not frustrating, and I apologize for the inconvenience.</p>
                                    <p>I'll escalate this to our rewards support team and our corporate office to get this resolved for you. If you'd like, please reply with your rewards account information (phone number or email), and I'll personally follow up to ensure the issue is fixed.</p>
                                    <p>Thank you for your patience, and we appreciate your loyalty!</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'food_poisoning' && (
                                  <>
                                    <p>Thank you for reaching out.</p>
                                    <p>My name is <span className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-semibold">{emailPlaceholders.managerName || '[Name]'}</span>, and I'm the <span className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-semibold">{emailPlaceholders.managerPosition || '[Position]'}</span> for {feedback.market || '[Market/Region]'}. We take any feedback regarding possible food poisoning extremely seriously, and I'm very sorry to hear about your experience.</p>
                                    <p>I'd like to speak with you directly to learn more about what happened so we can conduct a thorough investigation on our end. Your health and safety are our top priority, and we need to understand the situation fully to prevent this from happening to anyone else.</p>
                                    <p>Please provide a good phone number where I can reach you at your earliest convenience. I'll personally follow up to discuss this matter further.</p>
                                    <p>Thank you for bringing this to our attention.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'acknowledgment' && (
                                  <>
                                    <p>Thank you for taking the time to share your feedback with us. We have received your message and want to assure you that we take all customer feedback seriously.</p>
                                    <div className="bg-background/50 p-3 rounded border my-2">
                                      <p className="font-medium mb-1">Feedback Details:</p>
                                      <p className="text-xs">Case Number: {feedback.case_number}</p>
                                      <p className="text-xs">Store Number: {feedback.store_number}</p>
                                      <p className="text-xs">Date: {new Date(feedback.feedback_date).toLocaleDateString()}</p>
                                      <p className="text-xs">Category: {feedback.complaint_category}</p>
                                    </div>
                                    <p>{feedback.priority === 'Critical' || feedback.priority === 'High' 
                                      ? 'Your feedback has been marked as high priority and will be reviewed by our management team within 24 hours.'
                                      : 'We will review your feedback and respond appropriately based on the nature of your concerns.'
                                    }</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'praise' && (
                                  <>
                                    <p>Thank you so much for taking the time to share your positive experience with us! Feedback like yours truly makes our day and motivates our team to continue providing excellent service.</p>
                                    <p>We've shared your kind words with the team at Store #{feedback.store_number}. They will be thrilled to hear that their hard work made a positive impact on your visit.</p>
                                    <p>We look forward to serving you again soon!</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'resolution' && (
                                  <>
                                    <p>Thank you for bringing this matter to our attention. I wanted to update you on the resolution of your concern regarding your visit on {new Date(feedback.feedback_date).toLocaleDateString()}.</p>
                                    {emailActionTaken && (
                                      <div className="bg-background/50 p-3 rounded border my-2">
                                        <p className="font-medium mb-1">Action Taken:</p>
                                        <p className="text-xs">{emailActionTaken}</p>
                                      </div>
                                    )}
                                    {emailResolutionNotes && (
                                      <div className="bg-background/50 p-3 rounded border my-2">
                                        <p className="font-medium mb-1">Resolution Details:</p>
                                        <p className="text-xs">{emailResolutionNotes}</p>
                                      </div>
                                    )}
                                    <p>We appreciate your patience and understanding as we worked to address your concerns. If you have any questions about this resolution, please don't hesitate to reach out.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'escalation' && (
                                  <>
                                    <p className="font-medium text-orange-600">This message requires immediate attention.</p>
                                    <p>Your feedback regarding your visit on {new Date(feedback.feedback_date).toLocaleDateString()} has been escalated to our management team for immediate review and action.</p>
                                    <div className="bg-background/50 p-3 rounded border my-2">
                                      <p className="font-medium mb-1">Escalation Details:</p>
                                      <p className="text-xs">Case Number: {feedback.case_number}</p>
                                      <p className="text-xs">Store: #{feedback.store_number}</p>
                                      <p className="text-xs">Priority: {feedback.priority}</p>
                                    </div>
                                    <p>A member of our management team will contact you within 24 hours to discuss this matter and work towards a resolution.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'custom' && emailMessage && (
                                  <p className="whitespace-pre-wrap">{emailMessage}</p>
                                )}
                                
                                {selectedTemplate === 'custom' && !emailMessage && (
                                  <p className="italic text-muted-foreground/60">Enter your custom message above to see the preview...</p>
                                )}
                                
                                <p className="pt-2 border-t mt-4">
                                  Best regards,<br />
                                  Customer Service Team<br />
                                  <a href="mailto:guestfeedback@atlaswe.com" className="text-primary underline">guestfeedback@atlaswe.com</a>
                                </p>
                              </div>
                            </div>
                          </Card>

                          {/* Editable Email Content */}
                          <div className="space-y-2">
                            <Label htmlFor="editableEmailContent" className="flex items-center gap-2">
                              <Edit className="h-4 w-4" />
                              Edit Email Before Sending
                              <span className="text-xs text-muted-foreground font-normal">(changes won't affect the master template)</span>
                            </Label>
                            <Textarea 
                              id="editableEmailContent"
                              value={editableEmailContent}
                              onChange={(e) => setEditableEmailContent(e.target.value)}
                              placeholder="Edit the email content before sending..."
                              rows={12}
                              className="font-mono text-sm"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              onClick={handleSendOutreach}
                              disabled={isLoading || !editableEmailContent.trim()}
                              className="flex-1"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              {isLoading ? "Sending..." : "Send Email"}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowEmailComposer(false)}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No customer email available for outreach.</p>
            )}
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span> {feedback.customer_name || 'Not provided'}
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span> {feedback.customer_email || 'Not provided'}
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-muted-foreground">Phone:</span> {feedback.customer_phone || 'Not provided'}
                  </div>
                  {feedback.customer_phone && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Checkbox
                        id="customer-called"
                        checked={customerCalled}
                        onCheckedChange={handleCalledChange}
                        disabled={isUpdatingCalled}
                      />
                      <label
                        htmlFor="customer-called"
                        className="text-sm font-medium cursor-pointer select-none"
                      >
                        Called Customer
                      </label>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Case Number:</span> {feedback.case_number}
                </div>
                {feedback.order_number && (
                  <div>
                    <span className="text-muted-foreground">Order #:</span> <span className="font-mono">{feedback.order_number}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Feedback Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span> {new Date(feedback.feedback_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-muted-foreground">Channel:</span> {feedback.channel}
                </div>
                {feedback.rating && (
                  <div>
                    <span className="text-muted-foreground">Rating:</span> {feedback.rating}/5
                  </div>
                )}
                {feedback.time_of_day && (
                  <div>
                    <span className="text-muted-foreground">Time of Day:</span> {feedback.time_of_day}
                  </div>
                )}
                {feedback.period && (
                  <div>
                    <span className="text-muted-foreground">Period:</span> {feedback.period}
                  </div>
                )}
                {feedback.ee_action && (
                  <div className="col-span-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-900">
                    <span className="text-muted-foreground">Action Required:</span> <span className="font-medium">{feedback.ee_action}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Created:</span> {new Date(feedback.created_at).toLocaleDateString()}
                </div>
              </div>
            </Card>
          </div>

          {/* Feedback Text */}
          {feedback.feedback_text && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Customer Feedback
              </h3>
              <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded border">
                {feedback.feedback_text}
              </p>
            </Card>
          )}

          {/* Editable Fields */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Resolution Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unopened">Unopened</SelectItem>
                    <SelectItem value="opened">Opened</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority} disabled={!isAdmin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Praise">Praise</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Input 
                  id="assignee"
                  value={assignee} 
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Enter assignee name"
                />
              </div>

              {isAdmin && (
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50 max-h-60 overflow-y-auto">
                      <SelectItem value="Sandwich Made Wrong">Sandwich Made Wrong</SelectItem>
                      <SelectItem value="Slow Service">Slow Service</SelectItem>
                      <SelectItem value="Rude Service">Rude Service</SelectItem>
                      <SelectItem value="Product Issue">Product Issue</SelectItem>
                      <SelectItem value="Closed Early">Closed Early</SelectItem>
                      <SelectItem value="Praise">Praise</SelectItem>
                      <SelectItem value="Missing Item">Missing Item</SelectItem>
                      <SelectItem value="Credit Card Issue">Credit Card Issue</SelectItem>
                      <SelectItem value="Bread Quality">Bread Quality</SelectItem>
                      <SelectItem value="Out of Product">Out of Product</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                      <SelectItem value="Possible Food Poisoning">Possible Food Poisoning</SelectItem>
                      <SelectItem value="Loyalty Program Issues">Loyalty Program Issues</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* CMX Link for Product Issues */}
                  {feedback && shouldShowCMXLink(feedback) && (
                    <a
                      href="https://jimmyjohns.compliancemetrix.com/rql/p/acoretableauhomevhomeactivator"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 mt-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-md text-sm font-medium text-blue-700 dark:text-blue-400 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in CMX
                    </a>
                  )}
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeNumber">Store Number</Label>
                  <Input 
                    id="storeNumber"
                    value={storeNumber} 
                    onChange={(e) => handleStoreNumberChange(e.target.value)}
                    placeholder="Enter store number"
                  />
                </div>
                <div>
                  <Label htmlFor="market">Market</Label>
                  <Input 
                    id="market"
                    value={market} 
                    onChange={(e) => setMarket(e.target.value)}
                    placeholder="Market (auto-filled)"
                    disabled
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Resolution Notes</Label>
                {!showAddNote && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddNote(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resolution Note
                  </Button>
                )}
              </div>
              
              {/* Display existing notes (read-only) */}
              {notes.filter(n => n.note_type === 'resolution').length > 0 && (
                <div className="space-y-2 mb-4">
                  {notes.filter(n => n.note_type === 'resolution').map((note) => (
                    <Card key={note.id} className="p-3 bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1">
                        <span className="font-medium">{format(new Date(note.created_at), 'MMM dd, yyyy h:mm a')}</span>
                        {' - '}
                        <span>{note.created_by_name}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.note_text}</p>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Add new note form */}
              {showAddNote && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                  <MentionsTextarea
                    value={newNoteText}
                    onChange={setNewNoteText}
                    placeholder="Enter resolution note... Use @username to mention someone"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowConfirmDialog(true)}
                      disabled={!newNoteText.trim() || isLoading}
                    >
                      Save Note
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNewNoteText('');
                        setShowAddNote(false);
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {feedback?.priority === 'Critical' && ['dm', 'director', 'vp', 'ceo', 'admin'].includes(permissions?.role?.toLowerCase() || '') && (
            <Button 
              variant="default"
              onClick={handleAcknowledgeCritical} 
              disabled={isLoading || hasAcknowledged}
              className={hasAcknowledged ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {hasAcknowledged ? "Acknowledged" : (isLoading ? "Acknowledging..." : "Acknowledge Critical Feedback")}
            </Button>
          )}
          {isAdmin && (
            <Button 
              variant="secondary" 
              onClick={handleTestNotifications} 
              disabled={isLoading || !assignee || assignee === 'Unassigned'}
            >
              {isLoading ? "Testing..." : "🧪 Test Notifications"}
            </Button>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Email Conversation Dialog */}
      {feedback?.customer_email && (
        <EmailConversationDialog
          feedbackId={feedback.id}
          customerEmail={feedback.customer_email}
          customerName={feedback.customer_name || feedback.customer_email}
          isOpen={showEmailConversation}
          onOpenChange={setShowEmailConversation}
        />
      )}
      
      {/* Confirmation Dialog for Adding Notes */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Confirm Permanent Note</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Once saved, this note will be <strong>permanent and cannot be edited or deleted</strong>.</p>
              <p>Are you sure you want to add this note?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSaveNote}>
              Confirm & Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};