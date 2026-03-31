import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Clock, ArrowLeft, ChevronRight, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

const SalonDetails = () => {
  const { id } = useParams();
  const [salon, setSalon] = useState<any>(null);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [showBarberModal, setShowBarberModal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchSalonData()
  }, [id])

  async function fetchSalonData() {
    setLoading(true)

    // Fetch salon
    const { data: salonData } = await supabase
      .from("salons")
      .select("*")
      .eq("id", id)
      .single()

    // Fetch barbers
    const { data: barbersData } = await supabase
      .from("barbers")
      .select("*, barber_images(image_url)")
      .eq("salon_id", id)
      .eq("is_active", true)

    // Fetch services
    const { data: servicesData } = await supabase
      .from("services")
      .select("*")
      .eq("salon_id", id)
      .eq("is_active", true)

    setSalon(salonData)
    setBarbers(barbersData || [])
    setServices(servicesData || [])
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    </div>
  )

  if (!salon) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">Salon not found</p>
        <Link to="/"><Button variant="outline">Back to Home</Button></Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Banner */}
      <div className="relative h-56 md:h-72 bg-muted">
        {salon.image_url ? (
          <img src={salon.image_url} alt={salon.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <Scissors className="w-16 h-16 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 container mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-primary-foreground/80 text-sm mb-2 hover:text-primary-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">{salon.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-1 text-primary-foreground/80 text-sm">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-salon-gold text-salon-gold" />
              {salon.rating || "New"} ({salon.total_reviews || 0} reviews)
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {salon.address}, {salon.city}
            </span>
            <span className={`flex items-center gap-1 ${salon.is_verified ? "text-green-400" : "text-primary-foreground/60"}`}>
              <Clock className="w-4 h-4" />
              {salon.is_verified ? "Verified" : "Pending Verification"}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-10">

        {/* Description */}
        {salon.description && (
          <section>
            <p className="text-muted-foreground text-sm leading-relaxed">{salon.description}</p>
          </section>
        )}

        {/* Services */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Services</h2>
          {services.length === 0 ? (
            <p className="text-muted-foreground text-sm">No services listed yet.</p>
          ) : (
            <div className="grid gap-2">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-card rounded-lg p-4 shadow-card">
                  <div>
                    <p className="font-medium text-foreground text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.duration} mins</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">₹{s.price}</span>
                    <Link to={`/booking?salon=${salon.id}&service=${s.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">Book</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Barbers */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Our Barbers</h2>
          {barbers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No barbers listed yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setShowBarberModal(b)}
                  className={`bg-card rounded-xl p-4 shadow-card cursor-pointer transition-all border-2 ${
                    selectedBarber === b.id
                      ? "border-primary"
                      : "border-transparent hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {b.barber_images?.[0]?.image_url ? (
                      <img
                        src={b.barber_images[0].image_url}
                        alt={b.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Scissors className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{b.name}</h3>
                      <p className="text-xs text-muted-foreground">{b.experience} yrs exp</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3.5 h-3.5 fill-salon-gold text-salon-gold" />
                    <span className="text-xs font-medium">{b.rating || "New"}</span>
                    <span className="text-xs text-muted-foreground">({b.total_reviews || 0})</span>
                  </div>
                  {b.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {b.specialties.slice(0, 2).map((s: string) => (
                        <span key={s} className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant={selectedBarber === b.id ? "default" : "outline"}
                    className="w-full mt-3 text-xs"
                    onClick={(e) => { e.stopPropagation(); setSelectedBarber(b.id); }}
                  >
                    {selectedBarber === b.id ? "Selected ✓" : "Select"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <div className="sticky bottom-4">
          <Link to={`/booking?salon=${salon.id}${selectedBarber ? `&barber=${selectedBarber}` : ""}`}>
            <Button className="w-full gradient-primary text-primary-foreground border-0 py-6 text-base font-semibold shadow-lg">
              Book Appointment <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Barber Modal */}
      {showBarberModal && (
        <div
          className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4"
          onClick={() => setShowBarberModal(null)}
        >
          <div
            className="bg-card rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              {showBarberModal.barber_images?.[0]?.image_url ? (
                <img
                  src={showBarberModal.barber_images[0].image_url}
                  alt={showBarberModal.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Scissors className="w-8 h-8 text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-foreground">{showBarberModal.name}</h3>
                <p className="text-sm text-muted-foreground">{showBarberModal.experience} yrs experience</p>
                <p className="text-sm text-muted-foreground mt-1">{showBarberModal.bio}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-salon-gold text-salon-gold" />
                  <span className="text-sm font-medium">{showBarberModal.rating || "New"}</span>
                  <span className="text-xs text-muted-foreground">({showBarberModal.total_reviews || 0} reviews)</span>
                </div>
              </div>
            </div>

            {showBarberModal.specialties?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-foreground mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {showBarberModal.specialties.map((s: string) => (
                    <span key={s} className="text-xs bg-accent text-accent-foreground px-2.5 py-1 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBarberModal(null)}
              >
                Close
              </Button>
              <Link
                to={`/booking?salon=${salon.id}&barber=${showBarberModal.id}`}
                className="flex-1"
              >
                <Button className="w-full gradient-primary text-primary-foreground border-0">
                  Book with {showBarberModal.name}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonDetails;