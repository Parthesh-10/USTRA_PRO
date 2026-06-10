import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SalonCard from "@/components/SalonCard";
import FilterBar from "@/components/FilterBar";
import { supabase } from "@/lib/supabase";
import { Slice, TrendingUp, Clock, Shield, Search } from "lucide-react";

const features = [
  { icon: Slice, title: "Expert Stylists", desc: "Verified professionals" },
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
    <div className="min-h-screen bg-[#FFFFFF]/30">
      <Navbar />

      {/* Hero with working carousel */}
      <section className="relative overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center bg-[#FFFFFF]">
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

        {/* Lighter overlays for white theme */}
        <div className="absolute inset-0 bg-[#FFFFFF]/60 backdrop-blur-[1px] z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFFFF]/10 via-[#FFFFFF]/30 to-[#FFFFFF] z-[1]" />
        
        {/* Decorative palette blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#FFFFFF]/40 blur-[120px] z-[1] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[#4A7B9D]/10 blur-[100px] z-[1] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        {/* Carousel dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-[2]">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === heroIndex ? "bg-[#4A7B9D] w-8 shadow-sm shadow-[#4A7B9D]/20" : "bg-[#9AA899]/40 w-2 hover:bg-[#9AA899]/60"
              }`}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-[2] py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFFFF] border border-[#9AA899]/20 text-[#54577C] text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
            <TrendingUp className="w-3 h-3" />
            Hyperlocal Salon Discovery
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight text-[#54577C]">
            Discover & Book the <br />
            <span className="text-primary">Perfect Style</span>
          </h1>
          
          <p className="text-[#54577C]/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
            Find the best salons in your neighborhood and book your next appointment in seconds.
          </p>

          <div className="max-w-2xl mx-auto relative mb-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#9AA899]">
              <Search className="w-full h-full" />
            </div>
            <input
              type="text"
              placeholder="Search by salon name, city, or service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#FFFFFF] text-[#54577C] placeholder:text-[#9AA899] focus:outline-none focus:ring-4 focus:ring-[#4A7B9D]/10 shadow-xl transition-all text-lg"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-4 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/50">
                <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] flex items-center justify-center">
                  <f.icon className="w-6 h-6 text-[#4A7B9D]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#54577C]">{f.title}</p>
                  <p className="text-xs font-medium text-[#9AA899]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Salon listing */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-[#54577C] mb-2">
              {loading ? "Finding Salons..." : "Handpicked for You"}
            </h2>
            <p className="text-[#9AA899] font-medium">
              {filtered.length} top-rated salons found in your area
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city === "All" ? "" : city)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  (city === "All" && !selectedCity) || selectedCity === city
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-[#FFFFFF]/50 text-[#54577C] hover:bg-[#FFFFFF]"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <FilterBar />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/50 rounded-2xl h-80 animate-pulse border border-[#FFFFFF]/30" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white/50 rounded-3xl border border-dashed border-[#FFFFFF]">
            <div className="w-20 h-20 rounded-full bg-[#FFFFFF] flex items-center justify-center mx-auto mb-6">
              <Slice className="w-10 h-10 text-[#9AA899]" />
            </div>
            <h3 className="text-xl font-bold text-[#54577C] mb-2">No results found</h3>
            <p className="text-[#9AA899] max-w-sm mx-auto mb-8 font-medium">
              {search || selectedCity
                ? "Try adjusting your search or filters to find what you're looking for."
                : "There are no salons listed in this area yet."}
            </p>
            {!search && !selectedCity && (
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              >
                Join as a Partner
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {filtered.map((salon, i) => (
              <div key={salon.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
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