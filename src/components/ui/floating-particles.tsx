"use client";

import { useEffect } from "react";

export function FloatingParticles() {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "particle fixed pointer-events-none z-0";

      // Position aléatoire
      particle.style.left = Math.random() * 100 + "vw";
      particle.style.top = "100vh";

      // Taille aléatoire
      const size = Math.random() * 6 + 2;
      particle.style.width = size + "px";
      particle.style.height = size + "px";

      // Couleurs de la palette vintage
      const colors = [
        "rgba(45, 90, 90, 0.7)", // Vintage Teal
        "rgba(244, 208, 63, 0.8)", // Vintage Yellow
        "rgba(230, 126, 34, 0.7)", // Vintage Orange
        "rgba(74, 124, 124, 0.6)", // Vintage Teal Light
        "rgba(232, 232, 232, 0.9)", // Vintage Gray
      ];
      particle.style.background =
        colors[Math.floor(Math.random() * colors.length)];

      // Animation
      particle.style.animation = `float-up ${Math.random() * 3 + 5}s linear infinite`;

      // Ajouter au DOM
      document.body.appendChild(particle);

      // Supprimer après l'animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 8000);
    };

    // Style pour l'animation CSS
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float-up {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateY(-100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    // Créer des particules à intervalles réguliers
    const interval = setInterval(createParticle, 2000);

    return () => {
      clearInterval(interval);
      document.head.removeChild(style);
    };
  }, []);

  return null;
}
