"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
  updateDoc,
  DocumentReference,
  deleteDoc,
} from "firebase/firestore";
import Header from "@/components/header";
import Image from "next/image";
import bgvs from "../../../public/images/bgvs.png";
import ftvs from "../../../public/images/ftvs.jpg";
import Footer from "@/components/footer";
import circ from "../../../public/images/Cricket.jpg";
import foot from "../../../public/images/Football.jpg";
import bask from "../../../public/images/Basketball.jpeg";
import tenn from "../../../public/images/Tennis.jpg";
import hock from "../../../public/images/Hockey.jpg";
import boxi from "../../../public/images/Boxing.jpg";
import cycl from "../../../public/images/Cycling.jpg";
import swim from "../../../public/images/Swimming.jpg";
import wres from "../../../public/images/Wrestling.jpg";
import raci from "../../../public/images/Racing.jpg";
import ludo from "../../../public/images/Ludo.jpg";
import subw from "../../../public/images/Subway Surfers.jpg";
import pubg from "../../../public/images/PUBG Mobile.jpg";
import ches from "../../../public/images/Chess.jpeg";
import carr from "../../../public/images/Carrom Board.jpg";
import tict from "../../../public/images/Tic-tac-toe.jpg";
import cube from "../../../public/images/rubik's cube.jpg";
import skat from "../../../public/images/Skating.jpg";
import base from "../../../public/images/Baseball.jpg";
import snoo from "../../../public/images/Snooker.jpg";
import BrowserGame from "../browsergame/page";

export default function Dashboard() {
  const router = useRouter();

  const [selectedCards, setSelectedCards] = useState<
    { title: string; image: any }[]
  >([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBroGame, setShowBroGame] = useState(true);
  const [gameData, setGameData] = useState({
    gameName: "",
    playerOne: "",
    playerTwo: "",
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleShowDashboard = () => {
    setShowBroGame(false); // This will show the dashboard content
  };

  const cards = [
    { image: circ, title: "Cricket" },
    { image: foot, title: "Football" },
    { image: bask, title: "Basketball" },
    { image: tenn, title: "Tennis" },
    { image: hock, title: "Hockey" },
    { image: boxi, title: "Boxing" },
    { image: cycl, title: "Cycling" },
    { image: swim, title: "Swimming" },
    { image: wres, title: "Wrestling" },
    { image: raci, title: "Racing" },
    { image: ludo, title: "Ludo" },
    { image: subw, title: "Subway Surfers" },
    { image: pubg, title: "PUBG Mobile" },
    { image: ches, title: "Chess" },
    { image: carr, title: "Carrom Board" },
    { image: tict, title: "Tic-tac-toe" },
    { image: cube, title: "rubik's cube" },
    { image: skat, title: "Skating" },
    { image: base, title: "Baseball" },
    { image: snoo, title: "Snooker" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameData({ ...gameData, [e.target.name]: e.target.value });
  };

  const handleSelectCard = (selectedCard: { title: string; image: any }) => {
    setSelectedCards((prev) => {
      const exists = prev.some((card) => card.title === selectedCard.title);

      if (exists) {
        return prev.filter((card) => card.title !== selectedCard.title);
      } else if (prev.length < 6) {
        return [...prev, selectedCard];
      }

      return prev;
    });
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setError(null);

    // Validate all fields with specific error messages
    if (!gameData.gameName.trim()) {
      toast.error("Please enter your game name");
      return;
    }

    if (!gameData.playerOne.trim()) {
      toast.error("Please enter first player name");
      return;
    }

    if (!gameData.playerTwo.trim()) {
      toast.error("Please enter second player name");
      return;
    }

    if (selectedCards.length !== 6) {
      toast.error(
        `Please select exactly 6 categories (${selectedCards.length} selected)`
      );
      return;
    }

    // Check if userEmail exists
    if (!userEmail) {
      toast.error("User authentication error. Please login again.");
      return;
    }

    // Proceed with game creation if all validations pass
    try {
      const sanitizedEmail = userEmail.replace(/\./g, "_");
      const userGameCollection = collection(db, sanitizedEmail);

      // Check for existing game with same name
      const querySnapshot = await getDocs(userGameCollection);
      const existingGame = querySnapshot.docs.some(
        (doc) =>
          doc.data().gameName.toLowerCase() === gameData.gameName.toLowerCase()
      );

      if (existingGame) {
        toast.error(
          "Game name already exists. Please choose a different name."
        );
        return;
      }

      // Check payment status for ALL game creations
      const correctEmail = userEmail.replace(/_/g, ".");
      const paymentsRef = collection(db, "payments");
      const paymentsQuery = query(
        paymentsRef,
        where("userEmail", "==", correctEmail)
      );
      const paymentsSnap = await getDocs(paymentsQuery);

      let hasValidPackage = false;
      let docToUpdate: DocumentReference | null = null;
      let currentPackageValue: string | null = null;
      let docsToDelete: DocumentReference[] = [];

      if (!paymentsSnap.empty) {
        // First pass: Find all invalid packages (0 games) to delete
        for (const doc of paymentsSnap.docs) {
          const data = doc.data();
          if (
            data.userEmail === correctEmail &&
            typeof data.package === "string"
          ) {
            const numberMatch = data.package.match(/\d+/);
            if (numberMatch) {
              const packageNumber = parseInt(numberMatch[0], 10);
              if (packageNumber === 0) {
                docsToDelete.push(doc.ref);
              }
            }
          }
        }

        // Delete all invalid packages first
        if (docsToDelete.length > 0) {
          await Promise.all(docsToDelete.map((doc) => deleteDoc(doc)));
        }

        // Second pass: Check remaining valid packages
        const updatedPaymentsSnap = await getDocs(paymentsQuery);
        for (const doc of updatedPaymentsSnap.docs) {
          const data = doc.data();
          if (
            data.userEmail === correctEmail &&
            typeof data.package === "string"
          ) {
            const numberMatch = data.package.match(/\d+/);
            if (numberMatch) {
              const packageNumber = parseInt(numberMatch[0], 10);
              if (packageNumber > 0) {
                docToUpdate = doc.ref;
                currentPackageValue = data.package;
                hasValidPackage = true;
                break;
              }
            }
          }
        }
      }

      // Only allow game creation if valid package exists
      if (!hasValidPackage) {
        toast.error("Please buy a game package to continue creating");
        router.push("/?showCards=true");
        return;
      }

      // Create the game document (only reaches here if hasValidPackage)
      const docRef = await addDoc(userGameCollection, {
        ...gameData,
        selectedCards,
        createdAt: Timestamp.now(),
      });

      // Update package count (we know hasValidPackage is true here)
      if (docToUpdate && currentPackageValue) {
        const numberMatch = currentPackageValue.match(/\d+/);
        if (numberMatch) {
          let packageNumber = parseInt(numberMatch[0], 10);
          packageNumber--;
          const updatedPackageValue = `${packageNumber} Games`;

          await updateDoc(docToUpdate, {
            package: updatedPackageValue,
          });
        }
      }

      toast.success("Game created successfully!");
      router.push(`/creategame?gameId=${docRef.id}`);
    } catch (error) {
      console.error("Error saving game info:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <ToastContainer
        position="top-center"
        className="text-center font-semibold"
      />
      <div>
        {showBroGame ? (
          <div className="container mx-auto p-4 mt-5">
            <BrowserGame />
          </div>
        ) : (
          <>
            <div className="mt-10 flex flex-col items-center px-4 sm:px-6 lg:px-8">
              {/* Heading */}
              <h1 className="font-bold text-xl sm:text-2xl px-4 py-3 rounded-lg text-center">
                <span className="text-blue-500 text-lg sm:text-xl px-2 border-2 p-2 border-x-0 border-yellow-500">
                  Specify the information of the two players.
                </span>
              </h1>

              {/* Game Name Input */}
              <div className="mt-10 w-full max-w-xl">
                <h2 className="text-yellow-500 font-semibold text-lg sm:text-xl mb-2">
                  Your Game
                </h2>
                <div className="relative mb-5">
                  <input
                    type="text"
                    name="gameName"
                    id="gameName"
                    required
                    value={gameData.gameName}
                    onChange={handleChange}
                    className="peer w-full px-4 py-3 text-base sm:text-lg border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition duration-300"
                  />
                  <label
                    htmlFor="gameName"
                    className={`absolute left-4 top-3 text-base sm:text-lg px-1 transition-all duration-200 bg-white
        ${
          gameData.gameName
            ? "top-[-10px] text-sm text-blue-500 "
            : "text-gray-500"
        }`}
                  >
                    Enter Name
                  </label>
                </div>
              </div>

              {/* Players Section */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-6 w-full max-w-3xl">
                {/* First Player Input */}
                <div className="relative w-full max-w-xs sm:max-w-md">
                  <h2 className="absolute bottom-16 mb-2 text-yellow-500 font-semibold text-lg sm:text-xl">
                    First Player
                  </h2>
                  <input
                    type="text"
                    name="playerOne"
                    id="playerOne"
                    required
                    value={gameData.playerOne}
                    onChange={handleChange}
                    className="peer w-full px-4 py-3 text-base sm:text-lg border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition duration-300"
                  />
                  <label
                    htmlFor="playerOne"
                    className={`absolute left-4 top-3 text-base sm:text-lg px-1 transition-all duration-200 bg-white
        ${
          gameData.playerOne
            ? "top-[-10px] text-sm text-blue-500 "
            : "text-gray-500"
        }`}
                  >
                    Enter Name
                  </label>
                </div>

                {/* VS Image */}
                <div
                  className="relative w-16 h-16 sm:w-36 sm:h-18 flex items-center justify-center rounded-full shadow-lg bg-cover bg-center mb-5 sm:mb-0"
                  style={{ backgroundImage: `url(${ftvs.src})` }}
                >
                  <Image
                    src={bgvs}
                    alt="VS Icon"
                    width={100}
                    height={100}
                    className="rounded-full mt-0 z-10"
                  />
                </div>

                {/* Second Player Input */}
                <div className="relative w-full max-w-xs sm:max-w-md">
                  <h2 className="absolute bottom-16 mb-2 text-yellow-500 font-semibold text-lg sm:text-xl">
                    Second Player
                  </h2>
                  <input
                    type="text"
                    name="playerTwo"
                    id="playerTwo"
                    required
                    value={gameData.playerTwo}
                    onChange={handleChange}
                    className="peer w-full px-4 py-3 text-base sm:text-lg border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition duration-300"
                  />
                  <label
                    htmlFor="playerTwo"
                    className={`absolute left-4 top-3 text-base sm:text-lg px-1 transition-all duration-200 bg-white
        ${
          gameData.playerTwo
            ? "top-[-10px] text-sm text-blue-500 "
            : "text-gray-500"
        }`}
                  >
                    Enter Name
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-10 ">
              <div className="font-bold text-2xl px-6 py-3 text-center rounded-lg ">
                <span className="text-blue-500 text-2xl px-2 border-2 p-2 border-x-0 border-yellow-500">
                  Choose 6 categories
                </span>
              </div>
              <div className="mt-3">
                <h2 className="md:px-10 px-5 mt-5 text-center font-normal text-2xl text-gray-700">
                  3 categories for first player and 3 categories for second
                  player , for a total of 6 categories with 36 different
                  questions. Choose the categories carefully to maximize your
                  chances of winning. <br />
                  <span className="font-semibold text-yellow-500 text-3xl">
                    Temporary categories
                  </span>{" "}
                  <br />A limited number of games are available from them!
                </h2>
              </div>
            </div>
            <div className="min-h-screen bg-gray-100 py-10">
              <div className="container mx-auto px-4">
                <div className="font-bold text-2xl px-6 py-3 text-center rounded-lg ">
                  <span className="text-blue-500 text-2xl px-2 border-2 p-2 border-x-0 border-yellow-500">
                    Selete Game
                  </span>
                </div>{" "}
                <div className="grid h-full cursor-pointer mt-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {cards.map((card, index) => {
                    const isSelected = selectedCards.some(
                      (selected) => selected.title === card.title
                    );
                    const isDisabled = selectedCards.length >= 6 && !isSelected;

                    return (
                      <div
                        key={index}
                        className={`bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl ${
                          isDisabled ? "opacity-50 cursor-not-allowed" : ""
                        } ${isSelected ? "border-4 border-yellow-500" : ""}`}
                        onClick={() => handleSelectCard(card)}
                      >
                        <img
                          src={card.image.src}
                          alt={card.title}
                          className="w-full h-56 object-cover mt-0"
                        />
                        <div className="p-4 text-center">
                          <h2 className="text-xl text-blue-500 font-semibold mb-2">
                            {card.title}
                          </h2>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-[3.25rem] text-center">
                <button
                  onClick={handleSubmit}
                  className="text-white text-lg font-semibold shadow-xl w-56 h-12 bg-blue-600 opacity-90 hover:opacity-100 transition-opacity p-[2px] hover:bg-blue-700 px-3 py-1 rounded-md bg-gradient-to-t from-blue-600 to-blue-500 active:scale-95"
                >
                  Start playing now
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
