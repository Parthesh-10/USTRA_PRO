import { Link } from "react-router-dom";
import { Star, MapPin, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Salon } from "@/data/types";

const SalonCard = ({ salon }: { salon: Salon }) => {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group">
      <div className="relative overflow-hidden aspect-[16/10]">
        {/* Image or Placeholder */}
        {salon.image && !salon.image.includes("unsplash") ? (
          <img
            src={salon.image}
            alt={salon.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-2">
            <Scissors className="w-10 h-10 text-muted-foreground/30" />
            <span className="text-xs text-muted-foreground">No photo yet</span>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Salon name on image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white text-base drop-shadow-lg leading-tight">{salon.name}</h3>
        </div>

        {/* Open Now badge */}
        {salon.openNow && (
          <Badge className="absolute top-3 left-3 bg-salon-green text-salon-green-foreground border-0 text-xs">
            Open Now
          </Badge>
        )}

        {/* Rating */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-salon-gold text-salon-gold" />
          <span className="text-xs font-semibold text-white">{salon.rating}</span>
          <span className="text-xs text-white/70">({salon.reviewCount})</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{salon.address}</span>
          {salon.distance && (
            <>
              <span className="mx-1">•</span>
              <span className="flex-shrink-0">{salon.distance}</span>
            </>
          )}
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