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
} from "lucide-react";
import Particles from "@/components/ui/particles";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

import { motion, AnimatePresence } from "framer-motion";

import { words } from "@/constants/words";
import { sampleSentences } from "@/constants/sampleSentences";

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

  // toggle state variables
  const [showPerformance, setShowPerformance] = useState(true);
  const [showCharacterAccuracyIndicator, setShowCharacterAccuracyIndicator] =
    useState(false);

  // Refs to store the wpm and accuracy without causing re-renders
  const wpmRef = useRef(wpm);
  const accuracyRef = useRef(accuracy);

  // Refs for shortcut detection
  const tabPressedRef = useRef(false);
  const tabTimerRef = useRef<NodeJS.Timeout | null>(null);

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
  };

  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    setTestDuration(duration);
    setTimeLeft(duration);
    resetGame();
  };

  const handleWordCountChange = (value: string) => {
    const wordCount = parseInt(value);
    setTestWordCount(wordCount);
    resetGame();
  };

  const calculateTranslateX = () => {
    const wordWidth = 120;
    const centerPosition = containerWidth / 2;
    const targetPosition = wordIndex * wordWidth + wordWidth / 2;
    return centerPosition - targetPosition;
  };

  return (
    <div className="h-screen flex flex-col relative bg-gray-100">
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={200}
        color="#000000"
        refresh
      />
      <div className="mx-auto p-4 flex flex-col items-center justify-center w-full h-full z-10">
        {gameState === "typing" && (
          <>
            <div className="mb-4 w-full max-w-2xl flex flex-col items-center justify-center">
              {/* {startTime !== 0 && (
                <div className="flex justify-center items-center mb-2 w-full">
                  {testMode === "time" ? (
                    <div className="text-2xl font-bold">
                      Time left: {timeLeft}s
                    </div>
                  ) : (
                    <div className="text-2xl font-bold">
                      Words left: {testWordCount - wordIndex}
                    </div>
                  )}
                </div>
              )} */}
              {/* Conditionally render Dock or Progress Bar based on startTime */}
              <motion.div
                layout
                className="mb-4 overflow-hidden rounded-lg w-full flex justify-center"
                animate={{
                  backgroundColor: startTime !== 0 ? "#171717" : "#e5e7eb",
                  width: startTime !== 0 ? "100%" : "552.02px",
                }}
                transition={{
                  layout: { type: "spring", stiffness: 700, damping: 30 },
                  backgroundColor: { duration: 0.3 },
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {startTime !== 0 ? (
                    <motion.div
                      key="small-div"
                      initial={{ opacity: 0, height: "16px" }}
                      animate={{ opacity: 1, height: "16px" }}
                      exit={{ opacity: 0, height: "72px" }}
                      transition={{
                        opacity: { duration: 0.2 },
                        height: { duration: 0.5, ease: "easeInOut" },
                      }}
                      className="w-full"
                    >
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
                    </motion.div>
                  ) : (
                    <motion.div
                      key="dock"
                      initial={{ opacity: 0, height: "72px" }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: "16px" }}
                      transition={{
                        opacity: { duration: 0.2 },
                        height: { duration: 0.4, ease: "easeInOut" },
                      }}
                    >
                      <div className="w-fit flex items-center space-x-2 justify-center bg-gray-200 rounded-lg p-4">
                        {/* Mode Selection Buttons */}
                        <Button
                          variant={testMode === "time" ? "default" : "outline"}
                          onClick={() => {
                            setTestMode("time");
                            resetGame();
                          }}
                        >
                          <Timer />
                        </Button>
                        <Button
                          variant={testMode === "words" ? "default" : "outline"}
                          onClick={() => {
                            setTestMode("words");
                            resetGame();
                          }}
                        >
                          <WholeWord />
                        </Button>

                        {/* Duration or Word Count Selection Buttons */}
                        {testMode === "time" ? (
                          <>
                            <Button
                              size="sm"
                              variant={
                                testDuration === 15 ? "default" : "outline"
                              }
                              onClick={() => handleDurationChange("15")}
                            >
                              15
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                testDuration === 30 ? "default" : "outline"
                              }
                              onClick={() => handleDurationChange("30")}
                            >
                              30
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                testDuration === 60 ? "default" : "outline"
                              }
                              onClick={() => handleDurationChange("60")}
                            >
                              60
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                testDuration === 120 ? "default" : "outline"
                              }
                              onClick={() => handleDurationChange("120")}
                            >
                              120
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant={
                                testWordCount === 10 ? "default" : "outline"
                              }
                              onClick={() => handleWordCountChange("10")}
                            >
                              10
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                testWordCount === 25 ? "default" : "outline"
                              }
                              onClick={() => handleWordCountChange("25")}
                            >
                              25
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                testWordCount === 50 ? "default" : "outline"
                              }
                              onClick={() => handleWordCountChange("50")}
                            >
                              50
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                testWordCount === 100 ? "default" : "outline"
                              }
                              onClick={() => handleWordCountChange("100")}
                            >
                              100
                            </Button>
                          </>
                        )}

                        {/* Toggle Buttons */}
                        <Button
                          className="font-semibold"
                          size="sm"
                          variant={includePunctuation ? "default" : "outline"}
                          onClick={() => {
                            setIncludePunctuation(!includePunctuation);
                            inputRef.current?.focus();
                          }}
                        >
                          Aa!
                        </Button>
                        <Button
                          className="font-semibold"
                          size="sm"
                          variant={includeNumbers ? "default" : "outline"}
                          onClick={() => {
                            setIncludeNumbers(!includeNumbers);
                            inputRef.current?.focus();
                          }}
                        >
                          123
                        </Button>
                        <Button
                          size="sm"
                          variant={showPerformance ? "default" : "outline"}
                          onClick={() => {
                            setShowPerformance(!showPerformance);
                            inputRef.current?.focus();
                          }}
                        >
                          <Calculator />
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            showCharacterAccuracyIndicator
                              ? "default"
                              : "outline"
                          }
                          onClick={() => {
                            setShowCharacterAccuracyIndicator(
                              !showCharacterAccuracyIndicator
                            );
                            inputRef.current?.focus();
                          }}
                        >
                          <MessageSquareWarningIcon />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Continuous Infinite Strip of Words with Centered Current Word */}
            <div
              ref={containerRef}
              className="relative h-24 overflow-hidden rounded-lg w-full max-w-2xl z-10"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(243, 244, 246, 0) 0%, rgba(243, 244, 246, 1) 25%, rgba(243, 244, 246, 1) 75%, rgba(243, 244, 246, 0) 100%)",
              }}
              onClick={() => inputRef.current?.focus()}
            >
              <div className="absolute left-0 h-full w-[100px] bg-gradient-to-r from-gray-100 to-transparent z-10"></div>
              <div className="absolute right-0 h-full w-[100px] bg-gradient-to-r from-transparent to-gray-100 z-10"></div>
              <div
                className="absolute whitespace-nowrap flex items-center h-full transition-transform duration-100 text-lg"
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
                        ? "text-primary font-bold text-2xl"
                        : "text-muted-foreground text-lg"
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
                                : "text-muted-foreground";

                            return (
                              <span
                                key={charIndex}
                                className={`inline-block ${className} ${
                                  charIndex === userInput.length
                                    ? "bg-gray-200 rounded"
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

            {/* Character Accuracy Indicators */}
            {startTime !== 0 && (
              <div className="mb-4 text-center min-h-8">
                {showCharacterAccuracyIndicator && (
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
                )}
              </div>
            )}

            {/* Invisible Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              style={{ position: "absolute", left: "-9999px" }}
              aria-label="Type the words shown above"
            />

            {/* Conditionally render WPM and Accuracy */}
            <div className="grid grid-cols-2 gap-4 text-center w-full max-w-2xl h-16">
              {showPerformance && (
                <>
                  <div>
                    <div className="text-3xl font-bold text-primary">{wpm}</div>
                    <div className="text-sm text-gray-600">WPM</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {accuracy}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
        {gameState === "result" && (
          <>
            <div className="text-center mb-16 w-full max-w-2xl">
              <h2 className="text-3xl font-bold mb-16">Results</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-4xl font-bold text-primary">{wpm}</p>
                  <p className="text-lg text-gray-600">Words per Minute</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary">{accuracy}%</p>
                  <p className="text-lg text-gray-600">Accuracy</p>
                </div>
              </div>
            </div>
            <Button onClick={resetGame} className="w-full max-w-2xl">
              Try Again
            </Button>
          </>
        )}

        {/* Footer with Shortcut Information */}
        {startTime === 0 && (
          <footer className="mt-8 w-full max-w-2xl text-center text-sm text-gray-500">
            Press <kbd className="font-mono bg-gray-200 px-1 rounded">Tab</kbd>{" "}
            + <kbd className="font-mono bg-gray-200 px-1 rounded">Enter</kbd> to
            restart the game.
          </footer>
        )}
      </div>

      {startTime === 0 && (
        <a
          className="absolute bottom-0 w-full flex justify-center pb-8 cursor-pointer z-10"
          href="https://github.com/basith-ahmed/type-racer"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AnimatedGradientText className="backdrop-blur-lg">
            <div className="hover:underline text-sm flex justify-center items-center">
              View on GitHub
              <Link2 className="w-4 h-4 ml-1" />
            </div>
          </AnimatedGradientText>
        </a>
      )}
    </div>
  );
}
