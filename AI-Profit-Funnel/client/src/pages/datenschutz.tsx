import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function DatenschutzPage() {
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

        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Datenschutzerklärung</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. Verantwortlicher</h2>
            <p className="font-semibold text-foreground">DGU International LLC</p>
            <p>30 N Gould St Ste N</p>
            <p>Sheridan, WY 82801</p>
            <p>United States of America</p>
            <p className="mt-2">E-Mail: <a href="mailto:info@geheime-ki-klickmethode.de" className="text-primary hover:underline">info@geheime-ki-klickmethode.de</a></p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. Allgemeine Hinweise</h2>
            <p>Der Schutz Ihrer persönlichen Daten ist uns wichtig. Personenbezogene Daten werden auf dieser Website nur im technisch notwendigen Umfang sowie zur Bearbeitung von Anfragen verarbeitet.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. Erhebung und Verarbeitung personenbezogener Daten</h2>
            <p>Beim Besuch dieser Website werden automatisch technische Daten erfasst (z. B. IP-Adresse, Browsertyp, Betriebssystem, Uhrzeit des Zugriffs).</p>
            <p className="mt-2">Diese Daten dienen der technischen Stabilität und Sicherheit der Website und lassen keine direkten Rückschlüsse auf Ihre Person zu.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Kontaktaufnahme</h2>
            <p>Wenn Sie uns per E-Mail oder über ein Kontaktformular kontaktieren, werden die von Ihnen übermittelten Angaben (z. B. E-Mail-Adresse) ausschließlich zur Bearbeitung Ihrer Anfrage verarbeitet und nicht ohne Ihre Einwilligung weitergegeben.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">5. Cookies</h2>
            <p>Diese Website kann Cookies verwenden. Cookies richten auf Ihrem Endgerät keinen Schaden an und enthalten keine Viren.</p>
            <p className="mt-2">Sie dienen dazu, das Angebot nutzerfreundlicher und effektiver zu machen.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">6. Drittanbieter & Datenübermittlung in Drittländer</h2>
            <p>Da der Sitz des Unternehmens außerhalb der Europäischen Union liegt, kann eine Verarbeitung von Daten in den USA erfolgen.</p>
            <p className="mt-2">Die Verarbeitung erfolgt unter Beachtung der geltenden Datenschutzvorschriften.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">7. Speicherdauer</h2>
            <p>Personenbezogene Daten werden nur so lange gespeichert, wie dies zur Erfüllung des jeweiligen Zwecks erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">8. Rechte der betroffenen Personen</h2>
            <p>Sie haben jederzeit das Recht auf:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Auskunft über Ihre gespeicherten Daten</li>
              <li>Berichtigung unrichtiger Daten</li>
              <li>Löschung Ihrer Daten</li>
              <li>Einschränkung der Verarbeitung</li>
            </ul>
            <p className="mt-2">Anfragen richten Sie bitte per E-Mail an die oben genannte Kontaktadresse.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">9. Änderung dieser Datenschutzerklärung</h2>
            <p>Diese Datenschutzerklärung kann jederzeit angepasst werden, um rechtlichen Anforderungen zu entsprechen oder Änderungen der Leistungen umzusetzen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
