import { useState } from 'react';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority, EcoSure } from '@/types/work-order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar, MessageSquare, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  onUpdate: (updates: Partial<WorkOrder>) => void;
  onClose: () => void;
}

const statusColors = {
  pending: 'bg-warning/20 text-warning-foreground border-warning/40 hover:bg-warning/30',
  'in-progress': 'bg-info/20 text-info-foreground border-info/40 hover:bg-info/30',
  completed: 'bg-success/20 text-success-foreground border-success/40 hover:bg-success/30',
  cancelled: 'bg-muted text-muted-foreground border-muted-foreground/40 hover:bg-muted/30',
};

const priorityColors = {
  Low: 'bg-muted/40 text-muted-foreground border-muted-foreground/40 hover:bg-muted/30',
  Important: 'bg-warning/20 text-warning-foreground border-warning/40 hover:bg-warning/30',
  Critical: 'bg-destructive/20 text-destructive-foreground border-destructive/40 hover:bg-destructive/30',
};

const ecoSureColors = {
  'N/A': 'bg-muted/20 text-muted-foreground border-muted-foreground/40 hover:bg-muted/30',
  'Minor': 'bg-info/20 text-info-foreground border-info/40 hover:bg-info/30',
  'Major': 'bg-warning/20 text-warning-foreground border-warning/40 hover:bg-warning/30',
  'Critical': 'bg-destructive/20 text-destructive-foreground border-destructive/40 hover:bg-destructive/30',
  'Imminent Health': 'bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90',
};

const assigneeOptions = [
  { value: '', label: 'Unassigned' },
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
  const { toast } = useToast();

  const handleStatusChange = (newStatus: WorkOrderStatus) => {
    onUpdate({ status: newStatus });
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
    onUpdate({ assignee: newAssignee || undefined });
    toast({
      title: "Assignee Updated",
      description: `Work order assignee changed to ${newAssignee || 'Unassigned'}`,
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const timestamp = new Date().toISOString();
    const noteWithTimestamp = `${format(new Date(), 'MMM d, yyyy h:mm a')}: ${newNote.trim()}`;
    const updatedNotes = [...(workOrder.notes || []), noteWithTimestamp];
    
    onUpdate({ notes: updatedNotes });
    setNewNote('');
    setIsAddingNote(false);
    toast({
      title: "Note Added",
      description: "Your note has been added to the work order",
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
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
            <p className="mt-1 p-3 bg-muted rounded-md">{workOrder.description}</p>
          </div>

          {/* Assignee Section */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">Assignee</Label>
            <Select value={workOrder.assignee || ''} onValueChange={handleAssigneeChange}>
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
                      {workOrder.status.replace('-', ' ')}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <Badge className={statusColors.pending}>Pending</Badge>
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
              <div className="space-y-2 mb-4 p-3 border rounded-md bg-muted/20">
                <Textarea
                  placeholder="Add a note or update..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px]"
                />
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
                  <div key={index} className="p-3 bg-muted rounded-md text-sm">
                    {note}
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