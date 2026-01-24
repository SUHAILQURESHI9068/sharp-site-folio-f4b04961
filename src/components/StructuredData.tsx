import { Helmet } from "react-helmet-async";

const StructuredData = () => {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Suhail Qureshi",
    alternateName: "Morzen",
    url: "https://morzenx.lovable.app",
    image: "https://morzenx.lovable.app/og-image.png",
    jobTitle: "Web Developer & Designer",
    worksFor: {
      "@type": "Organization",
      name: "Morzen",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Saharanpur",
      addressRegion: "Uttar Pradesh",
      addressCountry: "India",
    },
    email: "suhailqureshi0828@gmail.com",
    telephone: "+917500669672",
    sameAs: [
      "https://www.linkedin.com/in/suhail-qureshi-9694a32a8",
      "https://www.instagram.com/suhail.founder",
      "https://www.facebook.com/share/1BRY3caUyH/",
    ],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Morzen Web Development",
    image: "https://morzenx.lovable.app/og-image.png",
    url: "https://morzenx.lovable.app",
    telephone: "+917500669672",
    email: "suhailqureshi0828@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Saharanpur",
      addressRegion: "Uttar Pradesh",
      addressCountry: "India",
    },
    priceRange: "₹₹",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 29.9680,
        longitude: 77.5460,
      },
      geoRadius: "50000",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Web Development Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom Website Development",
            description: "Professional website development with modern technologies",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "E-commerce Solutions",
            description: "Full-featured online stores with payment integration",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "UI/UX Design",
            description: "Modern, user-friendly interface design",
          },
        },
      ],
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Morzen",
    url: "https://morzenx.lovable.app",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://morzenx.lovable.app/blog?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(personSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
