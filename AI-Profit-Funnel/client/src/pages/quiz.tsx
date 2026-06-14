import { useLocation } from "wouter";
import { useAnalytics } from "@/hooks/useAnalytics";
import MiniFunnel from "@/components/MiniFunnel";
import { useEffect } from "react";

export default function QuizPage() {
  const [, navigate] = useLocation();
  const { trackPageView, trackEvent } = useAnalytics();

  useEffect(() => {
    trackPageView("/quiz");
  }, []);

  const handleComplete = (answers: Record<number, string>) => {
    fetch("/api/quiz-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        frage_1_alter: answers[1] ?? "",
        frage_2_situation: answers[2] ?? "",
        frage_3_ziel: answers[3] ?? "",
        frage_4_finanzielles_ziel: answers[4] ?? "",
        frage_5_zeitaufwand: answers[5] ?? "",
        quelle: "KI-Klick Methode Quiz",
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
    navigate("/thankyou");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <section className="flex-1 py-10 sm:py-14 px-3 sm:px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-4">
              Nur 5 kurze Fragen
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
              Bist du für die KI-Klick Methode geeignet?
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Beantworte die Fragen ehrlich — dauert nur 60 Sekunden.
            </p>
          </div>

          <div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg shadow-primary/5">
            <MiniFunnel onComplete={handleComplete} onTrackEvent={trackEvent} />
          </div>
        </div>
      </section>

      <footer className="py-5 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
            <a href="/impressum" className="hover:text-foreground transition-colors">Impressum</a>
            <span>|</span>
            <a href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutzerklärung</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
