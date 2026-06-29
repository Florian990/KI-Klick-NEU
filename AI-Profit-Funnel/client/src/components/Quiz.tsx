import { useState, useEffect, useRef } from "react";
import { Check, XCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAnalytics } from "@/hooks/useAnalytics";

export interface QuizAnswers {
  [questionId: number]: string;
}

interface QuizProps {
  onComplete: (answers: QuizAnswers) => void;
  onDisqualify: () => void;
}

interface QuizAnswer {
  text: string;
  image?: string;
  icon?: React.ReactNode;
  disqualify?: boolean;
  followUp?: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  hint?: string;
  answers: QuizAnswer[];
}

const questions: QuizQuestion[] = [
  {
    id: 11,
    question: "Wie alt bist du?",
    answers: [
      { text: "Unter 18", image: "/assets/quiz/age-under18.jpg", disqualify: true },
      { text: "18–29", image: "/assets/quiz/age-18-29.jpg" },
      { text: "30–45", image: "/assets/quiz/age-30-45.jpg" },
      { text: "Über 45", image: "/assets/quiz/age-45plus.jpg" },
    ],
  },
  {
    id: 12,
    question: "In welcher beruflichen Situation bist du?",
    hint: "Richtet sich an Menschen mit regelmäßigem Einkommen.",
    answers: [
      { text: "Angestellt", image: "/assets/quiz/job-angestellt.jpg" },
      { text: "Selbstständig/Unternehmer", image: "/assets/quiz/job-selbststaendig.jpg" },
      { text: "Rentner/in", image: "/assets/quiz/job-rentner.jpg" },
      { text: "Schüler/in", image: "/assets/quiz/job-schueler.jpg", disqualify: true },
      { text: "Azubi/Student", image: "/assets/quiz/job-azubi.jpg", disqualify: true },
      { text: "Arbeitssuchend/arbeitslos", image: "/assets/quiz/job-arbeitssuchend.jpg", disqualify: true },
    ],
  },
  {
    id: 13,
    question: "Hand aufs Herz: Wie zufrieden bist du mit deinem aktuellen Einkommen?",
    answers: [
      { text: "Überhaupt nicht – es reicht hinten und vorne nicht", icon: <span className="text-3xl sm:text-4xl">😟</span> },
      { text: "Es geht so – mehr wäre schön", icon: <span className="text-3xl sm:text-4xl">😐</span> },
      { text: "Eigentlich ganz okay", icon: <span className="text-3xl sm:text-4xl">🙂</span> },
      { text: "Sehr zufrieden – aber zusätzlich schadet nie", icon: <span className="text-3xl sm:text-4xl">😄</span> },
    ],
  },
  {
    id: 14,
    question: "Ist dir bewusst, dass das ein lernbarer Skill ist und KEIN fertiges Job-Angebot?",
    answers: [
      { text: "Ja", icon: <Check className="h-6 w-6 sm:h-8 sm:w-8" /> },
      { text: "Nein", icon: <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />, followUp: true },
    ],
  },
];

const followUpQuestion: QuizQuestion = {
  id: 15,
  question: "Wenn du einen Mehrwert erkennst + eine schriftliche Garantie von uns bekommst, könntest du es dir vorstellen, das System zu nutzen?",
  answers: [
    { text: "Ja", icon: <Check className="h-6 w-6 sm:h-8 sm:w-8" /> },
    { text: "Nein", icon: <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />, disqualify: true },
  ],
};

export default function Quiz({ onComplete, onDisqualify }: QuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const { trackEvent } = useAnalytics();
  const hasTrackedStart = useRef(false);

  const currentQuestion = showFollowUp ? followUpQuestion : questions[currentStep];
  const totalSteps = showFollowUp ? questions.length + 1 : questions.length;
  const displayStep = showFollowUp ? questions.length + 1 : currentStep + 1;
  const progress = (displayStep / totalSteps) * 100;
  const isPhotoQuestion = currentQuestion.answers.some((a) => a.image);

  useEffect(() => {
    if (!hasTrackedStart.current) {
      trackEvent('quiz_start');
      trackEvent('funnel_start');
      hasTrackedStart.current = true;
    }
  }, []);

  const handleAnswer = (answer: QuizAnswer) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: answer.text }));

    trackEvent(`quiz_step_${currentQuestion.id}`, {
      question: currentQuestion.question.substring(0, 50),
      answer: answer.text
    });

    trackEvent(`funnel_q${currentQuestion.id}`);

    if (answer.disqualify) {
      onDisqualify();
      return;
    }

    if (answer.followUp) {
      setShowFollowUp(true);
      return;
    }

    if (showFollowUp || currentStep === questions.length - 1) {
      const finalAnswers = { ...selectedAnswers, [currentQuestion.id]: answer.text };
      onComplete(finalAnswers);
      return;
    }

    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 300);
  };

  const handleBack = () => {
    if (showFollowUp) {
      setShowFollowUp(false);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const gridCols = isPhotoQuestion
    ? (currentQuestion.answers.length >= 6
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-2 lg:grid-cols-4")
    : (currentQuestion.answers.length >= 4
        ? "grid-cols-1 sm:grid-cols-2"
        : currentQuestion.answers.length === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2");

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <div className="mb-3 sm:mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Frage {displayStep} von {totalSteps}</span>
          <span className="text-[10px] sm:text-xs md:text-sm text-primary font-semibold">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1 sm:h-1.5 md:h-2" />
      </div>

      <div className="text-center mb-4 sm:mb-5 md:mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight px-1">
          {currentQuestion.id === 14 ? (
            <>
              Ist dir bewusst, dass das ein <span className="underline">lernbarer Skill</span> ist und <span className="underline">KEIN</span> fertiges Job-Angebot?
            </>
          ) : (
            currentQuestion.question
          )}
        </h2>
        {currentQuestion.hint && (
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{currentQuestion.hint}</p>
        )}
      </div>

      <div className={`grid gap-2 sm:gap-3 md:gap-4 ${gridCols}`}>
        {currentQuestion.answers.map((answer, index) => {
          const isSelected = selectedAnswers[currentQuestion.id] === answer.text;

          if (answer.image) {
            return (
              <button
                key={index}
                onClick={() => handleAnswer(answer)}
                data-testid={`quiz-answer-${currentQuestion.id}-${index}`}
                className={`group relative overflow-hidden rounded-xl border-2 bg-card transition-all duration-200 active:scale-[0.98] touch-manipulation ${
                  isSelected
                    ? "border-primary ring-2 ring-primary"
                    : "border-primary/30 hover:border-primary"
                }`}
              >
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={answer.image}
                    alt={answer.text}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-2 sm:p-3">
                  <span className="block text-xs sm:text-sm md:text-base font-semibold text-foreground text-center leading-tight">
                    {answer.text}
                  </span>
                </div>
              </button>
            );
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(answer)}
              data-testid={`quiz-answer-${currentQuestion.id}-${index}`}
              className={`group p-3 sm:p-4 md:p-5 rounded-lg border-2 bg-card transition-all duration-200 active:scale-[0.98] flex flex-col items-center justify-center gap-1.5 sm:gap-2 md:gap-3 min-h-[80px] sm:min-h-[100px] md:min-h-[120px] touch-manipulation ${
                isSelected
                  ? "border-primary ring-2 ring-primary bg-primary/10"
                  : "border-primary/30 hover:border-primary hover:bg-primary/10"
              }`}
            >
              <div className="text-primary group-hover:scale-110 group-active:scale-105 transition-transform">
                {answer.icon}
              </div>
              <span className="text-xs sm:text-sm md:text-base font-medium text-foreground text-center leading-tight">
                {answer.text}
              </span>
            </button>
          );
        })}
      </div>

      {(currentStep > 0 || showFollowUp) && (
        <div className="mt-3 sm:mt-4 md:mt-6 flex justify-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-muted-foreground h-10 sm:h-11 touch-manipulation"
            data-testid="quiz-back-button"
          >
            <ChevronLeft className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className="text-sm sm:text-base">Zurück</span>
          </Button>
        </div>
      )}
    </div>
  );
}
