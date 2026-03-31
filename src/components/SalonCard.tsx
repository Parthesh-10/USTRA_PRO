import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Salon } from "@/data/types";

const SalonCard = ({ salon }: { salon: Salon }) => {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group">
      <div className="relative overflow-hidden aspect-[16/10]">
        <img
          src={salon.image}
          alt={salon.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {salon.openNow && (
          <Badge className="absolute top-3 left-3 bg-salon-green text-salon-green-foreground border-0 text-xs">
            Open Now
          </Badge>
        )}
        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-salon-gold text-salon-gold" />
          <span className="text-xs font-semibold text-foreground">{salon.rating}</span>
          <span className="text-xs text-muted-foreground">({salon.reviewCount})</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-base mb-1">{salon.name}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{salon.address}</span>
          <span className="mx-1">•</span>
          <span>{salon.distance}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {salon.services.slice(0, 3).map((s) => (
            <span key={s} className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-md">{s}</span>
          ))}
          {salon.services.length > 3 && (
            <span className="text-xs text-muted-foreground">+{salon.services.length - 3}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{salon.priceRange}</span>
          <Link to={`/salon/${salon.id}`}>
            <Button size="sm" className="gradient-primary text-primary-foreground border-0 hover:opacity-90">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SalonCard;
