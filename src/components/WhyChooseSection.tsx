import { motion } from "framer-motion";
import { 
  Zap, 
  Code, 
  Palette, 
  Smartphone, 
  Search, 
  Headphones 
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Fast Delivery",
    description: "Quick turnaround without compromising quality",
  },
  {
    icon: Code,
    title: "Clean Code",
    description: "Well-structured, maintainable codebase",
  },
  {
    icon: Palette,
    title: "Modern UI/UX",
    description: "Contemporary designs that impress",
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Perfect on all devices and screens",
  },
  {
    icon: Search,
    title: "SEO Friendly",
    description: "Built for search engine visibility",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Always here when you need help",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="section-padding relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium mb-4 block">Why Work With Me</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Why <span className="gradient-text">Choose Me</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Delivering excellence at every step of your project
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-4 p-6 glass-card hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
