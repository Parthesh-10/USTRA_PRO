import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, User, Menu, X, Scissors, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, setLocation] = useState("Bengaluru");
  const [showLocations, setShowLocations] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const cities = ["Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Kochi", "Indore", "Nagpur", "Gurgaon", "Noida"];

  async function handleLogout() {
    await signOut();
    navigate("/login");
    setShowUserMenu(false);
    setMobileOpen(false);
  }

  // Dashboard link based on role
  const dashboardLink = user?.role === "owner"
    ? "/owner-dashboard"
    : user?.role === "admin"
    ? "/admin"
    : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Scissors className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground hidden sm:block">
            USTRA<span className="text-primary"> PRO</span>
          </span>
        </Link>

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-6">
          <div className="relative">
            <button
              onClick={() => setShowLocations(!showLocations)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors"
            >
              <MapPin className="w-4 h-4 text-primary" />
              {location}
            </button>
            {showLocations && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 w-48 max-h-64 overflow-y-auto">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => { setLocation(city); setShowLocations(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${location === city ? "text-primary font-medium" : "text-foreground"}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search salons, services..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-muted rounded-lg border-0 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right side — desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/ai-assistant">
            <Button variant="ghost" size="sm" className="text-muted-foreground">AI Stylist</Button>
          </Link>

          {user ? (
            // Logged in
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground leading-none">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <Link
                    to={dashboardLink}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {user.role === "owner" ? "Owner Dashboard" : "My Dashboard"}
                  </Link>
                  <div className="border-t border-border" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not logged in
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gradient-primary text-primary-foreground border-0">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search salons, services..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted rounded-lg outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Link to="/ai-assistant" className="block py-2 text-sm text-foreground" onClick={() => setMobileOpen(false)}>
            AI Stylist
          </Link>

          {user ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 py-2 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name || "User"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>

              <Link
                to={dashboardLink}
                className="flex items-center gap-2 py-2 text-sm text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                {user.role === "owner" ? "Owner Dashboard" : "My Dashboard"}
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 py-2 text-sm text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)}>
                <Button className="w-full gradient-primary text-primary-foreground border-0">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;