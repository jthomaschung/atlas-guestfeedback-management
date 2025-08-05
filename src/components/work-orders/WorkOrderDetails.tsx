import { useState, useEffect, useRef } from 'react';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority, EcoSure } from '@/types/work-order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar, MessageSquare, Plus, X, User, AtSign } from 'lucide-react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const { sendCompletionNotification, sendTaggedNotification } = useNotifications();

  // Load users for tagging
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, display_name');
      if (data) {
        setUsers(data);
      }
    };
    loadUsers();
  }, []);

  // Helper function to get display name for a user
  const getUserDisplayName = (user: typeof users[0]) => {
    if (user.display_name) return user.display_name;
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || user.email.split('@')[0];
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl">Work Order Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(workOrder.created_at), 'MMM d, yyyy h:mm a')}
              </div>
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
              <Label className="text-sm font-medium text-muted-foreground">Attached Image</Label>
              <div className="mt-1">
                <img 
                  src={workOrder.image_url} 
                  alt="Work order attachment" 
                  className="max-w-full h-auto max-h-64 rounded-md border"
                />
              </div>
            </div>
          )}

          {/* Assignee Section */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">Assignee</Label>
            <Select value={workOrder.assignee || 'unassigned'} onValueChange={handleAssigneeChange}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {assigneeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interactive Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectContent>
                  <SelectItem value="pending">
                     <Badge className={statusColors.pending}>Pending</Badge>
                   </SelectItem>
                   <SelectItem value="pending-approval">
                     <Badge className={statusColors['pending-approval']}>Pending Approval</Badge>
                   </SelectItem>
                   <SelectItem value="in-progress">
                     <Badge className={statusColors['in-progress']}>In Progress</Badge>
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

            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Priority</Label>
              <Select value={workOrder.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <Badge className={priorityColors[workOrder.priority]}>
                      {workOrder.priority}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
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

            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">EcoSure</Label>
              <Select value={workOrder.ecosure} onValueChange={handleEcoSureChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <Badge className={ecoSureColors[workOrder.ecosure]}>
                      {workOrder.ecosure}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
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
  );
}