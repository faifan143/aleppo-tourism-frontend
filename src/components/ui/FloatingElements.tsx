"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const FloatingElements = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const elements = [
    { icon: "✈️", size: "text-4xl", delay: 0 },
    { icon: "🏖️", size: "text-5xl", delay: 2 },
    { icon: "🗺️", size: "text-3xl", delay: 4 },
    { icon: "🎨", size: "text-4xl", delay: 1 },
    { icon: "📸", size: "text-3xl", delay: 3 },
    { icon: "🌴", size: "text-5xl", delay: 2.5 },
    { icon: "⛰️", size: "text-4xl", delay: 1.5 },
    { icon: "🏛️", size: "text-3xl", delay: 3.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute ${element.size} opacity-10`}
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            rotate: 0,
          }}
          animate={{
            x: [
              Math.random() * dimensions.width,
              Math.random() * dimensions.width,
              Math.random() * dimensions.width,
            ],
            y: [
              Math.random() * dimensions.height,
              Math.random() * dimensions.height,
              Math.random() * dimensions.height,
            ],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            delay: element.delay,
            ease: "linear",
          }}
        >
          {element.icon}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements;
