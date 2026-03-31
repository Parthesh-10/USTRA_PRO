import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Barber } from "@/data/types";

const BarberCard = ({
  barber,
  onSelect,
  selected,
}: {
  barber: Barber;
  onSelect?: (id: string) => void;
  selected?: boolean;
}) => {
  return (
    <div
      className={`bg-card rounded-lg p-4 shadow-card transition-all duration-200 ${
        selected ? "ring-2 ring-primary" : "hover:shadow-card-hover"
      }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={barber.image}
          alt={barber.name}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm">{barber.name}</h4>
          <p className="text-xs text-muted-foreground mb-1">{barber.experience} experience</p>
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-salon-gold text-salon-gold" />
            <span className="text-xs font-medium text-foreground">{barber.rating}</span>
            <span className="text-xs text-muted-foreground">({barber.reviewCount})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {barber.specialties.slice(0, 2).map((s) => (
              <span key={s} className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      {onSelect && (
        <Button
          size="sm"
          variant={selected ? "default" : "outline"}
          className={`w-full mt-3 ${selected ? "gradient-primary text-primary-foreground border-0" : ""}`}
          onClick={() => onSelect(barber.id)}
        >
          {selected ? "Selected" : "Select Barber"}
        </Button>
      )}
    </div>
  );
};

export default BarberCard;
