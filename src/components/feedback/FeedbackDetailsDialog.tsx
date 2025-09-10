import { useState, useEffect, useRef } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, User, Star, MapPin, Phone, Mail, MessageSquare, Clock, AlertTriangle, Store } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserPermissions } from "@/hooks/useUserPermissions";

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
};

const priorityColors = {
  Praise: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400',
  Low: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
  High: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
  Critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400',
};

const categoryLabels = {
  'Sandwich Made wrong': 'Sandwich Made wrong',
  'Slow Service': 'Slow Service',
  'Rude Service': 'Rude Service',
  'Product issue': 'Product issue',
  'Closed Early': 'Closed Early',
  'Praise': 'Praise',
  'Missing Item': 'Missing Item',
  'Credit Card Issue': 'Credit Card Issue',
  'Bread Quality': 'Bread Quality',
  'Out of product': 'Out of product',
  'Other': 'Other',
  'Cleanliness': 'Cleanliness',
  'Possible Food Poisoning': 'Possible Food Poisoning',
  'Loyalty Program Issues': 'Loyalty Program Issues'
};

const channelLabels = {
  yelp: 'Yelp',
  qualtrics: 'Qualtrics',
  jimmy_johns: "Jimmy John's"
};

// Assignment logic function that mirrors the edge function
const getAssigneeForFeedback = async (storeNumber: string, market: string, category: string): Promise<string> => {
  console.log('🔍 ASSIGNMENT: Starting assignment logic', { storeNumber, market, category });
  
  // Store-level complaints go to store email
  const storeLevelCategories = ['Missing Item', 'Sandwich Made wrong', 'Closed Early', 'Cleanliness', 'Possible Food Poisoning'];
  if (storeLevelCategories.includes(category)) {
    const assignee = `store${storeNumber}@atlaswe.com`;
    console.log('✅ ASSIGNMENT: Store-level complaint assigned to', assignee);
    return assignee;
  }

  // Guest feedback complaints go to guest feedback email
  const guestFeedbackCategories = ['Loyalty Program Issues', 'Credit Card Issue'];
  if (guestFeedbackCategories.includes(category)) {
    console.log('✅ ASSIGNMENT: Guest feedback complaint assigned to guestfeedback@atlaswe.com');
    return 'guestfeedback@atlaswe.com';
  }

  // DM-level complaints - lookup DM for the market
  const dmLevelCategories = ['Rude Service', 'Slow Service', 'Product issue', 'Bread Quality', 'Out of product', 'Other'];
  if (dmLevelCategories.includes(category)) {
    console.log('🔍 ASSIGNMENT: DM-level complaint, looking up DM for market:', market);
    try {
      // Get all DMs first
      const { data: dmData } = await supabase
        .from('user_hierarchy')
        .select('user_id')
        .eq('role', 'DM');

      console.log('🔍 ASSIGNMENT: Found DMs:', dmData);

      if (dmData && dmData.length > 0) {
        // Check each DM's permissions to find who has access to this market
        for (const dm of dmData) {
          const { data: permissions } = await supabase
            .from('user_permissions')
            .select('markets')
            .eq('user_id', dm.user_id)
            .maybeSingle();
          
          console.log(`🔍 ASSIGNMENT: DM ${dm.user_id} has markets:`, permissions?.markets);
          
          if (permissions?.markets?.includes(market)) {
            // Get the email for this DM
            const { data: dmProfile } = await supabase
              .from('profiles')
              .select('email')
              .eq('user_id', dm.user_id)
              .maybeSingle();
              
            if (dmProfile?.email) {
              console.log(`✅ ASSIGNMENT: Found exact market match for DM: ${dmProfile.email}`);
              return dmProfile.email;
            }
          }
        }
        
        // If no exact match found, try normalized market names
        const normalizedMarket = market.replace(/\s+/g, '');
        console.log(`🔍 ASSIGNMENT: Trying normalized market: "${normalizedMarket}" (original: "${market}")`);
        
        for (const dm of dmData) {
          const { data: permissions } = await supabase
            .from('user_permissions')
            .select('markets')
            .eq('user_id', dm.user_id)
            .maybeSingle();
          
          if (permissions?.markets) {
            const hasMatchingMarket = permissions.markets.some(m => {
              const normalizedPermission = m.replace(/\s+/g, '');
              console.log(`🔍 ASSIGNMENT: Comparing "${normalizedMarket}" with "${normalizedPermission}" (original: "${m}")`);
              const matches = normalizedPermission === normalizedMarket;
              if (matches) {
                console.log(`🎯 ASSIGNMENT: MATCH FOUND! "${normalizedMarket}" === "${normalizedPermission}"`);
              }
              return matches;
            });
            
            if (hasMatchingMarket) {
              // Get the email for this DM
              const { data: dmProfile } = await supabase
                .from('profiles')
                .select('email')
                .eq('user_id', dm.user_id)
                .maybeSingle();
                
              if (dmProfile?.email) {
                console.log(`✅ ASSIGNMENT: Found normalized market match for DM: ${dmProfile.email}`);
                return dmProfile.email;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ ASSIGNMENT: Error looking up DM:', error);
    }
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
  const { toast } = useToast();
  const { permissions, loading: permissionsLoading } = useUserPermissions();
  const processedFeedbackId = useRef<string | null>(null);

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
    }
  }, [feedback]);

  // Auto-mark as viewed and change status when dialog opens
  useEffect(() => {
    if (feedback && isOpen && feedback.id !== processedFeedbackId.current) {
      console.log('🔍 FEEDBACK DIALOG: Auto-update check', {
        feedbackId: feedback.id,
        currentStatus: feedback.resolution_status,
        isViewed: feedback.viewed,
        shouldUpdate: !feedback.viewed && feedback.resolution_status === 'unopened'
      });
      
      // Only update if not already viewed AND status is unopened
      // This prevents multiple updates of the same feedback
      if (!feedback.viewed && feedback.resolution_status === 'unopened') {
        processedFeedbackId.current = feedback.id;
        
        const updateFeedback = async () => {
          try {
            const updateData: any = {
              viewed: true,
              updated_at: new Date().toISOString(),
              resolution_status: 'opened'
            };
            
            console.log('📝 FEEDBACK DIALOG: Updating feedback', { feedbackId: feedback.id, updateData });
            
            const { data, error } = await supabase
              .from('customer_feedback')
              .update(updateData)
              .eq('id', feedback.id)
              .select();

            if (error) {
              console.error('❌ FEEDBACK DIALOG: Update error', error);
              processedFeedbackId.current = null; // Reset on error
            } else {
              console.log('✅ FEEDBACK DIALOG: Update successful', data);
              onUpdate(); // Refresh the list to show updated status
            }
          } catch (error) {
            console.error('❌ FEEDBACK DIALOG: Exception during update', error);
            processedFeedbackId.current = null; // Reset on error
          }
        };
        
        updateFeedback();
      }
    }
  }, [feedback?.id, isOpen, feedback?.viewed, feedback?.resolution_status, onUpdate]);

  // Reset processed ID when dialog closes
  useEffect(() => {
    if (!isOpen) {
      processedFeedbackId.current = null;
    }
  }, [isOpen]);

  // Handle category change and auto-assign
  const handleCategoryChange = async (newCategory: string) => {
    console.log('🔄 CATEGORY CHANGE: Changing category from', category, 'to', newCategory);
    setCategory(newCategory);
    
    if (newCategory && storeNumber && market) {
      console.log('🔄 CATEGORY CHANGE: Triggering reassignment with', { storeNumber, market, newCategory });
      try {
        const newAssignee = await getAssigneeForFeedback(storeNumber, market, newCategory);
        console.log('🔄 CATEGORY CHANGE: New assignee determined:', newAssignee);
        setAssignee(newAssignee);
        
        // Auto-save the changes to the database
        const { error } = await supabase
          .from('customer_feedback')
          .update({
            complaint_category: newCategory,
            assignee: newAssignee || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', feedback!.id);

        if (error) {
          console.error('❌ CATEGORY CHANGE: Error saving changes:', error);
          toast({
            title: "Error",
            description: "Failed to save changes. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Category Updated", 
            description: `Complaint category changed to "${newCategory}". Assignee updated to ${newAssignee}.`,
          });
          onUpdate(); // Refresh the parent component to show updated data
        }
      } catch (error) {
        console.error('❌ CATEGORY CHANGE: Error reassigning after category change:', error);
        toast({
          title: "Error",
          description: "Failed to update assignment. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      console.log('⚠️ CATEGORY CHANGE: Missing required data', { newCategory, storeNumber, market });
    }
  };

  // Handle store number change and auto-assign
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

  const handleSave = async () => {
    if (!feedback) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({
          resolution_status: status,
          assignee: assignee || null,
          complaint_category: category,
          resolution_notes: resolutionNotes || null,
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
            <Badge variant="secondary">
              {market}
            </Badge>
            <Badge variant="outline">
              {channelLabels[feedback.channel as keyof typeof channelLabels] || feedback.channel}
            </Badge>
            <Badge className={cn("transition-colors", statusColors[feedback.resolution_status as keyof typeof statusColors])}>
              {feedback.resolution_status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge className={cn("transition-colors", priorityColors[feedback.priority as keyof typeof priorityColors])}>
              {feedback.priority === 'Praise' && <Star className="h-3 w-3 mr-1" />}
              {(feedback.priority === 'High' || feedback.priority === 'Critical') && <AlertTriangle className="h-3 w-3 mr-1" />}
              {feedback.priority}
            </Badge>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <h4 className="font-semibold">Customer Information</h4>
              {feedback.customer_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  {feedback.customer_name}
                </div>
              )}
              {feedback.customer_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  {feedback.customer_email}
                </div>
              )}
              {feedback.customer_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  {feedback.customer_phone}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Feedback Details</h4>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {format(new Date(feedback.feedback_date), 'MMM d, yyyy')}
              </div>
                <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                {!permissionsLoading && permissions.isDirectorOrAbove ? (
                  <Select 
                    value={category} 
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="h-8 border-none p-0 bg-transparent hover:bg-muted/50 focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sandwich Made wrong">Sandwich Made wrong</SelectItem>
                      <SelectItem value="Slow Service">Slow Service</SelectItem>
                      <SelectItem value="Rude Service">Rude Service</SelectItem>
                      <SelectItem value="Product issue">Product issue</SelectItem>
                      <SelectItem value="Closed Early">Closed Early</SelectItem>
                      <SelectItem value="Praise">Praise</SelectItem>
                      <SelectItem value="Missing Item">Missing Item</SelectItem>
                      <SelectItem value="Credit Card Issue">Credit Card Issue</SelectItem>
                      <SelectItem value="Bread Quality">Bread Quality</SelectItem>
                      <SelectItem value="Out of product">Out of product</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                      <SelectItem value="Possible Food Poisoning">Possible Food Poisoning</SelectItem>
                      <SelectItem value="Loyalty Program Issues">Loyalty Program Issues</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-muted-foreground">
                    {categoryLabels[feedback.complaint_category as keyof typeof categoryLabels] || feedback.complaint_category}
                  </span>
                )}
              </div>
              {feedback.rating && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-current" />
                  {feedback.rating}/5 Rating
                </div>
              )}
            </div>
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Feedback</Label>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm leading-relaxed">{feedback.feedback_text}</p>
            </div>
          </div>

          {/* Edit Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Admin-only Store Number field */}
            {!permissionsLoading && permissions.isDirectorOrAbove && (
              <div className="space-y-2">
                <Label htmlFor="store-number" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Store Number
                </Label>
                <Input
                  id="store-number"
                  placeholder="Enter store number"
                  value={storeNumber}
                  onChange={(e) => handleStoreNumberChange(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Resolution Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unopened">Unopened</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                placeholder="Enter assignee name"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            </div>
          </div>



          {/* Resolution Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Resolution Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add resolution notes..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}