import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterControlsProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  specialtyFilter: string[];
  toggleSpecialtyFilter: (specialty: string) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  maxDistance: number;
  setMaxDistance: (distance: number) => void;
  allSpecialties: string[];
  filteredCount: number;
  resetFilters: () => void;
}

const FilterControls = ({
  statusFilter,
  setStatusFilter,
  specialtyFilter,
  toggleSpecialtyFilter,
  minRating,
  setMinRating,
  maxDistance,
  setMaxDistance,
  allSpecialties,
  filteredCount,
  resetFilters,
}: FilterControlsProps) => {
  return (
    <div className="absolute left-4 top-4 z-10 flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="bg-white">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <h3 className="font-medium">Filter Mechanics</h3>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Status</h4>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Minimum Rating</h4>
              <div className="flex items-center gap-4">
                <Slider
                  value={[minRating]}
                  min={0}
                  max={5}
                  step={0.5}
                  onValueChange={(value) => setMinRating(value[0])}
                />
                <span className="w-12 text-center">{minRating}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Maximum Distance (miles)</h4>
              <div className="flex items-center gap-4">
                <Slider
                  value={[maxDistance]}
                  min={0.5}
                  max={10}
                  step={0.5}
                  onValueChange={(value) => setMaxDistance(value[0])}
                />
                <span className="w-12 text-center">{maxDistance}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Specialties</h4>
              <div className="grid grid-cols-2 gap-2">
                {allSpecialties.map((specialty) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`specialty-${specialty}`}
                      checked={specialtyFilter.includes(specialty)}
                      onCheckedChange={() => toggleSpecialtyFilter(specialty)}
                    />
                    <Label
                      htmlFor={`specialty-${specialty}`}
                      className="text-sm"
                    >
                      {specialty}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset
              </Button>
              <Button size="sm">Apply Filters</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="bg-white rounded-md border px-3 py-2 text-sm flex items-center gap-1">
        <span className="text-muted-foreground">Results:</span>
        <span className="font-medium">{filteredCount}</span>
      </div>
    </div>
  );
};

export default FilterControls;
