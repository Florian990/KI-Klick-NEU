import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DisqualifiedMessage() {
  const handleClick = () => {
    window.open("https://www.digistore24.com/redir/453066/Florianbenedict/disq", "_blank");
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 text-center py-16">
      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/20 mb-6">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
        Entschuldige, die KI-Klick Methode ist für dich leider ungeeignet, ABER
      </h2>
      
      <p className="text-lg text-foreground mb-8">
        Wir haben ebenfalls eine <span className="underline">Methode die kostenlos ist</span>, um 300 - 1000 Euro im Monat nebenbei online dazu zu verdienen:
      </p>

      <Button
        size="lg"
        onClick={handleClick}
        className="h-14 px-10 text-lg font-semibold uppercase tracking-wide"
      >
        Jetzt Methode entdecken
      </Button>
    </div>
  );
}
