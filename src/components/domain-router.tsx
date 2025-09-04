"use client";

import { useEffect, useState } from "react";

interface DomainRouterProps {
  selfcampContent: React.ReactNode;
  selfkeyContent: React.ReactNode;
}

export function DomainRouter({
  selfcampContent,
  selfkeyContent,
}: DomainRouterProps) {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  // Afficher le contenu selfcamp si on est sur selfcamp.ch
  if (hostname === "selfcamp.ch" || hostname === "www.selfcamp.ch") {
    return <>{selfcampContent}</>;
  }

  // Sinon afficher le contenu selfkey par défaut
  return <>{selfkeyContent}</>;
}
