"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import vs from "../../../public/images/bgvs.png";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Result() {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage sidebar visibility
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [gameData, setGameData] = useState<any>(null);
  const [playerOneCorrect, setPlayerOneCorrect] = useState(0);
  const [playerTwoCorrect, setPlayerTwoCorrect] = useState(0);
  const [winner, setWinner] = useState<string>("");
  const [gameId, setGameId] = useState<string | null>(null);


  useEffect(() => {
    // Get gameId from URL using URLSearchParams
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("gameId");
      setGameId(id);
    }
  }, []);

  
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

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 500); // Adjust breakpoint as needed
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar state
  };

  if (!gameData){
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">Loading result...</p>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <header className="w-full h-[5.5rem] flex items-center bg-gray-800 text-white py-4 shadow-lg relative">
        <div className="flex-shrink-0 ml-10">
          <Image src={logo} alt="Logo" width={50} height={50} className="mt-0"/>
        </div>
        <h1 className="flex-grow text-2xl md:text-3xl font-bold text-center">
        {isSmallScreen ? "Result" : `${gameData.gameName} Game Result`}
        </h1>
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
                <p className="sm:text-3xl text-2xl font-semibold ml-5">IQPLAY</p>
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

      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 p-4">
      {/* Result Card */}
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-4xl text-center transform transition-all duration-300 hover:scale-105">
        {/* Player 1 vs Player 2 */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
          <p className="text-2xl sm:text-3xl font-bold text-yellow-500">{gameData.player1}</p>
          <Image src={vs} alt="VS" width={80} height={100} className="h-16 sm:h-20 mt-0" />
          <p className="text-2xl sm:text-3xl font-bold text-blue-500">{gameData.player2}</p>
        </div>

        {/* Winner Announcement */}
        <p className="text-4xl sm:text-3xl font-bold text-green-600 mb-8 animate-bounce">
          {winner}
        </p>

        {/* Total Questions & Marks */}
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <p className="text-xl sm:text-2xl font-semibold text-gray-800">
            Total Questions: <span className="font-bold text-gray-900">10</span> | Total Marks:{" "}
            <span className="font-bold text-gray-900">25</span>
          </p>
        </div>

        {/* Player Scores */}
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <p className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            Players Obtained Marks:
          </p>
          <div className="space-y-4">
            <p className="text-xl sm:text-xl font-semibold">
              <span className="text-yellow-500">{gameData.player1}</span>{" "}
              <span className="text-gray-700">Marks:</span>{" "}
              <span className="font-bold text-gray-900">{gameData.playerOneScore}</span>
            </p>
            <p className="text-xl sm:text-xl font-semibold">
              <span className="text-blue-500">{gameData.player2}</span>{" "}
              <span className="text-gray-700">Marks:</span>{" "}
              <span className="font-bold text-gray-900">{gameData.playerTwoScore}</span>
            </p>
          </div>
        </div>

        {/* Correct Answers */}
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <p className="text-xl sm:text-3xl font-semibold text-green-600 mb-4">
            Correct Answers
          </p>
          <div className="space-y-4">
            <p className="text-xl sm:text-xl font-semibold text-gray-700">
              <span className="text-yellow-500">{gameData.player1}</span> : {playerOneCorrect} correct answers (Marks:{" "}
              {gameData.playerOneScore})
            </p>
            <p className="text-xl sm:text-xl font-semibold text-gray-700">
              <span className="text-blue-500">{gameData.player2}</span> : {playerTwoCorrect} correct answers (Marks:{" "}
              {gameData.playerTwoScore})
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-8">
          <button
            className="bg-red-500 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
            onClick={() => router.push(`/review?gameId=${gameId}`)}
          >
            Check Your Answers
          </button>
          <button
            className="bg-green-500 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
            onClick={() => router.push(`/creategame?gameId=${gameId}`)}
          >
            Play More Games
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
