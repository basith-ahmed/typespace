"use client";

import React from "react";

interface PerformanceDisplayProps {
  wpm: number;
  accuracy: number;
  darkMode: boolean;
}

const PerformanceDisplay: React.FC<PerformanceDisplayProps> = ({
  wpm,
  accuracy,
  darkMode,
}) => {
  return (
    <div className="text-center w-full max-w-2xl h-16 justify-center items-center flex">
      <div className="flex flex-row gap-48 w-full items-center justify-center text-gray-500 dark:text-gray-400">
        <div>
          <div className="text-3xl font-bold">{wpm}</div>
          <div className="text-sm ">WPM</div>
        </div>
        <div>
          <div className="text-3xl font-bold">{accuracy}%</div>
          <div className="text-sm ">Accuracy</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDisplay;
