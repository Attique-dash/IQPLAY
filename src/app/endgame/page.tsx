"use client";
import { useEffect, useState } from "react";
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
import winpla from "../../../public/images/wining.png";
import logo from "../../../public/images/logo.png";

interface GameData {
  gameName: string;
  playerOne: string;
  playerTwo: string;
}

export default function EndGamePage() {
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

  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");

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
          `7. No matching documents found in 'payments' collection for user: "${correctEmail}"`
        );
        return;
      }

      let docToUpdate: DocumentReference | null = null;
      let currentPackageValue: string | undefined;

      paymentsSnap.forEach((doc) => {
        const data = doc.data();
        console.log("8. Found payment document:", data);
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
          `9. No valid package data found for user: "${correctEmail}"`
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

            console.log(
              "11. Updating package from",
              currentPackageValue,
              "to",
              updatedPackageValue
            );

            await updateDoc(docToUpdate, {
              package: updatedPackageValue,
            });

            console.log(
              "12. After update - Package Value:",
              updatedPackageValue
            );
          } else {
            console.log(
              "13. Package is already at minimum (0 Games). No update performed."
            );
          }
        } else {
          console.error("14. Error: No numeric value found in package.");
        }
      } else {
        console.error("15. Error: currentPackageValue is not a valid string.");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error ending game:", error);
      setError("Failed to end game.");
    }
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
<>
  {/* Header Section */}
  <header className="w-full h-[5.5rem] flex items-center bg-gray-800 text-white py-4 shadow-lg">
    <div className="flex-shrink-0 ml-10">
      <Image src={logo} alt="Logo" width={50} height={50} className="mt-0" />
    </div>
    <h1 className="flex-grow text-3xl font-bold text-center">
      {gameData?.gameName}
    </h1>
    <button
      onClick={handleEndGame}
      className="ml-auto bg-red-500 font-semibold text-white px-4 py-2 rounded-lg mr-10 w-28"
    >
      End Game
    </button>
  </header>

  {/* Main Content */}
  <div className="flex flex-col items-center justify-center bg-gray-100 text-white p-6">
    {/* Video Container */}
    <div className="relative w-[900px] h-[500px] flex justify-center items-center">
      {/* Video */}
      <video
        src="/video/winning.mp4"
        loop
        muted
        autoPlay
        className="w-full h-full object-cover rounded-lg shadow-lg"
      />

      {/* Winner Image with Name and Points */}
      {winner && (
        <div className="absolute top-[-4rem] right-[-13.75rem] flex flex-col items-center">
          <Image
            src={winpla}
            alt="Winner Player"
            width={600} 
            height={450} 
            className="rounded-lg"
          />
          <div className="absolute bottom-40 px-4 py-2 rounded-lg text-center">
            <h2 className="text-3xl font-semibold text-blue-500"> {winner.name} </h2>
            <p className="text-2xl font-semibold text-white">{winner.score} Points</p>
          </div>
        </div>
      )}
    </div>

    {/* Players' Scores Below the Video */}
    <div className="mt-6 text-center bg-white p-5 w-8/12 rounded-lg shadow-lg">
      <p className="text-3xl text-gray-900 font-semibold">
        Player One: {gameData?.playerOne} -{" "}
        <span className="text-yellow-400">
          {playerScores[gameData?.playerOne!] || 0} Points
        </span>
      </p>
      <p className="text-3xl text-gray-900 font-semibold">
        Player Two: {gameData?.playerTwo} -{" "}
        <span className="text-blue-600">
          {playerScores[gameData?.playerTwo!] || 0} Points
        </span>
      </p>
    </div>
  </div>
</>
  );
}
