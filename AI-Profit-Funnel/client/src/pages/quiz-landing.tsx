import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Quiz from "@/components/Quiz";
import LeadForm from "@/components/LeadForm";
import DisqualifiedMessage from "@/components/DisqualifiedMessage";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

function LiveCounter() {
  const [count, setCount] = useState(Math.floor(Math.random() * 8) + 18);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = prev + change;
        return Math.max(12, Math.min(35, newCount));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <Users className="h-3 w-3 text-primary" />
      <span className="text-xs text-foreground font-medium">{count} Personen machen gerade den Test</span>
    </div>
  );
}

type FunnelState = "quiz" | "form" | "disqualified";

interface UTMParams {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}

export default function QuizLandingPage() {
  const [funnelState, setFunnelState] = useState<FunnelState>("quiz");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [utmParams, setUtmParams] = useState<UTMParams>({
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmParams({
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      utmContent: params.get("utm_content"),
      utmTerm: params.get("utm_term"),
    });

    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  }, []);

  const scrollToQuiz = () => {
    document.getElementById("quiz-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleQuizComplete = () => {
    setFunnelState("form");
  };

  const handleDisqualify = () => {
    setFunnelState("disqualified");
  };

  const handleFormSubmit = async (data: { name: string; email: string }) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/leads", {
        name: data.name,
        email: data.email,
        utmSource: utmParams.utmSource,
        utmMedium: utmParams.utmMedium,
        utmCampaign: utmParams.utmCampaign,
        utmContent: utmParams.utmContent,
        utmTerm: utmParams.utmTerm,
      });

      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", {
          content_name: "Quiz Optin",
          utm_source: utmParams.utmSource,
        });
      }

      toast({
        title: "Erfolgreich!",
        description: "Du wirst jetzt zum Video weitergeleitet.",
      });

      setTimeout(() => {
        setLocation("/vsl");
      }, 1000);
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        title: "Fehler",
        description: "Etwas ist schief gelaufen. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-6 pb-4 sm:pt-8 sm:pb-6 md:pt-10 md:pb-8 text-center overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-3 sm:mb-4">
            <LiveCounter />
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-3 sm:mb-4">
            Finde in <span className="text-primary">30 Sekunden</span> heraus, ob du dafür geeignet bist.
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-muted-foreground text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>750+ erfolgreiche Teilnehmer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>90% automatisiert</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>Keine Vorkenntnisse nötig</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz / Form / Disqualified Section */}
      <section id="quiz-section" className="flex items-center justify-center py-4 sm:py-6 md:py-8">
        {funnelState === "quiz" && (
          <Quiz onComplete={handleQuizComplete} onDisqualify={handleDisqualify} />
        )}
        {funnelState === "form" && (
          <LeadForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        )}
        {funnelState === "disqualified" && (
          <div className="w-full">
            <DisqualifiedMessage />
          </div>
        )}
      </section>

      {/* System Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
                Das System das für normale Angestellte wirklich funktioniert
              </h2>
              <p className="text-foreground mb-4">
                Das System ist für alle die sich neben ihrem Haupt- oder Teilzeitjob ein zweites Einkommen aufbauen wollen. Ohne verkaufen zu müssen oder ihr eigenes Business von 0 auf aufzubauen.
              </p>
              <p className="text-foreground mb-6">
                Ob du gerade erst startest oder schon Erfahrung hast, spielt keine Rolle. Mit unserer <span className="font-medium">Schritt-für-Schritt-Anleitung</span> kannst du sofort loslegen – flexibel, anonym und effektiv.
              </p>
              <ul className="space-y-3">
                {[
                  "Keine Vorerfahrung nötig",
                  "Mit 1-2h Zeitaufwand pro Tag",
                  "Von überall aus",
                  "Neben dem Vollzeit- oder Teilzeitjob",
                  "Ohne dein Gesicht zu zeigen",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                onClick={scrollToQuiz}
                className="mt-8 h-14 px-10 text-lg font-semibold"
                data-testid="button-cta-test"
              >
                <ChevronRight className="mr-2 h-5 w-5" />
                Teste jetzt, ob du geeignet bist
              </Button>
            </div>

            <div className="flex flex-col items-center text-center">
              <img 
                src="/assets/WhatsApp_Image_2025-12-12_at_11.54.15_(1)_1765900281327.jpeg" 
                alt="Florian Mehler"
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-primary/30 mb-4"
              />
              <p className="text-lg text-foreground font-medium">
                Florian Mehler
              </p>
              <p className="text-muted-foreground">
                der Gründer des KI Agenten Modells
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Bereit für den ersten Schritt?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Finde jetzt heraus, ob das System zu dir passt.
          </p>
          <Button
            size="lg"
            onClick={scrollToQuiz}
            className="h-14 px-10 text-lg font-semibold"
            data-testid="button-cta-final"
          >
            <ChevronRight className="mr-2 h-5 w-5" />
            Teste jetzt, ob du geeignet bist
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          {/* Disclaimer */}
          <div className="mb-6">
            <p className="text-xs text-primary font-medium mb-2">Haftungsausschluss & Disclaimer:</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Diese Website ist nicht Teil der Facebook-Website oder der Facebook Inc. Außerdem wird diese Website in keiner Weise von Facebook unterstützt.<br />
              FACEBOOK ist eine Marke von FACEBOOK, Inc.
            </p>
          </div>

          {/* Copyright */}
          <div className="mb-6">
            <p className="text-xs text-primary font-medium">© 2025 KI Lizenzpartner</p>
            <p className="text-xs text-primary">Alle Rechte vorbehalten.</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Impressum</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">Datenschutzerklärung</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">Allgemeine Geschäftsbedingungen</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
