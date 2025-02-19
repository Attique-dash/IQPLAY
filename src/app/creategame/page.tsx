"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import vs from "../../../public/images/bgvs.png";
import logo from "../../../public/images/logo.png";

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
  const [selectedPoints, setSelectedPoints] = useState<{
    [key: number]: number | null;
  }>({});
  const [playerScores, setPlayerScores] = useState<{
    [key: string]: number | null;
  }>({}); // State to hold player scores

  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");
  const pointsList = [100, 250, 450, 600];

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
        // Access the playerPoints collection where scores are stored
        const scoresRef = doc(db, "playerPoints", gameId);
        const scoresSnap = await getDoc(scoresRef);

        if (scoresSnap.exists()) {
          const scoresData = scoresSnap.data();
          // Get the score for Player One and Player Two
          setPlayerScores({
            playerOne: scoresData?.[gameData.playerOne] || 0,
            playerTwo: scoresData?.[gameData.playerTwo] || 0,
          });
        } else {
          setError("No scores found.");
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
    router.push(`/question?title=${title}&difficulty=${point}&gameId=${gameId}&playerOne=${gameData?.playerOne}&playerTwo=${gameData?.playerTwo}`);
};

const ExitGame = () => {
    router.push("/dashboard");
};

const EndGame = () => {
    router.push(`/endgame?gameId=${gameId}`);
};

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      {gameData && (
        <div className="h-[5.5rem] text-white bg-gray-800 flex items-center justify-between px-4">
          <Image
            src={logo}
            alt="logo"
            height={50}
            width={50}
            className="mt-0"
          />

          <h1 className="text-2xl font-bold text-center flex-grow mx-4">
            {gameData.gameName}
          </h1>

          <div className="flex space-x-4">
            <button onClick={EndGame} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded">
              End of Game
            </button>
            <button onClick={ExitGame} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded">
              Exit
            </button>
          </div>
        </div>
      )}
      <div className="p-4">
        {gameData ? (
          <div
            key={gameData.id}
            className="border p-4 mb-4 rounded shadow bg-white"
          >
            <div className="grid grid-cols-3 justify-items-center items-center text-center gap-2">
              <div className="flex flex-col items-center">
              <p className="text-xl font-semibold">
                  Player One:{" "}
                  <span className="text-yellow-500 ml-3">{gameData.playerOne}</span>
                </p>
                <p className="text-lg font-semibold text-gray-700">
                  Score: {playerScores.playerOne !== null ? playerScores.playerOne : "Loading..."}
                </p>
              </div>

              <Image
                src={vs}
                alt="vs"
                height={70}
                width={70}
                className="mt-0"
              />

              <div className="flex flex-col items-center">
              <p className="text-xl font-semibold">
                  Player Two:{" "}
                  <span className="text-blue-600 ml-3">{gameData.playerTwo}</span>
                </p>
                <p className="text-lg font-semibold text-gray-700">
                  Score: {playerScores.playerTwo !== null ? playerScores.playerTwo : "Loading..."}
                </p>
              </div>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-blue-500 text-center">
              Selected Games:
            </h3>
            <div className="grid grid-cols-3 gap-6 mt-4">
              {gameData.selectedCards?.map((card, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg shadow-lg flex flex-col items-center bg-gray-200"
                >
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={150}
                    height={150}
                    className="rounded-lg mt-0"
                  />
                  <p className="text-base font-semibold text-blue-500 mt-2">
                    {card.title}
                  </p>

                  <div className="flex justify-between w-full mt-2 px-4">
                    {pointsList.map((point) => (
                      <button
                        key={point}
                        className={`px-3 py-1 rounded-lg text-sm font-bold ${
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

                  <button
                    className={`w-full mt-3 px-4 py-2 text-white font-semibold rounded-lg shadow-lg ${
                      selectedPoints[index]
                        ? "bg-blue-400 hover:bg-blue-500"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!selectedPoints[index]}
                    onClick={
                      () =>
                        handlePlay(card.title, selectedPoints[index] as number) 
                    }
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
