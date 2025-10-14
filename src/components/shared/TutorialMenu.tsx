import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TutorialMenuProps {
  onStartTutorial: () => void;
}

export function TutorialMenu({ onStartTutorial }: TutorialMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Aide
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={onStartTutorial}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Démarrer le guide
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            asChild
          >
            <a href="/help" target="_blank" rel="noopener noreferrer">
              <HelpCircle className="h-4 w-4 mr-2" />
              Guide complet
            </a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
