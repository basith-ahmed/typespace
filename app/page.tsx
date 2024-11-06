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
import { Link2 } from "lucide-react";
import Particles from "@/components/ui/particles";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

const words = [
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "I",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "they",
  "we",
  "say",
  "her",
  "she",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me",
  "when",
  "make",
  "can",
  "like",
  "time",
  "no",
  "just",
  "him",
  "know",
  "take",
  "people",
  "into",
  "year",
  "your",
  "good",
  "some",
  "could",
  "them",
  "see",
  "other",
  "than",
  "then",
  "now",
  "look",
  "only",
  "come",
  "its",
  "over",
  "think",
  "also",
  "back",
  "after",
  "use",
  "two",
  "how",
  "our",
  "work",
  "first",
  "well",
  "way",
  "even",
  "new",
  "want",
  "because",
  "any",
  "these",
  "give",
  "day",
  "most",
  "us",
];

const sampleSentences = [
  "The quick brown fox jumps over the lazy dog.",
  "I can't believe it's already October!",
  "She said, 'Hello!' and waved.",
  "Do you know where I left my keys?",
  "It's a beautiful day, isn't it?",
  "He scored 100 points in the game.",
  "They've been friends for 10 years.",
  "Why don't we try something new?",
  "Let's meet at 5:30 pm.",
  "Can you solve this problem: 5 + 7?",
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
  const [wordStatuses, setWordStatuses] = useState<boolean[]>([]);

  const [includePunctuation, setIncludePunctuation] = useState(false);
  const [includeNumbers, setIncludeNumbers] = useState(false);

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
    let newWords: string[] = [];

    if (includePunctuation) {
      while (newWords.length < count) {
        const sentence =
          sampleSentences[Math.floor(Math.random() * sampleSentences.length)];
        let wordsInSentence = sentence.split(" ");

        if (!includeNumbers) {
          // Remove words that are numbers
          wordsInSentence = wordsInSentence.filter((word) => !/\d/.test(word));
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

    setCurrentWords((prevWords) => [...prevWords, ...newWords.slice(0, count)]);
  };

  const updateCurrentWords = () => {
    const wordsTyped = currentWords.slice(0, wordIndex);
    setCurrentWords(wordsTyped);
    generateWords(50); // Generate new words according to the settings
  };

  // When options change, update the currentWords
  useEffect(() => {
    if (gameState === "typing") {
      updateCurrentWords();
    }
  }, [includePunctuation, includeNumbers]);

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

      setWordStatuses((prevStatuses) => [...prevStatuses, isCorrect]);
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
    setWordIndex(0);
    setCorrectWords(0);
    setStartTime(0);
    setWpm(0);
    setAccuracy(100);
    setTimeLeft(testDuration);
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

  const calculateTranslateX = () => {
    const wordWidth = 120;
    const centerPosition = containerWidth / 2;
    const targetPosition = wordIndex * wordWidth + wordWidth / 2;
    return centerPosition - targetPosition;
  };

  return (
    <div className="h-screen flex flex-col relative">
      <div className="mx-auto p-4 flex flex-col items-center justify-center w-full h-full bg-gray-100">
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

            {/* Options for Punctuation and Numbers */}
            <div className="mb-4 w-full max-w-2xl flex justify-center space-x-4">
              <Button
                variant={includePunctuation ? "default" : "outline"}
                onClick={() => {
                  setIncludePunctuation(!includePunctuation);
                }}
              >
                {includePunctuation ? "Disable" : "Enable"} Punctuation
              </Button>
              <Button
                variant={includeNumbers ? "default" : "outline"}
                onClick={() => {
                  setIncludeNumbers(!includeNumbers);
                }}
              >
                {includeNumbers ? "Disable" : "Enable"} Numbers
              </Button>
            </div>

            {/* Continuous Infinite Strip of Words with Centered Current Word */}
            <div
              ref={containerRef}
              className="relative h-16 overflow-hidden mb-4 bg-secondary rounded-lg w-full max-w-2xl"
            >
              <div className="absolute left-0 h-full w-[20px] bg-gradient-to-r from-gray-100 to-transparent z-10"></div>
              <div className="absolute right-0 h-full w-[20px] bg-gradient-to-r from-transparent to-gray-100 z-10"></div>
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
                    {index === wordIndex
                      ? // If it's the current word being typed, split into characters
                        word.split("").map((char, charIndex) => (
                          <span
                            key={charIndex}
                            className={`inline-block ${
                              charIndex < characterAccuracy.length
                                ? characterAccuracy[charIndex]
                                  ? "text-green-500"
                                  : "text-red-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            {char}
                          </span>
                        ))
                      : // For other words, display normally
                        word}
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
              className="mb-4 text-lg w-full max-w-2xl text-center border border-gray-300/50 rounded-lg px-4 py-2 focus:outline-none shadow-sm focus:shadow-lg z-10 backdrop-blur-sm"
              placeholder="Start typing to begin."
              aria-label="Type the words shown above"
            />

            <div className="grid grid-cols-2 gap-4 text-center w-full max-w-2xl">
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
            <Button onClick={resetGame} className="w-full max-w-2xl">
              Try Again
            </Button>
          </>
        )}

        {/* Footer with Shortcut Information */}
        <footer className="mt-8 w-full max-w-2xl text-center text-sm text-gray-500">
          Press <kbd className="font-mono bg-gray-200 px-1 rounded">Tab</kbd> +{" "}
          <kbd className="font-mono bg-gray-200 px-1 rounded">Enter</kbd> to
          restart the game.
        </footer>
      </div>
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
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={200}
        // staticity={30}
        color="#000000"
        refresh
      />
    </div>
  );
}
