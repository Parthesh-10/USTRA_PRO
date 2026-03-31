import { TimeSlot } from "@/data/types";

const TimeSlotGrid = ({
  slots,
  selected,
  onSelect,
}: {
  slots: TimeSlot[];
  selected: string | null;
  onSelect: (time: string) => void;
}) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.time}
          disabled={!slot.available}
          onClick={() => onSelect(slot.time)}
          className={`text-sm py-2.5 px-2 rounded-lg border transition-all duration-200 font-medium ${
            !slot.available
              ? "bg-muted text-muted-foreground/40 border-border cursor-not-allowed line-through"
              : selected === slot.time
              ? "gradient-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card text-foreground border-border hover:border-primary hover:bg-accent"
          }`}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
};

export default TimeSlotGrid;
