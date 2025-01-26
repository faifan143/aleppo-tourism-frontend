"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnimatePresence, motion } from "framer-motion";

const generateRandomPositions = (
  count: number,
  width: number,
  height: number
) => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
  }));
};

const particlePositions = generateRandomPositions(
  20,
  window.innerWidth,
  window.innerHeight
);

const ParticleEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {particlePositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-orange-500/20"
          style={{ willChange: "transform, opacity" }}
          initial={{
            x: pos.x,
            y: pos.y,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            opacity: [0, 0.2, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: Math.random() * 15 + 10, // Longer duration for smoother effect
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const shapes = {
  كورسات: ["M0 0L30 0L15 30Z", "M0 0H30V30H0Z", "M15 0L30 30H0Z"],
  تخرج: [
    "M0 15C0 6.716 6.716 0 15 0C23.284 0 30 6.716 30 15C30 23.284 23.284 30 15 30C6.716 30 0 23.284 0 15Z",
    "M0 0L30 0L15 30Z",
    "M0 0H30V30H0Z",
  ],
  نظامي: [
    "M15 0L30 30H0Z",
    "M0 15C0 6.716 6.716 0 15 0C23.284 0 30 6.716 30 15C30 23.284 23.284 30 15 30C6.716 30 0 23.284 0 15Z",
    "M0 0L30 0L15 30Z",
  ],
  عقود: ["M0 0L30 0L15 30Z", "M0 0H30V30H0Z", "M15 0L30 30H0Z"],
};

const FloatingShapes = ({
  type,
}: {
  type: "كورسات" | "تخرج" | "نظامي" | "عقود";
}) => {
  const shapePositions = generateRandomPositions(
    shapes[type].length,
    window.innerWidth,
    window.innerHeight
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {shapes[type]?.map((path, i) => (
        <motion.svg
          key={i}
          width="30"
          height="30"
          viewBox="0 0 30 30"
          className="absolute"
          style={{ willChange: "transform, opacity" }}
          initial={{
            x: shapePositions[i]?.x || 0,
            y: shapePositions[i]?.y || 0,
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            opacity: [0, 0.2, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 20 + 15, // Slower and smoother animations
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <path d={path} fill="currentColor" className="text-orange-500/10" />
        </motion.svg>
      ))}
    </div>
  );
};

const SplineBackground = () => {
  const styles = {
    gradient: "from-gray-900/90 via-gray-900/90 to-gray-900/90",
    highlightColor: "rgba(249, 115, 22, 0.05)",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-0"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} backdrop-blur-md`}
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,var(--highlight-color),transparent_50%)]"
        style={{ "--highlight-color": styles.highlightColor } as any}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={"كورسات"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ParticleEffect />
          <FloatingShapes type={"كورسات"} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 border-b border-gray-800" />
      <div className="absolute inset-0 bg-noise opacity-[0.015]" />
    </motion.div>
  );
};

export default SplineBackground;
