import { useState } from "react";
import { ArrowLeft, Send, Sparkles, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface Message {
  role: "user" | "ai";
  content: string;
}

const suggestions = [
  {
    title: "Modern Pompadour",
    desc: "Great for oval face shapes with thick hair. Low maintenance.",
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=200",
    tag: "Hairstyle",
  },
  {
    title: "Short Boxed Beard",
    desc: "Clean and professional. Works well for most face shapes.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    tag: "Beard",
  },
  {
    title: "Argan Oil Treatment",
    desc: "Nourishes dry hair, adds shine. Budget-friendly at ₹500.",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200",
    tag: "Product",
  },
];

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your AI Style Assistant. Tell me about your preferences and I'll suggest the perfect look for you. 💈" },
  ]);
  const [input, setInput] = useState("");
  const [faceShape, setFaceShape] = useState("");
  const [hairType, setHairType] = useState("");
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", content: "That's great! Let me analyze your preferences and find the best styles for you. Use the form below for more precise results!" }]);
    }, 600);
    setInput("");
  };

  const handleGetSuggestions = () => {
    setShowResults(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `Face: ${faceShape || "Any"}, Hair: ${hairType || "Any"}, Occasion: ${occasion || "Any"}, Budget: ${budget || "Any"}` },
      { role: "ai", content: "Here are my personalized suggestions based on your profile! 👇" },
    ]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground text-sm mb-4 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Style Assistant</h1>
            <p className="text-sm text-muted-foreground">Get personalized grooming suggestions</p>
          </div>
        </div>

        {/* Chat */}
        <div className="bg-card rounded-xl shadow-card p-4 mb-6 max-h-64 overflow-y-auto space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "ai" && (
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="flex gap-2 mb-8">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything about styles..."
            className="flex-1 px-4 py-2.5 text-sm bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
          <Button size="icon" className="gradient-primary text-primary-foreground border-0" onClick={handleSend}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Preference Form */}
        <div className="bg-card rounded-xl shadow-card p-5 mb-6">
          <h3 className="font-semibold text-foreground text-sm mb-4">Tell us about yourself</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Face Shape", value: faceShape, set: setFaceShape, options: ["Oval", "Round", "Square", "Heart", "Oblong"] },
              { label: "Hair Type", value: hairType, set: setHairType, options: ["Straight", "Wavy", "Curly", "Coily", "Thin"] },
              { label: "Occasion", value: occasion, set: setOccasion, options: ["Casual", "Formal", "Wedding", "Party", "Daily"] },
              { label: "Budget", value: budget, set: setBudget, options: ["Under ₹300", "₹300-₹800", "₹800-₹1500", "₹1500+"] },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{field.label}</label>
                <select
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-muted rounded-lg border-0 outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select...</option>
                  {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 gradient-primary text-primary-foreground border-0" onClick={handleGetSuggestions}>
            <Sparkles className="w-4 h-4 mr-2" /> Get Suggestions
          </Button>
        </div>

        {/* Results */}
        {showResults && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-semibold text-foreground">Recommended for You</h3>
            {suggestions.map((s) => (
              <div key={s.title} className="bg-card rounded-xl shadow-card p-4 flex gap-4">
                <img src={s.image} alt={s.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">{s.tag}</span>
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">{s.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
