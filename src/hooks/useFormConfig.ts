import { useState, useEffect } from "react";

interface FormFieldConfig {
  enabled: boolean;
  required: boolean;
}

interface FormConfig {
  [fieldId: string]: FormFieldConfig;
}

export function useFormConfig(hotelSlug: string) {
  const [formConfig, setFormConfig] = useState<FormConfig>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFormConfig = async () => {
      try {
        const response = await fetch(
          `/api/establishments/${hotelSlug}/form-config`
        );
        if (response.ok) {
          const data = await response.json();
          setFormConfig(data.formConfig || {});
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement de la configuration du formulaire:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadFormConfig();
  }, [hotelSlug]);

  const isFieldEnabled = (fieldId: string): boolean => {
    // Si pas de configuration spécifique, le champ est activé par défaut
    return formConfig[fieldId]?.enabled ?? true;
  };

  const isFieldRequired = (fieldId: string): boolean => {
    // Les champs obligatoires le restent toujours, incluant ceux requis par Stripe
    const requiredFields = [
      "adults",
      "clientFirstName",
      "clientLastName",
      "clientEmail",
      "clientPhone",
      // Champs requis par Stripe pour billing_details
      "clientAddress",
      "clientPostalCode",
      "clientCity",
      "clientCountry",
    ];
    return requiredFields.includes(fieldId);
  };

  return {
    formConfig,
    isLoading,
    isFieldEnabled,
    isFieldRequired,
  };
}
