import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, Apple, Chrome, Share, MoreVertical, PlusSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const steps = isIOS
    ? [
        { icon: Share, text: "Tap the Share button in Safari" },
        { icon: PlusSquare, text: 'Scroll down and tap "Add to Home Screen"' },
        { icon: CheckCircle2, text: "Tap Add to install Morzen" },
      ]
    : [
        { icon: MoreVertical, text: "Tap the menu button (⋮) in Chrome" },
        { icon: Download, text: 'Select "Install app" or "Add to Home Screen"' },
        { icon: CheckCircle2, text: "Tap Install to add Morzen" },
      ];

  return (
    <>
      <Helmet>
        <title>Install Morzen App | Add to Home Screen</title>
        <meta name="description" content="Install Morzen as a mobile app for quick access to web development services. Works offline and loads instantly." />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen bg-background pt-20">
        <section className="section-padding">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Smartphone className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Install App</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Install <span className="gradient-text">Morzen</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Add Morzen to your home screen for instant access. Works offline and loads faster than a regular website.
              </p>
            </motion.div>

            {isInstalled ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 text-center"
              >
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Already Installed!</h2>
                <p className="text-muted-foreground">
                  Morzen is already installed on your device. Open it from your home screen for the best experience.
                </p>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Install Button Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    {isIOS ? (
                      <Apple className="w-8 h-8 text-primary" />
                    ) : (
                      <Chrome className="w-8 h-8 text-primary" />
                    )}
                    <h2 className="text-xl font-bold">
                      {isIOS ? "Install on iPhone/iPad" : "Install on Android"}
                    </h2>
                  </div>

                  {deferredPrompt && !isIOS ? (
                    <Button
                      size="lg"
                      className="w-full mb-6"
                      onClick={handleInstallClick}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Install Morzen App
                    </Button>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                      <p className="text-sm text-muted-foreground">
                        {isIOS
                          ? "Use Safari browser to install this app."
                          : "Use Chrome browser for the best install experience."}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      Manual Installation Steps
                    </h3>
                    {steps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <step.icon className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm">{step.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Benefits Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-8"
                >
                  <h2 className="text-xl font-bold mb-6">Why Install?</h2>
                  
                  <div className="space-y-6">
                    {[
                      {
                        title: "Instant Access",
                        description: "Launch Morzen directly from your home screen with one tap.",
                      },
                      {
                        title: "Works Offline",
                        description: "Browse services and portfolio even without internet connection.",
                      },
                      {
                        title: "Faster Loading",
                        description: "App loads instantly, much faster than opening in a browser.",
                      },
                      {
                        title: "Full Screen Experience",
                        description: "No browser bars - enjoy a native app-like experience.",
                      },
                    ].map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Install;
