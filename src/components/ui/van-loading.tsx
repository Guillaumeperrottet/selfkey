"use client";

import { motion } from "framer-motion";

interface VanLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  showRoad?: boolean;
}

export function VanLoading({
  message = "Chargement en cours...",
  size = "md",
  showRoad = true,
}: VanLoadingProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const roadSizeClasses = {
    sm: "w-32 h-2",
    md: "w-48 h-3",
    lg: "w-64 h-4",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Route avec animation - version simple */}
      {showRoad && (
        <div className="relative flex items-center">
          {/* Route simple */}
          <div
            className={`${roadSizeClasses[size]} bg-gray-100 rounded-full relative overflow-hidden`}
          >
            {/* Lignes de route animées */}
            <motion.div
              className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 flex items-center justify-center"
              style={{ transform: "translateY(-50%)" }}
            >
              {/* Petites lignes blanches qui défilent */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-0.5 bg-white mx-2 rounded-full"
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.4,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* Van qui roule */}
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} flex items-center justify-center`}
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* SVG du van camping-car */}
          <svg
            viewBox="0 0 100 60"
            className="w-full h-full text-[#84994F]"
            fill="currentColor"
          >
            {/* Corps principal du van */}
            <rect
              x="15"
              y="20"
              width="55"
              height="25"
              rx="3"
              ry="3"
              fill="currentColor"
            />

            {/* Cabine */}
            <rect
              x="10"
              y="25"
              width="15"
              height="20"
              rx="2"
              ry="2"
              fill="currentColor"
            />

            {/* Toit du van */}
            <rect
              x="12"
              y="18"
              width="56"
              height="4"
              rx="2"
              ry="2"
              fill="currentColor"
            />

            {/* Fenêtres */}
            <rect
              x="12"
              y="26"
              width="8"
              height="6"
              rx="1"
              ry="1"
              fill="white"
            />
            <rect
              x="30"
              y="22"
              width="12"
              height="8"
              rx="1"
              ry="1"
              fill="white"
            />
            <rect
              x="45"
              y="22"
              width="12"
              height="8"
              rx="1"
              ry="1"
              fill="white"
            />
            <rect
              x="60"
              y="22"
              width="8"
              height="8"
              rx="1"
              ry="1"
              fill="white"
            />

            {/* Roues */}
            <circle cx="22" cy="48" r="6" fill="#333" />
            <circle cx="22" cy="48" r="3" fill="#666" />
            <circle cx="58" cy="48" r="6" fill="#333" />
            <circle cx="58" cy="48" r="3" fill="#666" />

            {/* Phares */}
            <circle cx="8" cy="35" r="2" fill="#FFE135" />

            {/* Porte */}
            <rect x="50" y="30" width="1" height="12" fill="#666" />

            {/* Détails camping */}
            <rect x="67" y="25" width="2" height="8" fill="#84994F" />
            <circle cx="68" cy="27" r="1" fill="white" />
          </svg>
        </motion.div>

        {/* Nuage de poussière simple */}
        <motion.div
          className="absolute -bottom-1 -left-2 flex space-x-1"
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-gray-300 rounded-full" />
          ))}
        </motion.div>
      </div>

      {/* Message de chargement */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-[#84994F]">{message}</p>

        {/* Points de chargement animés */}
        <div className="flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-[#84994F] rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Composant pour page de loading pleine page
export function VanLoadingPage({
  message = "SelfCamp se prépare pour votre aventure...",
  subtitle = "Recherche des meilleurs emplacements de camping",
}: {
  message?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#84994F] mb-2">SelfCamp</h1>
          <p className="text-gray-600">{subtitle}</p>
        </motion.div>

        {/* Van qui roule */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <VanLoading message={message} size="lg" />
        </motion.div>
      </div>
    </div>
  );
}
