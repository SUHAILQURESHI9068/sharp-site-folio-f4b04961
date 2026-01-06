import { motion } from "framer-motion";
import { 
  Palette, 
  Code, 
  ShoppingCart, 
  Layers, 
  Search, 
  FileText 
} from "lucide-react";

const services = [
  {
    icon: Palette,
    title: "Web Design",
    description: "Beautiful, modern designs that capture your brand essence and engage visitors.",
  },
  {
    icon: Code,
    title: "Website Development",
    description: "Clean, efficient code that brings designs to life with optimal performance.",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce Store",
    description: "Complete online store setup with payment integration and inventory management.",
  },
  {
    icon: Layers,
    title: "UI/UX Design",
    description: "User-centered designs that enhance usability and drive conversions.",
  },
  {
    icon: Search,
    title: "SEO Optimization",
    description: "Improve your search rankings and drive organic traffic to your website.",
  },
  {
    icon: FileText,
    title: "Landing Pages",
    description: "High-converting landing pages designed to maximize your marketing ROI.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="section-padding relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium mb-4 block">What I Offer</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            My <span className="gradient-text">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive web solutions tailored to your business needs
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-5 md:p-8 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
