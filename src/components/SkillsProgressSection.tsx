import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const skills = [
  { name: "React / Next.js", percentage: 95, color: "from-primary to-secondary" },
  { name: "JavaScript / TypeScript", percentage: 92, color: "from-secondary to-primary" },
  { name: "HTML5 / CSS3", percentage: 98, color: "from-primary to-secondary" },
  { name: "Tailwind CSS", percentage: 95, color: "from-secondary to-primary" },
  { name: "Node.js", percentage: 85, color: "from-primary to-secondary" },
  { name: "WordPress / Shopify", percentage: 88, color: "from-secondary to-primary" },
  { name: "UI/UX Design", percentage: 90, color: "from-primary to-secondary" },
  { name: "SEO Optimization", percentage: 87, color: "from-secondary to-primary" },
];

const circularSkills = [
  { name: "Frontend", percentage: 95, icon: "💻" },
  { name: "Backend", percentage: 85, icon: "⚙️" },
  { name: "Design", percentage: 90, icon: "🎨" },
  { name: "SEO", percentage: 87, icon: "📈" },
];

const SkillBar = ({ skill, index }: { skill: typeof skills[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="mb-6"
    >
      <div className="flex justify-between mb-2">
        <span className="text-foreground font-medium">{skill.name}</span>
        <span className="text-primary font-bold">{skill.percentage}%</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${skill.color} rounded-full relative`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${skill.percentage}%` } : { width: 0 }}
          transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const CircularProgress = ({ skill, index }: { skill: typeof circularSkills[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (skill.percentage / 100) * circumference;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <motion.circle
            cx="56"
            cy="56"
            r="45"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset } : { strokeDashoffset: circumference }}
            transition={{ duration: 1.5, delay: index * 0.15, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl">{skill.icon}</span>
          <span className="text-lg font-bold text-foreground">{skill.percentage}%</span>
        </div>
      </div>
      <span className="mt-3 text-sm font-medium text-muted-foreground">{skill.name}</span>
    </motion.div>
  );
};

const SkillsProgressSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium mb-4 block">My Expertise</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Skills & <span className="gradient-text">Proficiency</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Years of experience transformed into measurable expertise
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Linear Progress Bars */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6 text-foreground">Technical Skills</h3>
            {skills.map((skill, index) => (
              <SkillBar key={skill.name} skill={skill} index={index} />
            ))}
          </div>

          {/* Circular Progress */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-8 text-foreground text-center">Core Competencies</h3>
            <div className="grid grid-cols-2 gap-8">
              {circularSkills.map((skill, index) => (
                <CircularProgress key={skill.name} skill={skill} index={index} />
              ))}
            </div>
            
            {/* Additional Stats */}
            <div className="mt-8 pt-8 border-t border-border grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold gradient-text">150+</div>
                <div className="text-xs text-muted-foreground">Projects Done</div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">50+</div>
                <div className="text-xs text-muted-foreground">Happy Clients</div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">5+</div>
                <div className="text-xs text-muted-foreground">Years Exp.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsProgressSection;
