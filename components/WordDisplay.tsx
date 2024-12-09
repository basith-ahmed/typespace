"use client";

import React from "react";
import { motion } from "framer-motion";
import { words } from "@/constants/words";

interface WordDisplayProps {
  currentWords: string[];
  wordIndex: number;
  characterAccuracy: boolean[];
  userInput: string;
  wordStatuses: boolean[];
  containerWidth: number;
  darkMode: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
}

const WordDisplay: React.FC<WordDisplayProps> = ({
  currentWords,
  wordIndex,
  characterAccuracy,
  userInput,
  wordStatuses,
  containerWidth,
  darkMode,
  containerRef,
  inputRef
}) => {
  const calculateTranslateX = () => {
    const wordWidth = 130;
    const centerPosition = containerWidth / 2;
    const targetPosition = wordIndex * wordWidth + wordWidth / 2;
    return centerPosition - targetPosition;
  };

  return (
    <div
      ref={containerRef}
      className="relative h-24 overflow-hidden rounded-lg w-full max-w-2xl z-10 my-6"
      style={{
        background: darkMode
          ? "linear-gradient(to bottom, rgba(50, 52, 55, 0) 0%, rgba(50, 52, 55, 1) 25%, rgba(50, 52, 55, 1) 75%, rgba(50, 52, 55, 0) 100%)"
          : "linear-gradient(to bottom, rgba(243, 244, 246, 0) 0%, rgba(243, 244, 246, 1) 25%, rgba(243, 244, 246, 1) 75%, rgba(243, 244, 246, 0) 100%)",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="absolute left-0 h-full w-[100px] bg-gradient-to-r from-gray-100 to-transparent dark:from-[#323437] z-10"></div>
      <div className="absolute right-0 h-full w-[100px] bg-gradient-to-r from-transparent to-gray-100 dark:to-[#323437] z-10"></div>

      <motion.div
        className="absolute whitespace-nowrap flex items-center h-full text-2xl font-semibold font-mono"
        animate={{ x: calculateTranslateX() }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {currentWords.map((word, index) => (
          <span
            key={index}
            className={`inline-block w-[130px] text-center ${
              index < wordIndex
                ? wordStatuses[index]
                  ? "text-green-500"
                  : "text-red-500"
                : index === wordIndex
                ? "text-primary font-bold text-4xl relative"
                : "text-muted-foreground font-semibold text-2xl dark:text-gray-400"
            }`}
          >
            <div className="inline-block">
              {index === wordIndex
                ? word.split("").map((char, charIndex) => {
                    const isCorrect =
                      charIndex < characterAccuracy.length
                        ? characterAccuracy[charIndex]
                        : null;
                    const className =
                      isCorrect === true
                        ? "text-green-500"
                        : isCorrect === false
                        ? "text-red-500"
                        : "text-muted-foreground dark:text-gray-400";

                    return (
                      <span
                        key={charIndex}
                        className={`inline-block ${className} ${
                          charIndex === userInput.length
                            ? "bg-gray-200 dark:bg-[#4e5157] rounded"
                            : ""
                        }`}
                      >
                        {char}
                      </span>
                    );
                  })
                : word}
              {index === wordIndex && userInput.length > word.length && (
                <span className="text-red-500">
                  {userInput.slice(word.length)}
                </span>
              )}
            </div>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default WordDisplay;
