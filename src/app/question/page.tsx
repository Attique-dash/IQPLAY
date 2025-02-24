"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../../firebase/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import Image from "next/image";
import logo from "../../../public/images/logo.png";

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
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "Game";
  const difficulty = searchParams.get("difficulty");
  const gameId = searchParams.get("gameId");
  const playerOne = searchParams.get("playerOne") || "Player 1";
  const playerTwo = searchParams.get("playerTwo") || "Player 2";
  const router = useRouter();

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState(playerOne);
  const [playerResponses, setPlayerResponses] = useState<any[]>([]);
  const [playerScores, setPlayerScores] = useState({
    playerOne: 0,
    playerTwo: 0,
  });

  useEffect(() => {
    fetch("/questions.json")
      .then((res) => res.json())
      .then((data) => {
        if (title && difficulty && data[title]?.[difficulty]) {
          const shuffledQuestions = data[title][difficulty].sort(
            () => Math.random() - 0.5
          );
          setAllQuestions(shuffledQuestions);
          setQuestions(shuffledQuestions.slice(0, 5));
        }
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [title, difficulty]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!showPopup && currentIndex < 5) {
      setTimer(15); // Reset timer when the question changes
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval!); // Stop at 0
            setSelectedOption(null); // Unselect option at 0 seconds
            handleNext(); // Move to the next question automatically
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval); // Cleanup to prevent multiple timers
    };
  }, [showPopup, currentIndex]); // Runs when question changes

  useEffect(() => {
    if (showPopup) {
      const timeout = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [showPopup]);

  const handleNext = () => {
    if (selectedOption !== null) {
      setPlayerResponses((prev) => [
        ...prev,
        {
          player: currentPlayer,
          question: questions[currentIndex].question,
          options: questions[currentIndex].options,
          correctAnswer: questions[currentIndex].correct,
          selectedOption: selectedOption,
        },
      ]);
    }

    if (selectedOption === questions[currentIndex]?.correct) {
      setPlayerScores((prev) => ({
        ...prev,
        [currentPlayer === playerOne ? "playerOne" : "playerTwo"]:
          prev[currentPlayer === playerOne ? "playerOne" : "playerTwo"] + 5,
      }));
    }

    if (currentIndex === 4) {
      if (currentPlayer === playerOne) {
        setShowPopup(true);
        setCurrentPlayer(playerTwo);
        setCurrentIndex(0);
        const remainingQuestions = allQuestions.filter(
          (q) => !questions.includes(q)
        );
        setQuestions(remainingQuestions.slice(0, 5));
      } else {
        handleComplete([
          ...playerResponses,
          {
            player: currentPlayer,
            question: questions[currentIndex].question,
            options: questions[currentIndex].options,
            correctAnswer: questions[currentIndex].correct,
            selectedOption: selectedOption,
          },
        ]);
      }
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setTimer(15);
  };

  const handleComplete = async (finalResponses: PlayerResponse[]) => {
    clearInterval(timer);

    console.log("Difficulty:", difficulty);
    console.log("Difficulty Type:", typeof difficulty); // Debugging line

    let winnerPoints = 0;

    const normalizedDifficulty = String(difficulty).trim(); // Convert to string

    const difficultyMap: { [key: string]: number } = {
      "Very Easy": 100,
      Medium: 250,
      Hard: 450,
      "Very Difficult": 600,
      "100": 100,
      "250": 250,
      "450": 450,
      "600": 600, // Ensure number-based difficulty values are mapped correctly
    };

    winnerPoints = difficultyMap[normalizedDifficulty] || 100; // Default to 100 if invalid

    console.log("Winner Points (Based on Difficulty):", winnerPoints);

    // Get scores from playerScores object
    const playerOneScore = playerScores.playerOne;
    const playerTwoScore = playerScores.playerTwo;

    let playerOnePoints = 0;
    let playerTwoPoints = 0;

    // ✅ Ensure points are correctly assigned
    if (playerOneScore > playerTwoScore) {
      playerOnePoints = winnerPoints;
    } else if (playerTwoScore > playerOneScore) {
      playerTwoPoints = winnerPoints;
    } else {
      // ✅ If both players have equal scores, give them half points each
      playerOnePoints = winnerPoints / 2;
      playerTwoPoints = winnerPoints / 2;
    }

    console.log("Final Assigned Player 1 Points:", playerOnePoints);
    console.log("Final Assigned Player 2 Points:", playerTwoPoints);

    try {
      // Store game results in 'games' collection
      await setDoc(doc(db, "games", gameId || ""), {
        gameName: title,
        player1: playerOne,
        player2: playerTwo,
        playerOneScore,
        playerTwoScore,
        responses: finalResponses,
      });

      // Reference to the playerPoints document
      const playerPointsRef = doc(db, "playerPoints", gameId || "");
      const playerPointsDoc = await getDoc(playerPointsRef);

      if (playerPointsDoc.exists()) {
        console.log("Updating existing playerPoints document...");
        await updateDoc(playerPointsRef, {
          [playerOne]: increment(playerOnePoints), // Increment correctly
          [playerTwo]: increment(playerTwoPoints),
        });
      } else {
        console.log("Creating new playerPoints document...");
        await setDoc(playerPointsRef, {
          gameId,
          playerOne,
          playerTwo,
          [playerOne]: playerOnePoints,
          [playerTwo]: playerTwoPoints,
        });
      }

      console.log("Data successfully updated in Firestore.");
      router.push(`/result?gameId=${gameId}`);
    } catch (error) {
      console.error("Error saving game results:", error);
    }
  };

  const handleOptionClick = (option: string) => {
    if (timer === 0) {
      setError("Your time is up! You cannot select an option.");
      return;
    }
    setSelectedOption(option);
    setError("");
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (!questions.length && !showPopup) return <p>No questions available.</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!showPopup && (
        <header className="w-full h-[5.5rem] flex items-center bg-gray-800 text-white py-4 shadow-lg">
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
            onClick={() => router.push(`/creategame?gameId=${gameId}`)}
            className="ml-auto bg-red-500 font-semibold text-white px-4 py-2 rounded-lg mr-10 w-24"
          >
            Exit
          </button>
        </header>
      )}
      {showPopup ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-blue-500 bg-white p-10 rounded-lg shadow-lg text-center text-2xl font-bold w-1/2 h-1/2 flex flex-col items-center justify-center">
            {currentPlayer} Ready!
            <br />
            <span className="text-yellow-500 mt-2">Play the game</span>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-4xl flex flex-col items-center text-center mt-6">
          <p className=" text-lg font-bold border-2 border-blue-500 text-red-600 p-2 rounded-full">{`Time Left: ${timer}s`}</p>
          <h2 className="text-3xl font-semibold mt-4 text-gray-700">
            {questions[currentIndex]?.question}
          </h2>

          <div className="mt-6 space-y-4 w-full flex flex-col items-center">
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {questions[currentIndex]?.options.map((option) => (
              <button
                key={option}
                className={`w-3/4 py-3 text-xl rounded-lg font-semibold ${
                  selectedOption === option
                    ? "bg-yellow-400 text-white"
                    : "bg-gray-200 text-gray-800"
                } ${timer === 0 ? "opacity-50 cursor-not-allowed" : ""}`} // Disabled styling
                onClick={() => handleOptionClick(option)}
                disabled={timer === 0} // Disable button when time is 0
              >
                {option}
              </button>
            ))}
          </div>

          {currentPlayer === playerTwo && currentIndex === 4 ? (
            <button
              onClick={() => handleComplete(playerResponses)}
              className="mt-6 w-3/4 bg-green-500 text-white py-3 rounded-lg text-xl"
            >
              Complete
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="mt-6 w-3/4 bg-blue-500 text-white py-3 rounded-lg text-xl"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
