import { useState, useEffect } from "react";
import { Users, CalendarDays, BarChart3, Clock, Plus, TrendingUp, DollarSign, Scissors, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = [
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "barbers", label: "Barbers", icon: Users },
  { id: "services", label: "Services", icon: Scissors },
  { id: "earnings", label: "Earnings", icon: BarChart3 },
];

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("bookings");
  const [salon, setSalon] = useState<any>(null);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add barber form
  const [showAddBarber, setShowAddBarber] = useState(false);
  const [newBarber, setNewBarber] = useState({ name: "", experience: "", specialties: "", bio: "" });

  // Add service form
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: "", price: "", duration: "" });

  // Add salon form
  const [showAddSalon, setShowAddSalon] = useState(false);
  const [newSalon, setNewSalon] = useState({ name: "", description: "", address: "", city: "", state: "" });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "owner" && user.role !== "admin") { navigate("/"); return; }
    fetchOwnerData();
  }, [user]);

  async function fetchOwnerData() {
    setLoading(true);

    // Get owner's salon
    const { data: salonData } = await supabase
      .from("salons")
      .select("*")
      .eq("owner_id", user?.id)
      .single();

    if (salonData) {
      setSalon(salonData);

      // Fetch barbers, services, bookings in parallel
      const [barbersRes, servicesRes, bookingsRes] = await Promise.all([
        supabase.from("barbers").select("*").eq("salon_id", salonData.id),
        supabase.from("services").select("*").eq("salon_id", salonData.id),
        supabase.from("bookings")
          .select("*, users(name, phone), services(name), barbers(name)")
          .eq("salon_id", salonData.id)
          .order("booking_date", { ascending: false })
          .limit(50),
      ]);

      setBarbers(barbersRes.data || []);
      setServices(servicesRes.data || []);
      setBookings(bookingsRes.data || []);
    }

    setLoading(false);
  }

  async function handleAddBarber() {
    if (!salon || !newBarber.name) return;
    const { error } = await supabase.from("barbers").insert({
      salon_id: salon.id,
      name: newBarber.name,
      experience: parseInt(newBarber.experience) || 0,
      specialties: newBarber.specialties.split(",").map(s => s.trim()).filter(Boolean),
      bio: newBarber.bio,
      is_active: true,
    });
    if (!error) {
      setShowAddBarber(false);
      setNewBarber({ name: "", experience: "", specialties: "", bio: "" });
      fetchOwnerData();
    }
  }

  async function handleRemoveBarber(id: string) {
    await supabase.from("barbers").update({ is_active: false }).eq("id", id);
    fetchOwnerData();
  }

  async function handleAddService() {
    if (!salon || !newService.name || !newService.price) return;
    const { error } = await supabase.from("services").insert({
      salon_id: salon.id,
      name: newService.name,
      price: parseInt(newService.price),
      duration: parseInt(newService.duration) || 30,
      is_active: true,
    });
    if (!error) {
      setShowAddService(false);
      setNewService({ name: "", price: "", duration: "" });
      fetchOwnerData();
    }
  }

  async function handleRemoveService(id: string) {
    await supabase.from("services").update({ is_active: false }).eq("id", id);
    fetchOwnerData();
  }

  async function handleUpdateBookingStatus(id: string, status: string) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    fetchOwnerData();
  }

  async function handleCreateSalon() {
    if (!newSalon.name) return;
    const { error } = await supabase.from("salons").insert({
      owner_id: user?.id,
      name: newSalon.name,
      description: newSalon.description,
      address: newSalon.address,
      city: newSalon.city,
      state: newSalon.state,
      is_verified: false,
    });
    if (!error) {
      setShowAddSalon(false);
      fetchOwnerData();
    }
  }

  // Earnings calculations
  const totalEarnings = bookings.filter(b => b.status === "completed").reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const todayEarnings = bookings.filter(b => {
    const today = new Date().toISOString().split("T")[0];
    return b.booking_date === today && b.status === "completed";
  }).reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const completedBookings = bookings.filter(b => b.status === "completed").length;

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    </div>
  );

  // No salon yet
  if (!salon) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-96 gap-4 px-4">
        <Scissors className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="text-xl font-bold text-foreground">No Salon Yet</h2>
        <p className="text-muted-foreground text-sm text-center">
          Create your salon to start accepting bookings
        </p>
        <Button
          className="gradient-primary text-primary-foreground border-0"
          onClick={() => setShowAddSalon(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Create My Salon
        </Button>

        {/* Create Salon Modal */}
        {showAddSalon && (
          <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">Create Salon</h3>
                <button onClick={() => setShowAddSalon(false)}><X className="w-5 h-5" /></button>
              </div>
              {[
                { label: "Salon Name *", key: "name", placeholder: "The Urban Cut" },
                { label: "Description", key: "description", placeholder: "Premium grooming..." },
                { label: "Address", key: "address", placeholder: "12 MG Road" },
                { label: "City", key: "city", placeholder: "Bengaluru" },
                { label: "State", key: "state", placeholder: "Karnataka" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1">{field.label}</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={field.placeholder}
                    value={newSalon[field.key as keyof typeof newSalon]}
                    onChange={e => setNewSalon({ ...newSalon, [field.key]: e.target.value })}
                  />
                </div>
              ))}
              <Button className="w-full gradient-primary text-primary-foreground border-0" onClick={handleCreateSalon}>
                Create Salon
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 min-h-[calc(100vh-4rem)] bg-card border-r border-border p-4">
          <div className="mb-4 px-2">
            <h2 className="text-sm font-bold text-foreground">{salon.name}</h2>
            <span className={`text-xs ${salon.is_verified ? "text-green-500" : "text-amber-500"}`}>
              {salon.is_verified ? "✓ Verified" : "⏳ Pending approval"}
            </span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-40">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${
                activeSection === item.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">

          {/* Bookings */}
          {activeSection === "bookings" && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-foreground mb-6">
                Bookings
                {pendingBookings > 0 && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {pendingBookings} pending
                  </span>
                )}
              </h2>
              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-sm">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="bg-card rounded-xl p-4 shadow-card">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground text-sm">{b.users?.name || "Customer"}</p>
                          <p className="text-xs text-muted-foreground">
                            {b.services?.name} • {b.barbers?.name} • {b.booking_date} at {b.booking_time?.slice(0, 5)}
                          </p>
                          {b.users?.phone && (
                            <p className="text-xs text-muted-foreground">{b.users.phone}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">₹{b.total_amount}</p>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            b.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                            b.status === "confirmed" ? "bg-blue-500/10 text-blue-500" :
                            b.status === "completed" ? "bg-green-500/10 text-green-500" :
                            "bg-destructive/10 text-destructive"
                          }`}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                      {b.status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white border-0 text-xs"
                            onClick={() => handleUpdateBookingStatus(b.id, "confirmed")}
                          >
                            <Check className="w-3 h-3 mr-1" /> Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-destructive border-destructive/30 text-xs"
                            onClick={() => handleUpdateBookingStatus(b.id, "cancelled")}
                          >
                            <X className="w-3 h-3 mr-1" /> Cancel
                          </Button>
                        </div>
                      )}
                      {b.status === "confirmed" && (
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white border-0 text-xs"
                          onClick={() => handleUpdateBookingStatus(b.id, "completed")}
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Barbers */}
          {activeSection === "barbers" && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Manage Barbers</h2>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0" onClick={() => setShowAddBarber(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Barber
                </Button>
              </div>
              {barbers.length === 0 ? (
                <p className="text-muted-foreground text-sm">No barbers yet. Add your first barber!</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {barbers.map((b) => (
                    <div key={b.id} className="bg-card rounded-xl p-4 shadow-card">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{b.name}</h4>
                          <p className="text-xs text-muted-foreground">{b.experience} yrs experience</p>
                        </div>
                      </div>
                      {b.specialties?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {b.specialties.map((s: string) => (
                            <span key={s} className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded flex-1 text-center ${b.is_active ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                          {b.is_active ? "Active" : "Inactive"}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-destructive border-destructive/30"
                          onClick={() => handleRemoveBarber(b.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Barber Modal */}
              {showAddBarber && (
                <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
                  <div className="bg-card rounded-xl w-full max-w-md p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground">Add Barber</h3>
                      <button onClick={() => setShowAddBarber(false)}><X className="w-5 h-5" /></button>
                    </div>
                    {[
                      { label: "Name *", key: "name", placeholder: "Rajesh Kumar" },
                      { label: "Experience (years)", key: "experience", placeholder: "5" },
                      { label: "Specialties (comma separated)", key: "specialties", placeholder: "Haircut, Beard Trim" },
                      { label: "Bio", key: "bio", placeholder: "Expert barber..." },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium mb-1">{field.label}</label>
                        <input
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder={field.placeholder}
                          value={newBarber[field.key as keyof typeof newBarber]}
                          onChange={e => setNewBarber({ ...newBarber, [field.key]: e.target.value })}
                        />
                      </div>
                    ))}
                    <Button className="w-full gradient-primary text-primary-foreground border-0" onClick={handleAddBarber}>
                      Add Barber
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Services */}
          {activeSection === "services" && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Manage Services</h2>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0" onClick={() => setShowAddService(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Service
                </Button>
              </div>
              {services.length === 0 ? (
                <p className="text-muted-foreground text-sm">No services yet. Add your first service!</p>
              ) : (
                <div className="grid gap-3">
                  {services.map((s) => (
                    <div key={s.id} className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.duration} mins</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">₹{s.price}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-destructive border-destructive/30"
                          onClick={() => handleRemoveService(s.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Service Modal */}
              {showAddService && (
                <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
                  <div className="bg-card rounded-xl w-full max-w-md p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground">Add Service</h3>
                      <button onClick={() => setShowAddService(false)}><X className="w-5 h-5" /></button>
                    </div>
                    {[
                      { label: "Service Name *", key: "name", placeholder: "Haircut + Beard Trim" },
                      { label: "Price (₹) *", key: "price", placeholder: "450" },
                      { label: "Duration (minutes)", key: "duration", placeholder: "45" },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium mb-1">{field.label}</label>
                        <input
                          type={field.key === "price" || field.key === "duration" ? "number" : "text"}
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder={field.placeholder}
                          value={newService[field.key as keyof typeof newService]}
                          onChange={e => setNewService({ ...newService, [field.key]: e.target.value })}
                        />
                      </div>
                    ))}
                    <Button className="w-full gradient-primary text-primary-foreground border-0" onClick={handleAddService}>
                      Add Service
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Earnings */}
          {activeSection === "earnings" && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-foreground mb-6">Earnings</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Today", value: `₹${todayEarnings}`, icon: DollarSign },
                  { label: "Total Earnings", value: `₹${totalEarnings}`, icon: TrendingUp },
                  { label: "Total Bookings", value: bookings.length, icon: CalendarDays },
                  { label: "Completed", value: completedBookings, icon: Check },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card rounded-xl p-5 shadow-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                      <stat.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent completed bookings */}
              <h3 className="text-sm font-semibold text-foreground mb-3">Completed Bookings</h3>
              <div className="space-y-2">
                {bookings.filter(b => b.status === "completed").map((b) => (
                  <div key={b.id} className="bg-card rounded-lg p-3 shadow-card flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.users?.name}</p>
                      <p className="text-xs text-muted-foreground">{b.services?.name} • {b.booking_date}</p>
                    </div>
                    <span className="font-semibold text-foreground">₹{b.total_amount}</span>
                  </div>
                ))}
                {bookings.filter(b => b.status === "completed").length === 0 && (
                  <p className="text-muted-foreground text-sm">No completed bookings yet.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;