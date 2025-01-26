// components/common/ScrollProgressBar.tsx
"use client";
import { motion, useScroll, useSpring } from "framer-motion";

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-[64px] left-0 right-0 h-[1px] bg-orange-600 origin-left z-50"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgressBar;
