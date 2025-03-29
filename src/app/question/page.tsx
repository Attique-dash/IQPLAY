"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { FaBars, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Question {
  question: string;
  options: string[];
  correct: string;
}

interface PlayerResponse {
  player: string;
  question: string;
  options: string[];
  correctAnswer: string;
  selectedOption: string | null;
}

export default function Quiz() {
  const router = useRouter();

  const [urlParams, setUrlParams] = useState({
    title: "Game",
    difficulty: "",
    gameId: "",
    playerOne: "Player 1",
    playerTwo: "Player 2",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(true);
  // Initialize currentPlayer with the default value first
  const [currentPlayer, setCurrentPlayer] = useState("Player 1");
  const [playerResponses, setPlayerResponses] = useState<PlayerResponse[]>([]);
  const [playerScores, setPlayerScores] = useState({
    playerOne: 0,
    playerTwo: 0,
  });
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const newParams = {
        title: params.get("title") || "Game",
        difficulty: params.get("difficulty") || "",
        gameId: params.get("gameId") || "",
        playerOne: params.get("playerOne") || "Player 1",
        playerTwo: params.get("playerTwo") || "Player 2",
      };
      setUrlParams(newParams);
      // Update currentPlayer after urlParams is set
      setCurrentPlayer(newParams.playerOne);
    }
  }, []);

  const { title, difficulty, gameId, playerOne, playerTwo } = urlParams;

  useEffect(() => {
    fetch("/questions.json")
      .then((res) => res.json())
      .then((data) => {
        if (title && difficulty && data[title]?.[difficulty]) {
          const shuffledQuestions = data[title][difficulty].sort(
            () => Math.random() - 0.5
          );
          setAllQuestions(shuffledQuestions);
          setQuestions(shuffledQuestions.slice(0, 5)); // Set initial 5 questions
        }
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [title, difficulty]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!showPopup && currentIndex < 5) {
      setTimer(15); // Reset timer for each question
      setIsTimeUp(false); // Reset time-up state
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval!); // Stop the timer
            setIsTimeUp(true); // Set time-up state
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval); // Cleanup timer
    };
  }, [showPopup, currentIndex]);

  useEffect(() => {
    if (showPopup) {
      const timeout = setTimeout(() => setShowPopup(false), 2000); // Hide popup after 2 seconds
      return () => clearTimeout(timeout);
    }
  }, [showPopup]);

  const storeResponse = () => {
    if (selectedOption !== null || isTimeUp) {
      const response = {
        player: currentPlayer,
        question: questions[currentIndex].question,
        options: questions[currentIndex].options,
        correctAnswer: questions[currentIndex].correct,
        selectedOption: selectedOption,
      };
      setPlayerResponses((prev) => [...prev, response]);

      // Update score if the answer is correct
      if (selectedOption === questions[currentIndex]?.correct) {
        setPlayerScores((prev) => ({
          ...prev,
          [currentPlayer === playerOne ? "playerOne" : "playerTwo"]:
            prev[currentPlayer === playerOne ? "playerOne" : "playerTwo"] + 5,
        }));
      }
    }
  };

  const switchPlayer = () => {
    // Store all used questions so far
    const newUsedQuestions = new Set(usedQuestions);
    questions.forEach((q) => newUsedQuestions.add(q.question));
    setUsedQuestions(newUsedQuestions);

    // Get remaining questions (not used by either player)
    const remainingQuestions = allQuestions.filter(
      (q) => !newUsedQuestions.has(q.question)
    );

    // Shuffle and take first 5
    const shuffledQuestions = [...remainingQuestions].sort(
      () => Math.random() - 0.5
    );
    const newQuestions = shuffledQuestions.slice(0, 5);

    if (newQuestions.length === 0) {
      toast.error("No more questions available");
      return;
    }

    setQuestions(newQuestions);
    setShowPopup(true);
    setCurrentPlayer(playerTwo);
    setCurrentIndex(0);
    setSelectedOption(null);
    setTimer(15);
    setIsTimeUp(false);
  };

  const handleNext = () => {
    if (timer > 0 && selectedOption === null) {
      toast.error("Please select an option before time up.");
      return;
    }

    storeResponse();

    if (currentIndex === 4) {
      if (currentPlayer === playerOne) {
        switchPlayer();
      } else {
        // For last question of player two
        toast.success("Quiz completed! Calculating results...");
        setTimeout(handleComplete, 2000); // Show toast for 2 seconds before completing
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimer(15);
      setIsTimeUp(false);
    }
  };

  const handleComplete = async () => {
    storeResponse(); // Store the last question's response before completing
    console.log("Final Responses:", playerResponses); // Log final responses

    let winnerPoints = 0;
    const normalizedDifficulty = String(difficulty).trim();

    const difficultyMap: { [key: string]: number } = {
      "Very Easy": 100,
      Medium: 250,
      Hard: 450,
      "Very Difficult": 600,
      "100": 100,
      "250": 250,
      "450": 450,
      "600": 600,
    };

    winnerPoints = difficultyMap[normalizedDifficulty] || 100;

    const playerOneScore = playerScores.playerOne;
    const playerTwoScore = playerScores.playerTwo;

    let playerOnePoints = 0;
    let playerTwoPoints = 0;

    if (playerOneScore > playerTwoScore) {
      playerOnePoints = winnerPoints;
    } else if (playerTwoScore > playerOneScore) {
      playerTwoPoints = winnerPoints;
    } else {
      playerOnePoints = winnerPoints / 2;
      playerTwoPoints = winnerPoints / 2;
    }

    try {
      await setDoc(doc(db, "games", gameId || ""), {
        gameName: title,
        player1: playerOne,
        player2: playerTwo,
        playerOneScore,
        playerTwoScore,
        responses: playerResponses, // Use the updated playerResponses array
      });

      const playerPointsRef = doc(db, "playerPoints", gameId || "");
      const playerPointsDoc = await getDoc(playerPointsRef);

      if (playerPointsDoc.exists()) {
        await updateDoc(playerPointsRef, {
          [playerOne]: increment(playerOnePoints),
          [playerTwo]: increment(playerTwoPoints),
        });
      } else {
        await setDoc(playerPointsRef, {
          gameId,
          playerOne,
          playerTwo,
          [playerOne]: playerOnePoints,
          [playerTwo]: playerTwoPoints,
        });
      }

      router.push(`/result?gameId=${gameId}`);
    } catch (error) {
      console.error("Error saving game results:", error);
    }
  };

  const handleOptionClick = (option: string) => {
    if (isTimeUp) {
      toast.error("Your time is up! You cannot select an option.");
      return;
    }
    setSelectedOption(option);
    setError("");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar state
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }
  if (!questions.length && !showPopup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">No questions available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <ToastContainer
        position="top-center"
        className="text-center font-semibold"
      />

      {!showPopup && (
        <header className="w-full h-[5.5rem] flex items-center bg-gray-800 text-white py-4 shadow-lg relative">
          <div className="flex-shrink-0 ml-10">
            <Image
              src={logo}
              alt="Logo"
              width={50}
              height={50}
              className="mt-0"
            />
          </div>

          <h1 className="flex-grow text-2xl font-bold text-center">{title}</h1>

          <button
            onClick={toggleSidebar}
            className="md:hidden ml-4 text-3xl focus:outline-none mr-5"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}{" "}
          </button>

          <div
            className={`fixed top-0 left-0 h-full w-60 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:hidden z-50`}
          >
            <div className="p-4">
              <div className="flex mb-5">
                <Image
                  src={logo}
                  alt="Logo"
                  width={50}
                  height={50}
                  className="mt-0"
                />
                <p className="sm:text-3xl text-2xl font-semibold ml-5">
                  IQPLAY
                </p>
                <button
            onClick={toggleSidebar}
            className=" ml-4 text-3xl focus:outline-none mr-5"
          >
            {isSidebarOpen ? <FaTimes /> : null}{" "}
          </button>
              </div>
              <button
                onClick={() => router.push(`/creategame?gameId=${gameId}`)}
                className="w-full bg-red-500 font-semibold text-white px-4 py-2 rounded-lg"
              >
                Exit
              </button>
            </div>
          </div>

          <button
            onClick={() => router.push(`/creategame?gameId=${gameId}`)}
            className="ml-auto bg-red-500 font-semibold text-white px-4 py-2 rounded-lg mr-10 w-24 hidden md:block"
          >
            Exit
          </button>
        </header>
      )}
      <div className="px-4">
        {showPopup ? (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-blue-500 bg-white p-10 rounded-lg shadow-lg text-center text-2xl font-bold w-1/2 h-1/2 flex flex-col items-center justify-center">
              {currentPlayer} Ready!
              <br />
              <span className="text-yellow-500 mt-2">Play the game</span>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-4xl flex flex-col items-center text-center mt-6 transition-all duration-500 justify-center">
            <div className="relative w-full h-4 bg-gray-300 rounded">
              <div
                className={`absolute h-full bg-green-500 rounded transition-all duration-1000`}
                style={{
                  width: `${(timer / 15) * 100}%`,
                  backgroundColor: timer <= 5 ? "red" : "green",
                }}
              />
            </div>
            <p
              className="text-lg font-bold p-2 rounded-full"
              style={{
                color: timer <= 5 ? "red" : "green",
              }}
            >{`Time Left: ${timer}s`}</p>

            <div className="flex flex-col md:flex-row w-full">
              <h2 className="text-3xl text-center md:content-center font-semibold mt-4 text-gray-700 md:w-1/2 transition-transform duration-500">
                {questions[currentIndex]?.question}
              </h2>
              <div className="mt-6 space-y-4 w-full md:w-1/2 flex flex-col items-center">
                {error && <p className="text-red-500 mt-2">{error}</p>}
                {questions[currentIndex]?.options.map((option) => (
                  <button
                    key={option}
                    className={`w-3/4 py-3 text-xl rounded-lg font-semibold ${
                      selectedOption === option
                        ? "bg-yellow-400 text-white"
                        : "bg-gray-200 text-gray-800"
                    } ${timer === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => handleOptionClick(option)}
                    disabled={timer === 0}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="mt-6 w-3/4 bg-blue-500 text-white py-3 rounded-lg text-xl"
            >
              {currentIndex === 4 ? "Finish" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
