import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import Quiz, { QuizAnswers } from "@/components/Quiz";
import LeadForm from "@/components/LeadForm";
import DisqualifiedMessage from "@/components/DisqualifiedMessage";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, ChevronRight, Users, Star, TrendingUp, Clock, Target, Coins, GraduationCap, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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


const benefits = [
  { icon: Coins, title: "Umsatzgarantie", description: "Du erhältst eine klare Garantie" },
  { icon: GraduationCap, title: "Komplette Schulung", description: "Umfassende Ausbildung inklusive" },
  { icon: Target, title: "KI gestützt", description: "Lerne wie du KI richtig nutzt" },
  { icon: Clock, title: "Flexible Zeiten", description: "Arbeite wann du willst" },
  { icon: TrendingUp, title: "Wachsender Markt", description: "Explodierender KI-Markt" },
  { icon: HeadphonesIcon, title: "1:1 Support", description: "Persönlicher Ansprechpartner" },
];


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
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const quizRef = useRef<HTMLDivElement>(null);
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
    quizRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleQuizComplete = (answers: QuizAnswers) => {
    setQuizAnswers(answers);
    setFunnelState("form");
  };

  const handleDisqualify = () => {
    setFunnelState("disqualified");
  };

  const handleFormSubmit = async (data: { name: string; email: string; countryCode: string; phone: string }) => {
    setIsLoading(true);
    try {
      const fullPhone = `${data.countryCode} ${data.phone}`;
      await apiRequest("POST", "/api/leads", {
        name: data.name,
        email: data.email,
        phone: fullPhone,
        utmSource: utmParams.utmSource,
        utmMedium: utmParams.utmMedium,
        utmCampaign: utmParams.utmCampaign,
        utmContent: utmParams.utmContent,
        utmTerm: utmParams.utmTerm,
        source: "Quiz Funnel",
        quizAnswers: quizAnswers,
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section - Kompakt mit direktem CTA */}
      <section className="relative flex flex-col items-center justify-center px-3 pt-8 pb-3 sm:px-4 sm:pt-12 sm:pb-4 md:pt-16 md:pb-6 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[200px] sm:h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 w-full">
          <div className="mb-2 sm:mb-3">
            <LiveCounter />
          </div>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-2 sm:mb-3 px-2">
            Finde in <span className="text-primary">30 Sekunden</span> heraus, ob du dafür geeignet bist.
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 text-muted-foreground text-[10px] sm:text-xs md:text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary flex-shrink-0" />
              <span>350+ erfolgreiche Partner</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary flex-shrink-0" />
              <span>90% automatisiert</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary flex-shrink-0" />
              <span>Keine Vorkenntnisse nötig</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Section - Der Hauptfokus mit Highlight */}
      <section ref={quizRef} className="py-6 sm:py-8 md:py-10 px-3 sm:px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg shadow-primary/5">
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
          </div>
        </div>
      </section>

      {/* Mini Social Proof - Direkt nach dem Quiz */}
      <section className="py-6 sm:py-8 px-3 sm:px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
            ))}
            <span className="ml-2 text-xs sm:text-sm text-muted-foreground">350+ zufriedene Partner</span>
          </div>
        </div>
      </section>

      {/* Benefits Section - Kompakt */}
      <section className="py-10 sm:py-14 md:py-20 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12">
            Das bekommst du als Partner
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-3 sm:p-4 md:p-5 text-center">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <benefit.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* System Section - Ohne CTA */}
      <section className="py-10 sm:py-14 md:py-20 px-3 sm:px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="flex flex-col items-center text-center order-first lg:order-last">
              <img 
                src="/assets/WhatsApp_Image_2025-12-12_at_11.54.15_(1)_1765900281327.jpeg" 
                alt="Florian Mehler"
                className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full object-cover border-4 border-primary/30 mb-3 sm:mb-4"
              />
              <p className="text-base sm:text-lg text-foreground font-medium">Florian Mehler</p>
              <p className="text-sm sm:text-base text-muted-foreground">Gründer der KI-Klick Methode</p>
            </div>

            <div className="order-last lg:order-first">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-4 sm:mb-5 text-center lg:text-left">
                Das System für normale Angestellte
              </h2>
              <p className="text-sm sm:text-base text-foreground mb-4">
                Baue dir neben deinem Job ein zweites Einkommen auf. Ohne verkaufen zu müssen oder ein eigenes Business von null zu starten.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  "Keine Vorerfahrung nötig",
                  "Nur 1-2h Zeitaufwand pro Tag",
                  "Von überall aus möglich",
                  "Neben dem Job machbar",
                  "Ohne dein Gesicht zu zeigen",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-foreground">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Einziger CTA nach Content */}
      <section className="py-10 sm:py-14 md:py-20 px-3 sm:px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            Bereit für den ersten Schritt?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-5 sm:mb-6">
            Finde jetzt heraus, ob das System zu dir passt.
          </p>
          <Button
            size="lg"
            onClick={scrollToQuiz}
            className="h-12 sm:h-14 px-8 sm:px-12 text-base sm:text-lg font-semibold w-full sm:w-auto touch-manipulation active:scale-[0.98] transition-transform"
          >
            <ChevronRight className="mr-2 h-5 w-5" />
            Quiz starten
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-3 sm:px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-4 sm:mb-6">
            <p className="text-[10px] sm:text-xs text-primary font-medium">© 2026 KI-Klick Methode</p>
            <p className="text-[10px] sm:text-xs text-primary">Alle Rechte vorbehalten.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Impressum</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">Datenschutzerklärung</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
