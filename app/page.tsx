"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import Particles from "@/components/ui/particles";
import { AnimatePresence, motion } from "framer-motion";
import { words } from "@/constants/words";
import { sampleSentences } from "@/constants/sampleSentences";

import SettingsDock from "@/components/SettingsDock";
import WordDisplay from "@/components/WordDisplay";
import PerformanceDisplay from "@/components/PerformanceDisplay";
import ResultScreen from "@/components/ResultScreen";
import CapsLockWarning from "@/components/CapsLockWarning";
import GitHubLink from "@/components/GitHubLink";

export default function ImprovedTypingSpeedTester() {
  const [gameState, setGameState] = useState<"typing" | "result">("typing");
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [testDuration, setTestDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(testDuration);
  const [testWordCount, setTestWordCount] = useState(10);
  const [performanceData, setPerformanceData] = useState<
    { time: number; wpm: number; accuracy: number }[]
  >([]);
  const [characterAccuracy, setCharacterAccuracy] = useState<boolean[]>([]);
  const [wordStatuses, setWordStatuses] = useState<boolean[]>([]);

  const [includePunctuation, setIncludePunctuation] = useState(false);
  const [includeNumbers, setIncludeNumbers] = useState(false);

  const [testMode, setTestMode] = useState<"time" | "words">("time");

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const [showPerformance, setShowPerformance] = useState(true);
  const [showCharacterAccuracyIndicator, setShowCharacterAccuracyIndicator] =
    useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const wpmRef = useRef(wpm);
  const accuracyRef = useRef(accuracy);

  const tabPressedRef = useRef(false);
  const tabTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    generateWords(50);

    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
      window.addEventListener("resize", handleResize);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleResize = () => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      tabPressedRef.current = true;

      if (tabTimerRef.current) {
        clearTimeout(tabTimerRef.current);
      }
      tabTimerRef.current = setTimeout(() => {
        tabPressedRef.current = false;
      }, 500);
    } else if (e.key === "Enter" && tabPressedRef.current) {
      e.preventDefault();
      resetGame();
      tabPressedRef.current = false;
      if (tabTimerRef.current) {
        clearTimeout(tabTimerRef.current);
      }
    }
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

  useEffect(() => {
    wpmRef.current = wpm;
    accuracyRef.current = accuracy;
  }, [wpm, accuracy]);

  useEffect(() => {
    if (gameState === "typing" && startTime !== 0 && testMode === "time") {
      const timer = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          const newTimeLeft = prevTimeLeft - 1;

          if (newTimeLeft <= 0) {
            clearInterval(timer);
            endGame();
            return 0;
          }

          const timeElapsed = testDuration - newTimeLeft;
          if (timeElapsed > 0 && timeElapsed % 5 === 0) {
            setPerformanceData((prev) => [
              ...prev,
              {
                time: timeElapsed,
                wpm: wpmRef.current,
                accuracy: accuracyRef.current,
              },
            ]);
          }

          return newTimeLeft;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, startTime, testDuration, testMode]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (gameState === "typing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  const generateWords = useCallback(
    (count = 10) => {
      let newWords: string[] = [];

      if (includePunctuation) {
        while (newWords.length < count) {
          const sentence =
            sampleSentences[Math.floor(Math.random() * sampleSentences.length)];
          let wordsInSentence = sentence.split(" ");

          if (!includeNumbers) {
            wordsInSentence = wordsInSentence.filter(
              (word) => !/\d/.test(word)
            );
          }

          newWords.push(...wordsInSentence);
        }
      } else {
        const wordPool = [...words];

        if (includeNumbers) {
          wordPool.push(...Array.from({ length: 10 }, (_, i) => i.toString()));
        }

        newWords = Array(count)
          .fill(null)
          .map(() => wordPool[Math.floor(Math.random() * wordPool.length)]);
      }

      setCurrentWords((prevWords) => [
        ...prevWords,
        ...newWords.slice(0, count),
      ]);
    },
    [includePunctuation, includeNumbers]
  );

  useEffect(() => {
    if (gameState === "typing") {
      setCurrentWords([]);
      setWordIndex(0);
      setUserInput("");
      setCharacterAccuracy([]);
      setWordStatuses([]);
      generateWords(50);
    }
  }, [
    includePunctuation,
    includeNumbers,
    gameState,
    generateWords,
    testMode,
    testWordCount,
  ]);

  const startGame = () => {
    setStartTime(Date.now());
    if (testMode === "time") {
      setTimeLeft(testDuration);
    }
    if (inputRef.current) inputRef.current.focus();
  };

  const endGame = () => {
    setGameState("result");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (startTime === 0) startGame();

    const inputValue = e.target.value;
    setUserInput(inputValue);

    const currentWord = currentWords[wordIndex];
    const newCharacterAccuracy = inputValue
      .split("")
      .map((char, index) => char === currentWord[index]);

    setCharacterAccuracy(newCharacterAccuracy);

    if (inputValue.endsWith(" ")) {
      const typedWord = inputValue.trim();
      const isCorrect = typedWord === currentWord;

      setWordStatuses((prevStatuses) => [...prevStatuses, isCorrect]);
      const newCorrectWords = isCorrect ? correctWords + 1 : correctWords;
      const newWordIndex = wordIndex + 1;

      setCorrectWords(newCorrectWords);
      setWordIndex(newWordIndex);
      setUserInput("");
      setCharacterAccuracy([]);

      if (newWordIndex >= currentWords.length - 20) {
        generateWords(10);
      }

      const timeElapsed = (Date.now() - startTime) / 60000;
      const newWpm = Math.round(newCorrectWords / timeElapsed || 0);
      const newAccuracy =
        newWordIndex > 0
          ? Math.round((newCorrectWords / newWordIndex) * 100)
          : 100;
      setWpm(newWpm);
      setAccuracy(newAccuracy);

      if (testMode === "words" && newWordIndex >= testWordCount) {
        endGame();
      }
    }
  };

  const resetGame = () => {
    setGameState("typing");
    setCurrentWords([]);
    setWordIndex(0);
    setCorrectWords(0);
    setStartTime(0);
    setWpm(0);
    setAccuracy(0);
    if (testMode === "time") {
      setTimeLeft(testDuration);
    }
    setPerformanceData([]);
    setCharacterAccuracy([]);
    setUserInput("");
    setWordStatuses([]);
    generateWords(50);
  };

  const handleDurationChange = (value: number) => {
    const duration = value;
    setTestDuration(duration);
    setTimeLeft(duration);
    resetGame();
  };

  const handleWordCountChange = (value: number) => {
    const wordCount = value;
    setTestWordCount(wordCount);
    resetGame();
  };

  const variants = {
    small: {
      backgroundColor: darkMode ? "#9ca3af" : "#737373",
      width: "100%",
      height: "16px",
      overflow: "hidden",
      transition: {
        type: "spring",
        stiffness: 700,
        damping: 30,
        backgroundColor: { duration: 0.3 },
        height: { duration: 0.5, ease: "easeInOut" },
        width: { duration: 0.5, ease: "easeInOut" },
      },
    },
    dock: {
      backgroundColor: darkMode ? "#2C2E31" : "rgba(229, 231, 235, 1)",
      width: "578px",
      height: "58px",
      overflow: "visible",
      transition: {
        type: "spring",
        stiffness: 700,
        damping: 30,
        backgroundColor: { duration: 0.3 },
        height: { duration: 0.5, ease: "easeInOut" },
        width: { duration: 0.5, ease: "easeInOut" },
      },
    },
  };

  return (
    <div
      className={`${
        darkMode ? "dark bg-[#323437]" : "bg-gray-100"
      } h-screen flex flex-col relative`}
    >
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={200}
        color={darkMode ? "#ffffff" : "#000000"}
        refresh
      />
      <div className="mx-auto p-4 flex flex-col items-center justify-center w-full h-full z-10">
        <AnimatePresence mode="wait">
          {gameState === "typing" && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex flex-col w-full justify-center items-center"
              onAnimationComplete={() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            >
              <div className="w-full max-w-2xl flex flex-col items-center justify-center min-h-[58px]">
                {capsLockOn && <CapsLockWarning darkMode={darkMode} />}
                <motion.div
                  layout
                  className="rounded-full flex justify-center"
                  variants={variants}
                  initial={startTime !== 0 ? "small" : "dock"}
                  animate={startTime !== 0 ? "small" : "dock"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {startTime !== 0 ? (
                      <motion.div
                        key="small-div"
                        initial={{
                          opacity: 0,
                          height: "58px",
                          width: "578px",
                        }}
                        animate={{ opacity: 1, height: "16px", width: "100%" }}
                        exit={{ opacity: 0, height: "58px", width: "578px" }}
                        transition={{
                          opacity: { duration: 0.2 },
                        }}
                        className="w-full"
                      >
                        {startTime !== 0 && (
                          <>
                            {testMode === "time" ? (
                              <Progress
                                value={(timeLeft / testDuration) * 100}
                                className="w-full"
                              />
                            ) : (
                              <Progress
                                value={100 - (wordIndex / testWordCount) * 100}
                                className="w-full"
                              />
                            )}
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="dock"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, height: "58px" }}
                        exit={{ opacity: 0 }}
                        transition={{
                          opacity: { duration: 0.2 },
                        }}
                      >
                        <SettingsDock
                          includePunctuation={includePunctuation}
                          setIncludePunctuation={setIncludePunctuation}
                          includeNumbers={includeNumbers}
                          setIncludeNumbers={setIncludeNumbers}
                          testMode={testMode}
                          setTestMode={setTestMode}
                          testDuration={testDuration}
                          setTestDuration={handleDurationChange}
                          testWordCount={testWordCount}
                          setTestWordCount={handleWordCountChange}
                          showPerformance={showPerformance}
                          setShowPerformance={setShowPerformance}
                          showCharacterAccuracyIndicator={
                            showCharacterAccuracyIndicator
                          }
                          setShowCharacterAccuracyIndicator={
                            setShowCharacterAccuracyIndicator
                          }
                          darkMode={darkMode}
                          setDarkMode={setDarkMode}
                          inputRef={inputRef}
                          resetGame={resetGame}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <WordDisplay
                currentWords={currentWords}
                wordIndex={wordIndex}
                characterAccuracy={characterAccuracy}
                userInput={userInput}
                wordStatuses={wordStatuses}
                containerWidth={containerWidth}
                darkMode={darkMode}
                containerRef={containerRef}
                inputRef={inputRef}
              />

              <div className="w-full max-w-2xl flex flex-col justify-center items-center mb-12">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (
                      e.key === "ArrowLeft" ||
                      e.key === "ArrowRight" ||
                      e.key === "ArrowUp" ||
                      e.key === "ArrowDown"
                    ) {
                      e.preventDefault();
                    }
                  }}
                  style={{ position: "absolute", left: "-9999px" }}
                  aria-label="Type the words shown above"
                />

                {showCharacterAccuracyIndicator && (
                  <div className="mb-4 text-center min-h-8">
                    <>
                      {characterAccuracy.map((isCorrect, index) => (
                        <span
                          key={index}
                          className={`inline-block w-4 h-4 mx-0.5 rounded-full ${
                            isCorrect ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                      ))}
                    </>
                  </div>
                )}

                {showPerformance && (
                  <PerformanceDisplay wpm={wpm} accuracy={accuracy} darkMode={darkMode} />
                )}
              </div>
            </motion.div>
          )}
          {gameState === "result" && (
            <ResultScreen wpm={wpm} accuracy={accuracy} darkMode={darkMode} />
          )}
        </AnimatePresence>

        <footer className="w-full max-w-2xl text-center text-sm text-gray-500 dark:text-gray-400">
          Press{" "}
          <kbd className="font-mono bg-gray-200 dark:bg-[#2c2e31] px-1 rounded">
            Tab
          </kbd>{" "}
          +{" "}
          <kbd className="font-mono bg-gray-200 dark:bg-[#2c2e31] px-1 rounded">
            Enter
          </kbd>{" "}
          to restart the game.
        </footer>
      </div>

      {startTime === 0 && <GitHubLink />}
    </div>
  );
}