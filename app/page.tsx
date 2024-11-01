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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

  useEffect(() => {
    generateWords();
  }, []);

  useEffect(() => {
    if (gameState === "typing" && startTime !== 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prev - 1;
        });

        // Update performance data every 5 seconds
        if (timeLeft % 5 === 0) {
          setPerformanceData((prev) => [
            ...prev,
            { time: testDuration - timeLeft, wpm, accuracy },
          ]);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft, startTime, wpm, accuracy, testDuration]);

  const generateWords = () => {
    const newWords = Array(10)
      .fill(null)
      .map(() => words[Math.floor(Math.random() * words.length)]);
    setCurrentWords(newWords);
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
      if (typedWord === currentWords[wordIndex]) {
        setCorrectWords((prev) => prev + 1);
      }
      setWordIndex((prev) => prev + 1);
      setUserInput("");
      setCharacterAccuracy([]);

      if (wordIndex === currentWords.length - 1) {
        generateWords();
        setWordIndex(0);
      }

      // Calculate WPM and accuracy
      const timeElapsed = (Date.now() - startTime) / 60000; // in minutes
      const newWpm = Math.round(correctWords / timeElapsed);
      const newAccuracy = Math.round((correctWords / (wordIndex + 1)) * 100);
      setWpm(newWpm);
      setAccuracy(newAccuracy);
    }
  };

  const resetGame = () => {
    setGameState("typing");
    generateWords();
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
    setTestDuration(parseInt(value));
    setTimeLeft(parseInt(value));
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Improved Typing Speed Tester</h1>
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
          <div className="relative h-16 overflow-hidden mb-4 bg-secondary rounded-lg w-full max-w-2xl">
            <div
              className="absolute whitespace-nowrap transition-transform duration-300 flex items-center h-full"
              style={{
                transform: `translateX(calc(25% - ${wordIndex * 120}px))`,
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
          <div className="mb-4 text-center">
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
            className="mb-4 text-lg w-full max-w-2xl"
            placeholder="Start typing to begin..."
            aria-label="Type the words shown above"
          />
          <div className="grid grid-cols-2 gap-4 text-center w-full max-w-2xl">
            <div>
              <div className="text-3xl font-bold text-primary">{wpm}</div>
              <div className="text-sm text-muted-foreground">WPM</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>
        </>
      )}
      {gameState === "result" && (
        <>
          <div className="text-center mb-6 w-full max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Test Results</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-4xl font-bold text-primary">{wpm}</p>
                <p className="text-lg text-muted-foreground">
                  Words per Minute
                </p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">{accuracy}%</p>
                <p className="text-lg text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </div>
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
          <Button onClick={resetGame} className="w-full max-w-2xl">
            Try Again
          </Button>
        </>
      )}
    </div>
  );
}
