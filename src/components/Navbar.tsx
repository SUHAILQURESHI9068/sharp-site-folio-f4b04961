import { useState } from "react";
import { Menu, X, Circle } from "lucide-react";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { Link } from "react-router-dom";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#pricing", label: "Pricing" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isAvailable = true;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-20">
          <div className="flex items-center gap-2 md:gap-3">
            <a href="#home" className="text-lg md:text-2xl font-bold">
              <span className="gradient-text">Morzen</span>
            </a>
            <div className={`hidden sm:flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
              isAvailable 
                ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
            }`}>
              <Circle className={`w-1.5 h-1.5 md:w-2 md:h-2 fill-current ${isAvailable ? "animate-pulse" : ""}`} />
              <span className="hidden md:inline">{isAvailable ? "Available for Work" : "Currently Busy"}</span>
              <span className="md:hidden">{isAvailable ? "Available" : "Busy"}</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/contact"
              className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm font-medium"
            >
              Contact
            </Link>
            <ThemeToggle />
            <Button size="sm" asChild>
              <a href="#contact">Hire Me</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="text-foreground p-1"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium py-1"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/contact"
                className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium py-1"
                onClick={() => setIsOpen(false)}
              >
                Contact Page
              </Link>
              <Button size="sm" className="w-fit mt-2" asChild>
                <a href="#contact" onClick={() => setIsOpen(false)}>Hire Me</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
