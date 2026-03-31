import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Smartphone, Landmark, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const tipOptions = [0, 20, 50, 100];

const PaymentPage = () => {
  const [params] = useSearchParams();
  const total = Number(params.get("total")) || 450;
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [paid, setPaid] = useState(false);

  const actualTip = customTip ? Number(customTip) : tip;
  const grandTotal = total + actualTip;

  const methods = [
    { id: "upi", label: "UPI", icon: Smartphone },
    { id: "card", label: "Card", icon: CreditCard },
    { id: "netbanking", label: "Net Banking", icon: Landmark },
  ];

  if (paid) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-salon-green/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-salon-green" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-6">Your appointment has been booked. Check your dashboard for details.</p>
          <Link to="/dashboard">
            <Button className="gradient-primary text-primary-foreground border-0">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground text-sm mb-6 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="text-xl font-bold text-foreground mb-6">Payment</h1>

        {/* Summary */}
        <div className="bg-card rounded-xl p-5 shadow-card mb-6">
          <h3 className="font-semibold text-foreground text-sm mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Services</span><span className="text-foreground">₹{total}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Tip</span><span className="text-foreground">₹{actualTip}</span></div>
            <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-base">
              <span>Total</span><span>₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-card rounded-xl p-5 shadow-card mb-6">
          <h3 className="font-semibold text-foreground text-sm mb-3">Add a Tip</h3>
          <div className="flex gap-2 mb-3">
            {tipOptions.map((t) => (
              <button
                key={t}
                onClick={() => { setTip(t); setCustomTip(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  tip === t && !customTip
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {t === 0 ? "No tip" : `₹${t}`}
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Custom amount"
            value={customTip}
            onChange={(e) => setCustomTip(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-muted rounded-lg border-0 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-xl p-5 shadow-card mb-6">
          <h3 className="font-semibold text-foreground text-sm mb-3">Payment Method</h3>
          <div className="space-y-2">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  paymentMethod === m.id ? "border-primary bg-accent" : "border-border hover:bg-muted"
                }`}
              >
                <m.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{m.label}</span>
                {paymentMethod === m.id && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full gradient-primary text-primary-foreground border-0 py-6 text-base font-semibold" onClick={() => setPaid(true)}>
          Pay ₹{grandTotal}
        </Button>
      </div>
    </div>
  );
};

export default PaymentPage;
