import { Check, Calendar, FileText, CreditCard } from "lucide-react";

interface BookingStepsProps {
  currentStep: 1 | 2 | 3;
}

export function BookingSteps({ currentStep }: BookingStepsProps) {
  const steps = [
    {
      number: 1,
      title: "Booking",
      description: "Selection & details",
      icon: Calendar,
    },
    {
      number: 2,
      title: "Summary",
      description: "Review & terms",
      icon: FileText,
    },
    {
      number: 3,
      title: "Payment",
      description: "Secure payment",
      icon: CreditCard,
    },
  ];

  return (
    <div className="flex items-center justify-between mb-6 px-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  isCompleted
                    ? "bg-muted border-muted text-muted-foreground"
                    : isCurrent
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-muted/50 border-muted text-muted-foreground/50"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="mt-2 text-center">
                <div
                  className={`text-xs font-medium ${
                    isCompleted || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {step.description}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-border mx-3 mt-[-16px]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
