import { motion } from "framer-motion";
import { Code, Palette, Globe, Zap, Layers, Search } from "lucide-react";

const skills = [
  { icon: Code, name: "HTML/CSS" },
  { icon: Code, name: "JavaScript" },
  { icon: Code, name: "React" },
  { icon: Code, name: "TypeScript" },
  { icon: Layers, name: "WordPress" },
  { icon: Globe, name: "Shopify" },
  { icon: Palette, name: "UI/UX Design" },
  { icon: Zap, name: "Tailwind CSS" },
  { icon: Search, name: "SEO" },
];

const AboutSection = () => {
  return (
    <section id="about" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium mb-4 block">About Me</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Passionate <span className="gradient-text">Web Developer</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Crafting digital excellence for over 5 years
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-6">
              Building Digital Dreams Into Reality
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              I'm a passionate web developer with expertise in creating modern, 
              responsive, and user-friendly websites. With over 5 years of experience, 
              I've helped businesses of all sizes establish their online presence and 
              achieve their digital goals.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              My approach combines clean code with stunning design to deliver websites 
              that not only look amazing but also perform exceptionally. I believe in 
              continuous learning and staying updated with the latest technologies and 
              design trends.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <div className="text-2xl font-bold gradient-text">50+</div>
                <div className="text-sm text-muted-foreground">Projects Delivered</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl font-bold gradient-text">100%</div>
                <div className="text-sm text-muted-foreground">Client Satisfaction</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold mb-6">My Skills & Technologies</h3>
            <div className="grid grid-cols-3 gap-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="glass-card p-4 text-center hover:border-primary/50 transition-all duration-300 group"
                >
                  <skill.icon className="w-8 h-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{skill.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
