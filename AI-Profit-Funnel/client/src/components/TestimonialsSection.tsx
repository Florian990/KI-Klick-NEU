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
    <section className="py-10 sm:py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
            Das sagen unsere Vertriebspartner
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
            Echte Erfolgsgeschichten von Menschen, die mit uns gestartet sind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="relative"
              data-testid={`card-testimonial-${index}`}
            >
              <CardContent className="p-4 sm:p-5 md:p-6 lg:p-8">
                <Quote className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary/20 mb-3 sm:mb-4" />
                
                <blockquote className="text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-5 md:mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>

                <div className="flex items-center gap-3 sm:gap-4">
                  <Avatar className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                  <p className="text-xs sm:text-sm font-medium text-primary">
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
