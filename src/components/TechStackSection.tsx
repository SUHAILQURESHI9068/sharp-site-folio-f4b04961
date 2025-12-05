import { motion } from "framer-motion";

const technologies = [
  { name: "React", color: "#61DAFB" },
  { name: "Next.js", color: "#ffffff" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Tailwind", color: "#06B6D4" },
  { name: "Node.js", color: "#339933" },
  { name: "WordPress", color: "#21759B" },
  { name: "Shopify", color: "#7AB55C" },
  { name: "Figma", color: "#F24E1E" },
];

const TechStackSection = () => {
  return (
    <section className="py-12 overflow-hidden relative border-y border-border/30">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-muted/30 to-background" />
      
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
