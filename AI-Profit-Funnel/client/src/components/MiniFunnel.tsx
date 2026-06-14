import { useState } from "react";
import { ChevronLeft, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

interface MiniFunnelProps {
  onComplete: (answers: Record<number, string>) => void;
  onTrackEvent: (event: string) => void;
}

export default function MiniFunnel({ onComplete, onTrackEvent }: MiniFunnelProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [disqualified, setDisqualified] = useState(false);

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

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
      onComplete(newAnswers);
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

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
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-muted-foreground h-10 sm:h-11 touch-manipulation"
          >
            <ChevronLeft className="h-4 w-4 mr-1.5" />
            <span className="text-sm sm:text-base">Zurück</span>
          </Button>
        </div>
      )}
    </div>
  );
}
