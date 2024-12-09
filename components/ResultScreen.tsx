"use client";

import React from "react";
import { motion } from "framer-motion";

interface ResultScreenProps {
  wpm: number;
  accuracy: number;
  darkMode: boolean;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  wpm,
  accuracy,
  darkMode,
}) => {
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="text-center mb-16 w-full max-w-2xl"
    >
      <h2 className="text-3xl font-bold mb-16 text-gray-600 dark:text-gray-400">
        Results
      </h2>
      <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-gray-400">
        <div>
          <p className="text-4xl font-bold">{wpm}</p>
          <p className="text-lg ">Words per Minute</p>
        </div>
        <div>
          <p className="text-4xl font-bold">{accuracy}%</p>
          <p className="text-lg ">Accuracy</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultScreen;
