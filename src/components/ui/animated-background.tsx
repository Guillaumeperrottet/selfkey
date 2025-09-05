"use client";

import { useEffect } from "react";

export function AnimatedBackground() {
  useEffect(() => {
    // Créer les éléments de background animé
    const container = document.querySelector(".animated-background");
    if (!container) return;

    // Créer des formes géométriques flottantes avec la palette vintage
    for (let i = 0; i < 6; i++) {
      const shape = document.createElement("div");
      shape.className = `wave-${(i % 3) + 1}`;
      shape.style.position = "absolute";
      shape.style.borderRadius = "50%";

      // Utiliser les couleurs de la palette vintage
      const colors = [
        "linear-gradient(45deg, rgba(45, 90, 90, 0.15), rgba(74, 124, 124, 0.1))",
        "linear-gradient(45deg, rgba(244, 208, 63, 0.1), rgba(230, 126, 34, 0.08))",
        "linear-gradient(45deg, rgba(232, 232, 232, 0.2), rgba(245, 245, 245, 0.15))",
      ];
      shape.style.background = colors[i % 3];

      shape.style.width = `${Math.random() * 200 + 100}px`;
      shape.style.height = shape.style.width;
      shape.style.left = `${Math.random() * 100}%`;
      shape.style.top = `${Math.random() * 100}%`;
      shape.style.filter = "blur(1px)";
      shape.style.zIndex = "-1";
      container.appendChild(shape);
    }
  }, []);

  return (
    <div
      className="animated-background fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: -1 }}
    >
      {/* Gradient de base avec la palette vintage */}
      <div className="absolute inset-0 bg-gradient-vintage-background" />

      {/* Conteneur pour particules */}
      <div className="particles-container absolute inset-0 vintage-particles" />

      {/* Motifs géométriques statiques avec palette vintage */}
      <div
        className="absolute top-20 left-20 w-32 h-32 rounded-full blur-xl wave-1"
        style={{
          background:
            "linear-gradient(45deg, rgba(45, 90, 90, 0.2), rgba(74, 124, 124, 0.15))",
        }}
      />
      <div
        className="absolute bottom-40 right-32 w-48 h-48 rounded-full blur-xl wave-2"
        style={{
          background:
            "linear-gradient(45deg, rgba(244, 208, 63, 0.15), rgba(230, 126, 34, 0.1))",
        }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full blur-lg wave-3"
        style={{
          background:
            "linear-gradient(45deg, rgba(232, 232, 232, 0.3), rgba(245, 245, 245, 0.2))",
        }}
      />
    </div>
  );
}
