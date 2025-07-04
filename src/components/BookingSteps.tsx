import { Check, Calendar, FileText, CreditCard } from "lucide-react";

interface BookingStepsProps {
  currentStep: 1 | 2 | 3;
}

export function BookingSteps({ currentStep }: BookingStepsProps) {
  const steps = [
    {
      number: 1,
      title: "Réservation",
      description: "Sélection et informations",
      icon: Calendar,
    },
    {
      number: 2,
      title: "Résumé",
      description: "Vérification et conditions",
      icon: FileText,
    },
    {
      number: 3,
      title: "Paiement",
      description: "Paiement sécurisé",
      icon: CreditCard,
    },
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isCurrent
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>
              <div className="mt-2 text-center">
                <div
                  className={`text-sm font-medium ${
                    isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-gray-300 mx-4 mt-[-20px]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
