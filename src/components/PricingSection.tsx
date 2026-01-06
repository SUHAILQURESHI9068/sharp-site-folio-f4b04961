import { motion } from "framer-motion";
import { Check, Calculator } from "lucide-react";
import { Button } from "./ui/button";

const packages = [
  {
    name: "Basic",
    price: "₹4,999",
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
    name: "Standard",
    price: "₹9,999",
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
    name: "Premium",
    price: "₹19,999",
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
            Transparent pricing with no hidden costs
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary">
            <Calculator className="w-4 h-4" />
            <span>Use the calculator button (bottom right) for custom quotes!</span>
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
                <div className="text-2xl md:text-4xl font-bold gradient-text">{pkg.price}</div>
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
                asChild
              >
                <a href="#contact">Get Started</a>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
