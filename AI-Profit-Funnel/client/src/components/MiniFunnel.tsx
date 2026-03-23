import { useState } from "react";
import { Check, X, ChevronLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const DISQ_URL = "https://www.digistore24.com/redir/454379/Florianbenedict/disq";

interface Answer {
  text: string;
  label: string;
  disqualify: boolean;
}

interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "Wie viel Zeit kannst du aktuell täglich investieren?",
    answers: [
      { text: "1–2 Stunden", label: "1-2h", disqualify: false },
      { text: "2–4 Stunden", label: "2-4h", disqualify: false },
      { text: "4 Stunden oder mehr", label: "4h+", disqualify: false },
    ],
  },
  {
    id: 2,
    question: "Wärst du bereit, ca. 200–300€ monatlich in Tools & Umsetzung zu investieren?",
    answers: [
      { text: "Ja", label: "✓", disqualify: false },
      { text: "Nein", label: "✗", disqualify: true },
    ],
  },
  {
    id: 3,
    question: "Wie alt bist du?",
    answers: [
      { text: "Unter 18 Jahre", label: "-18", disqualify: true },
      { text: "18 – 24 Jahre", label: "18+", disqualify: false },
      { text: "25 – 39 Jahre", label: "25+", disqualify: false },
      { text: "40 Jahre oder älter", label: "40+", disqualify: false },
    ],
  },
];

interface MiniFunnelProps {
  onComplete: () => void;
}

export default function MiniFunnel({ onComplete }: MiniFunnelProps) {
  const [step, setStep] = useState(0);

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleAnswer = (answer: Answer) => {
    if (answer.disqualify) {
      window.location.href = DISQ_URL;
      return;
    }
    if (step === questions.length - 1) {
      onComplete();
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const cols =
    currentQuestion.answers.length === 4
      ? "grid-cols-2"
      : currentQuestion.answers.length === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Frage {step + 1} von {questions.length}
          </span>
          <span className="text-xs sm:text-sm text-primary font-semibold">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-1.5 sm:h-2" />
      </div>

      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground text-center mb-5 sm:mb-7 leading-tight px-1">
        {currentQuestion.question}
      </h2>

      <div className={`grid gap-3 sm:gap-4 ${cols}`}>
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(answer)}
            className="group p-4 sm:p-5 rounded-xl border-2 border-primary/30 bg-card hover:border-primary hover:bg-primary/10 active:bg-primary/20 active:scale-[0.98] transition-all duration-200 flex flex-col items-center justify-center gap-2 sm:gap-3 min-h-[90px] sm:min-h-[110px] touch-manipulation"
          >
            <div className="text-xl sm:text-2xl font-bold text-primary group-hover:scale-110 transition-transform">
              {answer.label === "✓" ? (
                <Check className="h-7 w-7 sm:h-8 sm:w-8" />
              ) : answer.label === "✗" ? (
                <X className="h-7 w-7 sm:h-8 sm:w-8" />
              ) : (
                <span>{answer.label}</span>
              )}
            </div>
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
