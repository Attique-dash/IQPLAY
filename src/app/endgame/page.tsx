"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import cup from "../../../public/images/winngprice.png";
import { FaBars, FaTimes } from "react-icons/fa";
import { useConfetti } from "@/app/hooks/useConfetti";

interface GameData {
  gameName: string;
  playerOne: string;
  playerTwo: string;
}

export default function EndGamePage() {
  useConfetti();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [playerScores, setPlayerScores] = useState<{ [key: string]: number }>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [winner, setWinner] = useState<{ name: string; score: number } | null>(
    null
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [shouldRender, setShouldRender] = useState(true);
  
  
  const router = useRouter();

  useEffect(() => {
    // Get gameId from URL on client side
    if (typeof window !== "undefined") {
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
    setError(null);
    handleEndGame();
    return () => {};
  }, []);


  useEffect(() => {
    if (!userEmail || !gameId) return;

    const fetchGameData = async () => {
      try {
        const gameRef = doc(db, userEmail, gameId);
        const gameSnap = await getDoc(gameRef);

        if (!gameSnap.exists()) {
          await cleanupGameData();
          setShouldRender(false);
          return;
        }

        const scoresRef = doc(db, "playerPoints", gameId);
        const scoresSnap = await getDoc(scoresRef);

        if (!scoresSnap.exists()) {
          await cleanupGameData();
          setShouldRender(false);
          return;
        }

        // Only proceed if we have both game data and scores
        setGameData(gameSnap.data() as GameData);
        const scores = scoresSnap.data() as { [key: string]: number };
        setPlayerScores(scores);

        if (
          scores[gameSnap.data().playerOne] > scores[gameSnap.data().playerTwo]
        ) {
          setWinner({
            name: gameSnap.data().playerOne,
            score: scores[gameSnap.data().playerOne],
          });
        } else if (
          scores[gameSnap.data().playerTwo] > scores[gameSnap.data().playerOne]
        ) {
          setWinner({
            name: gameSnap.data().playerTwo,
            score: scores[gameSnap.data().playerTwo],
          });
        } else {
          setWinner({
            name: "Both Players",
            score: scores[gameSnap.data().playerOne],
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        await cleanupGameData();
        setShouldRender(false);
      }
    };

    fetchGameData();
  }, [userEmail, gameId]);

  const cleanupGameData = async () => {
    if (!userEmail || !gameId) return;

    try {
      await deleteDoc(doc(db, userEmail, gameId)).catch(() => {});
      await deleteDoc(doc(db, "games", gameId)).catch(() => {});
      await deleteDoc(doc(db, "playerPoints", gameId)).catch(() => {});
      toast.success("Game Over! Well Played!")
    } catch (error) {
      console.error("Cleanup error:", error);
    }

    router.push("/dashboard");
  };

  const handleEndGame = async () => {
    await cleanupGameData();
  };
    
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <>
      {/* Header Section */}
      <ToastContainer
        position="top-center"
        className="text-center font-semibold"
      />
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
        <h1 className="flex-grow text-2xl md:text-3xl font-bold text-center">
          {gameData?.gameName}
        </h1>
        <button
          onClick={handleEndGame}
          className={`mr-3 bg-red-500 font-semibold text-white px-4 py-2 rounded-lg w-28 hidden md:block`}
        >
          End Game
        </button>
      </header>
      {/* 🏆 Main Content */}
      <div className="flex flex-col items-center justify-center text-white p-6 relative z-0 min-h-screen">
        {/* Winner Section */}
        <div className="relative w-full max-w-[900px] bg-white rounded-lg shadow-xl p-6 text-center border-4 border-yellow-400">
          <Image
            src={cup}
            alt="Cup"
            className="mx-auto w-full lg:w-[850px] lg:h-[500px] h-96 rounded-2xl transition-transform transform hover:scale-110 duration-300 ease-in-out"
          />
          {winner && (
            <div className="mt-4 px-4 py-3 bg-gray-700 rounded-lg border-2 border-yellow-500">
              <h2 className="text-3xl font-bold text-blue-500">
                {winner.name}
              </h2>
              <p className="text-2xl font-semibold text-white">
                {winner.score} Points
              </p>
            </div>
          )}
        </div>

        {/* Players' Scores */}
        <div className="mt-6 bg-white p-5 w-full max-w-[900px] text-center border-4 border-yellow-400 rounded-lg shadow-lg">
          <p className="text-2xl text-gray-900 font-semibold">
            <span className="font-bold"> Player One: </span>
            {gameData?.playerOne} -
            <span className="text-yellow-400">
              {" "}
              {playerScores[gameData?.playerOne!] || 0} Points
            </span>
          </p>
          <p className="text-2xl text-gray-900 font-semibold mt-2">
            <span className="font-bold"> Player Two: </span>
            {gameData?.playerTwo} -
            <span className="text-blue-600">
              {" "}
              {playerScores[gameData?.playerTwo!] || 0} Points
            </span>
          </p>
        </div>
        <button
          onClick={handleEndGame}
          className={`mr-3 mt-8 bg-red-500 font-semibold text-white px-4 py-2 rounded-lg w-[-webkit-fill-available] md:hidden block`}
        >
          End Game
        </button>

      </div>{" "}
    </>
  );
}
