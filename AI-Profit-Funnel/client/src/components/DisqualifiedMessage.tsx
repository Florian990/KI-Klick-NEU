import { XCircle } from "lucide-react";

export default function DisqualifiedMessage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 text-center py-16">
      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-destructive/20 mb-6">
        <XCircle className="h-10 w-10 text-destructive" />
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
        Entschuldige, die KI-Klick Methode ist für dich leider ungeeignet.
      </h2>
      
      <p className="text-lg text-muted-foreground">
        Basierend auf deinen Antworten passt unser Programm aktuell nicht zu deiner Situation.
        Wir wünschen dir trotzdem viel Erfolg auf deinem Weg!
      </p>
    </div>
  );
}
