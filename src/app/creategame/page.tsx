"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import vs from "../../../public/images/bgvs.png";
import logo from "../../../public/images/logo.png";
import { FaBars } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";

interface GameData {
  id: string;
  gameName: string;
  playerOne: string;
  playerTwo: string;
  selectedCards?: { image: string; title: string }[];
}

export default function UserGame() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<{
    [key: number]: number | null;
  }>({});
  const [playerScores, setPlayerScores] = useState<{
    [key: string]: number | null;
  }>({}); // State to hold player scores

  const router = useRouter();
  const pointsList = [100, 250, 450, 600];
  
  useEffect(() => {
    // Get gameId from URL on client side
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setGameId(params.get("gameId"));
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || !user.email) {
        router.push("/login");
      } else {
        setUserEmail(user.email.replace(/\./g, "_"));
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!userEmail || !gameId) return;
  
    const fetchGameData = async () => {
      try {
        const gameRef = doc(db, userEmail, gameId);
        const gameSnap = await getDoc(gameRef);
  
        if (!gameSnap.exists()) {
          setError("Game not found.");
          setLoading(false);
          return;
        }
  
        setGameData({ id: gameSnap.id, ...gameSnap.data() } as GameData);
      } catch (err) {
        setError("Failed to fetch game data.");
      }
      setLoading(false);
    };
  
    fetchGameData();
  }, [userEmail, gameId]);
  
  useEffect(() => {
    if (!gameId || !gameData) return;
  
    const fetchScores = async () => {
      try {
        const scoresRef = doc(db, "playerPoints", gameId);
        const scoresSnap = await getDoc(scoresRef);
  
        if (scoresSnap.exists()) {
          const scoresData = scoresSnap.data();
          setPlayerScores({
            playerOne: scoresData?.[gameData.playerOne] || 0,
            playerTwo: scoresData?.[gameData.playerTwo] || 0,
          });
        } else {
          // Set default scores if no scores found
          setPlayerScores({
            playerOne: 0,
            playerTwo: 0,
          });
        }
      } catch (err) {
        setError("Failed to fetch scores.");
      }
    };
  
    fetchScores();
  }, [gameId, gameData]);
  
  const handlePointSelection = (cardIndex: number, point: number) => {
    setSelectedPoints((prev) => ({
      ...prev,
      [cardIndex]: prev[cardIndex] === point ? null : point,
    }));
  };

  const handlePlay = (title: string, point: number) => {
    if (!gameData) return;
    router.push(
      `/question?title=${title}&difficulty=${point}&gameId=${gameId}&playerOne=${gameData.playerOne}&playerTwo=${gameData.playerTwo}`
    );
  };

const ExitGame = () => {
    router.push("/dashboard");
};

const EndGame = () => {
    router.push(`/endgame?gameId=${gameId}`);
};

if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg font-semibold">Loading...</p>
    </div>
  );
}
if (error) return <p>{error}</p>;

  return (
    <>
{gameData && (
  <div className="h-[5.5rem] text-white bg-gray-800 flex items-center justify-between px-4 relative">
    {/* Left Section (Logo) */}
    <div className="flex items-center w-full">
      {/* Logo */}
      <Image src={logo} alt="logo" height={50} width={50} className="mt-0" />
    </div>

    {/* Center Section (Game Name) */}
    <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl sm:text-2xl font-bold">
      {gameData.gameName}
    </h1>

    {/* Right Section (Menu Icon & Buttons) */}
    <div className="flex items-center space-x-4">
      {/* Menu Icon (Small Screens) */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="md:hidden ml-4 text-3xl focus:outline-none mr-5" // Increased size
      >
            {isSidebarOpen ? <RxCross2 /> : <FaBars />}
      </button>

      {/* Hidden on Small Screens */}
      <div className="hidden md:flex space-x-4">
        <button onClick={EndGame} className="bg-gray-600 sm:w-32 md:w-36 h-10 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded">
          End of Game
        </button>
        <button onClick={ExitGame} className="bg-red-600 h-10 w-20 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded">
          Exit
        </button>
      </div>
    </div>

    {/* Sidebar (Small Screens) */}
    <div
      className={`fixed top-0 left-0 h-full w-52 sm:w-60 bg-gray-900 shadow-lg flex flex-col items-center transition-transform duration-300 ${
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
              </div>

      {/* Sidebar Buttons */}
      <button onClick={EndGame} className="w-[85%] rounded-lg mt-3 py-3 text-white bg-gray-700 ">
        End Game
      </button>
      <button onClick={ExitGame} className="w-[85%] mt-3 py-3 rounded-lg text-white bg-red-700">
        Exit
      </button>
      </div>
    </div>
  </div>
)}      {/* Player Info Section */}
      <div className="p-4">
        {gameData ? (
          <div key={gameData.id} className="border p-4 mb-4 rounded shadow bg-white">
            {/* Player Layout Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-3 justify-items-center items-center text-center gap-4">
              {/* Player One */}
              <div className="flex flex-col items-center">
                <p className="text-lg sm:text-xl font-semibold">
                  Player One: <span className="text-yellow-500 ml-3">{gameData.playerOne}</span>
                </p>
                <p className="text-sm sm:text-lg font-semibold text-gray-700">
                  Score: {playerScores.playerOne !== null ? playerScores.playerOne : "Loading..."}
                </p>
              </div>

              {/* VS Image (Centered on Small Screens) */}
              <Image src={vs} alt="vs" height={70} width={70} className="mt-2 sm:mt-0" />

              {/* Player Two */}
              <div className="flex flex-col items-center">
                <p className="text-lg sm:text-xl font-semibold">
                  Player Two: <span className="text-blue-600 ml-3">{gameData.playerTwo}</span>
                </p>
                <p className="text-sm sm:text-lg font-semibold text-gray-700">
                  Score: {playerScores.playerTwo !== null ? playerScores.playerTwo : "Loading..."}
                </p>
              </div>
            </div>

            {/* Selected Games Section */}
            <h3 className="mt-4 text-lg font-semibold text-blue-500 text-center">Selected Games:</h3>

            {/* Game Cards Grid Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {gameData.selectedCards?.map((card, index) => (
                <div key={index} className="border p-4 rounded-lg shadow-lg flex flex-col items-center bg-gray-200">
                  <Image src={card.image} alt={card.title} width={150} height={150} className="rounded-lg mt-0" />
                  <p className="text-base font-semibold text-blue-500 mt-2">{card.title}</p>

                  {/* Points Selection */}
                  <div className="flex justify-between w-full mt-2 px-2 sm:px-4">
                    {pointsList.map((point) => (
                      <button
                        key={point}
                        className={`md:px-3 px-2 py-1 rounded-lg sm:text-sm text-xs font-bold ${
                          selectedPoints[index] === point
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-300 text-gray-700"
                        }`}
                        onClick={() => handlePointSelection(index, point)}
                      >
                        {point}
                      </button>
                    ))}
                  </div>

                  {/* Play Button */}
                  <button
                    className={`w-full mt-3 px-4 py-2 text-white font-semibold rounded-lg shadow-lg ${
                      selectedPoints[index] ? "bg-blue-400 hover:bg-blue-500" : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!selectedPoints[index]}
                    onClick={() => handlePlay(card.title, selectedPoints[index] as number)}
                  >
                    Play
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No game found.</p>
        )}
      </div>
    </>
  );
}
