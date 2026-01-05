import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import VSLPlayer from "@/components/VSLPlayer";
import BenefitsSection from "@/components/BenefitsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import FooterSection from "@/components/FooterSection";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UTMParams {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}

export default function LandingPage() {
  const [isVideoUnlocked, setIsVideoUnlocked] = useState(false);
  const [utmParams, setUtmParams] = useState<UTMParams>({
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      utmContent: params.get("utm_content"),
      utmTerm: params.get("utm_term"),
    };
    setUtmParams(utm);

    // Track PageView with Meta Pixel (if available)
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
    
    console.log("PageView tracked with UTM:", utm);
  }, []);

  const handleFormSubmit = async (data: { name: string; email: string; phone: string }) => {
    try {
      // Send lead to backend API
      await apiRequest("POST", "/api/leads", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        utmSource: utmParams.utmSource,
        utmMedium: utmParams.utmMedium,
        utmCampaign: utmParams.utmCampaign,
        utmContent: utmParams.utmContent,
        utmTerm: utmParams.utmTerm,
      });

      // Track Lead event with Meta Pixel (if available)
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", {
          content_name: "VSL Optin",
          utm_source: utmParams.utmSource,
          utm_content: utmParams.utmContent,
        });
      }

      console.log("Lead captured and sent to backend:", {
        ...data,
        ...utmParams,
      });

      setIsVideoUnlocked(true);
      
      toast({
        title: "Erfolgreich freigeschaltet!",
        description: "Du kannst jetzt das Video ansehen. Scrolle nach unten.",
      });

      setTimeout(() => {
        document.getElementById("vsl-section")?.scrollIntoView({ 
          behavior: "smooth",
          block: "start"
        });
      }, 500);
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        title: "Fehler",
        description: "Etwas ist schief gelaufen. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection 
        onFormSubmit={handleFormSubmit}
        isVideoUnlocked={isVideoUnlocked}
      />
      
      <div id="vsl-section">
        <VSLPlayer isUnlocked={isVideoUnlocked} />
      </div>
      
      <BenefitsSection />
      <TestimonialsSection />
      <CTASection 
        onFormSubmit={handleFormSubmit}
        isVideoUnlocked={isVideoUnlocked}
      />
      <FooterSection />
    </div>
  );
}
