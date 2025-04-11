'use client';

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HistoryFiltersProps {
  onSearch: (search: string) => void;
  onSeriesFilter: (series: string) => void;
  seriesList: string[];
}

export function HistoryFilters({ 
  onSearch, 
  onSeriesFilter,
  seriesList 
}: HistoryFiltersProps) {
  return (
    <div className="flex gap-4 mb-8">
      <Input 
        placeholder="Search titles..." 
        className="max-w-sm"
        onChange={(e) => onSearch(e.target.value)}
      />
      <Select onValueChange={onSeriesFilter}>
        <SelectTrigger>
          <SelectValue placeholder="All Series" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Series</SelectItem>
          {seriesList.map((series) => (
            <SelectItem key={series} value={series}>
              {series}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
