import { motion } from "framer-motion";
import { Search, Palette, Code, TestTube, Rocket, HeartHandshake } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discovery",
    description: "Understanding your goals, target audience, and project requirements through detailed discussions.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Palette,
    title: "Design",
    description: "Creating wireframes and stunning visual designs that align with your brand identity.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Code,
    title: "Development",
    description: "Building your website with clean, efficient code and modern technologies.",
    color: "from-primary to-secondary",
  },
  {
    icon: TestTube,
    title: "Testing",
    description: "Rigorous testing across all devices and browsers to ensure perfect functionality.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Rocket,
    title: "Launch",
    description: "Deploying your website with optimized performance and SEO configurations.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: HeartHandshake,
    title: "Support",
    description: "Ongoing maintenance and support to keep your website running smoothly.",
    color: "from-pink-500 to-rose-500",
  },
];

const WorkProcessSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium mb-4 block">How I Work</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            My Work <span className="gradient-text">Process</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A streamlined approach to deliver exceptional results on every project
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line - Desktop */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-secondary to-primary rounded-full" />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative lg:flex lg:items-center ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content Card */}
                <div className={`lg:w-5/12 ${index % 2 === 0 ? "lg:pr-12 lg:text-right" : "lg:pl-12"}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass-card p-6 relative group"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
                    
                    <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? "lg:justify-end" : ""}`}>
                      <div className={`lg:hidden w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                        <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </motion.div>
                </div>

                {/* Center Icon - Desktop */}
                <div className="hidden lg:flex lg:w-2/12 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg relative z-10`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </motion.div>
                </div>

                {/* Spacer */}
                <div className="hidden lg:block lg:w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkProcessSection;
