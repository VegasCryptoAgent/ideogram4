"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PrivacyScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

function getScoreCategory(score: number) {
  if (score <= 40) return { label: "Exposed", color: "#ef4444", bg: "from-red-600/20 to-red-500/5" };
  if (score <= 70) return { label: "At Risk", color: "#f59e0b", bg: "from-amber-600/20 to-amber-500/5" };
  if (score <= 90) return { label: "Protected", color: "#eab308", bg: "from-yellow-600/20 to-yellow-500/5" };
  return { label: "Shielded", color: "#22c55e", bg: "from-green-600/20 to-green-500/5" };
}

export default function PrivacyScore({ score, size = "md" }: PrivacyScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const category = getScoreCategory(score);

  const sizes = {
    sm: { width: 120, stroke: 8, fontSize: "text-2xl", labelSize: "text-xs" },
    md: { width: 160, stroke: 10, fontSize: "text-4xl", labelSize: "text-sm" },
    lg: { width: 220, stroke: 12, fontSize: "text-5xl", labelSize: "text-base" },
  };

  const { width, stroke, fontSize, labelSize } = sizes[size];
  const radius = (width - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = width / 2;

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => requestAnimationFrame(animate), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const dashOffset = circumference * (1 - animatedScore / 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      <div className="relative" style={{ width, height: width }}>
        {/* Glow background */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-30"
          style={{ background: `radial-gradient(circle, ${category.color}40, transparent)` }}
        />

        <svg
          width={width}
          height={width}
          viewBox={`0 0 ${width} ${width}`}
          className="relative z-10"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E5E0D5"
            strokeWidth={stroke}
          />

          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={category.color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            style={{
              transition: "stroke-dashoffset 0.1s linear",
            }}
          />

          {/* Center content */}
          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1A1A14"
            style={{ fontSize: size === "lg" ? 52 : size === "md" ? 36 : 24, fontWeight: 900 }}
          >
            {animatedScore}
          </text>
          <text
            x={center}
            y={center + (size === "lg" ? 30 : size === "md" ? 22 : 16)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={category.color}
            style={{
              fontSize: size === "lg" ? 14 : size === "md" ? 12 : 10,
              fontWeight: 600,
            }}
          >
            {category.label}
          </text>
        </svg>

        {/* Pulsing ring when high score */}
        {score >= 91 && (
          <div
            className="absolute inset-0 rounded-full border-2 animate-ping"
            style={{ borderColor: `${category.color}30` }}
          />
        )}
      </div>

      <div className="mt-3 text-center">
        <div className={`${labelSize} text-[#1A1A14]/40`}>Privacy Score</div>
      </div>
    </motion.div>
  );
}
