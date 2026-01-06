import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Play, X, Loader2, Calendar } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const applicationSchema = z.object({
  vorname: z.string().min(1, "Vorname ist erforderlich"),
  nachname: z.string().min(1, "Nachname ist erforderlich"),
  countryCode: z.string().default("+49"),
  phone: z.string().min(6, "Telefonnummer ist erforderlich"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export default function VSLPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      vorname: "",
      nachname: "",
      countryCode: "+49",
      phone: "",
    },
  });

  const onSubmit = async (data: ApplicationForm) => {
    setIsSubmitting(true);
    try {
      const fullPhone = `${data.countryCode} ${data.phone}`;
      await apiRequest("POST", "/api/leads", {
        name: `${data.vorname} ${data.nachname}`,
        phone: fullPhone,
        source: "VSL Bewerbung",
      });

      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", {
          content_name: "VSL Application",
        });
      }

      toast({
        title: "Erfolgreich!",
        description: "Wir melden uns in Kürze bei dir.",
      });

      setShowForm(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Fehler",
        description: "Etwas ist schief gelaufen. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookCall = () => {
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* VSL Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-primary font-medium mb-3">Exklusives Video-Training</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Die KI-Klick Methode
            </h1>
            <p className="text-lg text-muted-foreground">
              Schaue dir jetzt das Video an und erfahre, wie DU dir ein zweites Standbein aufbauen kannst.
            </p>
          </div>

          {/* Video Player Placeholder */}
          <div className="relative aspect-video bg-card rounded-xl border border-border overflow-hidden mb-8">
            {!isPlaying ? (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                onClick={() => setIsPlaying(true)}
                data-testid="button-play-video"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="text-center relative z-10">
                  <div className="h-20 w-20 mx-auto rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110 mb-4">
                    <Play className="h-8 w-8 text-primary-foreground ml-1" />
                  </div>
                  <p className="text-white font-medium">Video starten</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <p className="text-white text-lg">
                  [Video Player - Hier dein VSL einbetten]
                </p>
              </div>
            )}
          </div>

          {/* Key Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              "Schritt-für-Schritt erklärt",
              "Sofort umsetzbar",
              "Kein Vorwissen nötig",
            ].map((point, index) => (
              <div key={index} className="flex items-center gap-2 text-foreground">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* CTA under video */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleBookCall}
              className="h-14 px-10 text-lg font-semibold uppercase tracking-wide"
              data-testid="button-book-call-top"
            >
              Jetzt kostenfrei bewerben
            </Button>
          </div>
        </div>
      </section>

      {/* WhatsApp Testimonials Section */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-10">
            Das sagen unsere Teilnehmer
          </h2>
          
          {/* WhatsApp Screenshots */}
          <div className="columns-2 sm:columns-3 gap-4 space-y-4">
            {[
              "/assets/testimonial2.png",
              "/assets/testimonial3.png",
              "/assets/testimonial5.jpeg",
            ].map((src, index) => (
              <div key={index} className="break-inside-avoid">
                <img 
                  src={src} 
                  alt={`WhatsApp Testimonial ${index + 1}`}
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payout Screens Section */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-10">
            Stell dir vor, dein Handybildschirm sieht bald so aus
          </h2>
          
          {/* Payout Screenshots */}
          <div className="columns-2 sm:columns-3 gap-4 space-y-4">
            {[
              "/assets/testimonial1.jpeg",
              "/assets/testimonial6.jpeg",
              "/assets/testimonial7.jpeg",
            ].map((src, index) => (
              <div key={index} className="break-inside-avoid">
                <img 
                  src={src} 
                  alt={`Auszahlung ${index + 1}`}
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Bereit für den nächsten Schritt?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Vereinbare jetzt ein kostenloses Beratungsgespräch und erfahre, wie du mit dem KI-Lizenzpartner Modell durchstarten kannst.
          </p>

          <Button
            size="lg"
            onClick={handleBookCall}
            className="h-14 px-10 text-lg font-semibold uppercase tracking-wide"
            data-testid="button-book-call"
          >
            Jetzt kostenfrei bewerben
          </Button>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Kostenlos & unverbindlich</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>15-30 Minuten</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Persönliche Beratung</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          {/* Disclaimer */}
          <div className="mb-6">
            <p className="text-xs text-primary font-medium mb-2">Haftungsausschluss & Disclaimer:</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Diese Website ist nicht Teil der Facebook-Website oder der Facebook Inc. Außerdem wird diese Website in keiner Weise von Facebook unterstützt.<br />
              FACEBOOK ist eine Marke von FACEBOOK, Inc.
            </p>
          </div>

          {/* Copyright */}
          <div className="mb-6">
            <p className="text-xs text-primary font-medium">© 2025 KI Lizenzpartner</p>
            <p className="text-xs text-primary">Alle Rechte vorbehalten.</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Impressum</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">Datenschutzerklärung</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">Allgemeine Geschäftsbedingungen</a>
          </div>
        </div>
      </footer>

      {/* Application Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-md p-6 sm:p-8 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
              data-testid="button-close-form"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Dein <span className="text-primary">kostenloses</span> Erstgespräch
              </h2>
              <p className="text-zinc-400 text-sm">
                Damit wir Dich für dein gratis Gespräch kontaktieren können, hinterlass uns doch bitte <span className="font-semibold text-white">deine persönlichen Kontaktdaten</span> ...
              </p>
            </div>

            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="vorname" className="text-white text-sm font-medium">
                  Dein Vorname*
                </Label>
                <Input
                  id="vorname"
                  {...form.register("vorname")}
                  className="mt-1.5 bg-white border-0 text-zinc-900 h-11"
                  data-testid="input-vorname"
                />
                {form.formState.errors.vorname && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.vorname.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="nachname" className="text-white text-sm font-medium">
                  Dein Nachname*
                </Label>
                <Input
                  id="nachname"
                  {...form.register("nachname")}
                  className="mt-1.5 bg-white border-0 text-zinc-900 h-11"
                  data-testid="input-nachname"
                />
                {form.formState.errors.nachname && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.nachname.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-white text-sm font-medium">
                  Deine Telefonnummer*
                </Label>
                <div className="flex gap-2 mt-1.5">
                  <Select
                    defaultValue="+49"
                    onValueChange={(value) => form.setValue("countryCode", value)}
                  >
                    <SelectTrigger className="w-24 bg-white border-0 text-zinc-900 h-11" data-testid="select-country-code">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+49">DE +49</SelectItem>
                      <SelectItem value="+43">AT +43</SelectItem>
                      <SelectItem value="+41">CH +41</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="1512 3456789"
                    {...form.register("phone")}
                    className="flex-1 bg-white border-0 text-zinc-900 h-11"
                    data-testid="input-phone"
                  />
                </div>
                {form.formState.errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-bold uppercase tracking-wide mt-2"
                data-testid="button-submit-application"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Kostenfrei Bewerben"
                )}
              </Button>

              <p className="text-center text-zinc-500 text-xs">
                Die Eintragung ist <span className="font-semibold text-zinc-300">100% kostenlos</span> und kann <span className="font-semibold text-zinc-300">jederzeit</span> widerrufen werden.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
