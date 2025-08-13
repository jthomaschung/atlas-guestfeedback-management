import { useState, useEffect, useRef } from 'react';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority, EcoSure } from '@/types/work-order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar, MessageSquare, Plus, X, User, AtSign, Upload, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  onUpdate: (updates: Partial<WorkOrder>) => void;
  onClose: () => void;
}

const statusColors = {
  pending: 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600',
  'pending-approval': 'bg-purple-500 text-white border-purple-600 hover:bg-purple-600',
  'in-progress': 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600',
  'on-hold': 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600',
  completed: 'bg-green-500 text-white border-green-600 hover:bg-green-600',
  cancelled: 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600',
};

const priorityColors = {
  Low: 'bg-green-500 text-white border-green-600 hover:bg-green-600',
  Important: 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600',
  Critical: 'bg-red-500 text-white border-red-600 hover:bg-red-600',
};

const ecoSureColors = {
  'N/A': 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600',
  'Minor': 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600',
  'Major': 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600',
  'Critical': 'bg-red-500 text-white border-red-600 hover:bg-red-600',
  'Imminent Health': 'bg-red-700 text-white border-red-800 hover:bg-red-800',
};

const assigneeOptions = [
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'Anthony Luna', label: 'Anthony Luna' },
  { value: 'Grant Gelecki', label: 'Grant Gelecki' },
  { value: 'Dwayne Parks', label: 'Dwayne Parks' },
  { value: 'Whitney Bramlitt', label: 'Whitney Bramlitt' },
  { value: 'Ryan McMurtrie', label: 'Ryan McMurtrie' },
  { value: 'GM/DM', label: 'GM/DM' },
  { value: 'Director', label: 'Director' },
];

export function WorkOrderDetails({ workOrder, onUpdate, onClose }: WorkOrderDetailsProps) {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [users, setUsers] = useState<Array<{user_id: string, email: string, first_name?: string, last_name?: string, display_name?: string}>>([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState<Array<{user_id: string, email: string, first_name?: string, last_name?: string, display_name?: string}>>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditingCreatedBy, setIsEditingCreatedBy] = useState(false);
  const [isEditingCreatedDate, setIsEditingCreatedDate] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState('');
  const [editedCreatedDate, setEditedCreatedDate] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const { sendCompletionNotification, sendTaggedNotification } = useNotifications();

  // Check admin status and load users for tagging and additional images
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const { data } = await supabase.rpc('is_admin', { user_id: user.id });
        setIsAdmin(data || false);
      }
    };

    const loadUsers = async () => {
      // Use the secure function that only exposes necessary user information (no emails)
      const { data, error } = await supabase.rpc('get_user_display_info');
      if (error) {
        console.error('Error loading users for tagging:', error);
        return;
      }
      if (data) {
        // Transform the data to match expected format
        const transformedData = data.map(user => ({
          user_id: user.user_id,
          email: '', // No longer exposed for security
          first_name: user.first_name,
          last_name: user.last_name,
          display_name: user.display_name
        }));
        setUsers(transformedData);
      }
    };
    
    checkAdminStatus();
    loadUsers();

    // Load additional images from work order notes (if they contain image URLs)
    const imageUrls = (workOrder.notes || [])
      .filter(note => note.includes('http') && (note.includes('.jpg') || note.includes('.jpeg') || note.includes('.png') || note.includes('.webp') || note.includes('.gif')))
      .map(note => {
        const urlMatch = note.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)/i);
        return urlMatch ? urlMatch[0] : null;
      })
      .filter(Boolean) as string[];
    setAdditionalImages(imageUrls);
  }, [workOrder.notes, user]);

  // Helper function to get display name for a user (updated to not rely on email)
  const getUserDisplayName = (user: typeof users[0]) => {
    if (user.display_name) return user.display_name;
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || 'Unknown User'; // Fallback since email is no longer available
  };

  // Handle textarea changes and detect @ mentions
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setNewNote(value);
    
    // Find @ mentions
    const beforeCursor = value.substring(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w+(?:\s+\w*)*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionQuery(query);
      setMentionStartPos(beforeCursor.lastIndexOf('@'));
      
      // Filter users based on query
      const filteredUsers = users.filter(user => {
        const displayName = getUserDisplayName(user).toLowerCase();
        return displayName.includes(query);
      });
      
      setUserSuggestions(filteredUsers);
      setShowUserSuggestions(filteredUsers.length > 0);
      setSelectedSuggestionIndex(0);
    } else {
      setShowUserSuggestions(false);
      setUserSuggestions([]);
      setMentionQuery('');
    }
  };

  // Handle keyboard navigation in suggestions
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showUserSuggestions) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < userSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : userSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (userSuggestions[selectedSuggestionIndex]) {
        selectUser(userSuggestions[selectedSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowUserSuggestions(false);
    }
  };

  // Select a user from suggestions
  const selectUser = (user: typeof users[0]) => {
    const displayName = getUserDisplayName(user);
    const beforeMention = newNote.substring(0, mentionStartPos);
    const afterMention = newNote.substring(mentionStartPos + mentionQuery.length + 1);
    const newValue = beforeMention + '@' + displayName + ' ' + afterMention;
    
    setNewNote(newValue);
    setShowUserSuggestions(false);
    
    // Focus back to textarea and set cursor position
    if (textareaRef.current) {
      const newCursorPos = beforeMention.length + displayName.length + 2;
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    const updates: Partial<WorkOrder> = { 
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
    };
    onUpdate(updates);
    
    // Send completion notification if status changed to completed
    if (newStatus === 'completed') {
      await sendCompletionNotification(workOrder.id);
    }
    
    toast({
      title: "Status Updated",
      description: `Work order status changed to ${newStatus.replace('-', ' ')}`,
    });
  };

  const handlePriorityChange = (newPriority: WorkOrderPriority) => {
    onUpdate({ priority: newPriority });
    toast({
      title: "Priority Updated",
      description: `Work order priority changed to ${newPriority}`,
    });
  };

  const handleEcoSureChange = (newEcoSure: EcoSure) => {
    onUpdate({ ecosure: newEcoSure });
    toast({
      title: "EcoSure Updated", 
      description: `Work order EcoSure level changed to ${newEcoSure}`,
    });
  };

  const handleAssigneeChange = (newAssignee: string) => {
    const assignee = newAssignee === 'unassigned' ? undefined : newAssignee;
    onUpdate({ assignee });
    toast({
      title: "Assignee Updated",
      description: `Work order assignee changed to ${newAssignee === 'unassigned' ? 'Unassigned' : newAssignee}`,
    });
  };

  const handleAddNote = async () => {
    console.log('🚨 HANDLEADDNOTE FUNCTION CALLED - NEW VERSION 🚨');
    if (!newNote.trim()) return;
    
    const timestamp = new Date().toISOString();
    const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
                     user?.email || 'Unknown User';
    const noteWithUserAndTimestamp = `${format(new Date(), 'MMM d, yyyy h:mm a')} - ${userName}: ${newNote.trim()}`;
    const updatedNotes = [...(workOrder.notes || []), noteWithUserAndTimestamp];
    
    // Check for @mentions in the note - extract display names from known users
    const mentions = [];
    console.log('All users available for tagging:', users.map(u => getUserDisplayName(u)));
    console.log('Note text being analyzed:', newNote);
    
    // Find all @ symbols and check what follows
    const atPositions = [];
    for (let i = 0; i < newNote.length; i++) {
      if (newNote[i] === '@') {
        atPositions.push(i);
      }
    }
    
    for (const pos of atPositions) {
      const textAfterAt = newNote.substring(pos + 1);
      console.log('Text after @:', textAfterAt);
      
      // Check which user display name matches the beginning of this text
      let longestMatch = null;
      let longestMatchLength = 0;
      
      for (const user of users) {
        const displayName = getUserDisplayName(user);
        if (textAfterAt.toLowerCase().startsWith(displayName.toLowerCase())) {
          if (displayName.length > longestMatchLength) {
            longestMatch = displayName;
            longestMatchLength = displayName.length;
          }
        }
      }
      
      if (longestMatch) {
        console.log('Found matching user:', longestMatch);
        mentions.push('@' + longestMatch);
      }
    }
    console.log('Found mentions in note:', mentions);
    console.log('New note content:', newNote);
    
    onUpdate({ notes: updatedNotes });
    
    // Send notifications for tagged users
    console.log('DEBUGGING: About to process mentions:', mentions);
    for (const mention of mentions) {
      const displayName = mention.substring(1); // Remove @ symbol
      console.log('Sending notification for tagged user:', displayName);
      console.log('sendTaggedNotification function type:', typeof sendTaggedNotification);
      console.log('sendTaggedNotification function:', sendTaggedNotification);
      try {
        console.log('About to call sendTaggedNotification with:', { workOrderId: workOrder.id, displayName, note: newNote.trim() });
        const result = await sendTaggedNotification(workOrder.id, displayName, newNote.trim());
        console.log('Notification call completed with result:', result);
        console.log('Notification sent successfully for:', displayName);
      } catch (error) {
        console.error('Error sending notification for:', displayName, error);
        console.error('Full error details:', error);
      }
    }
    
    setNewNote('');
    setIsAddingNote(false);
    toast({
      title: "Note Added",
      description: mentions.length > 0 ? `Note added with ${mentions.length} user(s) tagged` : "Your note has been added to the work order",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/avi'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image (JPG, PNG, GIF, WebP) or video (MP4, MOV, AVI)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingFile(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${workOrder.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('work-orders')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('work-orders')
        .getPublicUrl(filePath);

      // Add the file URL as a note
      const timestamp = new Date().toISOString();
      const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
                       user?.email || 'Unknown User';
      const fileNote = `${format(new Date(), 'MMM d, yyyy h:mm a')} - ${userName}: Attached ${file.type.startsWith('image/') ? 'image' : 'video'}: ${publicUrl}`;
      const updatedNotes = [...(workOrder.notes || []), fileNote];

      onUpdate({ notes: updatedNotes });
      setAdditionalImages(prev => [...prev, publicUrl]);

      toast({
        title: "File Uploaded",
        description: `${file.type.startsWith('image/') ? 'Image' : 'Video'} has been attached to the work order`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChangeCreatedBy = async () => {
    if (!selectedCreatorId || !isAdmin) return;

    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ user_id: selectedCreatorId })
        .eq('id', workOrder.id);

      if (error) throw error;

      // Update the work order in parent component
      onUpdate({ user_id: selectedCreatorId });
      setIsEditingCreatedBy(false);
      
      toast({
        title: "Created By Updated",
        description: "Work order creator has been changed successfully",
      });
    } catch (error) {
      console.error('Error updating created by:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update work order creator",
        variant: "destructive",
      });
    }
  };

  const handleChangeCreatedDate = async () => {
    if (!editedCreatedDate || !isAdmin) return;

    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ created_at: editedCreatedDate })
        .eq('id', workOrder.id);

      if (error) throw error;

      // Update the work order in parent component
      onUpdate({ created_at: editedCreatedDate });
      setIsEditingCreatedDate(false);
      
      toast({
        title: "Created Date Updated",
        description: "Work order creation date has been changed successfully",
      });
    } catch (error) {
      console.error('Error updating created date:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update work order creation date",
        variant: "destructive",
      });
    }
  };

  const getCreatorDisplayName = () => {
    const creator = users.find(u => u.user_id === workOrder.user_id);
    return creator ? getUserDisplayName(creator) : 'Unknown User';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-background rounded-lg shadow-lg flex flex-col overflow-hidden">
        <Card className="h-full flex flex-col border-0 shadow-none bg-transparent overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6 pt-6 flex-shrink-0 border-b">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold">Work Order Details</h2>
            <Badge variant="outline" className="text-xs">#{workOrder.id.slice(-8)}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 p-6 overflow-y-auto flex-1 overscroll-contain">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Store #</Label>
              <p className="text-lg font-semibold">{workOrder.store_number}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Market</Label>
              <p className="text-lg font-semibold">{workOrder.market}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Repair Type</Label>
              <p className="text-lg font-semibold">{workOrder.repair_type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              {isAdmin && isEditingCreatedDate ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="datetime-local"
                    value={editedCreatedDate}
                    onChange={(e) => setEditedCreatedDate(e.target.value)}
                    className="h-8"
                  />
                  <Button size="sm" onClick={handleChangeCreatedDate} disabled={!editedCreatedDate}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingCreatedDate(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(workOrder.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                  {isAdmin && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        // Convert the ISO string to datetime-local format
                        const date = new Date(workOrder.created_at);
                        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                          .toISOString()
                          .slice(0, 16);
                        setEditedCreatedDate(localDateTime);
                        setIsEditingCreatedDate(true);
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      Change
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
              {isAdmin && isEditingCreatedBy ? (
                <div className="flex items-center gap-2 mt-1">
                  <Select value={selectedCreatorId} onValueChange={setSelectedCreatorId}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {getUserDisplayName(user)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleChangeCreatedBy} disabled={!selectedCreatorId}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingCreatedBy(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    {getCreatorDisplayName()}
                  </div>
                  {isAdmin && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setSelectedCreatorId(workOrder.user_id);
                        setIsEditingCreatedBy(true);
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      Change
                    </Button>
                  )}
                </div>
              )}
            </div>
            {workOrder.completed_at && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Completed</Label>
                <div className="flex items-center text-sm text-success-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(workOrder.completed_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
            <p className="mt-1 p-3 bg-muted rounded-md">{workOrder.description}</p>
          </div>

          {/* Image */}
          {workOrder.image_url && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Original Attachment</Label>
              <div className="mt-1">
                <img 
                  src={workOrder.image_url} 
                  alt="Work order attachment" 
                  className="max-w-full h-auto max-h-64 rounded-md border"
                />
              </div>
            </div>
          )}

          {/* Additional Attachments */}
          {additionalImages.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Additional Attachments</Label>
              <div className="mt-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {additionalImages.map((imageUrl, index) => (
                  <div key={index} className="border rounded-md overflow-hidden">
                    {imageUrl.includes('.mp4') || imageUrl.includes('.mov') || imageUrl.includes('.avi') ? (
                      <video 
                        src={imageUrl} 
                        controls 
                        className="w-full h-auto max-h-64"
                      />
                    ) : (
                      <img 
                        src={imageUrl} 
                        alt={`Additional attachment ${index + 1}`} 
                        className="w-full h-auto max-h-64 object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Attachment Section */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">Add Photo/Video</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="flex items-center gap-2"
              >
                {uploadingFile ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Paperclip className="h-4 w-4" />
                    Attach File
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                Images (JPG, PNG, GIF, WebP) or Videos (MP4, MOV, AVI) • Max 10MB
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Assignee Section */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">Assignee</Label>
              <Select value={workOrder.assignee || 'unassigned'} onValueChange={handleAssigneeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {assigneeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>

          {/* Interactive Badges */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Status</Label>
              <Select value={workOrder.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                   <SelectValue>
                     <Badge className={statusColors[workOrder.status]}>
                       {workOrder.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                     </Badge>
                   </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50 max-h-48 overflow-y-auto">
                  <SelectItem value="pending">
                     <Badge className={statusColors.pending}>Pending</Badge>
                   </SelectItem>
                   <SelectItem value="pending-approval">
                     <Badge className={statusColors['pending-approval']}>Pending Approval</Badge>
                   </SelectItem>
                   <SelectItem value="in-progress">
                     <Badge className={statusColors['in-progress']}>In Progress</Badge>
                   </SelectItem>
                   <SelectItem value="on-hold">
                     <Badge className={statusColors['on-hold']}>On Hold</Badge>
                   </SelectItem>
                   <SelectItem value="completed">
                     <Badge className={statusColors.completed}>Completed</Badge>
                   </SelectItem>
                   <SelectItem value="cancelled">
                     <Badge className={statusColors.cancelled}>Cancelled</Badge>
                   </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select value={workOrder.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <Badge className={priorityColors[workOrder.priority]}>
                      {workOrder.priority}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="Low">
                    <Badge className={priorityColors.Low}>Low</Badge>
                  </SelectItem>
                  <SelectItem value="Important">
                    <Badge className={priorityColors.Important}>Important</Badge>
                  </SelectItem>
                  <SelectItem value="Critical">
                    <Badge className={priorityColors.Critical}>Critical</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">EcoSure</Label>
              <Select value={workOrder.ecosure} onValueChange={handleEcoSureChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <Badge className={ecoSureColors[workOrder.ecosure]}>
                      {workOrder.ecosure}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="N/A">
                    <Badge className={ecoSureColors['N/A']}>N/A</Badge>
                  </SelectItem>
                  <SelectItem value="Minor">
                    <Badge className={ecoSureColors.Minor}>Minor</Badge>
                  </SelectItem>
                  <SelectItem value="Major">
                    <Badge className={ecoSureColors.Major}>Major</Badge>
                  </SelectItem>
                  <SelectItem value="Critical">
                    <Badge className={ecoSureColors.Critical}>Critical</Badge>
                  </SelectItem>
                  <SelectItem value="Imminent Health">
                    <Badge className={ecoSureColors['Imminent Health']}>Imminent Health</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-muted-foreground flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                Notes & Updates
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNote(true)}
                disabled={isAddingNote}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Note
              </Button>
            </div>

            {/* Add Note Form */}
            {isAddingNote && (
              <div className="space-y-2 mb-4 p-3 border rounded-md bg-muted/20 relative">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Add a note or update... Use @DisplayName to tag users"
                    value={newNote}
                    onChange={handleTextareaChange}
                    onKeyDown={handleTextareaKeyDown}
                    className="min-h-[80px]"
                  />
                  
                  {/* User Suggestions Dropdown */}
                  {showUserSuggestions && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {userSuggestions.map((user, index) => (
                        <div
                          key={user.user_id}
                          className={`px-3 py-2 cursor-pointer text-sm border-b border-border last:border-b-0 ${
                            index === selectedSuggestionIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                          }`}
                          onClick={() => selectUser(user)}
                        >
                          <div className="font-medium">{getUserDisplayName(user)}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-2 flex items-center">
                  <AtSign className="h-3 w-3 mr-1" />
                  Tip: Type @DisplayName to tag and notify users (e.g., @John Smith)
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddNote}>
                    Add Note
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNote('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {workOrder.notes && workOrder.notes.length > 0 ? (
                workOrder.notes.map((note, index) => (
                  <div key={index} className="p-3 bg-muted rounded-md text-sm border-l-4 border-primary/20">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="break-words">{note}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm italic">No notes added yet</p>
              )}
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}