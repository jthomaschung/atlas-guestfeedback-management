import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface StoreFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedMarket: string;
  onMarketChange: (value: string) => void;
  markets: string[];
}

export const StoreFilters = ({
  searchQuery,
  onSearchChange,
  selectedMarket,
  onMarketChange,
  markets
}: StoreFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by store #, name, or manager..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={selectedMarket} onValueChange={onMarketChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Markets" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Markets</SelectItem>
          {markets.map((market) => (
            <SelectItem key={market} value={market}>
              {market}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
