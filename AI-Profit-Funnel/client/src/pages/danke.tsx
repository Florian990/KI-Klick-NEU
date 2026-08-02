import { CheckCircle, Star, AlertTriangle } from "lucide-react";

export default function DankePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Header ── */}
      <header className="py-10 sm:py-16 px-4 text-center border-b border-border bg-primary/5">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3">
            Deine Terminbuchung war erfolgreich
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Wir freuen uns auf das Gespräch mit dir.
          </p>
        </div>
      </header>

      {/* ── Important checklist ── */}
      <section className="py-10 sm:py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Bitte lies das, bevor wir uns sprechen
              </h2>
            </div>

            <ul className="space-y-6">
              {/* Point 1 */}
              <li className="flex gap-4">
                <span className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  1
                </span>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Schau dir gerne noch einmal alle Kundenerfahrungen an
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Weiter unten auf dieser Seite findest du alle Erfahrungsberichte und Ergebnisse unserer Teilnehmer.
                  </p>
                </div>
              </li>

              {/* Point 2 */}
              <li className="flex gap-4">
                <span className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  2
                </span>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Stell sicher, dass du das Video vollständig angesehen hast
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Das Video ist die Grundlage unseres Gesprächs. Falls du es noch nicht gesehen hast:{" "}
                    <a
                      href="https://www.youtube.com/watch?v=ZYc4uDJxE2A"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4 font-semibold hover:text-primary/80 transition-colors"
                    >
                      hier klicken und Video ansehen →
                    </a>
                  </p>
                </div>
              </li>

              {/* Point 3 */}
              <li className="flex gap-4">
                <span className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  3
                </span>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Wir rufen dich pünktlich an — sei bereit
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Wir werden dich zum vereinbarten Zeitpunkt anrufen. Solltest du den Termin verpassen, können wir dir aufgrund der aktuell hohen Nachfrage leider keinen zweiten Termin garantieren.
                  </p>
                </div>
              </li>

              {/* Point 4 */}
              <li className="flex gap-4">
                <span className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  4
                </span>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Suche dir eine ruhige Umgebung
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Damit wir uns in unserem Gespräch vollständig auf dich, deine Situation und deine Ziele konzentrieren können, sorge bitte dafür, dass du in einer ruhigen Umgebung ohne Ablenkungen erreichbar bist. Nur so können wir dich optimal beraten.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── WhatsApp Testimonials ── */}
      <section className="py-10 sm:py-12 md:py-16 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="highlight text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
              Das sagen unsere Teilnehmer
            </span>
          </div>
          <div className="columns-2 sm:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
            {[
              "/assets/testimonial2.png",
              "/assets/testimonial3.png",
              "/assets/testimonial5.jpeg",
            ].map((src, index) => (
              <div key={index} className="break-inside-avoid">
                <img
                  src={src}
                  alt={`WhatsApp Erfahrung ${index + 1}`}
                  className="w-full h-auto rounded-lg sm:rounded-xl shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Video Testimonials ── */}
      <section className="py-10 sm:py-12 md:py-16 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="highlight text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
              Echte Erfahrungsberichte unserer Teilnehmer
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {[
              { id: "q6q_x_SVbT8", name: "Eric" },
              { id: "n3f7cc5d0qo", name: "Andrea" },
            ].map((video) => (
              <div key={video.id} className="space-y-3">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-card">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={`Bewertung KI-Klick Methode – ${video.name}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
                <p className="text-center text-sm sm:text-base font-semibold text-foreground">
                  {video.name} über die KI-Klick Methode
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Payout Screenshots ── */}
      <section className="py-10 sm:py-12 md:py-16 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="highlight text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
              Stell dir vor, dein Handybildschirm sieht bald so aus
            </span>
          </div>
          <div className="columns-2 sm:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
            {[
              "/assets/testimonial1.jpeg",
              "/assets/testimonial6.jpeg",
              "/assets/testimonial7.jpeg",
            ].map((src, index) => (
              <div key={index} className="break-inside-avoid">
                <img
                  src={src}
                  alt={`Auszahlung ${index + 1}`}
                  className="w-full h-auto rounded-lg sm:rounded-xl shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Written Reviews ── */}
      <section className="py-10 sm:py-12 md:py-16 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="highlight text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
              Das schreiben unsere Teilnehmer
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {[
              {
                name: "Markus W.",
                text: "Ehrlich gesagt war ich anfangs skeptisch. Aber das Training ist verständlich erklärt und der Support hat sich wirklich Zeit für mich genommen. Die ersten Ergebnisse haben mich überzeugt.",
              },
              {
                name: "Sandra L.",
                text: "Ich hatte vorher null Erfahrung. Genau deshalb hat mir der Schritt-für-Schritt-Aufbau so geholfen. Man wird nicht alleingelassen, das war mir am wichtigsten.",
              },
              {
                name: "Daniel K.",
                text: "Was mir gefällt: keine leeren Versprechen, sondern ein klarer Plan. Es ist Arbeit, aber wenn man dranbleibt, lohnt es sich. Kann ich nur weiterempfehlen.",
              },
              {
                name: "Julia P.",
                text: "Neben meinem Hauptjob konnte ich mir nach und nach etwas aufbauen. Die Termine waren persönlich und nicht aufdringlich. Fühlt sich seriös an.",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm"
              >
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">
                  „{review.text}"
                </p>
                <p className="text-sm font-semibold text-foreground">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-6 sm:py-8 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-4">
            <p className="text-[10px] sm:text-xs text-primary font-medium">© 2026 KI-Klick Methode</p>
            <p className="text-[10px] sm:text-xs text-primary">Alle Rechte vorbehalten.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
            <a href="/impressum" className="hover:text-foreground transition-colors">Impressum</a>
            <span>|</span>
            <a href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutzerklärung</a>
            <span>|</span>
            <a href="/agbkiklick" className="hover:text-foreground transition-colors">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
