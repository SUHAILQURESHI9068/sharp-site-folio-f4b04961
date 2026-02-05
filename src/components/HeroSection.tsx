import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "./ui/button";
import { TypeAnimation } from "react-type-animation";
import heroBg from "@/assets/hero-bg.jpg";
import laptopHero from "@/assets/laptop-hero.png";

const HeroSection = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16 md:pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      
      {/* Animated glow effects */}
      <div className="absolute top-1/4 -right-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -left-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-secondary/20 rounded-full blur-[60px] md:blur-[100px] animate-pulse" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 md:px-4 py-1.5 md:py-2 mb-4 md:mb-6 text-xs md:text-sm font-medium text-primary bg-primary/10 rounded-full border border-primary/20">
                🚀 AI-Native Web Expert
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight"
            >
              I Build{" "}
              <span className="gradient-text">High-Converting</span>
              <br />
              <TypeAnimation
                sequence={[
                  "Web Apps & Digital Experiences",
                  2000,
                  "in Days, Not Weeks.",
                  2000,
                  "with AI-Powered Speed",
                  2000,
                  "Custom Supabase Solutions",
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="text-foreground"
              />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-10 max-w-xl mx-auto lg:mx-0"
            >
              Helping businesses scale with AI-powered, lightning-fast websites and custom Supabase integrations. Production-ready results delivered at 10x speed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start"
            >
              <Button size="lg" className="group w-full sm:w-auto" asChild>
                <a href="#contact">
                  Hire Me
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <a href="/resume.pdf" download="Morzen_Resume.pdf">
                  <Download className="mr-2" />
                  Download CV
                </a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 md:mt-12 flex flex-wrap justify-center lg:justify-start gap-6 md:gap-8"
            >
              {[
                { value: "50+", label: "Projects Completed" },
                { value: "30+", label: "Happy Clients" },
                { value: "5+", label: "Years Experience" },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Laptop Image */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full" />
              <motion.img
                src={laptopHero}
                alt="Web Developer Workspace"
                className="relative z-10 w-full max-w-lg mx-auto drop-shadow-2xl"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
