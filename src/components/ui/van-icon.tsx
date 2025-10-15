"use client";

import { motion } from "framer-motion";

interface VanIconProps {
  size?: "sm" | "md" | "lg";
  showRoad?: boolean;
}

export function VanIcon({ size = "sm", showRoad = true }: VanIconProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const roadWidthClasses = {
    sm: "w-32",
    md: "w-40",
    lg: "w-48",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* Van qui roule légèrement */}
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
        {/* SVG du van camping-car - même style que van-loading */}
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

          {/* Fenêtres - cabine */}
          <rect x="12" y="26" width="8" height="6" rx="1" ry="1" fill="white" />

          {/* Fenêtres - arrière */}
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
          <rect x="60" y="22" width="8" height="8" rx="1" ry="1" fill="white" />

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

      {/* Route de campagne terre/beige - très douce et transparente */}
      {showRoad && (
        <div className={`${roadWidthClasses[size]} relative`}>
          {/* Route principale style chemin de terre - douce et transparente */}
          <div className="relative h-1.5 bg-gradient-to-b from-amber-600/15 via-amber-500/20 to-amber-600/15 rounded-sm overflow-hidden">
            {/* Ligne centrale en pointillés animée - très douce */}
            <motion.div
              className="absolute top-1/2 left-0 w-full h-px flex items-center"
              style={{ transform: "translateY(-50%)" }}
            >
              {/* Traits beige clair qui défilent - très transparents */}
              <motion.div
                className="flex items-center w-[200%]"
                animate={{
                  x: ["-50%", "0%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-2 h-px bg-amber-300/25 rounded-full mx-1.5"></div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Texture terre très légère */}
            <div className="absolute inset-0 bg-amber-700/3"></div>
          </div>

          {/* Herbe/végétation sur les côtés - très discrète */}
          <div className="absolute -left-0.5 top-0 w-0.5 h-1.5 bg-green-600/12 rounded-l-sm"></div>
          <div className="absolute -right-0.5 top-0 w-0.5 h-1.5 bg-green-600/12 rounded-r-sm"></div>
        </div>
      )}
    </div>
  );
}
