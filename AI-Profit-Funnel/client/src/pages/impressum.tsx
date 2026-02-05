import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function ImpressumPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Startseite
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Impressum</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <div>
            <p className="font-semibold text-foreground text-lg">DGU International LLC</p>
            <p>30 N Gould St Ste N</p>
            <p>Sheridan, WY 82801</p>
            <p>United States of America</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Kontakt:</h2>
            <p>E-Mail: <a href="mailto:info@geheime-ki-klickmethode.de" className="text-primary hover:underline">info@geheime-ki-klickmethode.de</a></p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Registereintrag:</h2>
            <p>Eingetragen im Handelsregister des Bundesstaates Wyoming, USA</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Employer Identification Number (EIN):</h2>
            <p>41-3777882</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Umsatzsteuer:</h2>
            <p>Keine Umsatzsteuer-Identifikationsnummer vorhanden, da Sitz außerhalb der EU.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
