import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface GoogleAnalyticsProps {
  measurementId?: string;
}

const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  const location = useLocation();
  const GA_ID = measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!GA_ID) return;

    // Load Google Analytics script
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script1);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      page_path: location.pathname,
    });

    return () => {
      // Cleanup if needed
      document.head.removeChild(script1);
    };
  }, [GA_ID]);

  // Track page views on route change
  useEffect(() => {
    if (!GA_ID || !window.gtag) return;
    
    window.gtag("config", GA_ID, {
      page_path: location.pathname + location.search,
    });
  }, [location, GA_ID]);

  return null;
};

// Helper function to track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export default GoogleAnalytics;
