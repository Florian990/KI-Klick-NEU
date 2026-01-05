import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import ContactFormDialog from "./ContactFormDialog";

interface CTASectionProps {
  onFormSubmit?: (data: { name: string; email: string; phone: string }) => void | Promise<void>;
  isVideoUnlocked?: boolean;
}

export default function CTASection({ onFormSubmit, isVideoUnlocked = false }: CTASectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFormSubmit = async (data: { name: string; email: string; phone: string }) => {
    await onFormSubmit?.(data);
    setIsDialogOpen(false);
  };

  return (
    <section className="py-16 sm:py-24 bg-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Calendar className="h-4 w-4" />
          Nächstes Onboarding: 20. Dezember 2024
        </div>

        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
          Bereit für deinen Erfolg im KI-Vertrieb?
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Starte jetzt und sichere dir deinen Platz im nächsten Onboarding. 
          Die Plätze sind begrenzt.
        </p>

        {!isVideoUnlocked ? (
          <Button
            size="lg"
            onClick={() => setIsDialogOpen(true)}
            className="px-10 py-6 text-lg font-semibold uppercase tracking-wide"
            data-testid="button-cta-bottom"
          >
            Jetzt Video ansehen
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <p className="text-green-600 font-medium text-lg">
            Du hast bereits Zugang zum Video. Scrolle nach oben um es anzusehen.
          </p>
        )}

        <ContactFormDialog 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </div>
    </section>
  );
}
