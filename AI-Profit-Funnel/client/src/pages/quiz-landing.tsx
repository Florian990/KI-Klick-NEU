import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import Quiz from "@/components/Quiz";
import LeadForm from "@/components/LeadForm";
import DisqualifiedMessage from "@/components/DisqualifiedMessage";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, ChevronRight, Users, Star, TrendingUp, Clock, Target, Coins, GraduationCap, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import avatar1 from "@assets/generated_images/male_testimonial_avatar_1.png";
import avatar2 from "@assets/generated_images/female_testimonial_avatar_2.png";
import avatar3 from "@assets/generated_images/male_testimonial_avatar_3.png";
import avatar4 from "@assets/generated_images/female_testimonial_avatar_4.png";

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

const miniTestimonials = [
  { name: "Thomas M.", result: "12.400€ im 1. Monat", avatar: avatar1 },
  { name: "Sandra W.", result: "8.900€ Durchschnitt", avatar: avatar2 },
  { name: "Markus S.", result: "15.200€ Rekord", avatar: avatar3 },
];

const benefits = [
  { icon: Coins, title: "Hohe Provisionen", description: "5-stellige Provisionen pro Deal" },
  { icon: GraduationCap, title: "Komplette Schulung", description: "Umfassende Ausbildung inklusive" },
  { icon: Target, title: "Warme Leads", description: "Vorqualifizierte Kontakte" },
  { icon: Clock, title: "Flexible Zeiten", description: "Arbeite wann du willst" },
  { icon: TrendingUp, title: "Wachsender Markt", description: "Explodierender KI-Markt" },
  { icon: HeadphonesIcon, title: "1:1 Support", description: "Persönlicher Ansprechpartner" },
];

const fullTestimonials = [
  {
    quote: "Innerhalb von 3 Monaten habe ich meinen ersten 5-stelligen Deal abgeschlossen. Die Schulungen und der Support sind erstklassig.",
    name: "Thomas Müller",
    role: "Vertriebspartner seit 2024",
    result: "12.400€ Provision im ersten Monat",
    avatar: avatar1,
  },
  {
    quote: "Endlich ein seriöses Geschäftsmodell im Vertrieb. Die KI-Produkte verkaufen sich praktisch von selbst, weil Unternehmen sie wirklich brauchen.",
    name: "Sandra Weber",
    role: "Ehemalige Bankkauffrau",
    result: "8.900€ Durchschnitt pro Monat",
    avatar: avatar2,
  },
  {
    quote: "Als Quereinsteiger war ich skeptisch. Aber die Ausbildung hat mich perfekt vorbereitet. Heute verdiene ich mehr als in meinem alten Job.",
    name: "Markus Schmidt",
    role: "Quereinsteiger aus der IT",
    result: "15.200€ im besten Monat",
    avatar: avatar3,
  },
  {
    quote: "Die Flexibilität ist unbezahlbar. Ich arbeite von zu Hause und habe endlich Zeit für meine Familie - bei besserem Einkommen als je zuvor.",
    name: "Christine Bauer",
    role: "Vertriebspartnerin seit 2023",
    result: "Über 100.000€ im ersten Jahr",
    avatar: avatar4,
  },
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section - Kompakt mit direktem CTA */}
      <section className="relative flex flex-col items-center justify-center px-3 pt-4 pb-3 sm:px-4 sm:pt-6 sm:pb-4 md:pt-8 md:pb-6 text-center overflow-hidden">
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
              <span>750+ erfolgreiche Teilnehmer</span>
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
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
            ))}
            <span className="ml-2 text-xs sm:text-sm text-muted-foreground">750+ zufriedene Partner</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {miniTestimonials.map((t, i) => (
              <div key={i} className="flex items-center gap-2 bg-background/50 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                  <AvatarImage src={t.avatar} alt={t.name} />
                  <AvatarFallback>{t.name[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs font-medium">{t.name}</p>
                  <p className="text-[10px] sm:text-xs text-primary font-semibold">{t.result}</p>
                </div>
              </div>
            ))}
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
              <p className="text-sm sm:text-base text-muted-foreground">Gründer des KI Agenten Modells</p>
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

              <Button
                size="lg"
                onClick={scrollToQuiz}
                className="mt-6 sm:mt-8 h-12 sm:h-14 px-8 sm:px-12 text-base sm:text-lg font-semibold w-full sm:w-auto touch-manipulation active:scale-[0.98] transition-transform"
              >
                <ChevronRight className="mr-2 h-5 w-5" />
                Quiz starten
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Full Testimonials Section */}
      <section className="py-10 sm:py-14 md:py-20 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-2 sm:mb-3">
            Das sagen unsere Partner
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 sm:mb-8 md:mb-12">
            Echte Erfolgsgeschichten von Menschen wie dir
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {fullTestimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <blockquote className="text-sm sm:text-base leading-relaxed mb-4 italic text-muted-foreground">
                    "{testimonial.quote}"
                  </blockquote>

                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">{testimonial.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs sm:text-sm font-semibold text-primary">{testimonial.result}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            <p className="text-[10px] sm:text-xs text-primary font-medium mb-1 sm:mb-2">Haftungsausschluss:</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
              Diese Website ist nicht Teil der Facebook-Website oder der Facebook Inc. Außerdem wird diese Website in keiner Weise von Facebook unterstützt. FACEBOOK ist eine Marke von FACEBOOK, Inc.
            </p>
          </div>

          <div className="mb-4 sm:mb-6">
            <p className="text-[10px] sm:text-xs text-primary font-medium">© 2025 KI Lizenzpartner</p>
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
