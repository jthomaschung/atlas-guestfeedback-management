import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ManageMarketsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markets: { market: string; count: number }[];
  onRefresh: () => void;
}

export const ManageMarketsDialog = ({ open, onOpenChange, markets, onRefresh }: ManageMarketsDialogProps) => {
  const { toast } = useToast();
  const [newMarket, setNewMarket] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMarket = async () => {
    if (!newMarket.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a market name',
        variant: 'destructive'
      });
      return;
    }

    setIsAdding(true);
    try {
      // Check if market already exists
      const exists = markets.some(m => m.market.toLowerCase() === newMarket.trim().toLowerCase());
      if (exists) {
        toast({
          title: 'Error',
          description: 'This market already exists',
          variant: 'destructive'
        });
        return;
      }

      // Create a placeholder store for the new market
      const { error } = await supabase
        .from('stores')
        .insert([{
          store_number: `${newMarket.toUpperCase()}-PLACEHOLDER`,
          store_name: `${newMarket} Market Placeholder`,
          region: newMarket.trim(),
          is_active: false
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Market "${newMarket}" created successfully`
      });

      setNewMarket('');
      onRefresh();
    } catch (error: any) {
      console.error('Error adding market:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add market',
        variant: 'destructive'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteMarket = async (marketName: string, count: number) => {
    if (count > 0) {
      toast({
        title: 'Cannot Delete',
        description: 'This market has stores assigned. Please reassign or delete all stores first.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('region', marketName);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Market "${marketName}" deleted successfully`
      });

      onRefresh();
    } catch (error: any) {
      console.error('Error deleting market:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete market',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Markets</DialogTitle>
          <DialogDescription>
            Add new markets or remove empty ones
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="new-market">New Market Name</Label>
              <Input
                id="new-market"
                value={newMarket}
                onChange={(e) => setNewMarket(e.target.value)}
                placeholder="e.g., AZ 6, FL 3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMarket();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleAddMarket}
              disabled={isAdding || !newMarket.trim()}
              className="mt-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Existing Markets</Label>
            <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto space-y-2">
              {markets.map((market) => (
                <div
                  key={market.market}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{market.market}</span>
                    <Badge variant="secondary">{market.count} stores</Badge>
                  </div>
                  {market.count === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMarket(market.market, market.count)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
