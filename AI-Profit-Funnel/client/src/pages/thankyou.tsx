import { useEffect } from "react";
import { CheckCircle, Star } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

declare namespace JSX {
  interface IntrinsicElements {
    "close-form": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { id?: string }, HTMLElement>;
  }
}

function CloseForm() {
  useEffect(() => {
    if (document.querySelector('script[src*="closeiocdn.com"]')) return;
    const script = document.createElement("script");
    script.src = "https://webforms.closeiocdn.com/webforms.js";
    script.type = "module";
    script.crossOrigin = "anonymous";
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return <close-form id="form_033YOL9ssAohiPddd1DgOk" />;
}

const TESTIMONIAL_IMAGES = [
  "/assets/testimonial2.png",
  "/assets/testimonial3.png",
  "/assets/testimonial5.jpeg",
  "/assets/testimonial1.jpeg",
  "/assets/testimonial6.jpeg",
  "/assets/testimonial7.jpeg",
];

const TEXT_REVIEWS = [
  {
    name: "Marco B.",
    stars: 5,
    date: "vor 2 Wochen",
    text: "Ich war ehrlich gesagt skeptisch am Anfang. Aber nach den ersten 3 Wochen hatte ich meinen ersten Auftrag und 800 € auf dem Konto. Das System ist wirklich simpel und nachvollziehbar erklärt.",
  },
  {
    name: "Sabrina K.",
    stars: 5,
    date: "vor 1 Monat",
    text: "Als Vollzeit-Angestellte dachte ich, ich hätte keine Zeit dafür. Falsch gedacht. Morgens 1 Stunde vor der Arbeit — nach 6 Wochen: 1.400 € Zusatzeinnahmen. Mein Mann kann es nicht glauben.",
  },
  {
    name: "Tobias H.",
    stars: 5,
    date: "vor 3 Wochen",
    text: "Florian erklärt alles Schritt für Schritt. Keine technischen Vorkenntnisse nötig. Ich habe 0 Ahnung von KI gehabt und trotzdem in Woche 2 die ersten Ergebnisse gesehen.",
  },
  {
    name: "Melanie R.",
    stars: 5,
    date: "vor 5 Tagen",
    text: "Das Gespräch war super angenehm, kein Druck, kein Verkaufsgespräch. Man merkt, dass es wirklich darum geht, ob es zu einem passt. Ich bin jetzt seit 5 Wochen dabei — kein einziges Mal bereut.",
  },
  {
    name: "Dennis W.",
    stars: 5,
    date: "vor 2 Monaten",
    text: "2.300 € im ersten vollen Monat. Neben meinem 40h Job. Ich habe nicht geglaubt, dass das realistisch ist. War es aber. Die Community und der Support machen den Unterschied.",
  },
  {
    name: "Lena F.",
    stars: 5,
    date: "vor 3 Tagen",
    text: "Endlich ein System, das nicht verspricht, über Nacht reich zu werden — sondern zeigt, wie man konsequent aufbaut. Sehr authentisch und glaubwürdig. Bin total happy mit meiner Entscheidung.",
  },
];

export default function ThankYouPage() {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView("/thankyou");
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <section className="py-10 sm:py-14 px-3 sm:px-4">
        <div className="max-w-2xl mx-auto">

          {/* Thank You Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="flex justify-center mb-5">
              <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-11 w-11 text-green-500" />
              </div>
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold mb-4">
              ✅ Hat geklappt!
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              Danke — wir melden uns bald bei dir! 🎉
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Deine Anfrage ist bei uns angekommen. Wir melden uns in der Regel <strong className="text-foreground">innerhalb von 24 Stunden</strong> persönlich bei dir.
            </p>
          </div>

          {/* CRM Form Placeholder */}
          <div className="bg-card border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-lg shadow-primary/5 mb-10 sm:mb-14">
            <div className="text-center mb-6">
              <p className="text-base font-semibold text-foreground mb-1">Kostenloses Strategiegespräch sichern</p>
              <p className="text-sm text-muted-foreground">100% kostenlos & unverbindlich</p>
            </div>

            <CloseForm />

            <div className="mt-5 flex flex-col gap-2">
              {[
                "🔒 Deine Daten sind 100% sicher",
                "✅ Kein Spam, nur persönlicher Kontakt",
                "⚡ Wir melden uns innerhalb von 24h",
              ].map((item, i) => (
                <p key={i} className="text-xs sm:text-sm text-muted-foreground text-center">{item}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials — full width container */}
        <div className="max-w-4xl mx-auto">

          {/* Trust divider */}
          <div className="text-center mb-7 sm:mb-9">
            <span className="highlight text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
              Was andere über die KI-Klick Methode sagen
            </span>
            <p className="text-sm text-muted-foreground mt-2">
              Echte Ergebnisse von echten Menschen
            </p>
          </div>

          {/* Text Reviews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10 sm:mb-14">
            {TEXT_REVIEWS.map((review, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.stars }).map((_, si) => (
                      <Star key={si} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>

          {/* Screenshot / WhatsApp Testimonials */}
          <div className="text-center mb-5 sm:mb-7">
            <span className="highlight text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-relaxed">
              Das sagen unsere Teilnehmer
            </span>
          </div>
          <div className="columns-2 sm:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4 mb-10">
            {TESTIMONIAL_IMAGES.map((src, i) => (
              <div key={i} className="break-inside-avoid">
                <img
                  src={src}
                  alt={`Testimonial ${i + 1}`}
                  className="w-full h-auto rounded-lg sm:rounded-xl shadow-lg"
                />
              </div>
            ))}
          </div>

          {/* Payout Screenshots */}
          <div className="text-center mb-5 sm:mb-7">
            <span className="highlight text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-relaxed">
              Stell dir vor, dein Handybildschirm sieht bald so aus
            </span>
          </div>
          <div className="columns-2 sm:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4 mb-10">
            {[
              "/assets/testimonial1.jpeg",
              "/assets/testimonial6.jpeg",
              "/assets/testimonial7.jpeg",
            ].map((src, i) => (
              <div key={i} className="break-inside-avoid">
                <img
                  src={src}
                  alt={`Auszahlung ${i + 1}`}
                  className="w-full h-auto rounded-lg sm:rounded-xl shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-3 sm:px-4 border-t border-border mt-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-4">
            <p className="text-[10px] sm:text-xs text-primary font-medium">© 2026 KI-Klick Methode</p>
            <p className="text-[10px] sm:text-xs text-primary">Alle Rechte vorbehalten.</p>
          </div>
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
