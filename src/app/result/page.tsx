"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import vs from "../../../public/images/bgvs.png";

export default function Result() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");
  const router = useRouter();
  const [gameData, setGameData] = useState<any>(null);
  const [playerOneCorrect, setPlayerOneCorrect] = useState(0);
  const [playerTwoCorrect, setPlayerTwoCorrect] = useState(0);
  const [winner, setWinner] = useState<string>("");

  useEffect(() => {
    if (!gameId) return;

    const fetchResults = async () => {
      const docRef = doc(db, "games", gameId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setGameData(data);

        // Calculate correct answers for each player
        const playerOneAnswers = data.responses?.filter(
          (resp: any) =>
            resp.player === data.player1 &&
            resp.selectedOption === resp.correctAnswer
        ).length;

        const playerTwoAnswers = data.responses?.filter(
          (resp: any) =>
            resp.player === data.player2 &&
            resp.selectedOption === resp.correctAnswer
        ).length;

        setPlayerOneCorrect(playerOneAnswers || 0);
        setPlayerTwoCorrect(playerTwoAnswers || 0);

        // Determine the winner
        if (data.playerOneScore > data.playerTwoScore) {
          setWinner(`${data.player1} Wins! 🎉`);
        } else if (data.playerOneScore < data.playerTwoScore) {
          setWinner(`${data.player2} Wins! 🎉`);
        } else {
          setWinner("It's a Draw! 🤝");
        }
      }
    };

    fetchResults();
  }, [gameId]);

  if (!gameData)
    return <p className="text-center text-lg">Loading results...</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      {/* Header */}
      <header className="w-full h-[5.5rem] flex items-center bg-gray-800 text-white py-4 shadow-lg">
        <div className="flex-shrink-0 ml-10">
          <Image src={logo} alt="Logo" width={50} height={50} className="mt-0"/>
        </div>
        <h1 className="flex-grow text-2xl font-bold text-center">
          {gameData.gameName} Game Result
        </h1>
        <button
          onClick={() => router.push(`/creategame?gameId=${gameId}`)}
          className="ml-auto bg-red-500 font-semibold text-white px-4 py-2 rounded-lg mr-10 w-24"
        >
          Exit
        </button>
      </header>

      {/* Result Card */}
      <div className="bg-gray-200 shadow-lg rounded-lg p-6 mt-6 text-center w-2/3">
        {/* Player 1 vs Player 2 */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <p className="text-3xl font-bold text-yellow-500">{gameData.player1}</p>
          <Image src={vs} alt="VS" width={70} height={100} className="h-12 mt-0" />
          <p className="text-3xl font-bold text-blue-500">{gameData.player2}</p>
        </div>

        {/* Winner Announcement */}
        <p className="text-3xl font-bold text-green-600 mt-4">{winner}</p>

        {/* Total Questions & Marks */}
        <p className="mt-4 text-2xl font-semibold text-gray-700">
          Total Questions: <span className="font-bold">10</span> | Total Marks: {" "}
          <span className="font-bold">25</span>
        </p>

        {/* Player Scores */}
        <p className="mt-4 text-2xl font-semibold text-gray-700">
          Players Obtained Marks:
        </p>
        <p className="text-xl font-semibold">
          <span className="text-yellow-500"> {gameData.player1} </span> <span className="text-gray-700"> Marks: </span> <span className="font-bold text-gray-700"> {gameData.playerOneScore} </span> <br />
          <span className=" text-blue-500"> {gameData.player2} </span> <span className="text-gray-700">Marks:</span> <span className="font-bold text-gray-700"> {gameData.playerTwoScore} </span>
        </p>

        {/* Correct Answers */}
        <div className="mt-5">
          <p className="text-2xl font-semibold text-green-600"> Correct Answers</p>
          <p className="text-gray-700 text-xl font-semibold">
            <span className="text-yellow-500"> {gameData.player1} </span> : {playerOneCorrect} correct answers (Marks: {gameData.playerOneScore})
          </p>
          <p className="text-gray-700 text-xl font-semibold">
            <span className="text-blue-500"> {gameData.player2} </span> : {playerTwoCorrect} correct answers (Marks: {gameData.playerTwoScore})
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600"
            onClick={() => router.push(`/review?gameId=${gameId}`)}
          >
            Check Your Answers
          </button>
          <button
            className="bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600"
            onClick={() => router.push(`/creategame?gameId=${gameId}`)}
          >
            Play More Games
          </button>
        </div>
      </div>
    </div>
  );
}
