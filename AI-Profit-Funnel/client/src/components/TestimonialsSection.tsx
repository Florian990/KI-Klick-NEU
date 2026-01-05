import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Quote } from "lucide-react";
import avatar1 from "@assets/generated_images/male_testimonial_avatar_1.png";
import avatar2 from "@assets/generated_images/female_testimonial_avatar_2.png";
import avatar3 from "@assets/generated_images/male_testimonial_avatar_3.png";
import avatar4 from "@assets/generated_images/female_testimonial_avatar_4.png";

// todo: remove mock functionality - testimonials should come from backend
const testimonials = [
  {
    quote: "Innerhalb von 3 Monaten habe ich meinen ersten 5-stelligen Deal abgeschlossen. Die Schulungen und der Support sind erstklassig.",
    name: "Thomas Müller",
    role: "Vertriebspartner seit 2024",
    result: "12.400 Provision im ersten Monat",
    avatar: avatar1,
  },
  {
    quote: "Endlich ein seriöses Geschäftsmodell im Vertrieb. Die KI-Produkte verkaufen sich praktisch von selbst, weil Unternehmen sie wirklich brauchen.",
    name: "Sandra Weber",
    role: "Ehemalige Bankkauffrau",
    result: "8.900 Durchschnitt pro Monat",
    avatar: avatar2,
  },
  {
    quote: "Als Quereinsteiger war ich skeptisch. Aber die Ausbildung hat mich perfekt vorbereitet. Heute verdiene ich mehr als in meinem alten Job.",
    name: "Markus Schmidt",
    role: "Quereinsteiger aus der IT",
    result: "15.200 im besten Monat",
    avatar: avatar3,
  },
  {
    quote: "Die Flexibilität ist unbezahlbar. Ich arbeite von zu Hause und habe endlich Zeit für meine Familie - bei besserem Einkommen als je zuvor.",
    name: "Christine Bauer",
    role: "Vertriebspartnerin seit 2023",
    result: "Über 100.000 im ersten Jahr",
    avatar: avatar4,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Das sagen unsere Vertriebspartner
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Echte Erfolgsgeschichten von Menschen, die mit uns gestartet sind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="relative"
              data-testid={`card-testimonial-${index}`}
            >
              <CardContent className="p-6 sm:p-8">
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                
                <blockquote className="text-lg leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>

                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-primary">
                    {testimonial.result}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
