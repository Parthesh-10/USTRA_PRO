import { useState, useEffect } from "react";
import { Users, Store, CalendarDays, BarChart3, Check, X, Shield, TrendingUp, DollarSign, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "salons", label: "Salons", icon: Store },
  { id: "users", label: "Users", icon: Users },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [salons, setSalons] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/"); return; }
    fetchAllData();
  }, [user]);

  async function fetchAllData() {
    setLoading(true);
    const [salonsRes, usersRes, bookingsRes] = await Promise.all([
      supabase.from("salons").select("*, users(name, email)").order("created_at", { ascending: false }),
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*, users(name), salons(name), services(name), barbers(name)").order("created_at", { ascending: false }).limit(100),
    ]);
    setSalons(salonsRes.data || []);
    setUsers(usersRes.data || []);
    setBookings(bookingsRes.data || []);
    setLoading(false);
  }

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  }

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  }

  async function handleApproveSalon(id: string) {
    setActionLoading(id);
    const { error } = await supabase
      .from("salons")
      .update({ is_verified: true })
      .eq("id", id);
    if (error) showError("Failed to approve salon: " + error.message);
    else showSuccess("Salon approved successfully!");
    setActionLoading(null);
    fetchAllData();
  }

  async function handleRemoveSalon(id: string) {
    if (!confirm("Are you sure you want to remove this salon? This will delete all associated barbers, services and bookings.")) return;
    setActionLoading(id);

    // Delete in correct order due to foreign keys
    await supabase.from("tips").delete().eq("booking_id", id);
    await supabase.from("payments").delete().in("booking_id",
      (await supabase.from("bookings").select("id").eq("salon_id", id)).data?.map(b => b.id) || []
    );
    await supabase.from("reviews").delete().eq("salon_id", id);
    await supabase.from("bookings").delete().eq("salon_id", id);
    await supabase.from("services").delete().eq("salon_id", id);
    await supabase.from("barbers").delete().eq("salon_id", id);
    const { error } = await supabase.from("salons").delete().eq("id", id);

    if (error) showError("Failed to remove salon: " + error.message);
    else showSuccess("Salon removed successfully!");
    setActionLoading(null);
    fetchAllData();
  }

  async function handleUpdateUserRole(id: string, role: string) {
    const { error } = await supabase.from("users").update({ role }).eq("id", id);
    if (error) showError("Failed to update role: " + error.message);
    else showSuccess("User role updated!");
    fetchAllData();
  }

  async function handleDeleteUser(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setActionLoading(id);
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) showError("Failed to delete user: " + error.message);
    else showSuccess("User deleted!");
    setActionLoading(null);
    fetchAllData();
  }

  async function handleUpdateBookingStatus(id: string, status: string) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) showError("Failed to update booking: " + error.message);
    else showSuccess("Booking updated!");
    fetchAllData();
  }

  // Stats
  const totalRevenue = bookings.filter(b => b.status === "completed").reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const pendingSalons = salons.filter(s => !s.is_verified).length;
  const verifiedSalons = salons.filter(s => s.is_verified).length;
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === "completed").length;

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

      {/* Global notifications */}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-destructive text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <X className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 min-h-[calc(100vh-4rem)] bg-card border-r border-border p-4">
          <div className="mb-4 px-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Admin Panel</h2>
          </div>
          {pendingSalons > 0 && (
            <div className="mb-3 mx-2 px-3 py-2 bg-amber-500/10 rounded-lg">
              <p className="text-xs text-amber-500 font-medium">⏳ {pendingSalons} salon{pendingSalons > 1 ? "s" : ""} pending</p>
            </div>
          )}
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
                {item.id === "salons" && pendingSalons > 0 && (
                  <span className="ml-auto text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full">{pendingSalons}</span>
                )}
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

          {/* Overview */}
          {activeSection === "overview" && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-foreground mb-6">Platform Overview</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
                  { label: "Total Users", value: users.length, icon: Users, color: "text-blue-500" },
                  { label: "Verified Salons", value: verifiedSalons, icon: Store, color: "text-primary" },
                  { label: "Total Bookings", value: totalBookings, icon: CalendarDays, color: "text-purple-500" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card rounded-xl p-5 shadow-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Pending approvals */}
              {pendingSalons > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    Pending Salon Approvals
                  </h3>
                  <div className="space-y-3">
                    {salons.filter(s => !s.is_verified).map((s) => (
                      <div key={s.id} className="bg-card rounded-xl p-4 shadow-card border border-amber-500/20">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{s.name}</h4>
                            <p className="text-xs text-muted-foreground">{s.city}, {s.state}</p>
                            <p className="text-xs text-muted-foreground">Owner: {s.users?.name} ({s.users?.email})</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white border-0 text-xs"
                              disabled={actionLoading === s.id}
                              onClick={() => handleApproveSalon(s.id)}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              {actionLoading === s.id ? "..." : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30 text-xs"
                              disabled={actionLoading === s.id}
                              onClick={() => handleRemoveSalon(s.id)}
                            >
                              <X className="w-3 h-3 mr-1" />
                              {actionLoading === s.id ? "..." : "Reject"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent bookings */}
              <h3 className="text-sm font-semibold text-foreground mb-3">Recent Bookings</h3>
              <div className="space-y-2">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="bg-card rounded-lg p-3 shadow-card flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.users?.name} → {b.salons?.name}</p>
                      <p className="text-xs text-muted-foreground">{b.services?.name} • {b.booking_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">₹{b.total_amount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        b.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                        b.status === "confirmed" ? "bg-blue-500/10 text-blue-500" :
                        b.status === "completed" ? "bg-green-500/10 text-green-500" :
                        "bg-destructive/10 text-destructive"
                      }`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Salons */}
          {activeSection === "salons" && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-foreground mb-6">
                All Salons
                <span className="ml-2 text-sm font-normal text-muted-foreground">({salons.length} total)</span>
              </h2>
              <div className="space-y-3">
                {salons.map((s) => (
                  <div key={s.id} className="bg-card rounded-xl p-4 shadow-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{s.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            s.is_verified ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                          }`}>
                            {s.is_verified ? "✓ Verified" : "⏳ Pending"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{s.address}, {s.city}, {s.state}</p>
                        <p className="text-xs text-muted-foreground">Owner: {s.users?.name} ({s.users?.email})</p>
                        <p className="text-xs text-muted-foreground">Rating: {s.rating || 0} ⭐ • {s.total_reviews || 0} reviews</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!s.is_verified && (
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white border-0 text-xs"
                            disabled={actionLoading === s.id}
                            onClick={() => handleApproveSalon(s.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            {actionLoading === s.id ? "..." : "Approve"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 text-xs"
                          disabled={actionLoading === s.id}
                          onClick={() => handleRemoveSalon(s.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          {actionLoading === s.id ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {salons.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-8">No salons yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Users */}
          {activeSection === "users" && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-foreground mb-6">
                All Users
                <span className="ml-2 text-sm font-normal text-muted-foreground">({users.length} total)</span>
              </h2>
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {u.name?.charAt(0) || u.email?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{u.name || "No name"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                        {u.phone && <p className="text-xs text-muted-foreground">{u.phone}</p>}
                        <p className="text-xs text-muted-foreground">Joined: {new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="customer">Customer</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                      {u.id !== user?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 text-xs"
                          disabled={actionLoading === u.id}
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings */}
          {activeSection === "bookings" && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-foreground mb-6">
                All Bookings
                <span className="ml-2 text-sm font-normal text-muted-foreground">({bookings.length} total)</span>
              </h2>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Completed", value: completedBookings, color: "text-green-500" },
                  { label: "Pending", value: bookings.filter(b => b.status === "pending").length, color: "text-amber-500" },
                  { label: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length, color: "text-destructive" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-card rounded-xl p-4 shadow-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">{b.users?.name} → {b.salons?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.services?.name} • {b.barbers?.name} • {b.booking_date} at {b.booking_time?.slice(0, 5)}
                        </p>
                        <p className="text-xs text-muted-foreground">Payment: {b.payment_status}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold text-foreground">₹{b.total_amount}</p>
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                          className={`text-xs border rounded px-2 py-1 bg-background focus:outline-none ${
                            b.status === "pending" ? "text-amber-500" :
                            b.status === "confirmed" ? "text-blue-500" :
                            b.status === "completed" ? "text-green-500" :
                            "text-destructive"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-8">No bookings yet.</p>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;