import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I get an Admin Panel?",
    answer: "Yes! Growth and Enterprise plans include a custom-configured dashboard or CMS, allowing you to manage your content without touching a single line of code. You can update text, images, and even add new blog posts easily.",
  },
  {
    question: "How long does it take to build a website?",
    answer: "With AI-powered development, I deliver 10x faster than traditional agencies. Standard Business sites are ready in 5-7 days, Growth plans in 2 weeks, and Enterprise projects in 3-4 weeks depending on complexity.",
  },
  {
    question: "What makes your approach different?",
    answer: "I leverage cutting-edge AI tools like Lovable, v0.dev, and Bolt.new combined with Supabase for enterprise-grade backends. This means faster delivery, lower costs, and production-ready code from day one.",
  },
  {
    question: "Do you provide hosting services?",
    answer: "I can help you set up hosting on reliable platforms like Vercel, Netlify, or traditional hosting providers. I'll guide you through the process and ensure smooth deployment.",
  },
  {
    question: "What about website maintenance?",
    answer: "Yes! All plans include post-launch support. Growth and Enterprise plans include extended maintenance periods to keep your website updated, secure, and running smoothly.",
  },
  {
    question: "Can you integrate payment gateways?",
    answer: "Absolutely! Enterprise plans include full payment gateway integration (Razorpay, Stripe, PayPal). I handle the complete setup including webhooks, order management, and secure checkout flows.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "I accept Razorpay (UPI, cards, net banking), bank transfers, and PayPal. A 50% advance is required to start the project, with the balance due upon completion.",
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
