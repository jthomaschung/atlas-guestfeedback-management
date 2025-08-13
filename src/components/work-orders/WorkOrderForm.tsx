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
  { value: 'Slicer', label: 'Slicer' },
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
  { value: 'PA', label: 'PA' },
];

const ecoSureOptions = [
  { value: 'N/A', label: 'N/A' },
  { value: 'Minor', label: 'Minor' },
  { value: 'Major', label: 'Major' },
  { value: 'Critical', label: 'Critical' },
  { value: 'Imminent Health', label: 'Imminent Health' },
];

const storeNumbers = [
  '522', '746', '799', '833', '838', '877', '930', '965', '1002', '1018',
  '1019', '1061', '1111', '1127', '1206', '1261', '1307', '1337', '1342', '1355',
  '1440', '1441', '1554', '1556', '1562', '1635', '1694', '1695', '1696', '1762',
  '1779', '1789', '1955', '1956', '1957', '2006', '2021', '2176', '2178', '2180',
  '2391', '2500', '2501', '2502', '2503', '2504', '2601', '2682', '2683', '2711',
  '2712', '2749', '2807', '2808', '2811', '2812', '2821', '2873', '2874', '2876',
  '2883', '2884', '3029', '3030', '3187', '3260', '3391', '3612', '3613', '3635',
  '3686', '3972', '4018', '4022', '4024', '4105', '4330', '4358', '4586'
].map(num => ({ value: `#${num}`, label: `#${num}` }));


export function WorkOrderForm({ onSubmit, onCancel, initialData }: WorkOrderFormProps) {
  const [formData, setFormData] = useState<WorkOrderFormData>({
    description: initialData?.description || '',
    repair_type: initialData?.repair_type || 'General Maintenance',
    store_number: initialData?.store_number || '',
    market: initialData?.market || 'AZ1',
    priority: initialData?.priority || 'Low',
    ecosure: initialData?.ecosure || 'N/A',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.store_number) {
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
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the work order"
                rows={3}
                required
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Repair Type *</Label>
                <Select 
                  value={formData.repair_type} 
                  onValueChange={(value: RepairType) => 
                    setFormData({ ...formData, repair_type: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
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
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Store Number *</Label>
                <Select 
                  value={formData.store_number} 
                  onValueChange={(value: string) => 
                    setFormData({ ...formData, store_number: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select store number" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {storeNumbers.map((store) => (
                      <SelectItem key={store.value} value={store.value}>
                        {store.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Market *</Label>
                <Select 
                  value={formData.market} 
                  onValueChange={(value: Market) => 
                    setFormData({ ...formData, market: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {markets.map((market) => (
                      <SelectItem key={market.value} value={market.value}>
                        {market.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>EcoSure *</Label>
                <Select 
                  value={formData.ecosure} 
                  onValueChange={(value) => 
                    setFormData({ ...formData, ecosure: value as any })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
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
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {initialData ? 'Update Work Order' : 'Create Work Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}