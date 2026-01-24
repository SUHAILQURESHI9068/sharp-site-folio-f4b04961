import { useState } from "react";
import { Github, Linkedin, Twitter, Instagram, Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscriptions")
        .insert({ email });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to the newsletter.",
          });
        } else {
          throw error;
        }
      } else {
        // Send email notification (fire and forget)
        supabase.functions.invoke("send-notification", {
          body: { type: "newsletter", data: { email } },
        }).catch(console.error);

        toast({
          title: "Subscribed!",
          description: "You've been added to the newsletter.",
        });
        setEmail("");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#portfolio", label: "Portfolio" },
    { href: "#pricing", label: "Pricing" },
    { href: "#contact", label: "Contact" },
  ];

  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" }, // TODO: Add your LinkedIn URL
  ];

  return (
    <footer className="border-t border-border/50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
          <div className="col-span-2">
            <a href="#home" className="text-xl md:text-2xl font-bold mb-4 block">
              <span className="gradient-text">Morzen</span>
            </a>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-4">
              Professional web developer creating modern, fast, and high-converting 
              websites that help businesses grow online.
            </p>
            <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-primary flex-shrink-0" />
                <span className="break-words">Saharanpur, Uttar Pradesh, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-primary flex-shrink-0" />
                <a href="tel:+917500669672" className="hover:text-primary transition-colors">+91 7500669672</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-primary flex-shrink-0" />
                <a href="mailto:suhailqureshi0828@gmail.com" className="hover:text-primary transition-colors break-all text-[11px] md:text-sm">suhailqureshi0828@gmail.com</a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Quick Links</h4>
            <ul className="space-y-1.5 md:space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-xs md:text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Newsletter</h4>
            <p className="text-muted-foreground text-xs md:text-sm mb-3">
              Get updates on new projects and tips.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 md:h-10 text-xs md:text-sm"
              />
              <Button type="submit" size="icon" className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <Send className="h-3 w-3 md:h-4 md:w-4" />}
              </Button>
            </form>
            <div className="flex gap-2 md:gap-3 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <social.icon size={16} className="md:w-[18px] md:h-[18px]" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 md:pt-8 text-center">
          <p className="text-muted-foreground text-xs md:text-sm">
            © {currentYear} Morzen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
