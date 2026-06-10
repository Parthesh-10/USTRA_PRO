import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, User, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const tabs = ["Upcoming", "Past"];

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  async function fetchBookings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        salons(id, name),
        barbers(name),
        services(name, price)
      `)
      .eq("user_id", user?.id)
      .order("booking_date", { ascending: false });

    if (!error) setBookings(data || []);
    setLoading(false);
  }

  async function handleCancel(bookingId: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);
    if (!error) fetchBookings();
  }

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  const upcoming = bookings.filter((b) => ["pending_approval", "confirmed"].includes(b.status));
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-3xl">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">My Bookings</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === t
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Upcoming */}
        {activeTab === "Upcoming" && (
          <div className="space-y-4 animate-fade-in">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming bookings</p>
                <Link to="/">
                  <Button className="mt-3 gradient-primary text-primary-foreground border-0" size="sm">
                    Explore Salons
                  </Button>
                </Link>
              </div>
            ) : (
              upcoming.map((b) => (
                <div key={b.id} className="bg-card rounded-xl p-5 shadow-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{b.salons?.name}</h3>
                      <p className="text-sm text-muted-foreground">{b.services?.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                      b.status === "pending_approval" ? "bg-amber-500/10 text-amber-500" :
                      "bg-green-500/10 text-green-500"
                    }`}>
                      {b.status === "pending_approval" ? "Pending Approval" : 
                       b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {b.booking_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {b.booking_time?.slice(0, 5)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" /> {b.barbers?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="font-semibold text-foreground">₹{b.total_amount}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(b.id)}
                        className="text-destructive border-destructive/30 hover:bg-destructive/5"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Past */}
        {activeTab === "Past" && (
          <div className="space-y-4 animate-fade-in">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : past.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No past bookings</p>
              </div>
            ) : (
              past.map((b) => (
                <div key={b.id} className="bg-card rounded-xl p-5 shadow-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{b.salons?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {b.services?.name} • {b.booking_date}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                      b.status === "completed"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {b.status === "completed" ? "Completed" : "Cancelled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-semibold text-foreground">₹{b.total_amount}</span>
                    <Link to={`/salon/${b.salons?.id}`}>
                      <Button variant="ghost" size="sm" className="text-primary text-xs">
                        Book Again <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}


      </div>
    </div>
  );
};

export default UserDashboard;