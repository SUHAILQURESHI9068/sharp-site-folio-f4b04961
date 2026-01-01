import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, Github, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const categories = ["All", "Website", "E-commerce", "Web App", "Landing Page"];
const technologies = ["All Tech", "React", "Next.js", "Node.js", "TypeScript", "WordPress"];

const projects = [
  {
    id: 1,
    title: "E-commerce Fashion Store",
    category: "E-commerce",
    description: "A modern fashion e-commerce platform with advanced filtering, wishlist, and seamless checkout experience.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    technologies: ["React", "Node.js", "Stripe"],
    liveUrl: "https://fashion-store-demo.com",
    githubUrl: "https://github.com/example/fashion-store",
  },
  {
    id: 2,
    title: "SaaS Dashboard",
    category: "Web App",
    description: "Comprehensive analytics dashboard for business intelligence with real-time data visualization.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    technologies: ["React", "TypeScript", "Tailwind"],
    liveUrl: "https://saas-dashboard-demo.com",
    githubUrl: "https://github.com/example/saas-dashboard",
  },
  {
    id: 3,
    title: "Restaurant Website",
    category: "Website",
    description: "Elegant restaurant website with online reservation system and menu management.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    technologies: ["WordPress", "PHP", "MySQL"],
    liveUrl: "https://restaurant-demo.com",
  },
  {
    id: 4,
    title: "Fitness App Landing",
    category: "Landing Page",
    description: "High-converting landing page for a fitness mobile application with animated sections.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
    technologies: ["React", "Framer Motion", "Tailwind"],
    liveUrl: "https://fitness-landing-demo.com",
    githubUrl: "https://github.com/example/fitness-landing",
  },
  {
    id: 5,
    title: "Real Estate Platform",
    category: "Web App",
    description: "Property listing platform with advanced search, map integration, and virtual tours.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    technologies: ["Next.js", "MongoDB", "MapBox"],
    liveUrl: "https://realestate-demo.com",
    githubUrl: "https://github.com/example/real-estate",
  },
  {
    id: 6,
    title: "Tech Startup Website",
    category: "Website",
    description: "Modern tech company website with interactive elements and smooth animations.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    technologies: ["React", "GSAP", "Tailwind"],
    liveUrl: "https://tech-startup-demo.com",
  },
  {
    id: 7,
    title: "Crypto Exchange",
    category: "Web App",
    description: "Cryptocurrency trading platform with real-time charts and secure wallet integration.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop",
    technologies: ["React", "Web3", "Node.js"],
    liveUrl: "https://crypto-exchange-demo.com",
    githubUrl: "https://github.com/example/crypto-exchange",
  },
  {
    id: 8,
    title: "Product Launch Landing",
    category: "Landing Page",
    description: "Conversion-optimized landing page for a product launch with countdown and email capture.",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop",
    technologies: ["React", "Tailwind", "Mailchimp"],
    liveUrl: "https://product-launch-demo.com",
  },
];

const PortfolioSection = () => {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTech, setActiveTech] = useState("All Tech");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = projects.filter((p) => {
    const matchesCategory = activeFilter === "All" || p.category === activeFilter;
    const matchesTech = activeTech === "All Tech" || p.technologies.includes(activeTech);
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesTech && matchesSearch;
  });

  return (
    <section id="portfolio" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium mb-4 block">My Work</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A showcase of my recent work and creative solutions
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="max-w-md mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search projects by name, description, or technology..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-base"
            />
          </div>
        </motion.div>

        {/* Category Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-6"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === category
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Technology Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {technologies.map((tech) => (
            <motion.button
              key={tech}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTech(tech)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                activeTech === tech
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              }`}
            >
              {tech}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="glass-card overflow-hidden group cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-sm font-medium text-foreground">View Project</span>
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-md">
                      {project.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-12"
          >
            No projects found matching your criteria.
          </motion.p>
        )}

        {/* Project Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-lg"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card max-w-2xl w-full max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-8">
                  <span className="text-sm text-primary font-medium">{selectedProject.category}</span>
                  <h3 className="text-2xl font-bold mt-2 mb-4">{selectedProject.title}</h3>
                  <p className="text-muted-foreground mb-6">{selectedProject.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {selectedProject.liveUrl && (
                      <Button 
                        className="flex-1"
                        onClick={() => window.open(selectedProject.liveUrl, "_blank")}
                      >
                        <ExternalLink size={18} className="mr-2" />
                        View Live
                      </Button>
                    )}
                    {selectedProject.githubUrl && (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.open(selectedProject.githubUrl, "_blank")}
                      >
                        <Github size={18} className="mr-2" />
                        GitHub
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PortfolioSection;