import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does it take to build a website?",
    answer: "Depending on the complexity, a basic website takes 5-7 days, while more complex projects can take 2-4 weeks. I'll provide a detailed timeline after understanding your requirements.",
  },
  {
    question: "How many revisions are included?",
    answer: "The number of revisions depends on the package you choose. Basic includes 3 revisions, Standard includes 5, and Premium offers unlimited revisions until you're completely satisfied.",
  },
  {
    question: "Do you provide hosting services?",
    answer: "I can help you set up hosting on reliable platforms like Vercel, Netlify, or traditional hosting providers. I'll guide you through the process and ensure smooth deployment.",
  },
  {
    question: "What about website maintenance?",
    answer: "Yes! I offer ongoing maintenance packages to keep your website updated, secure, and running smoothly. This includes regular updates, backups, and technical support.",
  },
  {
    question: "Can you redesign my existing website?",
    answer: "Absolutely! I specialize in website redesigns. I'll analyze your current site, understand your goals, and create a fresh, modern design that improves user experience and conversions.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "I accept various payment methods including bank transfers, PayPal, and major credit cards. A 50% deposit is required to start the project, with the balance due upon completion.",
  },
  {
    question: "Will my website be mobile-friendly?",
    answer: "Yes! All websites I create are fully responsive and optimized for all devices including smartphones, tablets, and desktops. Mobile-friendliness is a standard feature, not an add-on.",
  },
];

const FAQSection = () => {
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
          <span className="text-primary font-medium mb-4 block">FAQ</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get answers to common questions about my services
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card px-6 border-border/50"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
