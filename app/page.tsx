"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const words = [
  "the",
  "be",
  "of",
  "and",
  "a",
  "to",
  "in",
  "he",
  "have",
  "it",
  "that",
  "for",
  "they",
  "with",
  "as",
  "not",
  "on",
  "she",
  "at",
  "by",
  "this",
  "we",
  "you",
  "do",
  "but",
  "from",
  "or",
  "which",
  "one",
  "would",
  "all",
  "will",
  "there",
  "say",
  "who",
  "make",
  "when",
  "can",
  "more",
  "if",
  "no",
  "man",
  "out",
  "other",
  "so",
  "what",
  "time",
  "up",
  "go",
  "about",
  "than",
  "into",
  "could",
  "state",
  "only",
];

export default function ImprovedTypingSpeedTester() {
  const [gameState, setGameState] = useState<"typing" | "result">("typing");
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [testDuration, setTestDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(testDuration);
  const [performanceData, setPerformanceData] = useState<
    { time: number; wpm: number; accuracy: number }[]
  >([]);
  const [characterAccuracy, setCharacterAccuracy] = useState<boolean[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

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

  useEffect(() => {
    // Update refs whenever wpm or accuracy changes
    wpmRef.current = wpm;
    accuracyRef.current = accuracy;
  }, [wpm, accuracy]);

  useEffect(() => {
    if (gameState === "typing" && startTime !== 0) {
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
  }, [gameState, startTime, testDuration]);

  useEffect(() => {
    // Focus the input element on initial page load
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
      e.preventDefault(); // Prevent default tab behavior
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

  const generateWords = (count = 10) => {
    const newWords = Array(count)
      .fill(null)
      .map(() => words[Math.floor(Math.random() * words.length)]);
    setCurrentWords((prevWords) => [...prevWords, ...newWords]);
  };

  const startGame = () => {
    setStartTime(Date.now());
    setTimeLeft(testDuration);
    if (inputRef.current) inputRef.current.focus();
  };

  const endGame = () => {
    setGameState("result");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (startTime === 0) startGame();

    const inputValue = e.target.value;
    setUserInput(inputValue);

    // Update character accuracy
    const currentWord = currentWords[wordIndex];
    const newCharacterAccuracy = inputValue
      .split("")
      .map((char, index) => char === currentWord[index]);
    setCharacterAccuracy(newCharacterAccuracy);

    if (inputValue.endsWith(" ")) {
      const typedWord = inputValue.trim();
      const isCorrect = typedWord === currentWords[wordIndex];

      const newCorrectWords = isCorrect ? correctWords + 1 : correctWords;
      const newWordIndex = wordIndex + 1;

      setCorrectWords(newCorrectWords);
      setWordIndex(newWordIndex);
      setUserInput("");
      setCharacterAccuracy([]);

      // Append new words if nearing the end 
      if (newWordIndex >= currentWords.length - 20) {
        generateWords(10);
      }

      // Calculate WPM and accuracy
      const timeElapsed = (Date.now() - startTime) / 60000;
      const newWpm = Math.round(newCorrectWords / timeElapsed || 0);
      const newAccuracy =
        newWordIndex > 0
          ? Math.round((newCorrectWords / newWordIndex) * 100)
          : 100;
      setWpm(newWpm);
      setAccuracy(newAccuracy);
    }
  };

  const resetGame = () => {
    setGameState("typing");
    setCurrentWords([]);
    generateWords(50);
    setWordIndex(0);
    setCorrectWords(0);
    setStartTime(0);
    setWpm(0);
    setAccuracy(100);
    setTimeLeft(testDuration);
    setPerformanceData([]);
    setCharacterAccuracy([]);
    setUserInput("");
  };

  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    setTestDuration(duration);
    setTimeLeft(duration);
    resetGame();
  };

  const calculateTranslateX = () => {
    const wordWidth = 120;
    const centerPosition = containerWidth / 2;
    const targetPosition = wordIndex * wordWidth + wordWidth / 2;
    return centerPosition - targetPosition;
  };

  return (
    <div className="mx-auto p-4 flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* <h1 className="text-3xl font-bold mb-6">Type Racer</h1> */}
      {gameState === "typing" && (
        <>
          <div className="mb-4 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-2">
              <div className="text-2xl font-bold">Time left: {timeLeft}s</div>
              <Select
                value={testDuration.toString()}
                onValueChange={handleDurationChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Progress
              value={(timeLeft / testDuration) * 100}
              className="w-full"
            />
          </div>

          {/* Continuous Infinite Strip of Words with Centered Current Word */}
          <div
            ref={containerRef}
            className="relative h-16 overflow-hidden mb-4 bg-secondary rounded-lg w-full max-w-2xl"
          >
            <div
              className="absolute whitespace-nowrap flex items-center h-full transition-transform duration-300"
              style={{
                transform: `translateX(${calculateTranslateX()}px)`,
              }}
            >
              {currentWords.map((word, index) => (
                <span
                  key={index}
                  className={`inline-block w-[120px] text-center text-lg ${
                    index === wordIndex
                      ? "text-primary font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Character Accuracy Indicators */}
          <div className="mb-4 text-center min-h-8">
            {characterAccuracy.map((isCorrect, index) => (
              <span
                key={index}
                className={`inline-block w-4 h-4 mx-0.5 rounded-full ${
                  isCorrect ? "bg-green-500" : "bg-red-500"
                }`}
              />
            ))}
          </div>

          <Input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="mb-4 text-lg w-full max-w-2xl text-center border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Start typing to begin..."
            aria-label="Type the words shown above"
          />

          <div className="grid grid-cols-2 gap-4 text-center w-full max-w-2xl">
            <div>
              <div className="text-3xl font-bold text-primary">{wpm}</div>
              <div className="text-sm text-gray-600">WPM</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{accuracy}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>
        </>
      )}
      {gameState === "result" && (
        <>
          <div className="text-center mb-6 w-full max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Results</h2>
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

          {/* Performance Over Time Chart 
          <div className="mb-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-2">
              Performance Over Time
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    label={{
                      value: "Time (seconds)",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    yAxisId="left"
                    label={{ value: "WPM", angle: -90, position: "insideLeft" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{
                      value: "Accuracy (%)",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="wpm"
                    stroke="hsl(var(--primary))"
                    name="WPM"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="accuracy"
                    stroke="hsl(var(--secondary))"
                    name="Accuracy"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          */}

          <Button onClick={resetGame} className="w-full max-w-2xl">
            Try Again
          </Button>
        </>
      )}

      {/* Footer with Shortcut Information */}
      <footer className="mt-8 w-full max-w-2xl text-center text-sm text-gray-500">
        Press <kbd className="font-mono bg-gray-200 px-1 rounded">Tab</kbd> +{" "}
        <kbd className="font-mono bg-gray-200 px-1 rounded">Enter</kbd> to restart
        the game.
      </footer>
    </div>
  );
}
