"use client";

import { motion } from "framer-motion";

import { formatCompactNumber } from "@/lib/format";

type StatsCardProps = {
  label: string;
  value: number;
  tone?: "default" | "danger";
};

export function StatsCard({ label, value, tone = "default" }: StatsCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
      className="glass rounded-2xl p-5 shadow-glow"
    >
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tone === "danger" ? "text-danger" : "text-text"}`}>
        {formatCompactNumber(value)}
      </p>
    </motion.article>
  );
}