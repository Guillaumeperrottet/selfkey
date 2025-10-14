// src/lib/toast-utils.ts
import { toast } from "sonner";

/**
 * Utilitaires pour les toasts avec Sonner
 * Offre des toasts pré-configurés avec possibilité d'annulation
 */

interface ToastWithUndoOptions {
  message: string;
  undoAction: () => void | Promise<void>;
  undoLabel?: string;
  duration?: number;
}

interface ToastWithRetryOptions {
  message: string;
  retryAction: () => void | Promise<void>;
  retryLabel?: string;
  duration?: number;
}

export const toastUtils = {
  // Toasts basiques
  success: (message: string, duration?: number) => {
    return toast.success(message, { duration: duration ?? 4000 });
  },

  error: (message: string, duration?: number) => {
    return toast.error(message, { duration: duration ?? 6000 });
  },

  info: (message: string, duration?: number) => {
    return toast.info(message, { duration: duration ?? 4000 });
  },

  warning: (message: string, duration?: number) => {
    return toast.warning(message, { duration: duration ?? 5000 });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  // Toast de succès avec possibilité d'annuler l'action
  successWithUndo: ({
    message,
    undoAction,
    undoLabel = "Annuler",
    duration = 6000,
  }: ToastWithUndoOptions) => {
    return toast.success(message, {
      duration,
      action: {
        label: undoLabel,
        onClick: async () => {
          const undoToast = toast.loading("Annulation en cours...");
          try {
            await undoAction();
            toast.dismiss(undoToast);
            toast.info("Action annulée");
          } catch (error) {
            toast.dismiss(undoToast);
            toast.error("Erreur lors de l'annulation");
            console.error("Erreur annulation:", error);
          }
        },
      },
    });
  },

  // Toast d'erreur avec possibilité de réessayer
  errorWithRetry: ({
    message,
    retryAction,
    retryLabel = "Réessayer",
    duration = 8000,
  }: ToastWithRetryOptions) => {
    return toast.error(message, {
      duration,
      action: {
        label: retryLabel,
        onClick: async () => {
          const retryToast = toast.loading("Nouvelle tentative...");
          try {
            await retryAction();
            toast.dismiss(retryToast);
          } catch (error) {
            toast.dismiss(retryToast);
            toast.error("Échec de la nouvelle tentative");
            console.error("Erreur retry:", error);
          }
        },
      },
    });
  },

  // Toast de confirmation pour les actions importantes
  confirm: (
    message: string,
    confirmAction: () => void | Promise<void>,
    options?: {
      confirmLabel?: string;
      cancelLabel?: string;
    }
  ) => {
    const { confirmLabel = "Confirmer", cancelLabel = "Annuler" } =
      options ?? {};

    return toast(message, {
      duration: 8000,
      action: {
        label: confirmLabel,
        onClick: async () => {
          try {
            await confirmAction();
          } catch (error) {
            toast.error("Erreur lors de la confirmation");
            console.error("Erreur confirmation:", error);
          }
        },
      },
      cancel: {
        label: cancelLabel,
        onClick: () => {
          toast.info("Action annulée");
        },
      },
    });
  },

  // Dismisser un toast spécifique
  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  },

  // Dismisser tous les toasts
  dismissAll: () => {
    toast.dismiss();
  },

  // Toast personnalisé avec JSX
  custom: (jsx: React.ReactNode, options?: Parameters<typeof toast>[1]) => {
    return toast(jsx, options);
  },

  // Toasts spécifiques pour les opérations CRUD
  crud: {
    created: (entity: string, undoAction?: () => void | Promise<void>) => {
      if (undoAction) {
        return toastUtils.successWithUndo({
          message: `${entity} créé(e) avec succès`,
          undoAction,
        });
      }
      return toastUtils.success(`${entity} créé(e) avec succès`);
    },

    updated: (entity: string, undoAction?: () => void | Promise<void>) => {
      if (undoAction) {
        return toastUtils.successWithUndo({
          message: `${entity} modifié(e) avec succès`,
          undoAction,
        });
      }
      return toastUtils.success(`${entity} modifié(e) avec succès`);
    },

    deleted: (entity: string, undoAction?: () => void | Promise<void>) => {
      if (undoAction) {
        return toastUtils.successWithUndo({
          message: `${entity} supprimé(e) avec succès`,
          undoAction,
          undoLabel: "Restaurer",
          duration: 8000,
        });
      }
      return toastUtils.success(`${entity} supprimé(e) avec succès`);
    },

    activated: (entity: string, undoAction?: () => void | Promise<void>) => {
      if (undoAction) {
        return toastUtils.successWithUndo({
          message: `${entity} activé(e) avec succès`,
          undoAction,
          undoLabel: "Désactiver",
        });
      }
      return toastUtils.success(`${entity} activé(e) avec succès`);
    },

    deactivated: (entity: string, undoAction?: () => void | Promise<void>) => {
      if (undoAction) {
        return toastUtils.successWithUndo({
          message: `${entity} désactivé(e) avec succès`,
          undoAction,
          undoLabel: "Réactiver",
        });
      }
      return toastUtils.success(`${entity} désactivé(e) avec succès`);
    },
  },
};

export default toastUtils;
