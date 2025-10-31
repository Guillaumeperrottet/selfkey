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

  const roadSizeClasses = {
    sm: "w-32 h-2",
    md: "w-48 h-3",
    lg: "w-64 h-4",
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

      {/* Route avec animation - couleur assortie au background */}
      {showRoad && (
        <div className="relative flex items-center">
          {/* Route simple avec couleur du background */}
          <div
            className={`${roadSizeClasses[size]} rounded-full relative overflow-hidden`}
            style={{ backgroundColor: "#EEEAE2" }}
          >
            {/* Lignes de route animées */}
            <motion.div
              className="absolute top-1/2 left-0 w-full h-0.5"
              style={{
                transform: "translateY(-50%)",
                backgroundColor: "#d9d5cd",
              }}
            >
              {/* Petites lignes légèrement plus foncées qui défilent en boucle continue */}
              <motion.div
                key="road-animation"
                className="flex items-center"
                style={{ width: "200%" }}
                initial={{ x: "0%" }}
                animate={{
                  x: "-50%",
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop",
                }}
              >
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-0.5 mx-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#c9c5bd" }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
