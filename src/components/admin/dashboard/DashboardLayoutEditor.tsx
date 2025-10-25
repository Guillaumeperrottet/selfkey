"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  SECTION_LABELS,
  DEFAULT_SECTION_ORDER,
  type DashboardSectionType,
  type DashboardPreferences,
} from "@/types/dashboard-stats";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface DashboardLayoutEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPreferences: DashboardPreferences;
  onSave: (preferences: DashboardPreferences) => Promise<void>;
}

interface SortableItemProps {
  id: DashboardSectionType;
  label: string;
  isVisible: boolean;
  onToggleVisibility: (id: DashboardSectionType) => void;
}

function SortableItem({
  id,
  label,
  isVisible,
  onToggleVisibility,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-white border rounded-lg ${
        isDragging ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={isVisible}
          onCheckedChange={() => onToggleVisibility(id)}
          id={`switch-${id}`}
        />
        <Label htmlFor={`switch-${id}`} className="sr-only">
          {isVisible ? "Masquer" : "Afficher"} {label}
        </Label>
        {isVisible ? (
          <Eye className="h-4 w-4 text-green-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-gray-400" />
        )}
      </div>
    </div>
  );
}

export function DashboardLayoutEditor({
  open,
  onOpenChange,
  currentPreferences,
  onSave,
}: DashboardLayoutEditorProps) {
  const [sectionOrder, setSectionOrder] = useState<DashboardSectionType[]>(
    currentPreferences.sectionOrder || DEFAULT_SECTION_ORDER
  );
  const [hiddenSections, setHiddenSections] = useState<DashboardSectionType[]>(
    currentPreferences.hiddenSections || []
  );
  const [isSaving, setIsSaving] = useState(false);

  // Synchroniser l'état local quand currentPreferences change
  useEffect(() => {
    setSectionOrder(currentPreferences.sectionOrder || DEFAULT_SECTION_ORDER);
    setHiddenSections(currentPreferences.hiddenSections || []);
  }, [currentPreferences]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as DashboardSectionType);
        const newIndex = items.indexOf(over.id as DashboardSectionType);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleToggleVisibility = (id: DashboardSectionType) => {
    setHiddenSections((prev) => {
      if (prev.includes(id)) {
        return prev.filter((sectionId) => sectionId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedPreferences: DashboardPreferences = {
        ...currentPreferences,
        sectionOrder,
        hiddenSections,
      };
      await onSave(updatedPreferences);
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde de l'organisation");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSectionOrder(DEFAULT_SECTION_ORDER);
    setHiddenSections([]);
    toast.info("Organisation réinitialisée");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Organiser le Dashboard</DialogTitle>
          <DialogDescription>
            Glissez-déposez les sections pour réorganiser votre dashboard.
            Utilisez les interrupteurs pour masquer/afficher des sections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sectionOrder}
              strategy={verticalListSortingStrategy}
            >
              {sectionOrder.map((sectionId) => (
                <SortableItem
                  key={sectionId}
                  id={sectionId}
                  label={SECTION_LABELS[sectionId]}
                  isVisible={!hiddenSections.includes(sectionId)}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <DialogFooter className="flex gap-2 sticky bottom-0 bg-white border-t pt-4 mt-4">
          <Button variant="outline" onClick={handleReset}>
            Réinitialiser
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
