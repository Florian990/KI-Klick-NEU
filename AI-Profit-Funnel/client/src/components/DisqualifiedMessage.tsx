import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DisqualifiedMessage() {
  const handleClick = () => {
    window.open("https://moneten-wissen.de/mit-apps-geld-verdienen-ebook/?aff=Florianbenedict", "_blank");
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 text-center py-16">
      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/20 mb-6">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
        Entschuldige, die KI-Klick Methode ist für dich leider ungeeignet, ABER
      </h2>
      
      <p className="text-lg text-muted-foreground mb-8">
        Wir haben auch eine Methode, die <span className="font-bold text-foreground">perfekt</span> auf deine Situation zugeschnitten ist und mit der du sogar noch <span className="font-bold text-foreground">einfacher</span> Geld verdienen kannst!
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
