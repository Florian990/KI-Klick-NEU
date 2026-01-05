import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  GraduationCap, 
  Users, 
  Clock, 
  Shield, 
  Zap,
  Target,
  Coins,
  HeadphonesIcon
} from "lucide-react";

// todo: remove mock functionality - benefits can be made dynamic
const benefits = [
  {
    icon: Coins,
    title: "Hohe Provisionen",
    description: "Verdiene 5-stellige Provisionen pro abgeschlossenem Deal mit Unternehmenskunden.",
  },
  {
    icon: GraduationCap,
    title: "Komplette Schulung",
    description: "Erhalte eine umfassende Ausbildung in KI-Produkten und Verkaufstechniken.",
  },
  {
    icon: Target,
    title: "Warme Leads",
    description: "Arbeite mit vorqualifizierten Unternehmenskontakten, die echtes Interesse haben.",
  },
  {
    icon: Clock,
    title: "Flexible Arbeitszeiten",
    description: "Arbeite wann und wo du willst. Volle Freiheit bei deiner Zeiteinteilung.",
  },
  {
    icon: TrendingUp,
    title: "Wachsender Markt",
    description: "Profitiere vom explodierenden KI-Markt mit unendlichem Wachstumspotenzial.",
  },
  {
    icon: Users,
    title: "Starkes Netzwerk",
    description: "Werde Teil einer Community erfolgreicher Vertriebspartner.",
  },
  {
    icon: Shield,
    title: "Sichere Auszahlung",
    description: "Pünktliche und zuverlässige Provisionsauszahlungen garantiert.",
  },
  {
    icon: Zap,
    title: "Innovative Produkte",
    description: "Verkaufe Cutting-Edge KI-Lösungen, die Unternehmen wirklich brauchen.",
  },
  {
    icon: HeadphonesIcon,
    title: "1:1 Support",
    description: "Persönlicher Ansprechpartner für alle deine Fragen und Anliegen.",
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Das bekommst du als Vertriebspartner
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Alles was du brauchst, um im KI-Vertrieb erfolgreich zu werden.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="hover-elevate transition-transform duration-200"
              data-testid={`card-benefit-${index}`}
            >
              <CardContent className="p-6 sm:p-8">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
