"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  Link2,
  MessageSquareWarningIcon,
  Timer,
  WholeWord,
  Sun,
  Moon,
} from "lucide-react"; // Removed Computer icon as it's for system theme
import Particles from "@/components/ui/particles";
// import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

import { motion, AnimatePresence } from "framer-motion";

import { words } from "@/constants/words";
import { sampleSentences } from "@/constants/sampleSentences";
import { Dock, DockIcon } from "@/components/ui/dock";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";

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

  // Toggle state variables
  const [showPerformance, setShowPerformance] = useState(true);
  const [showCharacterAccuracyIndicator, setShowCharacterAccuracyIndicator] =
    useState(false);

  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Refs to store the wpm and accuracy without causing re-renders
  const wpmRef = useRef(wpm);
  const accuracyRef = useRef(accuracy);

  // Refs for shortcut detection
  const tabPressedRef = useRef(false);
  const tabTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle theme changes
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = () => {
      if (theme === "light") {
        root.classList.add("light");
        root.classList.remove("dark");
      } else if (theme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      }
    };

    applyTheme();
  }, [theme]);

  // Function to toggle theme between 'light' and 'dark'
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    generateWords(50); // Initialize with a larger number of words

    // Measure container width for dynamic centering
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
      window.addEventListener("resize", handleResize);
    }

    // Add global keydown listener for shortcuts
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleResize = () => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  };

  // Update refs whenever wpm or accuracy changes
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

          // Update performance data every 5 seconds
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

  // Focus the input element on initial page load
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

  // Handler for global keydown events to detect Tab + Enter
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      tabPressedRef.current = true;

      // Start a timer to reset the tabPressed flag
      if (tabTimerRef.current) {
        clearTimeout(tabTimerRef.current);
      }
      tabTimerRef.current = setTimeout(() => {
        tabPressedRef.current = false;
      }, 500); // 500ms window for Enter to be pressed after Tab
    } else if (e.key === "Enter" && tabPressedRef.current) {
      e.preventDefault();
      resetGame();
      tabPressedRef.current = false;
      if (tabTimerRef.current) {
        clearTimeout(tabTimerRef.current);
      }
    }
  };

  const generateWords = useCallback(
    (count = 10) => {
      let newWords: string[] = [];

      if (includePunctuation) {
        while (newWords.length < count) {
          const sentence =
            sampleSentences[Math.floor(Math.random() * sampleSentences.length)];
          let wordsInSentence = sentence.split(" ");

          if (!includeNumbers) {
            // Remove words that are numbers
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

  // useEffect to reset state when options change
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

    // Update character accuracy with extra characters if any
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
    if (inputRef.current) inputRef.current.focus();
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

  const calculateTranslateX = () => {
    const wordWidth = 120;
    const centerPosition = containerWidth / 2;
    const targetPosition = wordIndex * wordWidth + wordWidth / 2;
    return centerPosition - targetPosition;
  };

  // Animation Variants
  const variants = {
    small: {
      backgroundColor: theme === "light" ? "#e2e8f0" : "#171923", // Shade 4 Light / Shade 2 Dark (Darker)
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
      backgroundColor: theme === "light" ? "#f7fafc" : "#1f2937", // Shade 2 Light / Shade 3 Dark (Darker)
      width: "568px",
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
      className={`h-screen flex flex-col relative transition-colors duration-500 ${
        theme === "light" ? "bg-white" : "bg-black"
      }`}
    >
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={200}
        color={theme === "light" ? "#000000" : "#ffffff"}
        refresh
      />
      <div className="mx-auto p-4 flex flex-col items-center justify-center w-full h-full z-10">
        {gameState === "typing" && (
          <div className="flex flex-col w-full justify-center items-center">
            <div className="w-full max-w-2xl flex flex-col items-center justify-center">
              {/* Theme Toggle Button inside Dock */}
              <motion.div
                layout
                className="rounded-full flex justify-center mb-4"
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
                        width: "568px",
                        backgroundColor:
                          theme === "light" ? "#e2e8f0" : "#171923",
                      }}
                      animate={{
                        opacity: 1,
                        height: "16px",
                        width: "100%",
                        backgroundColor:
                          theme === "light" ? "#e2e8f0" : "#171923",
                      }}
                      exit={{
                        opacity: 0,
                        height: "58px",
                        width: "568px",
                        backgroundColor:
                          theme === "light" ? "#f7fafc" : "#1f2937",
                      }}
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
                              className={`w-full ${
                                theme === "light"
                                  ? "bg-gray-300"
                                  : "bg-gray-700"
                              }`}
                            />
                          ) : (
                            <Progress
                              value={100 - (wordIndex / testWordCount) * 100}
                              className={`w-full ${
                                theme === "light"
                                  ? "bg-gray-300"
                                  : "bg-gray-700"
                              }`}
                            />
                          )}
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="dock"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        backgroundColor:
                          theme === "light" ? "#f7fafc" : "#1f2937",
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        opacity: { duration: 0.2 },
                      }}
                      className="rounded-full"
                    >
                      <Dock
                        direction="middle"
                        className={`rounded-full ${
                          theme === "light" ? "bg-gray-100" : "bg-gray-900" // Updated to darker shade
                        }`}
                      >
                        {/* Punctuation Toggle */}
                        <DockIcon>
                          <Button
                            className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold ${
                              includePunctuation
                                ? theme === "light"
                                  ? "bg-gray-300 hover:bg-gray-400"
                                  : "bg-gray-700 hover:bg-gray-800"
                                : theme === "light"
                                ? "bg-gray-200 hover:bg-gray-300"
                                : "bg-gray-800 hover:bg-gray-700"
                            } transition-colors`}
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setIncludePunctuation(!includePunctuation);
                              inputRef.current?.focus();
                            }}
                            title={
                              includePunctuation
                                ? "Exclude punctuation"
                                : "Include punctuation"
                            }
                          >
                            Aa!
                          </Button>
                        </DockIcon>

                        {/* Numbers Toggle */}
                        <DockIcon>
                          <Button
                            className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold ${
                              includeNumbers
                                ? theme === "light"
                                  ? "bg-gray-300 hover:bg-gray-400"
                                  : "bg-gray-700 hover:bg-gray-800"
                                : theme === "light"
                                ? "bg-gray-200 hover:bg-gray-300"
                                : "bg-gray-800 hover:bg-gray-700"
                            } transition-colors`}
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setIncludeNumbers(!includeNumbers);
                              inputRef.current?.focus();
                            }}
                            title={
                              includeNumbers
                                ? "Exclude numbers"
                                : "Include numbers"
                            }
                          >
                            123
                          </Button>
                        </DockIcon>

                        <div
                          role="none"
                          className={`shrink-0 h-[90%] w-[2px] rounded-full ${
                            theme === "light" ? "bg-gray-300" : "bg-gray-700"
                          }`}
                        ></div>

                        {/* Test Mode Toggle */}
                        <DockIcon>
                          <Button
                            variant="ghost"
                            className={`w-10 h-10 flex items-center justify-center rounded-full ${
                              testMode === "time"
                                ? theme === "light"
                                  ? "bg-gray-300 hover:bg-gray-400"
                                  : "bg-gray-700 hover:bg-gray-800"
                                : theme === "light"
                                ? "bg-gray-200 hover:bg-gray-300"
                                : "bg-gray-800 hover:bg-gray-700"
                            } transition-colors`}
                            onClick={() => {
                              setTestMode("time");
                              resetGame();
                              inputRef.current?.focus();
                            }}
                            title="Time mode"
                          >
                            <Timer />
                          </Button>
                        </DockIcon>

                        <DockIcon>
                          <Button
                            variant="ghost"
                            className={`w-10 h-10 flex items-center justify-center rounded-full ${
                              testMode === "words"
                                ? theme === "light"
                                  ? "bg-gray-300 hover:bg-gray-400"
                                  : "bg-gray-700 hover:bg-gray-800"
                                : theme === "light"
                                ? "bg-gray-200 hover:bg-gray-300"
                                : "bg-gray-800 hover:bg-gray-700"
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
                          className={`shrink-0 h-[90%] w-[2px] rounded-full ${
                            theme === "light" ? "bg-gray-300" : "bg-gray-700"
                          }`}
                        ></div>

                        {/* Duration/Word Count Selection */}
                        <DockIcon className="mx-[4.5rem]">
                          {testMode === "time" ? (
                            <>
                              {[15, 30, 60, 120].map((duration) => (
                                <div key={duration}>
                                  <button
                                    className={`w-10 h-10 mx-1 flex items-center justify-center rounded-full border ${
                                      theme === "light"
                                        ? "border-transparent"
                                        : "border-transparent"
                                    } ${
                                      testDuration === duration
                                        ? theme === "light"
                                          ? "bg-gray-300 hover:bg-gray-400"
                                          : "bg-gray-700 hover:bg-gray-800"
                                        : theme === "light"
                                        ? "bg-gray-200 hover:bg-gray-300"
                                        : "bg-gray-800 hover:bg-gray-700"
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
                                    className={`w-10 h-10 mx-1 flex items-center justify-center rounded-full border ${
                                      theme === "light"
                                        ? "border-transparent"
                                        : "border-transparent"
                                    } ${
                                      testWordCount === count
                                        ? theme === "light"
                                          ? "bg-gray-300 hover:bg-gray-400"
                                          : "bg-gray-700 hover:bg-gray-800"
                                        : theme === "light"
                                        ? "bg-gray-200 hover:bg-gray-300"
                                        : "bg-gray-800 hover:bg-gray-700"
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
                          className={`shrink-0 h-[90%] w-[2px] rounded-full ${
                            theme === "light" ? "bg-gray-300" : "bg-gray-700"
                          }`}
                        ></div>

                        {/* Theme Toggle Button */}
                        <DockIcon>
                          <Button
                            variant="ghost"
                            className={`w-10 h-10 flex items-center justify-center rounded-full ${
                              theme === "light"
                                ? "bg-gray-200 hover:bg-gray-300"
                                : "bg-gray-800 hover:bg-gray-700"
                            } transition-colors`}
                            onClick={() => {
                              toggleTheme();
                              inputRef.current?.focus();
                            }}
                            title={
                              theme === "light"
                                ? "Switch to Dark Mode"
                                : "Switch to Light Mode"
                            }
                          >
                            {theme === "light" ? (
                              <Sun className="w-4 h-4" />
                            ) : (
                              <Moon className="w-4 h-4" />
                            )}
                          </Button>
                        </DockIcon>

                        {/* Performance and Accuracy Toggles */}
                        <DockIcon>
                          <Button
                            className={`w-10 h-10 flex items-center justify-center rounded-full ${
                              showPerformance
                                ? theme === "light"
                                  ? "bg-gray-300 hover:bg-gray-400"
                                  : "bg-gray-700 hover:bg-gray-800"
                                : theme === "light"
                                ? "bg-gray-200 hover:bg-gray-300"
                                : "bg-gray-800 hover:bg-gray-700"
                            } transition-colors`}
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setShowPerformance(!showPerformance);
                              inputRef.current?.focus();
                            }}
                            title="Toggle performance display"
                          >
                            <Calculator />
                          </Button>
                        </DockIcon>

                        <DockIcon>
                          <Button
                            className={`w-10 h-10 flex items-center justify-center rounded-full ${
                              showCharacterAccuracyIndicator
                                ? theme === "light"
                                  ? "bg-gray-300 hover:bg-gray-400"
                                  : "bg-gray-700 hover:bg-gray-800"
                                : theme === "light"
                                ? "bg-gray-200 hover:bg-gray-300"
                                : "bg-gray-800 hover:bg-gray-700"
                            } transition-colors`}
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setShowCharacterAccuracyIndicator(
                                !showCharacterAccuracyIndicator
                              );
                              inputRef.current?.focus();
                            }}
                            title="Toggle character accuracy indicator"
                          >
                            <MessageSquareWarningIcon />
                          </Button>
                        </DockIcon>
                      </Dock>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Continuous Infinite Strip of Words with Centered Current Word */}
            <div
              ref={containerRef}
              className={`relative h-24 overflow-hidden rounded-lg w-full max-w-2xl z-10 my-6 ${
                theme === "light" ? "bg-white" : "bg-black"
              }`}
              style={
                theme === "light"
                  ? {
                      background:
                        "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 25%, rgba(255, 255, 255, 1) 75%, rgba(255, 255, 255, 0) 100%)",
                    }
                  : {
                      background:
                        "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 25%, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0) 100%)",
                    }
              }
              onClick={() => inputRef.current?.focus()}
            >
              <div
                className={`absolute left-0 h-full w-[100px] z-10 ${
                  theme === "light"
                    ? "bg-gradient-to-r from-white to-transparent"
                    : "bg-gradient-to-r from-black to-transparent" // Updated to darker gradient
                }`}
              ></div>
              <div
                className={`absolute right-0 h-full w-[100px] z-10 ${
                  theme === "light"
                    ? "bg-gradient-to-r from-transparent to-white"
                    : "bg-gradient-to-r from-transparent to-black" // Updated to darker gradient
                }`}
              ></div>

              <div
                className="absolute whitespace-nowrap flex items-center h-full transition-transform duration-100 text-lg font-semibold font-mono"
                style={{
                  transform: `translateX(${calculateTranslateX()}px)`,
                }}
              >
                {currentWords.map((word, index) => (
                  <span
                    key={index}
                    className={`inline-block w-[120px] text-center ${
                      index < wordIndex
                        ? wordStatuses[index]
                          ? theme === "light"
                            ? "text-green-600"
                            : "text-green-400"
                          : theme === "light"
                          ? "text-red-600"
                          : "text-red-400"
                        : index === wordIndex
                        ? "text-primary font-bold text-3xl"
                        : theme === "light"
                        ? "text-gray-600 font-semibold text-lg"
                        : "text-gray-200 font-semibold text-lg" // Updated for better contrast
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
                                ? theme === "light"
                                  ? "text-green-600"
                                  : "text-green-400"
                                : isCorrect === false
                                ? theme === "light"
                                  ? "text-red-600"
                                  : "text-red-400"
                                : theme === "light"
                                ? "text-gray-600"
                                : "text-gray-200";

                            return (
                              <span
                                key={charIndex}
                                className={`inline-block ${className} ${
                                  charIndex === userInput.length
                                    ? theme === "light"
                                      ? "bg-gray-200 rounded"
                                      : "bg-gray-800 rounded"
                                    : ""
                                }`}
                              >
                                {char}
                              </span>
                            );
                          })
                        : word}
                      {/* Display extra characters in red if any */}
                      {index === wordIndex &&
                        userInput.length > word.length && (
                          <span
                            className={`${
                              theme === "light"
                                ? "text-red-600"
                                : "text-red-400"
                            }`}
                          >
                            {userInput.slice(word.length)}
                          </span>
                        )}
                    </div>
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full flex flex-col justify-center items-center">
              {/* Character Accuracy Indicators */}
              {startTime !== 0 && (
                <div
                  className={`mb-4 text-center min-h-8 ${
                    theme === "light" ? "text-gray-600" : "text-gray-200"
                  }`}
                >
                  {showCharacterAccuracyIndicator && (
                    <>
                      {characterAccuracy.map((isCorrect, index) => (
                        <span
                          key={index}
                          className={`inline-block w-4 h-4 mx-0.5 rounded-full ${
                            isCorrect
                              ? theme === "light"
                                ? "bg-green-600"
                                : "bg-green-400"
                              : theme === "light"
                              ? "bg-red-600"
                              : "bg-red-400"
                          }`}
                        />
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Invisible Input Field */}
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

              {/* Conditionally render WPM and Accuracy */}
              <div
                className={`text-center w-full max-w-2xl h-16 justify-center items-center flex ${
                  showPerformance ? "" : "hidden"
                }`}
              >
                <div className="flex flex-row gap-48 w-full items-center justify-center">
                  <div>
                    <div
                      className={`text-3xl font-bold ${
                        theme === "light" ? "text-gray-800" : "text-gray-200"
                      }`}
                    >
                      {wpm}
                    </div>
                    <div
                      className={`text-sm ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      WPM
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-3xl font-bold ${
                        theme === "light" ? "text-gray-800" : "text-gray-200"
                      }`}
                    >
                      {accuracy}%
                    </div>
                    <div
                      className={`text-sm ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      Accuracy
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {gameState === "result" && (
          <>
            <div
              className={`text-center mb-16 w-full max-w-2xl ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              <h2 className="text-3xl font-bold mb-16">Results</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p
                    className={`text-4xl font-bold ${
                      theme === "light" ? "text-gray-800" : "text-gray-200"
                    }`}
                  >
                    {wpm}
                  </p>
                  <p
                    className={`text-lg ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    Words per Minute
                  </p>
                </div>
                <div>
                  <p
                    className={`text-4xl font-bold ${
                      theme === "light" ? "text-gray-800" : "text-gray-200"
                    }`}
                  >
                    {accuracy}%
                  </p>
                  <p
                    className={`text-lg ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    Accuracy
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={resetGame}
              className={`w-full max-w-2xl ${
                theme === "light"
                  ? "bg-gray-300 hover:bg-gray-400 text-gray-800"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-200"
              }`}
            >
              Try Again
            </Button>
          </>
        )}

        {/* Footer with Shortcut Information */}
        {startTime === 0 && (
          <footer
            className={`mt-8 w-full max-w-2xl text-center text-sm ${
              theme === "light" ? "text-gray-600" : "text-gray-200"
            }`}
          >
            Press{" "}
            <kbd
              className={`font-mono px-1 rounded ${
                theme === "light" ? "bg-gray-200" : "bg-gray-700"
              }`}
            >
              Tab
            </kbd>{" "}
            +{" "}
            <kbd
              className={`font-mono px-1 rounded ${
                theme === "light" ? "bg-gray-200" : "bg-gray-700"
              }`}
            >
              Enter
            </kbd>{" "}
            to restart the game.
          </footer>
        )}
      </div>

      {startTime === 0 && (
        <div className="absolute bottom-0 w-full flex justify-center pb-8 cursor-pointer z-10">
          <a
            className={`group rounded-full border ${
              theme === "light"
                ? "border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-800"
                : "border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-200"
            } text-base transition-all ease-in hover:cursor-pointer`}
            href="https://github.com/basith-ahmed/type-racer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-gray-600 hover:duration-300 hover:dark:text-gray-400 shadow-sm rounded-full">
              {/* <div className="hover:underline text-sm flex justify-center items-center"> */}
              <span>View on GitHub</span>
              {/* <Link2 className="w-4 h-4 ml-1" /> */}
              {/* </div> */}
            </AnimatedShinyText>
          </a>
        </div>
      )}
    </div>
  );
}
