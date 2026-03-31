import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SalonCard from "@/components/SalonCard";
import FilterBar from "@/components/FilterBar";
import { supabase } from "@/lib/supabase";
import { Scissors, TrendingUp, Clock, Shield, Search } from "lucide-react";

const features = [
  { icon: Scissors, title: "Expert Stylists", desc: "Verified professionals" },
  { icon: Clock, title: "Instant Booking", desc: "Book in 30 seconds" },
  { icon: TrendingUp, title: "AI Suggestions", desc: "Personalized styles" },
  { icon: Shield, title: "Trusted Reviews", desc: "Real customer ratings" },
];

const heroImages = [
  "https://images.unsplash.com/photo-1585747860019-8796530c403e?w=1400&q=80",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1400&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1400&q=80",
];

const Index = () => {
  const navigate = useNavigate();
  const [salons, setSalons] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);

  const cities = ["All", "Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"];

  // Carousel auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch salons on mount
  useEffect(() => {
    fetchSalons();
  }, []);

  // Filter when search/city/salons change
  useEffect(() => {
    filterSalons();
  }, [search, selectedCity, salons]);

  async function fetchSalons() {
    setLoading(true);
    const { data, error } = await supabase
      .from("salons")
      .select("*, services(name)")
      .eq("is_verified", true)
      .order("rating", { ascending: false });

    if (error) console.error("Fetch error:", error.message);
    setSalons(data || []);
    setFiltered(data || []);
    setLoading(false);
  }

  function filterSalons() {
    let result = [...salons];
    if (search) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedCity && selectedCity !== "All") {
      result = result.filter(s => s.city === selectedCity);
    }
    setFiltered(result);
  }

  function formatSalon(salon: any) {
    return {
      id: salon.id,
      name: salon.name,
      address: `${salon.address || ""}, ${salon.city || ""}`,
      rating: salon.rating || 0,
      reviewCount: salon.total_reviews || 0,
      image: salon.image_url || heroImages[0],
      openNow: true,
      priceRange: "₹₹",
      distance: salon.city || "",
      services: salon.services?.map((s: any) => s.name) || [],
      tags: [],
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero with working carousel */}
      <section className="relative overflow-hidden min-h-[420px] md:min-h-[480px] flex items-center">
        {heroImages.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === heroIndex ? 1 : 0 }}
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background z-[1]" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-[100px] z-[1]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-primary/8 blur-[80px] z-[1]" />

        {/* Carousel dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-[2]">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === heroIndex ? "bg-primary w-6" : "bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-[2] py-16">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
            <span className="text-primary-foreground">Discover & Book the Best</span>
            <br />
            <span className="text-primary glow-text">Salons Near You</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8">
            Your hyperlocal salon discovery platform. Find top-rated salons, compare services, and book instantly.
          </p>

          <div className="max-w-lg mx-auto relative mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search salons, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-5 md:gap-8">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl glass flex items-center justify-center glow-primary">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Salon listing */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city === "All" ? "" : city)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                (city === "All" && !selectedCity) || selectedCity === city
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {loading ? "Loading salons..." : (
              <>
                Top Salons{" "}
                <span className="text-muted-foreground font-normal text-base">
                  ({filtered.length} found)
                </span>
              </>
            )}
          </h2>
        </div>

        <FilterBar />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Scissors className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {search || selectedCity
                ? "No salons found. Try a different search."
                : "No salons available yet. Be the first to list yours!"}
            </p>
            {!search && !selectedCity && (
              <button
                onClick={() => navigate("/signup")}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
              >
                List Your Salon
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {filtered.map((salon, i) => (
              <div key={salon.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <SalonCard salon={formatSalon(salon)} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;