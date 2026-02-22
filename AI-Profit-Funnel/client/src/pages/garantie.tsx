import { ArrowLeft, ShieldCheck, Target, Phone, MessageSquare, Mail, Users, CheckCircle, Clock, Calendar, Handshake } from "lucide-react";
import { useLocation } from "wouter";

export default function GarantiePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Startseite
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm sm:text-base font-semibold text-primary tracking-widest uppercase mb-3">Die KI-Klick-Methode</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Deine <span className="text-primary">Erster-Kunde-Garantie</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Du investierst in deine Selbstständigkeit.<br />
            Wir investieren unser Commitment.
          </p>
        </div>

        <div className="rounded-xl border-2 border-primary/30 bg-card p-6 sm:p-8 mb-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">
            Dein erster zahlender Kunde ist garantiert.
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Wenn du innerhalb der 6-monatigen Zusammenarbeit keinen zahlenden Auftrag gewinnst, 
            arbeiten wir kostenfrei mit dir weiter – bis dein erster Kunde abgeschlossen ist.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-6 text-sm sm:text-base font-medium">
            <span className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              Kein Risiko.
            </span>
            <span className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              Kein „Pech gehabt".
            </span>
            <span className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              Kein Verstecken hinter Klauseln.
            </span>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Warum wir das garantieren können</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-5">
            Weil dein erster Kunde kein Zufall ist.<br />
            Er entsteht, wenn du:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "klar positioniert bist",
              "strukturiert akquirierst",
              "echte Gespräche führst",
              "konsequent umsetzt",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground font-medium">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-5 font-medium">
            Und genau dabei begleiten wir dich.
          </p>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Handshake className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Was du dafür tun musst</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Die Voraussetzung ist einfach – und absolut machbar:
          </p>

          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              300 echte Erstkontakte in 6 Monaten
            </h3>
            <p className="text-muted-foreground mb-5">Das bedeutet:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { value: "100", label: "pro Monat", icon: <Calendar className="h-4 w-4 text-primary" /> },
                { value: "25", label: "pro Woche", icon: <Calendar className="h-4 w-4 text-primary" /> },
                { value: "5", label: "pro Arbeitstag", icon: <Clock className="h-4 w-4 text-primary" /> },
                { value: "30–60", label: "Minuten/Tag", icon: <Clock className="h-4 w-4 text-primary" /> },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex justify-center mb-1">{item.icon}</div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{item.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Ein Kontakt zählt, wenn du aktiv per <span className="text-foreground font-medium">Telefon</span>, <span className="text-foreground font-medium">personalisierter E-Mail</span> oder <span className="text-foreground font-medium">Direktnachricht</span> auf ein Unternehmen zugehst und ihn dokumentierst.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              10 echte Verkaufsgespräche
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Nicht 10 Abschlüsse.<br />
              Nur <span className="text-foreground font-medium">10 ernsthafte Gespräche.</span>
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Verbindliche Umsetzung
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Teilnahme an mindestens <span className="text-foreground font-medium">80 % der 1:1 Sessions</span></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Umsetzung unserer Struktur</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <p className="text-lg sm:text-xl font-bold text-primary">Das ist alles.</p>
          </div>
        </div>

      </div>
      <footer className="py-6 sm:py-8 px-3 sm:px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-4 sm:mb-6">
            <p className="text-[10px] sm:text-xs text-primary font-medium">© 2026 KI-Klick Methode</p>
            <p className="text-[10px] sm:text-xs text-primary">Alle Rechte vorbehalten.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
            <a href="/impressum" className="hover:text-foreground transition-colors">Impressum</a>
            <span>|</span>
            <a href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutzerklärung</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
