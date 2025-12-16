import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Check, ArrowRight, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const projectTypes = [
  { id: "landing", name: "Landing Page", basePrice: 5000 },
  { id: "business", name: "Business Website", basePrice: 15000 },
  { id: "ecommerce", name: "E-commerce Store", basePrice: 30000 },
  { id: "webapp", name: "Web Application", basePrice: 50000 },
  { id: "custom", name: "Custom Project", basePrice: 25000 },
];

const features = [
  { id: "responsive", name: "Responsive Design", price: 0, included: true },
  { id: "seo", name: "SEO Optimization", price: 3000 },
  { id: "cms", name: "Content Management System", price: 5000 },
  { id: "animations", name: "Custom Animations", price: 4000 },
  { id: "forms", name: "Contact Forms & Integration", price: 2000 },
  { id: "analytics", name: "Analytics Setup", price: 1500 },
  { id: "social", name: "Social Media Integration", price: 2000 },
  { id: "payment", name: "Payment Gateway", price: 8000 },
  { id: "multilingual", name: "Multi-language Support", price: 6000 },
  { id: "maintenance", name: "3 Months Maintenance", price: 5000 },
];

const QuoteCalculator = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["responsive"]);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const calculateTotal = () => {
    const typePrice = projectTypes.find(t => t.id === selectedType)?.basePrice || 0;
    const featuresPrice = selectedFeatures.reduce((sum, featureId) => {
      const feature = features.find(f => f.id === featureId);
      return sum + (feature?.price || 0);
    }, 0);
    return typePrice + featuresPrice;
  };

  const toggleFeature = (featureId: string) => {
    if (featureId === "responsive") return;
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("quote_requests")
        .insert({
          name: formData.name,
          email: formData.email,
          project_type: projectTypes.find(t => t.id === selectedType)?.name || "",
          features: selectedFeatures,
          estimated_price: calculateTotal(),
          message: formData.message || null,
        });

      if (error) throw error;

      // Send email notification (fire and forget)
      supabase.functions.invoke("send-notification", {
        body: { 
          type: "quote", 
          data: {
            name: formData.name,
            email: formData.email,
            project_type: projectTypes.find(t => t.id === selectedType)?.name,
            features: selectedFeatures,
            estimated_price: calculateTotal(),
            message: formData.message,
          }
        },
      }).catch(console.error);

      toast({
        title: "Quote Request Sent!",
        description: "I'll get back to you with a detailed quote soon.",
      });
      setIsOpen(false);
      setStep(1);
      setSelectedType(null);
      setSelectedFeatures(["responsive"]);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Calculator Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-secondary text-secondary-foreground rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        aria-label="Open Quote Calculator"
      >
        <Calculator className="w-6 h-6" />
      </motion.button>

      {/* Calculator Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Project Quote Calculator</h3>
                  <p className="text-muted-foreground text-sm">Get an instant estimate for your project</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Project Type Selection */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">1. Select Project Type</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {projectTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedType === type.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium text-sm">{type.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        From {formatPrice(type.basePrice)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features Selection */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">2. Select Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map((feature) => (
                    <label
                      key={feature.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedFeatures.includes(feature.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      } ${feature.included ? "opacity-75" : ""}`}
                    >
                      <Checkbox
                        checked={selectedFeatures.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        disabled={feature.included}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium flex items-center gap-2">
                          {feature.name}
                          {feature.included && (
                            <span className="text-xs text-primary">(Included)</span>
                          )}
                        </div>
                        {!feature.included && (
                          <div className="text-xs text-muted-foreground">
                            +{formatPrice(feature.price)}
                          </div>
                        )}
                      </div>
                      {selectedFeatures.includes(feature.id) && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 1: Selection */}
              {step === 1 && (
                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Estimated Total:</span>
                    <span className="text-3xl font-bold gradient-text">
                      {selectedType ? formatPrice(calculateTotal()) : "₹0"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    * This is an estimate. Final price may vary based on project requirements.
                  </p>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={() => setStep(2)}
                    disabled={!selectedType}
                  >
                    Get Detailed Quote
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Contact Form */}
              {step === 2 && (
                <form onSubmit={handleSubmitQuote} className="border-t border-border pt-6">
                  <h4 className="font-semibold mb-4">3. Your Contact Details</h4>
                  <div className="space-y-4 mb-6">
                    <Input
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    <Textarea
                      placeholder="Additional details about your project (optional)"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Estimated Total:</span>
                      <span className="text-xl font-bold gradient-text">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isSubmitting ? "Sending..." : "Submit Quote Request"}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuoteCalculator;
