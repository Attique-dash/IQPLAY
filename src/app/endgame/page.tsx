"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  DocumentReference,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import Confetti from "react-canvas-confetti";
import logo from "../../../public/images/logo.png";
import cup from "../../../public/images/winngprice.png";
import { FaBars, FaTimes } from "react-icons/fa";

interface GameData {
  gameName: string;
  playerOne: string;
  playerTwo: string;
}

type ConfettiInstance = (opts?: object) => void;

export default function EndGamePage() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [playerScores, setPlayerScores] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [winner, setWinner] = useState<{ name: string; score: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");
  const confettiRef = useRef<ConfettiInstance | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || !user.email) {
        router.push("/login");
      } else {
        setUserEmail(user.email.replace(/\./g, "_"));
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fireConfetti = () => {
    if (!confettiRef.current) return;

    // Fireworks Preset
    confettiRef.current({
      particleCount: 150, // Increase particle count for more confetti
      spread: 160, // Wider spread
      startVelocity: 60, // Faster start velocity
      origin: { y: 0.6 }, // Start from slightly above the bottom
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fireConfetti();
    }, 1000); // Fire confetti every 1 second

    return () => clearInterval(interval);
  }, []);

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

        setGameData(gameSnap.data() as GameData);

        const scoresRef = doc(db, "playerPoints", gameId);
        const scoresSnap = await getDoc(scoresRef);

        if (scoresSnap.exists()) {
          const scores = scoresSnap.data() as { [key: string]: number };
          setPlayerScores(scores);

          if (
            scores[gameSnap.data().playerOne] >
            scores[gameSnap.data().playerTwo]
          ) {
            setWinner({
              name: gameSnap.data().playerOne,
              score: scores[gameSnap.data().playerOne],
            });
          } else if (
            scores[gameSnap.data().playerTwo] >
            scores[gameSnap.data().playerOne]
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
        } else {
          setError("No scores found.");
        }
      } catch (err) {
        setError("Failed to fetch data.");
      }
      setLoading(false);
    };

    fetchGameData();
  }, [userEmail, gameId]);

  const handleEndGame = async () => {
    if (!userEmail || !gameId) return;
    try {
      await deleteDoc(doc(db, userEmail, gameId));
      await deleteDoc(doc(db, "games", gameId));
      await deleteDoc(doc(db, "playerPoints", gameId));

      const correctEmail = userEmail.replace(/_/g, ".");

      const paymentsRef = collection(db, "payments");
      const paymentsQuery = query(
        paymentsRef,
        where("userEmail", "==", correctEmail)
      );
      const paymentsSnap = await getDocs(paymentsQuery);

      if (paymentsSnap.empty) {
        console.log(
          `No matching documents found in 'payments' collection for user: "${correctEmail}"`
        );
        return;
      }

      let docToUpdate: DocumentReference | null = null;
      let currentPackageValue: string | undefined;

      paymentsSnap.forEach((doc) => {
        const data = doc.data();
        if (
          data.userEmail === correctEmail &&
          typeof data.package === "string"
        ) {
          currentPackageValue = data.package;
          docToUpdate = doc.ref;
        }
      });

      if (!docToUpdate || !currentPackageValue) {
        console.log(
          `No valid package data found for user: "${correctEmail}"`
        );
        return;
      }

      if (typeof currentPackageValue === "string") {
        const matches: RegExpMatchArray | null =
          currentPackageValue.match(/\d+/);

        if (matches && matches[0]) {
          let packageNumber = parseInt(matches[0], 10);

          if (packageNumber > 0) {
            packageNumber--;

            const updatedPackageValue = `${packageNumber} Games`;

            await updateDoc(docToUpdate, {
              package: updatedPackageValue,
            });
          }
        }
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error ending game:", error);
      setError("Failed to end game.");
    }
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
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden ml-4 text-3xl focus:outline-none mr-5"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div
          className={`fixed top-0 left-0 h-full w-60 sm:w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
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
            <button
              onClick={handleEndGame}
              className="w-full bg-red-500 font-semibold text-white px-4 py-2 rounded-lg"
            >
              End Game
            </button>
          </div>
        </div>
        <button
          onClick={handleEndGame}
          className={`mr-3 bg-red-500 font-semibold text-white px-4 py-2 rounded-lg w-28 hidden md:block`}
        >
          End Game
        </button>
      </header>

      {/* 🎆 Full-Page Confetti Component */}
      <Confetti
        onInit={({ confetti }) => {
          confettiRef.current = confetti; // Assign the `confetti` function to `confettiRef.current`
        }}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-10" // Add z-10 to ensure confetti is above other content
      />

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
              <h2 className="text-3xl font-bold text-blue-500">{winner.name}</h2>
              <p className="text-2xl font-semibold text-white">{winner.score} Points</p>
            </div>
          )}
        </div>

        {/* Players' Scores */}
        <div className="mt-6 bg-white p-5 w-full max-w-[900px] text-center border-4 border-yellow-400 rounded-lg shadow-lg">
          <p className="text-2xl text-gray-900 font-semibold">
            <span className="font-bold"> Player One: </span>{gameData?.playerOne} -
            <span className="text-yellow-400"> {playerScores[gameData?.playerOne!] || 0} Points</span>
          </p>
          <p className="text-2xl text-gray-900 font-semibold mt-2">
            <span className="font-bold"> Player Two: </span>{gameData?.playerTwo} -
            <span className="text-blue-600"> {playerScores[gameData?.playerTwo!] || 0} Points</span>
          </p>
        </div>
      </div>    </>
  );
}