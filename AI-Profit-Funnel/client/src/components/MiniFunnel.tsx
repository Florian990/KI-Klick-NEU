import { useState, useRef, useEffect } from "react";
import { ChevronLeft, XCircle, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

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

// Contact steps after quiz
const CONTACT_STEPS = [
  {
    key: "name" as keyof ContactData,
    question: "Wie heißt du?",
    subtitle: "Damit wir dich persönlich ansprechen können.",
    placeholder: "Vor- & Nachname",
    type: "text",
    hint: null,
    buttonLabel: "Weiter",
  },
  {
    key: "phone" as keyof ContactData,
    question: "Wie lautet deine Handynummer?",
    subtitle: "Wir melden uns persönlich bei dir.",
    placeholder: "+49 151 12345678",
    type: "tel",
    hint: "(am besten WhatsApp vorhanden)",
    buttonLabel: "Weiter",
  },
  {
    key: "email" as keyof ContactData,
    question: "Wie lautet deine E-Mail Adresse?",
    subtitle: "Du erhältst eine kurze Bestätigung von uns.",
    placeholder: "max@beispiel.de",
    type: "email",
    hint: null,
    buttonLabel: "Ja, ich will starten — kostenlos & unverbindlich →",
  },
];

// Total visual steps: 5 quiz + 3 contact = 8
const TOTAL_STEPS = questions.length + CONTACT_STEPS.length;

type Stage = "quiz" | "qualified" | "contact";

interface MiniFunnelProps {
  onComplete: (answers: Record<number, string>, contact: ContactData) => void;
  onPartialSave?: (contact: Partial<ContactData>, answers: Record<number, string>) => void;
  onTrackEvent: (event: string) => void;
}

export default function MiniFunnel({ onComplete, onPartialSave, onTrackEvent }: MiniFunnelProps) {
  const [quizStep, setQuizStep] = useState(0);
  const [contactStep, setContactStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [contact, setContact] = useState<ContactData>({ name: "", phone: "", email: "" });
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [disqualified, setDisqualified] = useState(false);
  const [stage, setStage] = useState<Stage>("quiz");
  const [submitting, setSubmitting] = useState(false);
  const partialSavedRef = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering contact step
  useEffect(() => {
    if (stage === "contact") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [stage, contactStep]);

  const currentQuestion = questions[quizStep];
  const currentContactStep = CONTACT_STEPS[contactStep];

  // Progress calculation
  const visualStep = stage === "quiz"
    ? quizStep + 1
    : stage === "qualified"
    ? questions.length + 0.5
    : questions.length + contactStep + 1;

  const progress = Math.round((visualStep / TOTAL_STEPS) * 100);

  const handleAnswer = (answer: Answer) => {
    onTrackEvent(`funnel_q${quizStep + 1}`);
    if (answer.disqualify) {
      onTrackEvent("funnel_disqualified");
      setDisqualified(true);
      return;
    }
    const newAnswers = { ...answers, [currentQuestion.id]: answer.text };
    setAnswers(newAnswers);

    if (quizStep === questions.length - 1) {
      onTrackEvent("funnel_qualified");
      setStage("qualified");
      setTimeout(() => {
        setStage("contact");
        setInputValue("");
      }, 1800);
      return;
    }
    setQuizStep((prev) => prev + 1);
  };

  const validateContactInput = (val: string, key: keyof ContactData) => {
    if (!val.trim()) return "Bitte füll dieses Feld aus";

    if (key === "phone") {
      const digits = val.replace(/\D/g, "");
      const cleaned = val.trim();

      // Must contain only valid phone characters
      if (/[a-zA-Z]/.test(cleaned)) {
        return "Bitte keine Buchstaben — nur Ziffern eingeben";
      }
      // German mobile (015x, 016x, 017x) or landline or international
      if (digits.length < 10) {
        return `Nummer zu kurz — bitte vollständig eingeben (${digits.length} von mind. 10 Ziffern)`;
      }
      if (digits.length > 15) {
        return "Nummer zu lang — bitte prüfen";
      }
      // Must start with + or 0 or country code digit
      if (!/^(\+|00|0)[1-9]/.test(cleaned) && !/^[1-9]/.test(cleaned)) {
        return "Ungültiges Format — z.B. +49 151 12345678";
      }
    }

    if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      return "Bitte gib eine gültige E-Mail ein (z.B. max@gmail.com)";
    }

    if (key === "name" && val.trim().length < 2) {
      return "Bitte gib deinen vollständigen Namen ein";
    }

    return "";
  };

  const handlePartialSave = (key: keyof ContactData, val: string) => {
    if (!val || partialSavedRef.current.has(key)) return;
    partialSavedRef.current.add(key);
    const updated = { ...contact, [key]: val };
    onPartialSave?.(updated, answers);
  };

  const handleContactNext = async () => {
    const err = validateContactInput(inputValue, currentContactStep.key);
    if (err) { setInputError(err); return; }

    const updated = { ...contact, [currentContactStep.key]: inputValue };
    setContact(updated);
    handlePartialSave(currentContactStep.key, inputValue);

    if (contactStep === CONTACT_STEPS.length - 1) {
      setSubmitting(true);
      onTrackEvent("funnel_contact_submitted");
      await onComplete(answers, updated);
      setSubmitting(false);
    } else {
      setContactStep((prev) => prev + 1);
      setInputValue("");
      setInputError("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleContactNext();
  };

  const handleBack = () => {
    setInputError("");
    if (stage === "contact") {
      if (contactStep === 0) {
        setStage("quiz");
        setQuizStep(questions.length - 1);
      } else {
        setContactStep((prev) => prev - 1);
        setInputValue(contact[CONTACT_STEPS[contactStep - 1].key]);
      }
    } else if (quizStep > 0) {
      setQuizStep((prev) => prev - 1);
    }
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
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-5 sm:mb-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Fast fertig...</span>
            <span className="text-xs sm:text-sm text-primary font-bold">{progress}% abgeschlossen</span>
          </div>
          <Progress value={progress} className="h-2 sm:h-2.5" />
        </div>
        <div className="text-center py-6 sm:py-10 animate-in fade-in duration-500">
          <div className="flex justify-center mb-5">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold mb-4">
            ✅ Du bist qualifiziert!
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">Perfekt — du passt zu uns! 🎉</h2>
          <p className="text-sm text-muted-foreground">Einen Moment noch...</p>
          <div className="mt-5 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CONTACT INPUT STEP (fließend)
  if (stage === "contact") {
    const isLast = contactStep === CONTACT_STEPS.length - 1;
    return (
      <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-400">
        <div className="mb-5 sm:mb-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              Schritt {questions.length + contactStep + 1} von {TOTAL_STEPS}
            </span>
            <span className="text-xs sm:text-sm text-primary font-bold">{progress}% abgeschlossen</span>
          </div>
          <Progress value={progress} className="h-2 sm:h-2.5" />
        </div>

        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground text-center mb-2 leading-tight px-1">
          {currentContactStep.question}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-5 sm:mb-6 px-2">
          {currentContactStep.subtitle}
        </p>

        <div className="space-y-3">
          <Input
            ref={inputRef}
            type={currentContactStep.type}
            placeholder={currentContactStep.placeholder}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (inputError) setInputError("");
            }}
            onKeyDown={handleKeyDown}
            onBlur={(e) => handlePartialSave(currentContactStep.key, e.target.value)}
            className={`h-14 text-base text-center rounded-xl border-2 ${inputError ? "border-red-500 focus-visible:ring-red-500" : "border-primary/30 focus-visible:border-primary"}`}
          />
          {currentContactStep.hint && (
            <p className="text-xs text-muted-foreground text-center">{currentContactStep.hint}</p>
          )}
          {inputError && <p className="text-xs text-red-500 text-center">{inputError}</p>}

          <Button
            onClick={handleContactNext}
            disabled={submitting}
            size="lg"
            className={`w-full h-13 font-bold mt-1 ${isLast ? "cta-blink" : ""}`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Wird gesendet...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {currentContactStep.buttonLabel}
                {!isLast && <ArrowRight className="h-5 w-5" />}
              </span>
            )}
          </Button>
        </div>

        <div className="mt-4 flex justify-center">
          <Button variant="ghost" onClick={handleBack} className="text-muted-foreground h-10 touch-manipulation">
            <ChevronLeft className="h-4 w-4 mr-1.5" />
            <span className="text-sm">Zurück</span>
          </Button>
        </div>
      </div>
    );
  }

  // QUIZ ANSWER STEP
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
            Schritt {quizStep + 1} von {TOTAL_STEPS}
          </span>
          <span className="text-xs sm:text-sm text-primary font-bold">{progress}% abgeschlossen</span>
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

      {quizStep > 0 && (
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
