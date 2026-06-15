import { useState, useRef } from "react";
import { ChevronLeft, XCircle, CheckCircle, ArrowRight, User, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Answer {
  text: string;
  emoji?: string;
  disqualify: boolean;
}

interface Question {
  id: number;
  question: string;
  subtitle?: string;
  answers: Answer[];
}

export interface ContactData {
  name: string;
  phone: string;
  email: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Wie alt bist du?",
    subtitle: "Nur qualifizierte Bewerber werden zugelassen.",
    answers: [
      { text: "Unter 18 Jahre", emoji: "🚫", disqualify: true },
      { text: "18–24 Jahre", emoji: "🙋", disqualify: false },
      { text: "25–39 Jahre", emoji: "💪", disqualify: false },
      { text: "40 Jahre oder älter", emoji: "🎯", disqualify: false },
    ],
  },
  {
    id: 2,
    question: "Was ist deine aktuelle Situation?",
    subtitle: "Wähle die Option, die am besten auf dich zutrifft.",
    answers: [
      { text: "Angestellter / Festangestellt", emoji: "💼", disqualify: false },
      { text: "In Ausbildung / Azubi", emoji: "📚", disqualify: false },
      { text: "Student", emoji: "🎓", disqualify: true },
      { text: "Schüler", emoji: "📓", disqualify: true },
      { text: "Arbeitslos / Jobsuchend", emoji: "🔍", disqualify: true },
    ],
  },
  {
    id: 3,
    question: "Was möchtest du mit der KI-Klick Methode erreichen?",
    subtitle: "Was ist dein wichtigstes Ziel?",
    answers: [
      { text: "Mehr Geld verdienen", emoji: "💰", disqualify: false },
      { text: "Mehr Zeit mit der Familie", emoji: "👨‍👩‍👧", disqualify: false },
      { text: "Mehr finanzielle Freiheit", emoji: "🏖️", disqualify: false },
      { text: "Mich weiterbilden & wachsen", emoji: "📈", disqualify: false },
    ],
  },
  {
    id: 4,
    question: "Was ist dein finanzielles Ziel pro Monat?",
    subtitle: "Sei ehrlich — das hilft uns, dir die beste Strategie zu zeigen.",
    answers: [
      { text: "1.000 – 2.000 € mehr pro Monat", emoji: "🌱", disqualify: false },
      { text: "3.000 – 5.000 € mehr pro Monat", emoji: "🚀", disqualify: false },
      { text: "10.000 €+ im Monat verdienen", emoji: "🔥", disqualify: false },
    ],
  },
  {
    id: 5,
    question: "Wie viel Zeit kannst du täglich investieren?",
    subtitle: "Schon 1–2 Stunden reichen für den Start.",
    answers: [
      { text: "1–2 Stunden täglich", emoji: "⏱️", disqualify: false },
      { text: "2–4 Stunden täglich", emoji: "⚡", disqualify: false },
      { text: "4+ Stunden täglich", emoji: "🏆", disqualify: false },
    ],
  },
];

type Stage = "quiz" | "qualified" | "contact";

interface MiniFunnelProps {
  onComplete: (answers: Record<number, string>, contact: ContactData) => void;
  onPartialSave?: (contact: Partial<ContactData>, answers: Record<number, string>) => void;
  onTrackEvent: (event: string) => void;
}

export default function MiniFunnel({ onComplete, onPartialSave, onTrackEvent }: MiniFunnelProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [disqualified, setDisqualified] = useState(false);
  const [stage, setStage] = useState<Stage>("quiz");
  const [contact, setContact] = useState<ContactData>({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<Partial<ContactData>>({});
  const [submitting, setSubmitting] = useState(false);
  const partialSavedRef = useRef<Set<string>>(new Set());

  const currentQuestion = questions[step];
  const progress = stage === "contact"
    ? 100
    : stage === "qualified"
    ? 95
    : ((step + 1) / questions.length) * 100;

  const handleAnswer = (answer: Answer) => {
    onTrackEvent(`funnel_q${step + 1}`);

    if (answer.disqualify) {
      onTrackEvent("funnel_disqualified");
      setDisqualified(true);
      return;
    }

    const newAnswers = { ...answers, [currentQuestion.id]: answer.text };
    setAnswers(newAnswers);

    if (step === questions.length - 1) {
      onTrackEvent("funnel_qualified");
      setStage("qualified");
      setTimeout(() => setStage("contact"), 2000);
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (stage === "contact") {
      setStage("quiz");
      setStep(questions.length - 1);
    } else if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handlePartialSave = (field: keyof ContactData, value: string) => {
    if (!value || partialSavedRef.current.has(field)) return;
    partialSavedRef.current.add(field);
    onPartialSave?.({ ...contact, [field]: value }, answers);
  };

  const validateContact = () => {
    const errs: Partial<ContactData> = {};
    if (!contact.name.trim()) errs.name = "Bitte gib deinen Namen ein";
    if (!contact.phone.trim()) errs.phone = "Bitte gib deine Telefonnummer ein";
    if (!contact.email.trim()) errs.email = "Bitte gib deine E-Mail ein";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errs.email = "Bitte gib eine gültige E-Mail ein";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContact()) return;
    setSubmitting(true);
    onTrackEvent("funnel_contact_submitted");
    await onComplete(answers, contact);
    setSubmitting(false);
  };

  // DISQUALIFIED
  if (disqualified) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-6 sm:py-8">
        <div className="flex justify-center mb-5">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="h-9 w-9 sm:h-11 sm:w-11 text-red-500" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 leading-tight">
          Die KI-Klick Methode ist leider nicht geeignet für dich
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
          Basierend auf deinen Antworten passt die KI-Klick Methode aktuell nicht zu deiner Situation. Wir möchten nur mit Menschen arbeiten, bei denen wir auch wirklich Ergebnisse garantieren können.
        </p>
        <div className="inline-block bg-muted/60 border border-border rounded-xl px-5 py-4 text-sm text-muted-foreground">
          Vielleicht ist der Zeitpunkt zu einem späteren Zeitpunkt besser. Wir wünschen dir alles Gute! 🙏
        </div>
      </div>
    );
  }

  // QUALIFIED TRANSITION
  if (stage === "qualified") {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-8 sm:py-12 animate-in fade-in duration-500">
        <div className="flex justify-center mb-5">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-11 w-11 sm:h-14 sm:w-14 text-green-500" />
          </div>
        </div>
        <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold mb-4">
          ✅ Du bist qualifiziert!
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
          Perfekt — du passt zu uns! 🎉
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Einen Moment noch — wir leiten dich gleich zum nächsten Schritt weiter...
        </p>
        <div className="mt-6 flex justify-center">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CONTACT FORM
  if (stage === "contact") {
    return (
      <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-5 sm:mb-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              Letzter Schritt
            </span>
            <span className="text-xs sm:text-sm text-primary font-bold">
              100% abgeschlossen
            </span>
          </div>
          <Progress value={100} className="h-2 sm:h-2.5" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 leading-tight">
            Wo sollen wir dich erreichen?
          </h2>
          <p className="text-sm text-muted-foreground">
            Damit wir uns persönlich bei dir melden können 👇
          </p>
        </div>

        <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              Vor- & Nachname
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Max Mustermann"
              value={contact.name}
              onChange={(e) => {
                setContact((c) => ({ ...c, name: e.target.value }));
                if (errors.name) setErrors((er) => ({ ...er, name: undefined }));
              }}
              onBlur={(e) => handlePartialSave("name", e.target.value)}
              className={`h-12 text-base ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" />
              Handynummer
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+49 151 12345678"
              value={contact.phone}
              onChange={(e) => {
                setContact((c) => ({ ...c, phone: e.target.value }));
                if (errors.phone) setErrors((er) => ({ ...er, phone: undefined }));
              }}
              onBlur={(e) => handlePartialSave("phone", e.target.value)}
              className={`h-12 text-base ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            <p className="text-xs text-muted-foreground">📱 Wird auch für WhatsApp genutzt</p>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" />
              E-Mail Adresse
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="max@beispiel.de"
              value={contact.email}
              onChange={(e) => {
                setContact((c) => ({ ...c, email: e.target.value }));
                if (errors.email) setErrors((er) => ({ ...er, email: undefined }));
              }}
              onBlur={(e) => handlePartialSave("email", e.target.value)}
              className={`h-12 text-base ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full h-13 text-base font-bold mt-2"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Wird gesendet...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Jetzt kostenloses Gespräch sichern
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>

          <div className="flex flex-col gap-1.5 pt-1">
            {["🔒 100% sicher — keine Weitergabe an Dritte", "✅ Kein Spam, nur persönlicher Kontakt", "⚡ Wir melden uns innerhalb von 24h"].map((item, i) => (
              <p key={i} className="text-xs text-muted-foreground text-center">{item}</p>
            ))}
          </div>
        </form>

        <div className="mt-4 flex justify-center">
          <Button variant="ghost" onClick={handleBack} className="text-muted-foreground h-10 touch-manipulation">
            <ChevronLeft className="h-4 w-4 mr-1.5" />
            <span className="text-sm">Zurück</span>
          </Button>
        </div>
      </div>
    );
  }

  // QUIZ QUESTIONS
  const cols =
    currentQuestion.answers.length >= 5
      ? "grid-cols-1 sm:grid-cols-2"
      : currentQuestion.answers.length === 4
      ? "grid-cols-2"
      : currentQuestion.answers.length === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-5 sm:mb-7">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">
            Schritt {step + 1} von {questions.length}
          </span>
          <span className="text-xs sm:text-sm text-primary font-bold">
            {Math.round(progress)}% abgeschlossen
          </span>
        </div>
        <Progress value={progress} className="h-2 sm:h-2.5" />
      </div>

      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground text-center mb-2 leading-tight px-1">
        {currentQuestion.question}
      </h2>
      {currentQuestion.subtitle && (
        <p className="text-sm text-muted-foreground text-center mb-5 sm:mb-6 px-2">
          {currentQuestion.subtitle}
        </p>
      )}

      <div className={`grid gap-3 sm:gap-4 ${cols}`}>
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(answer)}
            className="group p-4 sm:p-5 rounded-xl border-2 border-primary/30 bg-card hover:border-primary hover:bg-primary/10 active:bg-primary/20 active:scale-[0.98] transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[90px] sm:min-h-[100px] touch-manipulation"
          >
            {answer.emoji && (
              <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
                {answer.emoji}
              </span>
            )}
            <span className="text-sm sm:text-base font-semibold text-foreground text-center leading-tight">
              {answer.text}
            </span>
          </button>
        ))}
      </div>

      {step > 0 && (
        <div className="mt-4 sm:mt-5 flex justify-center">
          <Button variant="ghost" onClick={handleBack} className="text-muted-foreground h-10 sm:h-11 touch-manipulation">
            <ChevronLeft className="h-4 w-4 mr-1.5" />
            <span className="text-sm sm:text-base">Zurück</span>
          </Button>
        </div>
      )}
    </div>
  );
}
