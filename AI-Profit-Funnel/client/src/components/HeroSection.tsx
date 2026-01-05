import { useState } from "react";
import { CheckCircle, Play } from "lucide-react";
import heroBackground from "@assets/generated_images/tech_business_success_hero_background.png";
import videoThumbnail from "@assets/generated_images/vsl_video_thumbnail_preview.png";
import ContactFormDialog from "./ContactFormDialog";

interface HeroSectionProps {
  onFormSubmit?: (data: { name: string; email: string; phone: string }) => void | Promise<void>;
  isVideoUnlocked?: boolean;
}

export default function HeroSection({ onFormSubmit, isVideoUnlocked = false }: HeroSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFormSubmit = async (data: { name: string; email: string; phone: string }) => {
    await onFormSubmit?.(data);
    setIsDialogOpen(false);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-20">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Verdiene mit <span className="text-primary">KI-Produkten</span>
          <br />
          5-stellige Provisionen
        </h1>
        
        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
          Werde Vertriebspartner und generiere Abschlussszenarien mit Unternehmen 
          für unsere innovativen KI-Lösungen. Keine Vorkenntnisse nötig.
        </p>

        {!isVideoUnlocked ? (
          <div 
            className="relative max-w-3xl mx-auto cursor-pointer group"
            onClick={() => setIsDialogOpen(true)}
            data-testid="button-video-preview"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
              <img 
                src={videoThumbnail} 
                alt="Video Vorschau" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
                  <Play className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <p className="text-white text-sm sm:text-base font-medium backdrop-blur-sm bg-black/30 px-3 py-2 rounded-md inline-block">
                  Klicke hier um das Video freizuschalten
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-green-600/90 text-white px-6 py-3 rounded-md">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Video freigeschaltet - Scrolle nach unten</span>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>2.847 aktive Vertriebspartner</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>Kostenlose Schulung</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>Sofort starten</span>
          </div>
        </div>
      </div>

      <ContactFormDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </section>
  );
}
