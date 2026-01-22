import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Calculator, CreditCard, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const packages = [
  {
    id: "basic",
    name: "Basic",
    price: 4999,
    priceDisplay: "₹4,999",
    description: "Perfect for small businesses starting online",
    features: [
      "3-5 Page Website",
      "Mobile Responsive",
      "Contact Form",
      "Basic SEO Setup",
      "3 Revisions",
      "5 Days Delivery",
    ],
    popular: false,
  },
  {
    id: "standard",
    name: "Standard",
    price: 9999,
    priceDisplay: "₹9,999",
    description: "Ideal for growing businesses",
    features: [
      "8-10 Page Website",
      "Mobile Responsive",
      "Contact Form + Chat",
      "Advanced SEO",
      "Social Media Integration",
      "5 Revisions",
      "7 Days Delivery",
      "1 Month Support",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 19999,
    priceDisplay: "₹19,999",
    description: "Complete solution for established businesses",
    features: [
      "Unlimited Pages",
      "E-commerce Integration",
      "Custom Animations",
      "Full SEO Package",
      "Admin Panel / CMS",
      "Unlimited Revisions",
      "14 Days Delivery",
      "3 Months Support",
      "Performance Optimization",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyNow = (pkg: typeof packages[0]) => {
    setSelectedPackage(pkg);
    setIsDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedPackage || !formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load Razorpay SDK');

      // Save order to database
      const { data: quoteData, error: quoteError } = await supabase
        .from("quote_requests")
        .insert({
          name: formData.name,
          email: formData.email,
          project_type: `${selectedPackage.name} Package`,
          features: selectedPackage.features,
          estimated_price: selectedPackage.price,
          message: `Direct purchase of ${selectedPackage.name} package`,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          invoice_id: quoteData.id,
          amount: selectedPackage.price,
          currency: 'INR',
          receipt: `pkg_${selectedPackage.id}_${quoteData.id.slice(0, 8)}`,
          notes: {
            quote_id: quoteData.id,
            package_name: selectedPackage.name,
            client_name: formData.name,
            client_email: formData.email,
          }
        }
      });

      if (orderError || !orderData?.success) {
        throw new Error(orderData?.error || 'Failed to create order');
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MorzenX',
        description: `${selectedPackage.name} Package - Web Development`,
        order_id: orderData.order_id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone || '',
        },
        theme: {
          color: '#7c3aed',
        },
        handler: async function (response: any) {
          toast({
            title: "Payment Successful! 🎉",
            description: `Thank you for purchasing the ${selectedPackage.name} package! We'll contact you within 24 hours.`,
          });

          supabase.functions.invoke("send-notification", {
            body: { 
              type: "payment", 
              data: {
                name: formData.name,
                email: formData.email,
                project_type: `${selectedPackage.name} Package`,
                amount: selectedPackage.price,
                payment_id: response.razorpay_payment_id,
              }
            },
          }).catch(console.error);

          setIsDialogOpen(false);
          setFormData({ name: "", email: "", phone: "" });
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="pricing" className="section-padding relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="text-primary font-medium mb-4 block">Pricing Plans</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Affordable <span className="gradient-text">Packages</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Transparent pricing with no hidden costs. Pay directly & get started!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary">
            <Calculator className="w-4 h-4" />
            <span>Need custom features? Use the calculator button (bottom right)!</span>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`glass-card p-5 md:p-8 relative ${
                pkg.popular ? "border-primary/50 sm:scale-105" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 px-3 md:px-4 py-0.5 md:py-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs md:text-sm font-medium rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">{pkg.description}</p>
                <div className="text-2xl md:text-4xl font-bold gradient-text">{pkg.priceDisplay}</div>
              </div>
              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 md:gap-3">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                    </div>
                    <span className="text-xs md:text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={pkg.popular ? "default" : "outline"}
                className="w-full"
                onClick={() => handleBuyNow(pkg)}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Buy Now
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Payment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Your Purchase</DialogTitle>
            </DialogHeader>
            {selectedPackage && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{selectedPackage.name} Package</span>
                    <span className="text-xl font-bold gradient-text">{selectedPackage.priceDisplay}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedPackage.description}</p>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder="Your Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Input
                    type="tel"
                    placeholder="Your Phone (optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing || !formData.name || !formData.email}
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  {isProcessing ? "Processing..." : `Pay ${selectedPackage.priceDisplay}`}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  🔒 Secure payment powered by Razorpay
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default PricingSection;
