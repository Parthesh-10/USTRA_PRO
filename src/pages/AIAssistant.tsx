import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Sparkles, User, Loader2, Camera, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface Message {
  role: "user" | "ai";
  content: string;
  image?: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are an expert AI Style Assistant for USTRA PRO, a premium salon booking platform in India. 
Your job is to give personalized grooming, hairstyle, and beard style recommendations.
When analyzing a photo, identify:
1. Face shape (oval, round, square, heart, diamond, oblong)
2. Current hair type and texture
3. Current style
Then suggest 2-3 specific hairstyles that would suit them best.
Keep responses concise, friendly, and practical. Use Indian context (prices in ₹, Indian hair types, local trends).
Format responses clearly with emojis for better readability. Keep each response under 250 words.`;

async function callGemini(messages: Message[], userMessage: string, imageBase64?: string): Promise<string> {
  const conversationHistory = messages.map(m => ({
    role: m.role === "ai" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  // Build current message parts
  const currentParts: any[] = [];
  
  // Add image if provided
  if (imageBase64) {
    currentParts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: imageBase64
      }
    });
  }
  
  currentParts.push({ text: userMessage });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          ...conversationHistory,
          { role: "user", parts: currentParts }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
        }
      })
    }
  );

  if (!response.ok) throw new Error("Gemini API error");
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response. Please try again.";
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your AI Style Assistant powered by Gemini ✨\n\nUpload your photo and I'll analyze your face shape and suggest the perfect hairstyle! Or just ask me anything about grooming 💈" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [faceShape, setFaceShape] = useState("");
  const [hairType, setHairType] = useState("");
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      
      // Extract base64 (remove data:image/jpeg;base64, prefix)
      const base64 = result.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setSelectedImage(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend && !imageBase64) return;
    if (loading) return;

    const finalMessage = messageToSend || "Please analyze my photo and suggest the best hairstyles for me.";

    // Add user message with image preview
    const userMessage: Message = {
      role: "user",
      content: finalMessage,
      image: selectedImage || undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    const currentImageBase64 = imageBase64;
    clearImage();
    setLoading(true);

    try {
      const aiResponse = await callGemini(messages, finalMessage, currentImageBase64 || undefined);
      setMessages(prev => [...prev, { role: "ai", content: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "ai",
        content: "Sorry, I'm having trouble connecting right now. Please check your internet and try again! 🙏"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestions = () => {
    if (!faceShape && !hairType && !occasion && !budget) return;
    const prompt = `Give me personalized grooming suggestions for:
- Face Shape: ${faceShape || "Not specified"}
- Hair Type: ${hairType || "Not specified"}  
- Occasion: ${occasion || "Not specified"}
- Budget: ${budget || "Not specified"}

Suggest 2-3 specific hairstyles or grooming looks that would work best.`;
    handleSend(prompt);
  };

  const quickPrompts = [
    "What hairstyle suits an oval face?",
    "Best beard styles for formal occasions",
    "Hair care tips for Indian weather",
    "Trending styles in 2025",
  ];

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
            <p className="text-sm text-muted-foreground">Powered by Google Gemini ✨</p>
          </div>
        </div>

        {/* Chat Window */}
        <div className="bg-card rounded-xl shadow-card p-4 mb-4 h-72 overflow-y-auto space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "ai" && (
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
                {/* Show image if present */}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Uploaded"
                    className="w-full max-w-[200px] rounded-t-xl object-cover"
                  />
                )}
                <p className="px-3 py-2 whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div className="bg-muted px-3 py-2 rounded-xl flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Image preview */}
        {selectedImage && (
          <div className="relative inline-block mb-3">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-20 h-20 rounded-lg object-cover border-2 border-primary"
            />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Quick Prompts */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-xs whitespace-nowrap px-3 py-1.5 bg-muted hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="flex gap-2 mb-8">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />

          {/* Camera button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className={`p-2.5 rounded-lg transition-colors ${
              selectedImage
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Camera className="w-5 h-5" />
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={selectedImage ? "Ask about your photo..." : "Ask me anything about styles..."}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground disabled:opacity-50"
          />
          <Button
            size="icon"
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => handleSend()}
            disabled={loading || (!input.trim() && !selectedImage)}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {/* Preference Form */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-foreground text-sm mb-1">Get Personalized Suggestions</h3>
          <p className="text-xs text-muted-foreground mb-4">Fill in your details for AI-powered recommendations</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Face Shape", value: faceShape, set: setFaceShape, options: ["Oval", "Round", "Square", "Heart", "Oblong", "Diamond"] },
              { label: "Hair Type", value: hairType, set: setHairType, options: ["Straight", "Wavy", "Curly", "Coily", "Thin", "Thick"] },
              { label: "Occasion", value: occasion, set: setOccasion, options: ["Casual", "Formal", "Wedding", "Party", "Daily", "Office"] },
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
          <Button
            className="w-full mt-4 gradient-primary text-primary-foreground border-0"
            onClick={handleGetSuggestions}
            disabled={loading || (!faceShape && !hairType && !occasion && !budget)}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              : <><Sparkles className="w-4 h-4 mr-2" /> Get AI Suggestions</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;