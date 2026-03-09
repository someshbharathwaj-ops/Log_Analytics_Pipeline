"use client";

import { motion } from "framer-motion";

type AnimatedContainerProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function AnimatedContainer({ children, className, delay = 0 }: AnimatedContainerProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}