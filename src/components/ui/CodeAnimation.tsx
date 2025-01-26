"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const CodeAnimation = () => {
  const [currentText, setCurrentText] = useState("");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const codeLines = [
    { text: "function", x: 0, y: 0, color: "#f97316" },
    { text: "  develop()", x: 70, y: 0, color: "#60a5fa" },
    { text: "{", x: 140, y: 0, color: "#e5e7eb" },
    {
      text: "const solution = new Solution();",
      x: 20,
      y: 25,
      color: "#9ca3af",
    },
    { text: "solution.innovate();", x: 20, y: 50, color: "#9ca3af" },
    { text: "return success;", x: 20, y: 75, color: "#9ca3af" },
    { text: "}", x: 0, y: 100, color: "#e5e7eb" },
  ];

  const floatingCodeBlocks = [
    {
      x: 250,
      y: 50,
      width: 200,
      height: 120,
      lines: [
        { width: 140, y: 45 },
        { width: 120, y: 65 },
        { width: 160, y: 85 },
      ],
    },
    {
      x: 450,
      y: 150,
      width: 180,
      height: 100,
      lines: [
        { width: 120, y: 45 },
        { width: 140, y: 65 },
      ],
    },
  ];

  useEffect(() => {
    if (lineIndex < codeLines.length) {
      const line = codeLines[lineIndex];
      if (charIndex < line.text.length) {
        const timer = setTimeout(() => {
          setCurrentText((prev) => prev + line.text[charIndex]);
          setCursorPosition({
            x: line.x + charIndex * 8.5, // Adjust for monospace font width
            y: line.y,
          });
          setCharIndex((prev) => prev + 1);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setTimeout(() => {
          setLineIndex((prev) => prev + 1);
          setCharIndex(0);
          setCurrentText("");
        }, 500); // Pause between lines
      }
    }
  }, [lineIndex, charIndex]);

  return (
    <motion.svg
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <defs>
        <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "#f97316", stopOpacity: 0.1 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#f97316", stopOpacity: 0 }}
          />
        </linearGradient>
      </defs>

      {floatingCodeBlocks.map((block, index) => (
        <motion.g
          key={index}
          transform={`translate(${block.x}, ${block.y})`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.3, duration: 0.5 }}
        >
          <rect
            x="0"
            y="0"
            width={block.width}
            height={block.height}
            rx="10"
            fill="#1f2937"
            opacity="0.9"
          />
          <rect
            x="10"
            y="10"
            width={block.width - 20}
            height="20"
            rx="5"
            fill="#374151"
          />
          <circle cx="25" cy="20" r="5" fill="#ef4444" />
          <circle cx="45" cy="20" r="5" fill="#f59e0b" />
          <circle cx="65" cy="20" r="5" fill="#10b981" />

          {block.lines.map((line, lineIndex) => (
            <motion.rect
              key={lineIndex}
              x="20"
              y={line.y}
              width={line.width}
              height="8"
              rx="4"
              fill="#4b5563"
              opacity="0.7"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: index * 0.3 + lineIndex * 0.2,
                duration: 0.3,
              }}
            />
          ))}
        </motion.g>
      ))}

      <motion.g
        transform="translate(200, 150)"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <rect
          x="0"
          y="0"
          width="400"
          height="300"
          rx="15"
          fill="#1f2937"
          opacity="0.95"
        />
        <rect x="0" y="0" width="400" height="40" rx="15" fill="#374151" />
        <circle cx="30" cy="20" r="6" fill="#ef4444" />
        <circle cx="55" cy="20" r="6" fill="#f59e0b" />
        <circle cx="80" cy="20" r="6" fill="#10b981" />
        <rect x="20" y="60" width="360" height="220" rx="8" fill="#111827" />

        <g transform="translate(40, 80)">
          {codeLines.map((line, idx) => {
            const completedLine = idx < lineIndex;
            return completedLine ? (
              <text
                key={idx}
                x={line.x}
                y={line.y}
                fill={line.color}
                fontFamily="monospace"
                fontSize="14"
              >
                {line.text}
              </text>
            ) : idx === lineIndex ? (
              <g key={idx}>
                <text
                  x={line.x}
                  y={line.y}
                  fill={line.color}
                  fontFamily="monospace"
                  fontSize="14"
                >
                  {currentText}
                </text>
                <motion.text
                  x={cursorPosition.x}
                  y={cursorPosition.y}
                  fill="#f97316"
                  fontFamily="monospace"
                  fontSize="14"
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  |
                </motion.text>
              </g>
            ) : null;
          })}
        </g>
      </motion.g>

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <circle cx="100" cy="500" r="40" fill="url(#glow)" opacity="0.6" />
        <circle cx="700" cy="100" r="50" fill="url(#glow)" opacity="0.4" />

        <motion.path
          d="M50,300 Q200,450 400,300 T750,300"
          stroke="#f97316"
          strokeWidth="2"
          fill="none"
          opacity="0.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1.8 }}
        />

        <motion.path
          d="M50,320 Q200,470 400,320 T750,320"
          stroke="#f97316"
          strokeWidth="1"
          fill="none"
          opacity="0.1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 2 }}
        />
      </motion.g>
    </motion.svg>
  );
};

export default CodeAnimation;
