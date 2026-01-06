import { useState } from "react";
import { GraduationCap, Users, Briefcase, XCircle, Check, ChevronRight, ChevronLeft, Euro, Home, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface QuizAnswers {
  [questionId: number]: string;
}

interface QuizProps {
  onComplete: (answers: QuizAnswers) => void;
  onDisqualify: () => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  answers: {
    text: string;
    icon: React.ReactNode;
    disqualify?: boolean;
    followUp?: boolean;
  }[];
}

const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "Was ist dein aktueller Beruf?",
    answers: [
      { text: "Azubi/Student/in", icon: <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" /> },
      { text: "Angestellte/r", icon: <Users className="h-6 w-6 sm:h-8 sm:w-8" /> },
      { text: "Unternehmer/in", icon: <Briefcase className="h-6 w-6 sm:h-8 sm:w-8" /> },
      { text: "aktuell arbeitslos", icon: <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />, disqualify: true },
    ],
  },
  {
    id: 2,
    question: "Bist du mit deiner aktuellen Situation zufrieden?",
    answers: [
      { text: "Ja, aber mehr schadet nicht", icon: <Check className="h-6 w-6 sm:h-8 sm:w-8" /> },
      { text: "Nein, ich möchte was verändern", icon: <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" /> },
    ],
  },
  {
    id: 3,
    question: "Wie alt bist du?",
    answers: [
      { text: "Unter 18", icon: <span className="text-xl sm:text-2xl font-bold">-18</span>, disqualify: true },
      { text: "zwischen 18-26", icon: <span className="text-xl sm:text-2xl font-bold">18+</span> },
      { text: "zwischen 26-40", icon: <span className="text-xl sm:text-2xl font-bold">26+</span> },
      { text: "über 40", icon: <span className="text-xl sm:text-2xl font-bold">40+</span> },
    ],
  },
  {
    id: 4,
    question: "Wie viel Zeit hast du am Tag um sie in dein zweites Standbein zu investieren?",
    answers: [
      { text: "1-2H", icon: <span className="text-xl sm:text-2xl font-bold">1-2</span> },
      { text: "2-4H", icon: <span className="text-xl sm:text-2xl font-bold">2-4</span> },
      { text: "4H oder mehr", icon: <span className="text-xl sm:text-2xl font-bold">4+</span> },
    ],
  },
  {
    id: 5,
    question: "Ist dir bewusst, dass es sich hier um einen High Income Skill handelt den du lernen kannst und NICHT um ein Job Angebot?",
    answers: [
      { text: "Ja", icon: <Check className="h-6 w-6 sm:h-8 sm:w-8" /> },
      { text: "Nein", icon: <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />, followUp: true },
    ],
  },
  {
    id: 6,
    question: "Wähle aus, was dir am Wichtigsten ist!",
    answers: [
      { text: "Einkommen über 2.500€", icon: <Euro className="h-6 w-6 sm:h-8 sm:w-8" /> },
      { text: "Mehr Zeit für Freunde und Familie", icon: <Users className="h-6 w-6 sm:h-8 sm:w-8" /> },
      { text: "Arbeiten von Zuhause", icon: <Home className="h-6 w-6 sm:h-8 sm:w-8" /> },
      { text: "Ortsunabhängig", icon: <MapPin className="h-6 w-6 sm:h-8 sm:w-8" /> },
    ],
  },
];

const followUpQuestion: QuizQuestion = {
  id: 7,
  question: "Wenn du einen Mehrwert erkennen würdest + eine schriftliche Garantie von uns bekommst, könntest du es dir dann vorstellen das System zu nutzen?",
  answers: [
    { text: "Ja", icon: <Check className="h-6 w-6 sm:h-8 sm:w-8" /> },
    { text: "Nein", icon: <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />, disqualify: true },
  ],
};

export default function Quiz({ onComplete, onDisqualify }: QuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const currentQuestions = showFollowUp ? [followUpQuestion] : questions;
  const currentQuestion = showFollowUp ? followUpQuestion : questions[currentStep];
  const totalSteps = showFollowUp ? 7 : 6;
  const displayStep = showFollowUp ? 7 : currentStep + 1;
  const progress = (displayStep / totalSteps) * 100;

  const handleAnswer = (answer: typeof currentQuestion.answers[0]) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: answer.text }));

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
          {currentQuestion.id === 5 ? (
            <>
              Ist dir bewusst, dass es sich hier um einen <span className="underline">High Income Skill</span> handelt den du lernen kannst und <span className="underline">NICHT</span> um ein Job Angebot?
            </>
          ) : (
            currentQuestion.question
          )}
        </h2>
      </div>

      <div className={`grid gap-2 sm:gap-3 md:gap-4 ${currentQuestion.answers.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : currentQuestion.answers.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(answer)}
            data-testid={`quiz-answer-${currentQuestion.id}-${index}`}
            className="group p-3 sm:p-4 md:p-5 rounded-lg border-2 border-primary/30 bg-card transition-all duration-200 hover:border-primary hover:bg-primary/10 active:border-primary active:bg-primary/20 active:scale-[0.98] flex flex-col items-center justify-center gap-1.5 sm:gap-2 md:gap-3 min-h-[80px] sm:min-h-[100px] md:min-h-[120px] touch-manipulation"
          >
            <div className="text-primary group-hover:scale-110 group-active:scale-105 transition-transform">
              {answer.icon}
            </div>
            <span className="text-xs sm:text-sm md:text-base font-medium text-foreground text-center leading-tight">
              {answer.text}
            </span>
          </button>
        ))}
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
