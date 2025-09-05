"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface DomainRouterProps {
  selfcampContent: React.ReactNode;
  selfkeyContent: React.ReactNode;
}

export function DomainRouter({
  selfcampContent,
  selfkeyContent,
}: DomainRouterProps) {
  const [hostname, setHostname] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  // Permettre de forcer l'affichage avec ?app=selfkey ou ?app=selfcamp
  const forceApp = searchParams.get("app");

  if (forceApp === "selfkey") {
    return <>{selfkeyContent}</>;
  }

  if (forceApp === "selfcamp") {
    return <>{selfcampContent}</>;
  }

  // Afficher le contenu selfkey par défaut en développement local
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return <>{selfkeyContent}</>;
  }

  // Afficher le contenu selfcamp si on est sur selfcamp.ch
  if (hostname === "selfcamp.ch" || hostname === "www.selfcamp.ch") {
    return <>{selfcampContent}</>;
  }

  // Sinon afficher le contenu selfkey par défaut
  return <>{selfkeyContent}</>;
}
