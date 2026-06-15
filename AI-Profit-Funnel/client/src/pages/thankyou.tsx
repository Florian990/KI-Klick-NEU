import { useEffect } from "react";
import { CheckCircle, Star, Quote, ClipboardCheck, PhoneCall, CalendarCheck, BellRing } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

const NEXT_STEPS = [
  {
    icon: ClipboardCheck,
    title: "Wir prüfen deine Antworten",
    text: "Unser Team schaut sich deine Angaben persönlich an, um dich optimal vorzubereiten.",
  },
  {
    icon: PhoneCall,
    title: "Wir melden uns bei dir",
    text: "Innerhalb von 24 Stunden bekommst du eine Nachricht oder einen Anruf von uns.",
  },
  {
    icon: CalendarCheck,
    title: "Dein kostenloses Erstgespräch",
    text: "Gemeinsam klären wir unverbindlich, ob die KI-Klick Methode zu dir passt.",
  },
];

const TEXT_REVIEWS = [
  {
    name: "Dennis W.",
    stars: 5,
    date: "vor 2 Monaten",
    highlight: "2.300 € im ersten vollen Monat",
    text: "2.300 € im ersten vollen Monat. Neben meinem 40h Job. Ich habe nicht geglaubt, dass das realistisch ist. War es aber. Die Community und der Support machen den Unterschied.",
  },
  {
    name: "Sabrina K.",
    stars: 5,
    date: "vor 1 Monat",
    highlight: "1.400 € Zusatzeinnahmen nach 6 Wochen",
    text: "Als Vollzeit-Angestellte dachte ich, ich hätte keine Zeit dafür. Falsch gedacht. Morgens 1 Stunde vor der Arbeit — nach 6 Wochen: 1.400 € Zusatzeinnahmen. Mein Mann kann es nicht glauben.",
  },
  {
    name: "Marco B.",
    stars: 5,
    date: "vor 2 Wochen",
    highlight: "Erste 800 € nach nur 3 Wochen",
    text: "Ich war ehrlich gesagt skeptisch am Anfang. Aber nach den ersten 3 Wochen hatte ich meinen ersten Auftrag und 800 € auf dem Konto. Das System ist wirklich simpel und nachvollziehbar erklärt.",
  },
  {
    name: "Tobias H.",
    stars: 5,
    date: "vor 3 Wochen",
    highlight: "Erste Ergebnisse bereits in Woche 2",
    text: "Florian erklärt alles Schritt für Schritt. Keine technischen Vorkenntnisse nötig. Ich habe 0 Ahnung von KI gehabt und trotzdem in Woche 2 die ersten Ergebnisse gesehen.",
  },
  {
    name: "Melanie R.",
    stars: 5,
    date: "vor 5 Tagen",
    highlight: "Kein Druck — kein einziges Mal bereut",
    text: "Das Gespräch war super angenehm, kein Druck, kein Verkaufsgespräch. Man merkt, dass es wirklich darum geht, ob es zu einem passt. Ich bin jetzt seit 5 Wochen dabei — kein einziges Mal bereut.",
  },
  {
    name: "Lena F.",
    stars: 5,
    date: "vor 3 Tagen",
    highlight: "Authentisch, glaubwürdig, total happy",
    text: "Endlich ein System, das nicht verspricht, über Nacht reich zu werden — sondern zeigt, wie man konsequent aufbaut. Sehr authentisch und glaubwürdig. Bin total happy mit meiner Entscheidung.",
  },
];

const WHATSAPP_IMAGES = [
  "/assets/testimonial2.png",
  "/assets/testimonial3.png",
  "/assets/testimonial5.jpeg",
];

const PAYOUT_IMAGES = [
  "/assets/testimonial1.jpeg",
  "/assets/testimonial6.jpeg",
  "/assets/testimonial7.jpeg",
];

// YouTube Video-Testimonials — hier einfach die Video-IDs eintragen.
// Aus einem Link wie https://www.youtube.com/watch?v=ABC123  →  "ABC123"
// Aus einem Short  https://www.youtube.com/shorts/XYZ789      →  "XYZ789"
const YOUTUBE_TESTIMONIALS: { id: string; name?: string }[] = [
  { id: "n3f7cc5d0qo" },
  { id: "q6q_x_SVbT8" },
];

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

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

        {/* ── THANK YOU HEADER ── */}
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <div className="flex justify-center mb-5">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-11 w-11 text-green-500" />
            </div>
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold mb-4">
            ✅ Deine Anfrage ist angekommen!
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Danke — wir melden uns bald bei dir! 🎉
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
            Wir melden uns in der Regel <strong className="text-foreground">innerhalb von 24 Stunden</strong> persönlich bei dir. Bis dahin — schau dir an, was andere mit der KI-Klick Methode bereits erreicht haben.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            {[
              "✅ 350+ erfolgreiche Partner",
              "⭐ Top bewertet",
              "🔒 100% unverbindlich",
            ].map((badge, i) => (
              <span key={i} className="text-xs sm:text-sm font-medium text-muted-foreground bg-muted/50 border border-border rounded-full px-3 py-1">
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* ── WHAT HAPPENS NEXT ── */}
        <div className="max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-8 shadow-sm">
            <div className="text-center mb-7">
              <p className="text-xs sm:text-sm uppercase tracking-widest text-primary font-semibold mb-2">Deine nächsten Schritte</p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">So geht es jetzt weiter</h2>
            </div>

            <div className="relative flex flex-col gap-5 sm:gap-6">
              {/* connecting line */}
              <div className="absolute left-[19px] sm:left-[23px] top-3 bottom-3 w-px bg-border" aria-hidden="true" />
              {NEXT_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative flex items-start gap-4">
                    <div className="relative z-10 h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="pt-1 sm:pt-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">Schritt {i + 1}</span>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-0.5">{step.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Important reminder */}
            <div className="mt-7 flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
              <BellRing className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                <strong>Wichtig:</strong> Sei in den nächsten 24 Stunden gut erreichbar und halte dein Telefon bereit, damit du unsere Nachricht nicht verpasst.
              </p>
            </div>
          </div>
        </div>

        {/* ── SOCIAL PROOF ── */}
        <div className="max-w-4xl mx-auto">

          {/* ── 1. WhatsApp Proof ── */}
          <div className="text-center mb-5 sm:mb-8">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-primary font-semibold mb-2">WhatsApp Nachrichten unserer Teilnehmer</p>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">
              Lass uns gemeinsam deine Erfolgsgeschichte schreiben
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mb-12 sm:mb-16 max-w-3xl mx-auto">
            {WHATSAPP_IMAGES.map((src, i) => (
              <div key={i} className="bg-card border border-border rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-md">
                <img src={src} alt={`WhatsApp Feedback ${i + 1}`} className="w-full h-auto rounded-lg" />
              </div>
            ))}
          </div>

          {/* ── 2. Payout screenshots ── */}
          <div className="text-center mb-5 sm:mb-8">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-primary font-semibold mb-2">Echte Auszahlungen</p>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">
              Stell dir vor, dein Handy sieht bald so aus 💰
            </h2>
            <p className="text-sm text-muted-foreground mt-2">Neben dem Job — ohne Vorkenntnisse</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mb-12 sm:mb-16 max-w-3xl mx-auto">
            {PAYOUT_IMAGES.map((src, i) => (
              <div key={i} className="bg-card border border-border rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-md">
                <img src={src} alt={`Auszahlung ${i + 1}`} className="w-full h-auto rounded-lg" />
              </div>
            ))}
          </div>

          {/* ── 3. YouTube Video-Testimonials ── */}
          {YOUTUBE_TESTIMONIALS.length > 0 && (
            <>
              <div className="text-center mb-5 sm:mb-8">
                <p className="text-xs sm:text-sm uppercase tracking-widest text-primary font-semibold mb-2">Video-Testimonials</p>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">
                  Resultate lügen nicht
                </h2>
                <p className="text-sm text-muted-foreground mt-2">Echte Teilnehmer erzählen von ihren Ergebnissen</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6 mb-12 sm:mb-16">
                {YOUTUBE_TESTIMONIALS.map((video, i) => (
                  <div key={i} className="w-full max-w-[300px] bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="relative aspect-[9/16] bg-black">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                        title={video.name ? `Testimonial ${video.name}` : `Video-Testimonial ${i + 1}`}
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                    {video.name && (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                            {video.name.charAt(0)}
                          </div>
                          <p className="font-semibold text-foreground text-sm">{video.name}</p>
                        </div>
                        <StarRow count={5} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── 4. Text Reviews ── */}
          <div className="text-center mb-7 sm:mb-9">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-primary font-semibold mb-2">Echte Ergebnisse · Echte Menschen</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
              Einige unserer Bewertungen
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              aus 350+ glücklichen Kunden
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {TEXT_REVIEWS.map((review, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm flex flex-col gap-3">
                <div className="inline-flex">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                    💬 {review.highlight}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Quote className="h-4 w-4 text-primary/40 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-xs">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <StarRow count={review.stars} />
                </div>
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
