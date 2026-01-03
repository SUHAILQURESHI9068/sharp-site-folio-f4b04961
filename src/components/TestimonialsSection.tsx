import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  avatar_url: string | null;
  is_featured: boolean | null;
}

const defaultTestimonials = [
  {
    id: "1",
    name: "Robert Anderson",
    role: "CEO",
    company: "TechStart Inc.",
    content: "Exceptional work! The website exceeded our expectations. Professional, responsive, and delivered on time. Our conversion rates increased by 200%!",
    rating: 5,
    avatar_url: testimonial1,
    is_featured: false,
  },
  {
    id: "2",
    name: "Sarah Chen",
    role: "Founder",
    company: "EcoStore",
    content: "Our e-commerce sales increased by 150% after the website redesign. The attention to detail and user experience is remarkable. Best investment we made!",
    rating: 5,
    avatar_url: testimonial2,
    is_featured: false,
  },
  {
    id: "3",
    name: "Michael Foster",
    role: "Creative Director",
    company: "DesignHub",
    content: "Working with this developer was a fantastic experience. Great communication, creative solutions, and outstanding results. Highly recommend for any project!",
    rating: 5,
    avatar_url: testimonial3,
    is_featured: false,
  },
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data && data.length > 0) {
        setTestimonials(data);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium mb-4 block">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            What <span className="gradient-text">Clients Say</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take my word for it - hear from satisfied clients
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`glass-card p-8 relative group ${testimonial.is_featured ? "ring-2 ring-primary/50" : ""}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/20" />
              {testimonial.is_featured && (
                <span className="absolute top-4 left-4 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                  Featured
                </span>
              )}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4 relative z-10">
                {testimonial.avatar_url ? (
                  <img
                    src={testimonial.avatar_url}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}{testimonial.company ? `, ${testimonial.company}` : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
