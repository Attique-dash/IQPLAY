"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import Header from "@/components/header";
import Image from "next/image";
import bgvs from "../../../public/images/bgvs.png";
import ftvs from "../../../public/images/ftvs.jpeg";
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
  const [brogame, setBroGame] = useState(false);
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
    if (
      !gameData.gameName ||
      !gameData.playerOne ||
      !gameData.playerTwo ||
      selectedCards.length !== 6
    ) {
      toast.error("Please enter game and player names.");
      return;
    }

    if (!userEmail) {
      toast.error("User email is not available.");
      return;
    }

    try {
      const sanitizedEmail = userEmail.replace(/\./g, "_");
      const userGameCollection = collection(db, sanitizedEmail);
      console.log("Fetching collection for user:", sanitizedEmail);

      const querySnapshot = await getDocs(userGameCollection);
      console.log(
        "Fetched Docs:",
        querySnapshot.docs.map((doc) => doc.data())
      );

      const existingGame = querySnapshot.docs.some(
        (doc) =>
          doc.data().gameName.toLowerCase() === gameData.gameName.toLowerCase()
      );

      if (existingGame) {
        toast.error(
          "Your game name already exists. Please choose a different name."
        );
        return;
      }

      await addDoc(userGameCollection, {
        ...gameData,
        selectedCards,
        createdAt: Timestamp.now(),
      });

      toast.success(" Your Game create successfully!");
      router.push("/creategame");
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
        {!brogame ? (
          <BrowserGame setBroGame={setBroGame}/>
        ) : (
          <>
            <div className="mt-10 flex flex-col items-center">
              <h1 className="font-bold text-2xl px-6 py-3 rounded-lg relative">
                <span className="text-blue-500 text-2xl px-2 border-2 p-2 border-x-0 border-yellow-500">
                  Specify the information of the two players.
                </span>
              </h1>

              <div className="mt-10 w-[600px]">
                <h2 className="text-yellow-500 font-semibold text-xl mb-2">
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
                    className="peer w-full px-4 py-3 text-lg border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition duration-300"
                  />
                  <label
                    htmlFor="gameName"
                    className={`absolute left-4 top-3 text-lg px-1 transition-all duration-200 bg-white
                    ${
                      gameData.gameName
                        ? "top-[-1px] text-sm text-blue-500 "
                        : "text-gray-500"
                    }`}
                  >
                    Enter Name
                  </label>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-6">
                <div className="relative w-[500px] mt-5">
                  <h2 className="absolute bottom-16 mb-2 text-yellow-500 font-semibold text-xl">
                    First Player
                  </h2>
                  <input
                    type="text"
                    name="playerOne"
                    id="playerOne"
                    required
                    value={gameData.playerOne}
                    onChange={handleChange}
                    className="peer w-full px-4 py-3 text-lg border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition duration-300"
                  />
                  <label
                    htmlFor="gameName"
                    className={`absolute left-4 top-3 text-lg px-1 transition-all duration-200 bg-white
                  ${
                    gameData.playerOne
                      ? "top-[-1px] text-sm text-blue-500 "
                      : "text-gray-500"
                  }`}
                  >
                    Enter Name
                  </label>
                </div>

                <div
                  className="relative mt-4 w-[100px] h-[100px] flex items-center justify-center rounded-[3.75rem] shadow-lg bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${ftvs.src})`,
                  }}
                >
                  <Image
                    src={bgvs}
                    alt="VS Icon"
                    width={120}
                    height={120}
                    className="rounded-full shadow-lg z-10 mb-6"
                  />
                </div>

                <div className="relative w-[500px] mt-5">
                  <h2 className="absolute bottom-16 mb-2 text-yellow-500 font-semibold text-xl">
                    Second Player
                  </h2>
                  <input
                    type="text"
                    name="playerTwo"
                    id="playerTwo"
                    required
                    value={gameData.playerTwo}
                    onChange={handleChange}
                    className="peer w-full px-4 py-3 text-lg border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition duration-300"
                  />
                  <label
                    htmlFor="gameName"
                    className={`absolute left-4 top-3 text-lg px-1 transition-all duration-200 bg-white
                      ${
                        gameData.playerTwo
                          ? "top-[-1px] text-sm text-blue-500 "
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
                <h2 className="px-10 mt-5 text-center font-normal text-2xl text-gray-700">
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
                  className={`text-white text-lg font-semibold shadow-xl w-56 h-12 bg-blue-600 opacity-90 hover:opacity-100 transition-opacity p-[2px] hover:bg-blue-700 px-3 py-1 rounded-md bg-gradient-to-t from-blue-600 to-blue-500 active:scale-95 ${
                    selectedCards.length === 6
                      ? ""
                      : "opacity-50 cursor-not-allowed hover:opacity-50"
                  }`}
                  disabled={selectedCards.length !== 6}
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
