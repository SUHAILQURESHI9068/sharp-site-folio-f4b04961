import { motion } from "framer-motion";

const technologies = [
  { name: "Lovable AI", color: "#FF0080" },
  { name: "v0.dev", color: "#ffffff" },
  { name: "Bolt.new", color: "#FFD700" },
  { name: "Supabase", color: "#3ECF8E" },
  { name: "Next.js", color: "#ffffff" },
  { name: "Tailwind CSS", color: "#06B6D4" },
  { name: "React", color: "#61DAFB" },
  { name: "TypeScript", color: "#3178C6" },
];

const TechStackSection = () => {
  return (
    <section className="py-12 overflow-hidden relative border-y border-border/30">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-muted/30 to-background" />
      
      {/* Enterprise tagline */}
      <div className="container mx-auto px-4 mb-6 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-sm md:text-base text-muted-foreground"
        >
          <span className="gradient-text font-semibold">Leveraging cutting-edge AI tools</span> to deliver enterprise-grade performance
        </motion.p>
      </div>
      
      <motion.div
        className="flex gap-16 items-center"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...technologies, ...technologies, ...technologies].map((tech, index) => (
          <div
            key={index}
            className="flex items-center gap-3 whitespace-nowrap"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: tech.color }}
            />
            <span className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">
              {tech.name}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default TechStackSection;
