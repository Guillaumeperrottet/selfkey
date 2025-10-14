// Animations sans dépendances externes, utilisant l'API Web Animations

// Animation pour les éléments au scroll
export const animateOnScroll = (selector: string, delay: number = 0) => {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element, index) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const htmlElement = entry.target as HTMLElement;
            htmlElement.style.opacity = "1";
            htmlElement.style.transform = "translateY(0) scale(1)";
            htmlElement.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay + index * 100}ms`;
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Set initial state
    const htmlElement = element as HTMLElement;
    htmlElement.style.opacity = "0";
    htmlElement.style.transform = "translateY(50px) scale(0.8)";

    observer.observe(element);
  });
};

// Animation pour les cartes au hover
export const setupCardHoverAnimations = (selector: string) => {
  const cards = document.querySelectorAll(selector);

  cards.forEach((card) => {
    const cardElement = card as HTMLElement;

    cardElement.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    cardElement.addEventListener("mouseenter", () => {
      cardElement.style.transform = "translateY(-5px) scale(1.02)";
      cardElement.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.15)";
    });

    cardElement.addEventListener("mouseleave", () => {
      cardElement.style.transform = "translateY(0) scale(1)";
      cardElement.style.boxShadow = "";
    });
  });
};

// Animation de pulsation pour les badges
export const pulseAnimation = (selector: string) => {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    htmlElement.style.animation =
      "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite";
  });
};

// Animation de vague pour le background
export const createWaveAnimation = () => {
  const waves = document.querySelectorAll(".wave-1, .wave-2, .wave-3");

  waves.forEach((wave, index) => {
    const htmlElement = wave as HTMLElement;
    const duration = (index + 1) * 2 + 6; // 8s, 10s, 12s
    htmlElement.style.animation = `float ${duration}s ease-in-out infinite`;
    htmlElement.style.animationDelay = `${index * -2}s`;
  });
};

// Animation de typing effect
export const typewriterEffect = (
  selector: string,
  text: string,
  speed: number = 100
) => {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element) return;

  // Vérifier si l'animation a déjà été exécutée ou est en cours
  if (
    element.getAttribute("data-typewriter-done") === "true" ||
    element.getAttribute("data-typewriter-running") === "true"
  ) {
    return;
  }

  // Marquer comme en cours d'exécution
  element.setAttribute("data-typewriter-running", "true");
  element.innerHTML = "";

  const characters = text.split("");
  let currentIndex = 0;

  const typeCharacter = () => {
    if (currentIndex < characters.length) {
      element.innerHTML += characters[currentIndex];
      currentIndex++;
      setTimeout(typeCharacter, speed);
    } else {
      // Marquer comme terminé
      element.setAttribute("data-typewriter-done", "true");
      element.removeAttribute("data-typewriter-running");
    }
  };

  typeCharacter();
};

// Animation des statistiques (compteur)
export const animateCounter = (
  selector: string,
  finalValue: number,
  duration: number = 2000
) => {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element) return;

  const startTime = performance.now();
  const startValue = 0;

  const updateCounter = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (easeOutExpo)
    const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

    const currentValue = Math.round(
      startValue + (finalValue - startValue) * easeOutExpo
    );
    element.textContent = currentValue.toString();

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  };

  requestAnimationFrame(updateCounter);
};

// Animation des icônes flottantes
export const floatingIcons = (selector: string) => {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element, index) => {
    const htmlElement = element as HTMLElement;
    htmlElement.style.animation = `float 3s ease-in-out infinite`;
    htmlElement.style.animationDelay = `${index * 0.5}s`;
  });
};

// Animation de révélation de texte
export const revealText = (selector: string, delay: number = 0) => {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element, index) => {
    const words = element.textContent?.split(" ") || [];
    element.innerHTML = words
      .map(
        (word) =>
          `<span class="word" style="opacity: 0; transform: translateY(20px); display: inline-block; transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);">${word}</span>`
      )
      .join(" ");

    const wordElements = element.querySelectorAll(".word");

    wordElements.forEach((wordElement, wordIndex) => {
      const htmlWordElement = wordElement as HTMLElement;
      setTimeout(
        () => {
          htmlWordElement.style.opacity = "1";
          htmlWordElement.style.transform = "translateY(0)";
        },
        delay + index * 200 + wordIndex * 50
      );
    });
  });
};

// Animation de morphing des boutons
export const morphButton = (selector: string) => {
  const buttons = document.querySelectorAll(selector);

  buttons.forEach((button) => {
    const buttonElement = button as HTMLElement;

    buttonElement.addEventListener("click", () => {
      buttonElement.style.transform = "scale(0.95)";
      buttonElement.style.transition = "transform 0.1s ease-out";

      setTimeout(() => {
        buttonElement.style.transform = "scale(1)";
        buttonElement.style.transition = "transform 0.1s ease-out";
      }, 100);
    });
  });
};

// Animation de particules (version CSS)
export const createParticles = () => {
  const container = document.querySelector(".particles-container");
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 6 + 2}px;
      height: ${Math.random() * 6 + 2}px;
      background: rgba(${Math.random() * 100 + 100}, ${Math.random() * 200 + 150}, ${Math.random() * 100 + 200}, 0.6);
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${Math.random() * 3 + 4}s ease-in-out infinite;
      animation-delay: ${Math.random() * 2}s;
    `;
    container.appendChild(particle);
  }
};
