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
} from "lucide-react";
import Particles from "@/components/ui/particles";

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

  const [showPerformance, setShowPerformance] = useState(true);
  const [showCharacterAccuracyIndicator, setShowCharacterAccuracyIndicator] =
    useState(false);

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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      tabPressedRef.current = true;

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

    // Update character accuracy with extra characters (worngly spelled)
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

  const calculateTranslateX = () => {
    const wordWidth = 120;
    const centerPosition = containerWidth / 2;
    const targetPosition = wordIndex * wordWidth + wordWidth / 2;
    return centerPosition - targetPosition;
  };

  // Framer anim variants for Progress Bar and Dock
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

                {/* Conditionally render Dock or Progress Bar based on startTime */}
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
                                includePunctuation
                                  ? "Exclude punctuation"
                                  : "Include punctuation"
                              }
                            >
                              Aa!
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
                              <Timer />
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
                              <Calculator />
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Continuous Infinite Strip of Words with Centered Current Word */}
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
                            ? "text-green-500"
                            : "text-red-500"
                          : index === wordIndex
                          ? "text-primary font-bold text-3xl"
                          : "text-muted-foreground font-semibold text-lg dark:text-gray-400"

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
                        {/* Display extra characters in red if any */}
                        {index === wordIndex &&
                          userInput.length > word.length && (
                            <span className="text-red-500">
                              {userInput.slice(word.length)}
                            </span>
                          )}
                      </div>
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full max-w-2xl flex flex-col justify-center items-center mb-12">
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

                {/* Character Accuracy Indicators */}
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

                {/* Conditionally render WPM and Accuracy */}
                {showPerformance && (
                  <div className="text-center w-full max-w-2xl h-16 justify-center items-center flex">
                    <div className="flex flex-row gap-48 w-full items-center justify-center text-gray-600 dark:text-gray-400">
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
                )}
              </div>
            </motion.div>
          )}
          {gameState === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="text-center mb-16 w-full max-w-2xl"
            >
              {/* <div className="text-center mb-16 w-full max-w-2xl"> */}
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
              {/* </div> */}
              {/* <Button onClick={resetGame} className="w-full max-w-2xl">
                Try Again
              </Button> */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer with Shortcut Information */}
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

      {startTime === 0 && (
        <div className="absolute bottom-0 w-full flex justify-center pb-8 cursor-pointer z-10">
          <a
            className="group rounded-full border border-black/5 dark:border-white/5 bg-neutral-100 dark:bg-[#2c2e31] text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:hover:bg-neu[#2C2E31]"
            href="https://github.com/basith-ahmed/type-racer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 dark:hover:text-neutral-400 hover:duration-300 shadow-sm rounded-full">
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
