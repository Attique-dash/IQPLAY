"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig";
import Header from "@/components/header";
import camp from "../../public/images/camp.png";
import time from "../../public/images/timer.png";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MdBrowseGallery } from "react-icons/md";
import games from "../../public/images/games.png";
import { IoGameController } from "react-icons/io5";
import player from "../../public/images/player.png";
import pc from "../../public/images/pc.png";
import tages from "../../public/images/tages.png";
import coll from "../../public/images/collgame.png";
import Footer from "../components/footer";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showCardsOnly = searchParams.get("showCards") === "true";
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        if (pathname !== "/") {
          router.push("/login");
        }
      }
    });
    return () => unsubscribe();
  }, [pathname, router]);

  const Games = [
    {
      rs: "300 Rupees",
      info: "A package crafted to enhance your experience in one category.",
      pac: "2 Games",
    },
    {
      rs: "500 Rupees",
      info: "A package crafted to enhance your experience in one category.",
      pac: "5 Games",
    },
    {
      rs: "800 Rupees",
      info: "A package crafted to enhance your experience in one category.",
      pac: "10 Games",
    },
    {
      rs: "1200 Rupees",
      info: "A package crafted to enhance your experience in one category.",
      pac: "15 Games",
    },
  ];

  const handleNavigation = (path: string) => {
    if (userId) {
      router.push(path);
    } else {
      router.push("/login");
    }
  };

  const CreateGame = () => handleNavigation("/dashboard");
  const BrowseGame = () => handleNavigation("/dashboard");
  const BuyGame = (game: { rs: string; pac: string }) => {
    if (userId) {
      router.push(
        `/buygame?rs=${encodeURIComponent(game.rs)}&pac=${encodeURIComponent(
          game.pac
        )}&userId=${userId}`
      );
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      <Header />
      <div>
        {!showCardsOnly && (
          <>
            <main className=" bg-gray-100 min-h-[85vh]">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 text-center md:text-left mt-8">
                    <p className=" md:text-3xl  md:mt-14 font-bold text-gray-800 text-lg md:leading-[3.25rem]">
                      Ready to test your knowledge and challenge your friends?
                      Guess <span className="text-zinc-500"> what? </span>{" "}
                      Design your own game and choose from a variety of
                      interesting categories!
                    </p>
                    <div className="mt-12">
                      <button
                        onClick={CreateGame}
                        className="relative mr-[75px] font-semibold cursor-pointer opacity-90 hover:opacity-100 transition-opacity p-[2px] bg-blue-500 rounded-[16px] bg-gradient-to-t from-blue-600 to-blue-500 active:scale-95"
                      >
                        <span className="w-full h-full flex items-center gap-2 px-8 py-3 bg-blue-800 text-white rounded-[14px] bg-gradient-to-t from-blue-700 to-blue-500">
                          <IoGameController className="text-xl" />
                          Create a Game
                        </span>
                      </button>
                      <button
                        onClick={BrowseGame}
                        className="relative font-semibold cursor-pointer opacity-90 hover:opacity-100 transition-opacity p-[2px] bg-blue-500 rounded-[16px] bg-gradient-to-t from-blue-600 to-blue-500 active:scale-95"
                      >
                        <span className="w-full h-full flex items-center gap-2 px-8 py-3 bg-blue-800 text-white rounded-[14px] bg-gradient-to-t from-blue-700 to-blue-500">
                          <MdBrowseGallery className="text-xl" />
                          Browse Game
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="">
                      <Image
                        src={time}
                        alt="timer"
                        width={100}
                        height={30}
                        className=""
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="relative">
                        <Image
                          src={games}
                          alt="games"
                          width={300}
                          height={150}
                          className="relative z-10 shadow-md"
                        />
                        <div
                          className="absolute top-0 left-0 w-full h-full border border-gray-500"
                          style={{
                            borderBottom: "4px solid #6b7280",
                            borderLeft: "4px solid #6b7280",
                            borderRight: "4px solid #6b7280",
                            borderTop: "none",
                            borderRadius: "50px 50px 0 0",
                          }}
                        ></div>
                      </div>
                      <div className="relative">
                        <Image
                          src={camp}
                          alt="camp"
                          width={300}
                          height={150}
                          className="relative z-10 shadow-md"
                        />
                        <div
                          className="absolute top-0 left-0 w-full h-full border border-gray-500"
                          style={{
                            borderBottom: "4px solid #6b7280",
                            borderLeft: "4px solid #6b7280",
                            borderRight: "4px solid #6b7280",
                            borderTop: "none",
                            borderRadius: "50px 50px 0 0",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
            <div className="bg-gray-100 flex flex-col md:flex-row items-center justify-center p-6 shadow-xl rounded-lg ">
              <div className="w-full md:w-1/3 md:ml-[3.75rem] flex justify-center">
                <Image
                  src={player}
                  alt="player"
                  className="rounded-xl shadow-lg shadow-black w-40 h-40 md:w-[28rem] md:h-[24rem]"
                />
              </div>
              <div className="flex-1 text-center mt-6 md:mt-0 md:ml-[6rem] md:mr-6">
                <p className="text-lg md:text-3xl font-semibold text-gray-800 leading-relaxed">
                  <span className="text-yellow-300 font-bold">Two </span>{" "}
                  <span className="text-orange-400 font-bold"> players </span>{" "}
                  can choose from a
                  <span className="text-zinc-500 font-bold">
                    {" "}
                    variety of games
                  </span>
                  , select a game to purchase, and start playing. The games
                  include interactive quizzes like
                  <span className="text-blue-600 font-bold"> MCQs</span> related
                  to the selected game.
                </p>
                <div className=" relative top-12">
                  <p className=" md:text-xl font-semibold text-blue-500 text-lg ">
                    Discover the joy of learning while having fun!
                  </p>
                </div>
              </div>
            </div>
            <div className=" bg-gray-100 ">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 text-center md:text-left mt-20">
                    <h1 className=" font-bold text-center text-gray-500 text-2xl md:text-4xl">
                      Can you <span className="text-blue-500">crack it</span>?
                    </h1>
                    <p className=" md:text-3xl text-center md:mt-6 text-gray-800 text-lg md:leading-[3.25rem]">
                      A thrilling group game featuring 6 unique categories and
                      15 brain-teasing questions to challenge your knowledge. To
                      heighten the fun, each team gets 3 lifelines, so pick them
                      wisely!"
                    </p>
                    <div className="text-center">
                      <Image className="mt-0" src={tages} alt="tages" />
                    </div>
                    <div className="text-center">
                      <button
                        onClick={CreateGame}
                        className="relative font-semibold cursor-pointer opacity-90 hover:opacity-100 transition-opacity p-[2px] bg-blue-500 rounded-[16px] bg-gradient-to-t from-blue-600 to-blue-500 active:scale-95"
                      >
                        <span className="w-full h-full flex items-center gap-2 px-8 py-3 bg-blue-800 text-white rounded-[14px] bg-gradient-to-t from-blue-700 to-blue-500">
                          <IoGameController className="text-xl" />
                          Create a Game
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <Image
                      src={pc}
                      className="md:h-[600px] md:w-[608px]"
                      alt="pc"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="bg-gray-100 p-6 md:pt-[100px] ">
          <div className="text-center mb-6 ">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
              Games <span className="text-blue-500"> Packages </span>
            </h1>
            <p className="text-xl text-gray-600 mt-[25px] font-semibold">
              Each user can purchase a game, play it, explore game packages, and
              view special offers.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-[25px]">
            {Games.map((games, index) => (
              <div
                key={index}
                className="w-72 p-2 bg rounded-xl bg-white border border-blue-600 transform transition-all hover:-translate-y-2 duration-300 shadow-lg hover:shadow-2xl"
              >
                <div className="relative cursor-pointer">
                  <img
                    src={coll.src}
                    alt={"Games Offers"}
                    className="w-full h-[215px] object-cover rounded-xl blur-[2px] mt-0"
                  />
                  <p className="absolute inset-0 flex items-center justify-center text-black text-3xl font-semibold">
                    {games.pac}
                  </p>
                </div>
                <div className="p-2 border border-t-2 rounded-lg bg-slate-100 mt-3">
                  <h1 className="text-xl font-bold text-center text-blue-600">
                    {games.rs}
                  </h1>
                  <p className="text-lg text-center text-gray-600 font-semibold">
                    {games.info}
                  </p>
                  <div className="m-2 text-center">
                    <button
                      onClick={() => BuyGame(games)}
                      className="text-white text-lg font-semibold shadow-xl w-56 h-10 bg-blue-600 opacity-90 hover:opacity-100 transition-opacity p-[2px] hover:bg-blue-700 px-3 py-1 rounded-md bg-gradient-to-t from-blue-600 to-blue-500 active:scale-95"
                    >
                      <svg
                        className="w-[4.875rem] h-[20px] mt-[6px] me-2 absolute"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 18 21"
                      >
                        <path d="M15 12a1 1 0 0 0 .962-.726l2-7A1 1 0 0 0 17 3H3.77L3.175.745A1 1 0 0 0 2.208 0H1a1 1 0 0 0 0 2h.438l.6 2.255v.019l2 7 .746 2.986A3 3 0 1 0 9 17a2.966 2.966 0 0 0-.184-1h2.368c-.118.32-.18.659-.184 1a3 3 0 1 0 3-3H6.78l-.5-2H15Z" />
                      </svg>
                      buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
