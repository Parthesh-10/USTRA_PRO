import { useState } from "react";
import { Star, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const filterOptions = {
  rating: ["4.5+", "4.0+", "3.5+"],
  distance: ["< 1 km", "< 3 km", "< 5 km", "< 10 km"],
  price: ["Budget", "Mid-range", "Premium"],
  services: ["Haircut", "Beard", "Hair Color", "Spa", "Facial", "Keratin"],
};

const FilterBar = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters((prev) => {
      if (prev[category] === value) {
        const next = { ...prev };
        delete next[category];
        return next;
      }
      return { ...prev, [category]: value };
    });
  };

  const clearAll = () => setActiveFilters({});
  const filterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "gradient-primary text-primary-foreground border-0" : ""}
        >
          <SlidersHorizontal className="w-4 h-4 mr-1.5" />
          Filters
          {filterCount > 0 && (
            <span className="ml-1.5 bg-primary-foreground/20 text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {filterCount}
            </span>
          )}
        </Button>

        {Object.entries(activeFilters).map(([cat, val]) => (
          <span
            key={cat}
            className="flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap"
            onClick={() => toggleFilter(cat, val)}
          >
            {val}
            <X className="w-3 h-3" />
          </span>
        ))}

        {filterCount > 0 && (
          <button className="text-xs text-primary font-medium whitespace-nowrap" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-card rounded-lg p-4 shadow-card space-y-4 animate-fade-in">
          {Object.entries(filterOptions).map(([category, options]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggleFilter(category, opt)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      activeFilters[category] === opt
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
