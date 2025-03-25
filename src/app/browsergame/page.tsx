"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { FaSearch } from "react-icons/fa";
import Image from "next/image";

export default function BrowserGame() {
  const [games, setGames] = useState<any[]>([]);
  const [showBroGame, setShowBroGame] = useState(false);
  const [filteredGames, setFilteredGames] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalGames, setTotalGames] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowBroGame(params.get('showBroGame') === 'true');
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        auth.onAuthStateChanged(async (user) => {
          if (!user || !user.email) {
            router.push("/login");
            return;
          }

          const userEmail = user.email.replace(/\./g, "_");
          const userCollection = collection(db, userEmail);
          const querySnapshot = await getDocs(userCollection);

          if (querySnapshot.empty) {
            setError("No have a browser game data.");
            setGames([]);
            setFilteredGames([]);
          } else {
            const gamesData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setGames(gamesData);
            setFilteredGames(gamesData);
            setError(null);
          }

          // Fetch the number of games from payments collection
          await fetchTotalGames(user.email);
        });
      } catch (err) {
        console.error("Error fetching game data:", err);
        setError("Failed to fetch game data.");
      }
      setLoading(false);
    };

    fetchGames();
  }, [router]);

  const fetchTotalGames = async (email: string) => {
    try {
      const paymentsCollection = collection(db, "payments");
      const paymentsSnapshot = await getDocs(paymentsCollection);
      let total = 0;

      paymentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userEmail === email) {
          const matches = String(data.package).match(/\d+/g);
          if (matches) {
            total += matches.reduce((sum, num) => sum + parseInt(num, 10), 0);
          }
        }
      });

      setTotalGames(total);
      console.log("Total games:", total);
    } catch (err) {
      console.error("Error fetching payment data:", err);
      setTotalGames(0);
    }
  };

  const handlePlayNow = (gameId: string) => {
    if (totalGames > 0) {
      router.push(`/creategame?gameId=${gameId}`);
    } else {
      setError("Please buy the games first.");
    }
  };

  const handleCreateGame = () => {
    // Update URL without page reload
    const params = new URLSearchParams(window.location.search);
    params.set('showBroGame', 'true');
    window.history.pushState({}, '', `?${params.toString()}`);
    setShowBroGame(true);
  };

  const handleBuyGame = () => {
    router.push("/?showCards=true");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredGames(games);
      setError(null);
    } else {
      const filtered = games.filter((game) =>
        game.gameName.toLowerCase().includes(query)
      );
      setFilteredGames(filtered);

      if (filtered.length === 0) {
        setError("No matching game found.");
      } else {
        setError(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-5">
      {/* Search Bar & Total Games Counter */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="absolute ml-[6px] hidden md:block">
          <FaSearch className="text-lg text-blue-500" />
        </div>
        <input
          type="text"
          placeholder="Search your game name..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full md:max-w-md p-2 shadow-lg pl-8 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="bg-gray-400 border-blue-500 border-2 rounded-lg p-3 text-lg sm:text-xl font-semibold text-white text-center w-full md:w-auto">
          You have a total of {totalGames} Games
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Game Cards Grid */}
      {filteredGames.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGames.map((game) => (
            <div key={game.id} className="border p-4 rounded shadow bg-white">
              <h2 className="font-semibold text-2xl text-blue-500 text-center mb-2">
                {game.gameName}
              </h2>

              {/* Game Cards Images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 justify-items-center">
                {game.selectedCards?.map(
                  (
                    card: { image: { src: string }; title: string },
                    index: number
                  ) => (
                    <div key={index} className="text-center">
                      <Image
                        src={card.image.src}
                        alt={card.title}
                        width={80}
                        height={80}
                        className="rounded mt-0"
                      />
                      <p className="text-sm font-semibold bg-slate-400">
                        {card.title}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Play Now Button */}
              <button
                className={`mt-4 text-white text-xl font-semibold px-4 py-2 rounded w-full ${
                  totalGames > 0
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={() => handlePlayNow(game.id)}
                disabled={totalGames === 0}
              >
                {totalGames > 0 ? "Play Now" : "Please Buy the Games"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Buttons Section */}
      <div className="flex flex-col sm:flex-row gap-4 p-6 justify-center items-center">
        <button
          onClick={handleCreateGame}
          className="w-full sm:w-auto px-6 py-3 text-white font-semibold text-lg rounded-2xl shadow-lg bg-gradient-to-r from-gray-500 to-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          Create a new game
        </button>

        <button
          onClick={handleBuyGame}
          className="w-full sm:w-auto px-6 py-3 text-white font-semibold text-lg rounded-2xl shadow-lg bg-gradient-to-r from-blue-500 to-gray-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          Buy a game
        </button>
      </div>
    </div>
  );
}
