import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, User, Menu, X, Slice, LogOut, LayoutDashboard } from "lucide-react";
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
    <nav className="sticky top-0 z-50 bg-[#FFFFFF]/80 backdrop-blur-md border-b border-[#FFFFFF]/50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Slice className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#54577C] hidden sm:block tracking-tight">
            USTRA<span className="text-primary"> PRO</span>
          </span>
        </Link>

        {/* Search bar removed per user request */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-6">
          <div className="relative">
            <button
              onClick={() => setShowLocations(!showLocations)}
              className="flex items-center gap-1.5 text-sm font-medium text-[#9AA899] bg-white/50 border border-[#FFFFFF] rounded-xl px-4 py-2 hover:bg-[#FFFFFF]/30 transition-all"
            >
              <MapPin className="w-4 h-4 text-primary" />
              {location}
            </button>
            {showLocations && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-[#FFFFFF] rounded-xl shadow-xl z-50 w-52 max-h-72 overflow-y-auto p-1 animate-in fade-in slide-in-from-top-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => { setLocation(city); setShowLocations(false); }}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors ${location === city ? "bg-[#FFFFFF] text-[#54577C] font-semibold" : "text-[#54577C] hover:bg-[#FFFFFF]"}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side — desktop */}
          {user ? (
            // Logged in
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-white/50 transition-all border border-transparent hover:border-[#FFFFFF]"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-bold text-[#54577C] leading-none">
                    {user.name || "User"}
                  </p>
                  <p className="text-[10px] text-[#9AA899] font-semibold uppercase tracking-wider mt-1">{user.role}</p>
                </div>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-[#FFFFFF] rounded-2xl shadow-xl z-50 overflow-hidden p-1 animate-in fade-in slide-in-from-top-2">
                  <Link
                    to={dashboardLink}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#54577C] hover:bg-[#FFFFFF] rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#9AA899]" />
                    {user.role === "owner" ? "Owner Dashboard" : "My Dashboard"}
                  </Link>
                  <div className="my-1 border-t border-gray-50" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not logged in
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-medium text-[#54577C]">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gradient-primary text-white border-0 shadow-sm shadow-primary/20 rounded-xl px-6">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2 text-[#54577C]" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#FFFFFF] bg-white p-4 space-y-4 animate-in fade-in slide-in-from-top-4">

          {user ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#FFFFFF] rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#54577C]">{user.name || "User"}</p>
                  <p className="text-xs text-[#9AA899] font-semibold uppercase">{user.role}</p>
                </div>
              </div>

              <Link
                to={dashboardLink}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#54577C] hover:bg-[#FFFFFF] rounded-xl"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4 text-[#9AA899]" />
                {user.role === "owner" ? "Owner Dashboard" : "My Dashboard"}
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl font-medium border-[#FFFFFF]">Login</Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)}>
                <Button className="w-full gradient-primary text-white border-0 rounded-xl font-medium shadow-sm shadow-primary/20">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>


  );
};

export default Navbar;