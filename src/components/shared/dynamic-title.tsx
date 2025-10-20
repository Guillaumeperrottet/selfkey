"use client";

import { useEffect } from "react";

interface DynamicTitleProps {
  selfcampTitle?: string;
  selfkeyTitle?: string;
}

export function DynamicTitle({
  selfcampTitle = "Selfcamp - La liberté de camper, sans contraintes",
  selfkeyTitle = "Selfkey - Automatiser l'enregistrement pour votre établissement",
}: DynamicTitleProps) {
  useEffect(() => {
    const hostname = window.location.hostname;

    // Déterminer quel titre afficher selon le domaine
    if (hostname === "selfcamp.ch" || hostname === "www.selfcamp.ch") {
      document.title = selfcampTitle;
    } else {
      document.title = selfkeyTitle;
    }
  }, [selfcampTitle, selfkeyTitle]);

  return null; // Ce composant ne rend rien visuellement
}
