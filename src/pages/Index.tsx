import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TechStackSection from "@/components/TechStackSection";
import AboutSection from "@/components/AboutSection";
import SkillsProgressSection from "@/components/SkillsProgressSection";
import ServicesSection from "@/components/ServicesSection";
import WorkProcessSection from "@/components/WorkProcessSection";
import PortfolioSection from "@/components/PortfolioSection";
import StatsSection from "@/components/StatsSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import AnimatedBackground from "@/components/AnimatedBackground";
import PageLoader from "@/components/PageLoader";
import ScrollProgress from "@/components/ScrollProgress";

const Index = () => {
  return (
    <>
      <PageLoader />
      <ScrollProgress />
      <main className="min-h-screen bg-background relative">
        <AnimatedBackground />
        <Navbar />
        <HeroSection />
        <TechStackSection />
        <AboutSection />
        <SkillsProgressSection />
        <ServicesSection />
        <WorkProcessSection />
        <PortfolioSection />
        <StatsSection />
        <WhyChooseSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
        <ContactSection />
        <Footer />
        <FloatingButtons />
      </main>
    </>
  );
};

export default Index;
