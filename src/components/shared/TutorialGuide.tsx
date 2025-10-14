import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface TutorialStep {
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
  offset?: { x: number; y: number };
}

interface TutorialGuideProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export function TutorialGuide({
  steps,
  onComplete,
  onSkip,
}: TutorialGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [elementPosition, setElementPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const step = steps[currentStep];
      if (!step) return;

      const element = document.querySelector(step.target);
      if (element) {
        // Vérifier si l'élément est visible
        const rect = element.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;

        if (!isVisible) {
          // Si l'élément n'est pas visible, passer au suivant automatiquement
          if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            return;
          } else {
            // Si c'est le dernier élément et qu'il n'est pas visible, terminer
            onComplete();
            return;
          }
        }

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        let x = rect.left + scrollX;
        let y = rect.top + scrollY;

        // Ajuster la position selon l'orientation
        switch (step.position) {
          case "top":
            x += rect.width / 2;
            y -= 10;
            break;
          case "bottom":
            x += rect.width / 2;
            y += rect.height + 10;
            break;
          case "left":
            x -= 10;
            y += rect.height / 2;
            break;
          case "right":
            x += rect.width + 10;
            y += rect.height / 2;
            break;
        }

        // Appliquer l'offset personnalisé
        if (step.offset) {
          x += step.offset.x;
          y += step.offset.y;
        }

        setElementPosition({ x, y });
        setIsVisible(true);

        // Highlight de l'élément
        element.classList.add("tutorial-highlight");

        // Scroll vers l'élément si nécessaire
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      // Nettoyer les highlights
      document.querySelectorAll(".tutorial-highlight").forEach((el) => {
        el.classList.remove("tutorial-highlight");
      });
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [currentStep, steps, onComplete]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  if (!currentStepData || !isVisible) return null;

  const getArrowClasses = () => {
    const base = "absolute w-0 h-0 border-solid";
    switch (currentStepData.position) {
      case "top":
        return `${base} border-t-[10px] border-l-[10px] border-r-[10px] border-t-white border-l-transparent border-r-transparent -bottom-[10px] left-1/2 -translate-x-1/2`;
      case "bottom":
        return `${base} border-b-[10px] border-l-[10px] border-r-[10px] border-b-white border-l-transparent border-r-transparent -top-[10px] left-1/2 -translate-x-1/2`;
      case "left":
        return `${base} border-l-[10px] border-t-[10px] border-b-[10px] border-l-white border-t-transparent border-b-transparent -right-[10px] top-1/2 -translate-y-1/2`;
      case "right":
        return `${base} border-r-[10px] border-t-[10px] border-b-[10px] border-r-white border-t-transparent border-b-transparent -left-[10px] top-1/2 -translate-y-1/2`;
    }
  };

  const getCardClasses = () => {
    const base = "absolute z-50 max-w-sm";
    switch (currentStepData.position) {
      case "top":
        return `${base} -translate-x-1/2 -translate-y-full`;
      case "bottom":
        return `${base} -translate-x-1/2`;
      case "left":
        return `${base} -translate-x-full -translate-y-1/2`;
      case "right":
        return `${base} -translate-y-1/2`;
    }
  };

  return (
    <>
      {/* Overlay semi-transparent */}
      <div className="fixed inset-0 bg-black/50 z-40" />

      {/* Carte du tutorial */}
      <Card
        className={getCardClasses()}
        style={{
          left: `${elementPosition.x}px`,
          top: `${elementPosition.y}px`,
        }}
      >
        <div className={getArrowClasses()} />
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-lg">{currentStepData.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {currentStepData.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousStep}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
              )}

              <Button
                size="sm"
                onClick={nextStep}
                className="flex items-center gap-1"
              >
                {currentStep === steps.length - 1 ? "Terminé" : "Suivant"}
                {currentStep < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
