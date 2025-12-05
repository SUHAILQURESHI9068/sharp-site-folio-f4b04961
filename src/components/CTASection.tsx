import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />
      <div className="absolute inset-0 bg-background/80" />
      
      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 border border-primary/30 rounded-full"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-32 h-32 border border-secondary/30 rounded-full"
        animate={{ scale: [1, 0.8, 1], rotate: [0, -180, -360] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-6"
          >
            <Sparkles size={18} />
            <span className="text-sm font-medium">Ready to Start Your Project?</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Let's Create Something{" "}
            <span className="gradient-text">Amazing Together</span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Transform your vision into reality. Get a stunning, high-performing website 
            that helps your business grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="gradient" className="group">
              Start Your Project
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="xl" variant="outline">
              View Pricing
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
