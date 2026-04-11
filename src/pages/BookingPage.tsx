import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight, Calendar as CalendarIcon, Zap, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const steps = ["Service", "Barber", "Date & Time"];

const BookingPage = () => {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const salonId = params.get("salon");
  const preSelectedBarber = params.get("barber");
  const preSelectedService = params.get("service");

  const [salon, setSalon] = useState<any>(null);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    preSelectedService ? [preSelectedService] : []
  );
  const [selectedBarber, setSelectedBarber] = useState<string | null>(preSelectedBarber || null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isRushHour, setIsRushHour] = useState(false);

  // Time slots 9am - 8pm every 30 mins
  const allSlots = Array.from({ length: 22 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const min = i % 2 === 0 ? "00" : "30";
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${min} ${ampm}`;
  });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (salonId) fetchData();
  }, [salonId, user]);

  useEffect(() => {
    if (selectedDate && selectedBarber) fetchBookedSlots();
  }, [selectedDate, selectedBarber]);

  // Check if selected time is within rush hour
  useEffect(() => {
    if (!selectedTime || !salon?.rush_hour_enabled || !salon?.rush_hour_start || !salon?.rush_hour_end) {
      setIsRushHour(false);
      return;
    }

    // Convert selected time to 24hr
    const [timePart, ampm] = selectedTime.split(" ");
    const [h, m] = timePart.split(":");
    let hour = parseInt(h);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    const selectedMinutes = hour * 60 + parseInt(m);

    // Convert rush hour times to minutes
    const [startH, startM] = salon.rush_hour_start.split(":").map(Number);
    const [endH, endM] = salon.rush_hour_end.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    setIsRushHour(selectedMinutes >= startMinutes && selectedMinutes < endMinutes);
  }, [selectedTime, salon]);

  async function fetchData() {
    setLoading(true);
    const [salonRes, barbersRes, servicesRes] = await Promise.all([
      supabase.from("salons").select("*").eq("id", salonId).single(),
      supabase.from("barbers").select("*").eq("salon_id", salonId).eq("is_active", true),
      supabase.from("services").select("*").eq("salon_id", salonId).eq("is_active", true),
    ]);
    setSalon(salonRes.data);
    setBarbers(barbersRes.data || []);
    setServices(servicesRes.data || []);
    setLoading(false);
  }

  async function fetchBookedSlots() {
    if (!selectedBarber || !selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { data } = await supabase
      .from("bookings")
      .select("booking_time")
      .eq("barber_id", selectedBarber)
      .eq("booking_date", dateStr)
      .neq("status", "cancelled");

    setBookedSlots(data?.map((b) => {
      const [h, m] = b.booking_time.split(":");
      const hour = parseInt(h);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${m} ${ampm}`;
    }) || []);
  }

  async function handleBooking() {
    if (!user || !salon || !selectedDate || !selectedTime || !selectedBarber) return;
    setBooking(true);
    setError('');

    const [timePart, ampm] = selectedTime.split(" ");
    const [h, m] = timePart.split(":");
    let hour = parseInt(h);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    const timeStr = `${hour.toString().padStart(2, "0")}:${m}:00`;
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const serviceId = selectedServices[0];
    const serviceTotal = selectedServices.reduce((sum, id) => {
      const svc = services.find((s) => s.id === id);
      return sum + (svc?.price || 0);
    }, 0);

    const rushFee = isRushHour ? (salon.rush_fee || 0) : 0;
    const totalAmount = serviceTotal + rushFee;

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        salon_id: salon.id,
        barber_id: selectedBarber === "any" ? null : selectedBarber,
        service_id: serviceId,
        booking_date: dateStr,
        booking_time: timeStr,
        status: "pending",
        payment_status: "pending",
        total_amount: totalAmount,
        is_rush_hour: isRushHour,
        rush_fee: rushFee,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        setError("This slot was just booked! Please choose another time.");
      } else {
        setError(error.message);
      }
      setBooking(false);
    } else {
      navigate(`/payment?booking=${data.id}&total=${totalAmount}`);
    }
  }

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const serviceTotal = selectedServices.reduce((sum, id) => {
    const svc = services.find((s) => s.id === id);
    return sum + (svc?.price || 0);
  }, 0);

  const rushFee = isRushHour ? (salon?.rush_fee || 0) : 0;
  const totalPrice = serviceTotal + rushFee;

  // Check if a time slot is within rush hours
  function isSlotRushHour(slot: string): boolean {
    if (!salon?.rush_hour_enabled || !salon?.rush_hour_start || !salon?.rush_hour_end) return false;
    const [timePart, ampm] = slot.split(" ");
    const [h, m] = timePart.split(":");
    let hour = parseInt(h);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    const slotMinutes = hour * 60 + parseInt(m);
    const [startH, startM] = salon.rush_hour_start.split(":").map(Number);
    const [endH, endM] = salon.rush_hour_end.split(":").map(Number);
    return slotMinutes >= startH * 60 + startM && slotMinutes < endH * 60 + endM;
  }

  const canProceed =
    (step === 0 && selectedServices.length > 0) ||
    (step === 1 && selectedBarber !== null) ||
    (step === 2 && selectedDate && selectedTime);

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Link to={`/salon/${salonId}`} className="inline-flex items-center gap-1 text-muted-foreground text-sm mb-4 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to {salon?.name}
        </Link>

        {/* Salon info bar */}
        {salon && (
          <div className="bg-card rounded-xl p-3 mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground text-sm">{salon.name}</p>
              <p className="text-xs text-muted-foreground">{salon.address}, {salon.city}</p>
            </div>
            <div className="flex items-center gap-3">
              {salon.rush_hour_enabled && (
                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-amber-500 font-medium">Rush Hour Available</span>
                </div>
              )}
              {salon.phone && (
                <a href={`tel:${salon.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-xs">{salon.phone}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                i < step ? "bg-green-500 text-white" :
                i === step ? "gradient-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {s}
              </span>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 0 — Services */}
        {step === 0 && (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground">Select Services</h2>
            {services.length === 0 ? (
              <p className="text-muted-foreground text-sm">No services available for this salon.</p>
            ) : (
              services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                    selectedServices.includes(s.id)
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.duration} mins</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">₹{s.price}</span>
                    {selectedServices.includes(s.id) && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Step 1 — Barbers */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground">Select Barber</h2>
            {barbers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No barbers available.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setSelectedBarber("any")}>
                  Continue with any barber
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {barbers.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBarber(b.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all bg-card ${
                      selectedBarber === b.id ? "border-primary bg-accent" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {b.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.experience} yrs exp</p>
                      </div>
                      {selectedBarber === b.id && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    {b.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {b.specialties.slice(0, 2).map((s: string) => (
                          <span key={s} className="text-xs bg-muted px-2 py-0.5 rounded-md">{s}</span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Date & Time */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground">Select Date & Time</h2>

            {/* Rush Hour Info Banner */}
            {salon?.rush_hour_enabled && salon?.rush_hour_start && salon?.rush_hour_end && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-500">Rush Hour Available ⚡</p>
                  <p className="text-xs text-amber-500/80 mt-0.5">
                    Slots between {salon.rush_hour_start.slice(0, 5)} – {salon.rush_hour_end.slice(0, 5)} are Rush Hour.
                    Priority service with +₹{salon.rush_fee} extra charge.
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Date</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => { setSelectedDate(date); setSelectedTime(null); }}
                    disabled={(date) => date < new Date()}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {selectedDate && (
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  Available Slots
                  {salon?.rush_hour_enabled && (
                    <span className="ml-2 text-xs text-amber-500">⚡ = Rush Hour (+₹{salon.rush_fee})</span>
                  )}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {allSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = selectedTime === slot;
                    const isRush = isSlotRushHour(slot);
                    return (
                      <button
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all relative ${
                          isBooked
                            ? "bg-muted text-muted-foreground/40 cursor-not-allowed line-through"
                            : isSelected
                            ? "gradient-primary text-primary-foreground"
                            : isRush
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-600 hover:bg-amber-500/20"
                            : "bg-card border border-border hover:border-primary text-foreground"
                        }`}
                      >
                        {slot}
                        {isRush && !isBooked && (
                          <span className="absolute -top-1 -right-1 text-xs">⚡</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rush Hour confirmation when rush slot selected */}
            {isRushHour && selectedTime && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <p className="text-sm font-semibold text-amber-500">Rush Hour Slot Selected!</p>
                </div>
                <p className="text-xs text-amber-500/80">
                  You'll get priority service. An extra ₹{salon?.rush_fee} rush fee applies.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Booking Summary */}
        <div className="mt-8 bg-card rounded-xl p-5 shadow-card space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Booking Summary</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Salon</span>
              <span className="text-foreground">{salon?.name}</span>
            </div>
            {selectedServices.length > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Services</span>
                <span className="text-foreground text-right">
                  {selectedServices.map(id => services.find(s => s.id === id)?.name).join(", ")}
                </span>
              </div>
            )}
            {selectedBarber && (
              <div className="flex justify-between text-muted-foreground">
                <span>Barber</span>
                <span className="text-foreground">
                  {selectedBarber === "any" ? "Any available" : barbers.find(b => b.id === selectedBarber)?.name}
                </span>
              </div>
            )}
            {selectedDate && selectedTime && (
              <div className="flex justify-between text-muted-foreground">
                <span>When</span>
                <span className="text-foreground">{format(selectedDate, "dd MMM")} at {selectedTime}</span>
              </div>
            )}
            {serviceTotal > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Service Total</span>
                <span className="text-foreground">₹{serviceTotal}</span>
              </div>
            )}
            {isRushHour && rushFee > 0 && (
              <div className="flex justify-between text-amber-500">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Rush Fee
                </span>
                <span>+₹{rushFee}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          {step < 2 ? (
            <Button
              className="flex-1 gradient-primary text-primary-foreground border-0"
              disabled={!canProceed}
              onClick={() => setStep(step + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="flex-1 gradient-primary text-primary-foreground border-0"
              disabled={!canProceed || booking}
              onClick={handleBooking}
            >
              {booking ? "Booking..." : isRushHour ? `⚡ Confirm Rush Booking (₹${totalPrice})` : `Confirm Booking (₹${totalPrice})`}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;