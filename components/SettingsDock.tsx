"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dock, DockIcon } from "@/components/ui/dock";
import {
  WholeWord,
  Sun,
  Moon,
  LetterText,
  Locate,
  Hourglass,
} from "lucide-react";
import { GoNumber } from "react-icons/go";
import { SlSpeedometer } from "react-icons/sl";

interface SettingsDockProps {
  includePunctuation: boolean;
  setIncludePunctuation: (value: boolean) => void;
  includeNumbers: boolean;
  setIncludeNumbers: (value: boolean) => void;
  testMode: "time" | "words";
  setTestMode: (mode: "time" | "words") => void;
  testDuration: number;
  setTestDuration: (duration: number) => void;
  testWordCount: number;
  setTestWordCount: (count: number) => void;
  showPerformance: boolean;
  setShowPerformance: (value: boolean) => void;
  showCharacterAccuracyIndicator: boolean;
  setShowCharacterAccuracyIndicator: (value: boolean) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
    inputRef: React.RefObject<HTMLInputElement>;
    resetGame: () => void;
}

const SettingsDock: React.FC<SettingsDockProps> = ({
  includePunctuation,
  setIncludePunctuation,
  includeNumbers,
  setIncludeNumbers,
  testMode,
  setTestMode,
  testDuration,
  setTestDuration,
  testWordCount,
  setTestWordCount,
  showPerformance,
  setShowPerformance,
  showCharacterAccuracyIndicator,
  setShowCharacterAccuracyIndicator,
  darkMode,
  setDarkMode,
  inputRef,
  resetGame
}) => {
  const handleDurationChange = (duration: number) => {
    setTestDuration(duration);
  };

  const handleWordCountChange = (count: number) => {
    setTestWordCount(count);
  };

  return (
    <Dock
      direction="middle"
      className="rounded-full bg-gray-200 dark:bg-[#2C2E31] border border-gray-300/50 dark:border-[#323437] font-mono dark:text-[#646669] dark:hover:text-[#d1d0d5]"
    >
      <DockIcon>
        <Button
          className={`w-10 h-10 flex items-center justify-center border border-gray-200/50 dark:border-[#323437] rounded-full font-semibold ${
            includePunctuation
              ? "bg-gray-400/80 hover:bg-gray-500/50 dark:bg-[#4e5157] dark:hover:bg-[#70747d]"
              : "bg-gray-300 hover:bg-gray-400/50 dark:bg-[#323437] dark:hover:bg-[#4e5157]"
          } transition-colors`}
          size="sm"
          variant="ghost"
          onClick={() => {
            setIncludePunctuation(!includePunctuation);
            inputRef.current?.focus();
          }}
          title={
            includePunctuation ? "Exclude punctuation" : "Include punctuation"
          }
        >
          <LetterText />
        </Button>
      </DockIcon>

      <DockIcon>
        <Button
          className={`w-10 h-10 flex items-center justify-center border border-gray-200/50 dark:border-[#323437] rounded-full font-semibold ${
            includeNumbers
              ? "bg-gray-400/80 hover:bg-gray-500/50 dark:bg-[#4e5157] dark:hover:bg-[#70747d]"
              : "bg-gray-300 hover:bg-gray-400/50 dark:bg-[#323437] dark:hover:bg-[#4e5157]"
          } transition-colors`}
          size="sm"
          variant="ghost"
          onClick={() => {
            setIncludeNumbers(!includeNumbers);
            inputRef.current?.focus();
          }}
          title={includeNumbers ? "Exclude numbers" : "Include numbers"}
        >
          <GoNumber className="ml-[1px]" style={{
            strokeWidth: "0.3px",
          }}/>
        </Button>
      </DockIcon>

      <div
        role="none"
        className="shrink-0 bg-gray-300/50 dark:bg-[#323437] h-[90%] w-[2px] rounded-full"
      ></div>

      <DockIcon>
        <Button
          variant="ghost"
          className={`w-10 h-10 flex items-center justify-center border border-gray-200/50 dark:border-[#323437] rounded-full ${
            testMode === "time"
              ? "bg-gray-400/80 hover:bg-gray-500/50 dark:bg-[#4e5157] dark:hover:bg-[#70747d]"
              : "bg-gray-300 hover:bg-gray-400/50 dark:bg-[#323437] dark:hover:bg-[#4e5157]"
          } transition-colors`}
          onClick={() => {
            setTestMode("time");
            resetGame();
            inputRef.current?.focus();
          }}
          title="Time mode"
        >
          <Hourglass />
        </Button>
      </DockIcon>

      <DockIcon>
        <Button
          variant="ghost"
          className={`w-10 h-10 flex items-center justify-center border border-gray-200/50 dark:border-[#323437] rounded-full ${
            testMode === "words"
              ? "bg-gray-400/80 hover:bg-gray-500/50 dark:bg-[#4e5157] dark:hover:bg-[#70747d]"
              : "bg-gray-300 hover:bg-gray-400/50 dark:bg-[#323437] dark:hover:bg-[#4e5157]"
          } transition-colors`}
          onClick={() => {
            setTestMode("words");
            resetGame();
            inputRef.current?.focus();
          }}
          title="Words mode"
        >
          <WholeWord />
        </Button>
      </DockIcon>

      <div
        role="none"
        className="shrink-0 bg-gray-300/50 dark:bg-[#323437] h-[90%] w-[2px] rounded-full"
      ></div>

      <DockIcon className="mx-[4.5rem]">
        {testMode === "time" ? (
          <>
            {[15, 30, 60, 120].map((duration) => (
              <div key={duration}>
                <button
                  className={`w-10 h-10 mx-1 flex items-center justify-center rounded-full border border-gray-200/50 dark:border-[#323437] ${
                    testDuration === duration
                      ? "bg-gray-400/80 hover:bg-gray-500/50 dark:bg-[#4e5157] dark:hover:bg-[#70747d]"
                      : "bg-gray-300 hover:bg-gray-400/50 dark:bg-[#323437] dark:hover:bg-[#4e5157]"
                  } transition-colors`}
                  onClick={() => {
                    handleDurationChange(duration);
                    inputRef.current?.focus();
                  }}
                  title={`Set test duration to ${duration} seconds`}
                >
                  {duration}
                </button>
              </div>
            ))}
          </>
        ) : (
          <>
            {[10, 25, 50, 100].map((count) => (
              <div key={count}>
                <button
                  className={`w-10 h-10 mx-1 flex items-center justify-center rounded-full border border-gray-200/50 dark:border-[#323437] ${
                    testWordCount === count
                      ? "bg-gray-400/80 hover:bg-gray-500/50 dark:bg-[#4e5157] dark:hover:bg-[#70747d]"
                      : "bg-gray-300 hover:bg-gray-400/50 dark:bg-[#323437] dark:hover:bg-[#4e5157]"
                  } transition-colors`}
                  onClick={() => {
                    handleWordCountChange(count);
                    inputRef.current?.focus();
                  }}
                  title={`Set test word count to ${count}`}
                >
                  {count}
                </button>
              </div>
            ))}
          </>
        )}
      </DockIcon>

      <div
        role="none"
        className="shrink-0 bg-gray-300/50 dark:bg-[#323437] h-[90%] w-[2px] rounded-full"
      ></div>

      <DockIcon>
        <Button
          className={`w-10 h-10 flex items-center justify-center border border-gray-200/50 dark:border-[#323437] rounded-full ${
            showPerformance
              ? "bg-gray-400/80 hover:bg-gray-500/50 dark:bg-[#4e5157] dark:hover:bg-[#70747d]"
              : "bg-gray-300 hover:bg-gray-400/50 dark:bg-[#323437] dark:hover:bg-[#4e5157]"
          } transition-colors`}
          size="sm"
          variant="ghost"
          onClick={() => {
            setShowPerformance(!showPerformance);
            inputRef.current?.focus();
          }}
          title="Toggle performance display"
        >
          <SlSpeedometer className="-mt-[1px]" style={{
            strokeWidth: "10px",
          }}/>
        </Button>
      </DockIcon>

      <DockIcon>
        <Button
          className={`w-10 h-10 flex items-center justify-center border border-gray-200/50 dark:border-[#323437] rounded-full ${
            showCharacterAccuracyIndicator
              ? "bg-gray-400/80 hover:bg-gray-500/50 dark:bg-[#4e5157] dark:hover:bg-[#70747d]"
              : "bg-gray-300 hover:bg-gray-400/50 dark:bg-[#323437] dark:hover:bg-[#4e5157]"
          } transition-colors`}
          size="sm"
          variant="ghost"
          onClick={() => {
            setShowCharacterAccuracyIndicator(!showCharacterAccuracyIndicator);
            inputRef.current?.focus();
          }}
          title="Toggle character accuracy indicator"
        >
          <Locate />
        </Button>
      </DockIcon>

      <div
        role="none"
        className="shrink-0 bg-gray-300/50 dark:bg-[#323437] h-[90%] w-[2px] rounded-full"
      ></div>

      <DockIcon>
        <Button
          className={`w-10 h-10 flex items-center justify-center border border-gray-200/50 dark:border-[#323437] rounded-full ${
            darkMode
              ? "bg-gray-400/80 hover:bg-gray-500/50 dark:bg-[#4e5157] dark:hover:bg-[#70747d]"
              : "bg-gray-300 hover:bg-gray-400/50 dark:bg-[#323437] dark:hover:bg-[#323437]"
          } transition-colors`}
          size="sm"
          variant="ghost"
          onClick={() => {
            setDarkMode(!darkMode);
            inputRef.current?.focus();
          }}
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? <Sun /> : <Moon />}
        </Button>
      </DockIcon>
    </Dock>
  );
};

export default SettingsDock;
