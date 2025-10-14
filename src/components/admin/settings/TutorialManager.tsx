import { useState, useEffect } from "react";
import { TutorialGuide } from "@/components/shared/TutorialGuide";

interface TutorialStep {
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
  offset?: { x: number; y: number };
}

interface TutorialManagerProps {
  tutorialKey: string;
  steps: TutorialStep[];
  autoStart?: boolean;
  delay?: number;
}

export function useTutorial({
  tutorialKey,
  steps,
  autoStart = true,
  delay = 1000,
}: TutorialManagerProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(`tutorial_${tutorialKey}`);

    // Debug: log pour aider au débogage
    console.log(`Tutorial ${tutorialKey}: hasSeenTutorial =`, hasSeenTutorial);

    if (!hasSeenTutorial && autoStart) {
      setIsFirstVisit(true);
      // Petite pause pour laisser le temps à la page de se charger
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [tutorialKey, autoStart, delay]);

  const handleComplete = () => {
    setShowTutorial(false);
    localStorage.setItem(`tutorial_${tutorialKey}`, "completed");
  };

  const handleSkip = () => {
    setShowTutorial(false);
    localStorage.setItem(`tutorial_${tutorialKey}`, "skipped");
  };

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem(`tutorial_${tutorialKey}`);
    setIsFirstVisit(true);
    setShowTutorial(true);
  };

  return {
    showTutorial,
    isFirstVisit,
    startTutorial,
    resetTutorial,
    tutorialComponent: showTutorial ? (
      <TutorialGuide
        steps={steps}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    ) : null,
  };
}
