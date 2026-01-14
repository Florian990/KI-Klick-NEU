import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DisqualifiedMessage() {
  const handleClick = () => {
    window.open("https://www.digistore24.com/redir/453066/Florianbenedict/disq", "_blank");
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 text-center py-8 sm:py-12 md:py-16">
      <div className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full bg-primary/20 mb-4 sm:mb-5 md:mb-6">
        <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />
      </div>
      
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
        Entschuldige, die KI-Klick Methode ist für dich leider ungeeignet, ABER
      </h2>
      
      <p className="text-base sm:text-lg text-foreground mb-6 sm:mb-8 leading-relaxed">
        Wir haben ebenfalls eine <span className="underline">Methode die kostenlos ist</span>, um 300 - 1000 Euro im Monat nebenbei online dazu zu verdienen:
      </p>

      <Button
        size="lg"
        onClick={handleClick}
        className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-semibold uppercase tracking-wide touch-manipulation active:scale-[0.98] transition-transform"
      >
        Jetzt Methode entdecken
      </Button>
    </div>
  );
}
