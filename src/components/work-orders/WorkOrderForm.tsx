import { useState } from "react";
import { WorkOrderFormData, RepairType, WorkOrderPriority, Market } from "@/types/work-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface WorkOrderFormProps {
  onSubmit: (data: WorkOrderFormData) => void;
  onCancel: () => void;
  initialData?: Partial<WorkOrderFormData>;
}

const repairTypes: { value: RepairType; label: string }[] = [
  { value: 'AC / Heating', label: 'AC / Heating' },
  { value: 'Walk In Cooler / Freezer', label: 'Walk In Cooler / Freezer' },
  { value: 'Ice Machine', label: 'Ice Machine' },
  { value: 'Cold Tables', label: 'Cold Tables' },
  { value: 'Oven / Proofer', label: 'Oven / Proofer' },
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'General Maintenance', label: 'General Maintenance' },
  { value: 'Exterior Signage', label: 'Exterior Signage' },
  { value: 'Retarder', label: 'Retarder' },
  { value: 'Toasted Sandwich Oven', label: 'Toasted Sandwich Oven' },
  { value: 'POS / Network', label: 'POS / Network' },
  { value: 'Doors / Windows', label: 'Doors / Windows' },
];

const priorities: { value: WorkOrderPriority; label: string }[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Important', label: 'Important' },
  { value: 'Critical', label: 'Critical' },
];

const markets: { value: Market; label: string }[] = [
  { value: 'AZ1', label: 'AZ1' },
  { value: 'AZ2', label: 'AZ2' },
  { value: 'AZ3', label: 'AZ3' },
  { value: 'AZ4', label: 'AZ4' },
  { value: 'AZ5', label: 'AZ5' },
  { value: 'IE/LA', label: 'IE/LA' },
  { value: 'OC', label: 'OC' },
  { value: 'MN1', label: 'MN1' },
  { value: 'MN2', label: 'MN2' },
  { value: 'NE1', label: 'NE1' },
  { value: 'NE2', label: 'NE2' },
  { value: 'NE3', label: 'NE3' },
  { value: 'NE4', label: 'NE4' },
  { value: 'FL1', label: 'FL1' },
  { value: 'FL2', label: 'FL2' },
  { value: 'FL3', label: 'FL3' },
  { value: 'PA', label: 'PA' },
];

const ecoSureOptions = [
  { value: 'N/A', label: 'N/A' },
  { value: 'Minor', label: 'Minor' },
  { value: 'Major', label: 'Major' },
  { value: 'Critical', label: 'Critical' },
  { value: 'Imminent Health', label: 'Imminent Health' },
];


export function WorkOrderForm({ onSubmit, onCancel, initialData }: WorkOrderFormProps) {
  const [formData, setFormData] = useState<WorkOrderFormData>({
    description: initialData?.description || '',
    repair_type: initialData?.repair_type || 'General Maintenance',
    store_number: initialData?.store_number || '',
    market: initialData?.market || 'AZ1',
    priority: initialData?.priority || 'Low',
    ecosure: initialData?.ecosure || 'N/A',
  });

  const [storeNumberError, setStoreNumberError] = useState('');

  const validateStoreNumber = (value: string) => {
    const pattern = /^#?\d{3,4}$/;
    if (!value) {
      setStoreNumberError('Store number is required');
      return false;
    }
    if (!pattern.test(value)) {
      setStoreNumberError('Store number must be 3-4 digits (e.g., #1234 or 1234)');
      return false;
    }
    setStoreNumberError('');
    return true;
  };

  const handleStoreNumberChange = (value: string) => {
    // Auto-add # prefix if user enters just numbers
    let formattedValue = value;
    if (value && !value.startsWith('#') && /^\d/.test(value)) {
      formattedValue = '#' + value;
    }
    setFormData({ ...formData, store_number: formattedValue });
    validateStoreNumber(formattedValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStoreNumber(formData.store_number)) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Work Order' : 'Create New Work Order'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the work order"
                rows={3}
                required
              />
            </div>
            
            <div>
              <Label>Repair Type *</Label>
              <Select 
                value={formData.repair_type} 
                onValueChange={(value: RepairType) => 
                  setFormData({ ...formData, repair_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {repairTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Priority *</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: WorkOrderPriority) => 
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="store_number">Store Number *</Label>
              <Input
                id="store_number"
                value={formData.store_number}
                onChange={(e) => handleStoreNumberChange(e.target.value)}
                placeholder="#1234"
                required
                className={storeNumberError ? 'border-destructive' : ''}
              />
              {storeNumberError && (
                <p className="text-sm text-destructive mt-1">{storeNumberError}</p>
              )}
            </div>
            
            <div>
              <Label>Market *</Label>
              <Select 
                value={formData.market} 
                onValueChange={(value: Market) => 
                  setFormData({ ...formData, market: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {markets.map((market) => (
                    <SelectItem key={market.value} value={market.value}>
                      {market.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>EcoSure *</Label>
              <Select 
                value={formData.ecosure} 
                onValueChange={(value) => 
                  setFormData({ ...formData, ecosure: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ecoSureOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            
            <div>
              <Label htmlFor="image">Image (Optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] })}
              />
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update Work Order' : 'Create Work Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}