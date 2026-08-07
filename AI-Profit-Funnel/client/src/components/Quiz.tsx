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
      { text: "Unter 18", disqualify: true },
      { text: "18–29" },
      { text: "30–45" },
      { text: "45–72" },
      { text: "Über 72", disqualify: true },
    ],
  },
  {
    id: 12,
    question: "In welcher beruflichen Situation bist du?",
    hint: "Richtet sich an Menschen mit regelmäßigem Einkommen.",
    answers: [
      { text: "Angestellt" },
      { text: "Selbstständig/Unternehmer" },
      { text: "Rentner/in" },
      { text: "Schüler/in", disqualify: true },
      { text: "Azubi/Student", disqualify: true },
      { text: "Arbeitssuchend/arbeitslos", disqualify: true },
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

// --- Rentner branch questions (ids 16 & 17) ---
const rentnerArtQuestion: QuizQuestion = {
  id: 16,
  question: "In welcher Rentenart befindest du dich aktuell?",
  answers: [
    { text: "Frührente / Erwerbsminderungsrente", disqualify: true },
    { text: "Altersrente" },
  ],
};

const rentnerSpielraumQuestion: QuizQuestion = {
  id: 17,
  question: "Wie viel finanziellen Spielraum hast du, wenn alle Fixkosten bezahlt sind?",
  hint: "Deine Antwort hilft uns einzuschätzen, ob wir dir wirklich weiterhelfen können.",
  answers: [
    { text: "Aktuell nichts – es ist eng", disqualify: true },
    { text: "Ein paar hundert Euro" },
    { text: "Deutlich mehr, ich habe Rücklagen" },
  ],
};

// --- Follow-up question if Q14 answered "Nein" ---
const followUpQuestion: QuizQuestion = {
  id: 15,
  question: "Wenn du einen Mehrwert erkennst + eine schriftliche Garantie von uns bekommst, könntest du es dir vorstellen, das System zu nutzen?",
  answers: [
    { text: "Ja", icon: <Check className="h-6 w-6 sm:h-8 sm:w-8" /> },
    { text: "Nein", icon: <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />, disqualify: true },
  ],
};

// Index of Q14 in the questions array
const Q14_INDEX = 3;

export default function Quiz({ onComplete, onDisqualify }: QuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFollowUp, setShowFollowUp] = useState(false);
  // null = not in rentner branch, 'art' = asking rentenart, 'spielraum' = asking financial room
  const [rentnerPhase, setRentnerPhase] = useState<null | 'art' | 'spielraum'>(null);
  // true once the rentner path has been taken (so we know to skip Q13 and handle back correctly)
  const [isRentnerPath, setIsRentnerPath] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const { trackEvent } = useAnalytics();
  const hasTrackedStart = useRef(false);

  // --- Compute which question to show ---
  const currentQuestion =
    rentnerPhase === 'art' ? rentnerArtQuestion :
    rentnerPhase === 'spielraum' ? rentnerSpielraumQuestion :
    showFollowUp ? followUpQuestion :
    questions[currentStep];

  // --- Progress bar ---
  // Rentner path has 5 visible steps (Q11, Q12, Q16, Q17, Q14), normal has 4.
  const extraSteps = isRentnerPath ? 1 : 0;
  const totalSteps = showFollowUp
    ? questions.length + 1 + extraSteps
    : questions.length + extraSteps;

  let displayStep: number;
  if (rentnerPhase === 'art') {
    displayStep = currentStep + 2; // Q12 was step 2, so Q16 = step 3
  } else if (rentnerPhase === 'spielraum') {
    displayStep = currentStep + 3; // Q17 = step 4
  } else if (showFollowUp) {
    displayStep = questions.length + 1 + extraSteps;
  } else if (isRentnerPath) {
    // After rentner branch, currentStep is set to Q14_INDEX (3)
    // Q14 is the 5th visible step on the rentner path
    displayStep = currentStep + 2;
  } else {
    displayStep = currentStep + 1;
  }

  const progress = (displayStep / totalSteps) * 100;

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
      answer: answer.text,
    });
    trackEvent(`funnel_q${currentQuestion.id}`);

    if (answer.disqualify) {
      onDisqualify();
      return;
    }

    // "Rentner/in" selected at Q12 → enter the rentner branch
    if (currentQuestion.id === 12 && answer.text === "Rentner/in") {
      setRentnerPhase('art');
      setIsRentnerPath(true);
      return;
    }

    // Inside rentner branch: rentnerArt question → only Altersrente reaches here
    if (rentnerPhase === 'art') {
      setRentnerPhase('spielraum');
      return;
    }

    // Inside rentner branch: spielraum question → passed, skip Q13, jump to Q14
    if (rentnerPhase === 'spielraum') {
      setRentnerPhase(null);
      setCurrentStep(Q14_INDEX);
      return;
    }

    if (answer.followUp) {
      setShowFollowUp(true);
      return;
    }

    // Last question or followUp answered → complete
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
    if (rentnerPhase === 'spielraum') {
      setRentnerPhase('art');
      return;
    }
    if (rentnerPhase === 'art') {
      setRentnerPhase(null);
      setIsRentnerPath(false);
      // currentStep is still 1 (Q12), so the user sees Q12 again
      return;
    }
    // Back from Q14 when arrived via rentner path → return to spielraum question
    if (isRentnerPath && currentStep === Q14_INDEX) {
      setRentnerPhase('spielraum');
      return;
    }
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const gridCols =
    currentQuestion.answers.length >= 4
      ? "grid-cols-1 sm:grid-cols-2"
      : currentQuestion.answers.length === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

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

          return (
            <button
              key={index}
              onClick={() => handleAnswer(answer)}
              data-testid={`quiz-answer-${currentQuestion.id}-${index}`}
              className={`group p-3 sm:p-4 md:p-5 rounded-lg border-2 bg-card transition-all duration-200 active:scale-[0.98] flex flex-col items-center justify-center gap-1.5 sm:gap-2 md:gap-3 min-h-[72px] sm:min-h-[88px] md:min-h-[104px] touch-manipulation ${
                isSelected
                  ? "border-primary ring-2 ring-primary bg-primary/10"
                  : "border-primary/30 hover:border-primary hover:bg-primary/10"
              }`}
            >
              {answer.icon && (
                <div className="text-primary group-hover:scale-110 group-active:scale-105 transition-transform">
                  {answer.icon}
                </div>
              )}
              <span className="text-sm sm:text-base md:text-lg font-medium text-foreground text-center leading-tight">
                {answer.text}
              </span>
            </button>
          );
        })}
      </div>

      {(currentStep > 0 || showFollowUp || rentnerPhase !== null) && (
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
