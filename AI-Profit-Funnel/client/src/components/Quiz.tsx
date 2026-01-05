import { useState } from "react";
import { GraduationCap, Users, Briefcase, XCircle, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface QuizProps {
  onComplete: () => void;
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
    question: "Ist dir bewusst, dass die KI Agent Methode kein Jobangebot ist, sondern es sich um ein System handelt, welches du nebenbei umsetzen kannst um Geld zu verdienen?",
    answers: [
      { text: "Ja", icon: <Check className="h-6 w-6 sm:h-8 sm:w-8" /> },
      { text: "Nein", icon: <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />, followUp: true },
    ],
  },
];

const followUpQuestion: QuizQuestion = {
  id: 6,
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
  const totalSteps = showFollowUp ? 6 : 5;
  const displayStep = showFollowUp ? 6 : currentStep + 1;
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
      onComplete();
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
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs sm:text-sm text-muted-foreground">Frage {displayStep} von {totalSteps}</span>
          <span className="text-xs sm:text-sm text-primary font-semibold">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5 sm:h-2" />
      </div>

      <div className="text-center mb-5 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
          {currentQuestion.id === 5 ? (
            <>
              Ist dir bewusst, dass die KI Agent Methode <span className="underline">kein Jobangebot</span> ist, sondern es sich um ein System handelt, welches du nebenbei umsetzen kannst um Geld zu verdienen?
            </>
          ) : (
            currentQuestion.question
          )}
        </h2>
      </div>

      <div className={`grid gap-3 sm:gap-4 ${currentQuestion.answers.length === 4 ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4' : currentQuestion.answers.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(answer)}
            data-testid={`quiz-answer-${currentQuestion.id}-${index}`}
            className="group p-4 sm:p-5 rounded-lg border-2 border-primary/30 bg-card transition-all duration-200 hover:border-primary hover:bg-primary/10 flex flex-col items-center justify-center gap-2 sm:gap-3 min-h-[100px] sm:min-h-[120px]"
          >
            <div className="text-primary group-hover:scale-110 transition-transform">
              {answer.icon}
            </div>
            <span className="text-sm sm:text-base font-medium text-foreground text-center">
              {answer.text}
            </span>
          </button>
        ))}
      </div>

      {(currentStep > 0 || showFollowUp) && (
        <div className="mt-4 sm:mt-6 flex justify-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-muted-foreground"
            data-testid="quiz-back-button"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>
      )}
    </div>
  );
}
