import { Link, useNavigate } from "react-router-dom";
import { Star, MapPin, Slice, Phone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Salon } from "@/data/types";

const SalonCard = ({ salon }: { salon: Salon }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/salon/${salon.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group cursor-pointer border border-[#FFFFFF]/30"
    >
      <div className="relative overflow-hidden aspect-[16/10]">
        {/* Image or Placeholder */}
        {salon.image && !salon.image.includes("unsplash") ? (
          <img
            src={salon.image}
            alt={salon.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#FFFFFF] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
              <Slice className="w-6 h-6 text-primary/30" />
            </div>
            <span className="text-xs font-medium text-[#9AA899]">No photo available</span>
          </div>
        )}

        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFFFFF]/20 to-transparent" />

        {/* Open Now badge */}
        {salon.openNow && (
          <Badge className="absolute top-3 left-3 bg-[#FFFFFF] text-[#54577C] border-0 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
            OPEN
          </Badge>
        )}

        {/* Rush Hour badge */}
        {salon.rushHourEnabled && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-[#4A7B9D] text-white border-0 text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg shadow-sm">
              <Zap className="w-2.5 h-2.5" /> RUSH
            </Badge>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-[#54577C] text-lg leading-tight group-hover:text-primary transition-colors">{salon.name}</h3>
          {/* Rating */}
          <div className="flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-[#54577C]">{salon.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#9AA899] text-sm mb-4">
          <MapPin className="w-4 h-4 text-[#9AA899] flex-shrink-0" />
          <span className="truncate">{salon.address}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {salon.services.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] font-bold uppercase tracking-wider bg-[#FFFFFF] text-[#9AA899] border border-[#FFFFFF] px-2 py-1 rounded-md">{s}</span>
          ))}
          {salon.services.length > 3 && (
            <span className="text-[10px] font-bold text-[#9AA899] mt-1">+{salon.services.length - 3} MORE</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#FFFFFF]/30">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#9AA899] uppercase tracking-widest">Starting at</span>
            <span className="text-lg font-extrabold text-[#54577C]">{salon.priceRange === "₹₹" ? "₹299" : salon.priceRange}</span>
          </div>
          <Button size="sm" className="gradient-primary text-white border-0 shadow-sm shadow-primary/20 rounded-xl px-5 py-5 group-hover:scale-105 transition-transform">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};



export default SalonCard;