"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Review() {
  const router = useRouter();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
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
      try {
        const docRef = doc(db, "games", gameId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setResponses(data.responses || []);
        } else {
          console.error("No document found for gameId:", gameId);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [gameId]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 400); // Change based on breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">Loading review...</p>
      </div>
    );
  }

  if (!responses.length) {
    return <p className="text-center text-lg">No responses found.</p>;
  }

  const handleNext = () => {
    if (currentIndex < responses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Redirect to result page
      router.push(`/result?gameId=${gameId}`);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Get the current question details
  const { question, options, correctAnswer, selectedOption, player } =
    responses[currentIndex];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="w-full h-[5.5rem] flex items-center bg-gray-800 text-white py-4 shadow-lg relative">
        <div className="flex-shrink-0 ml-10">
          <Image src={logo} alt="Logo" className="mt-0" width={50} height={50} />
        </div>

        <h1 className="flex-grow text-2xl md:text-3xl font-bold text-center">
          {isSmallScreen ? "Review" : "Review Answers"}
        </h1>

        {/* Toggle Button for Small Screens */}
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
                <button
            onClick={() => setMenuOpen(!menuOpen)}
            className=" ml-4 text-3xl focus:outline-none"
          >
            {menuOpen ? <FaTimes /> : null}
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
          className={`ml-auto bg-red-500 font-semibold mr-8 text-white px-4 py-2 rounded-lg w-24 hidden md:block`}
        >
          Exit
        </button>
      </header>


      <div className="bg-white shadow-lg rounded-lg p-6 mt-6 w-11/12 md:w-3/4 mb-6">
        <p className="text-2xl md:text-3xl font-semibold mt-4 text-gray-700 text-center">
          {question}
        </p>
        <p className="text-md md:text-lg text-gray-500 font-semibold mt-2">
          Answered by: <span className="font-bold text-gray-600"> {player} </span>
        </p>

        {options.map((option: string, i: number) => {
          const isCorrect = option === correctAnswer;
          const isSelected = option === selectedOption;

          return (
            <p
              key={i}
              className={`p-2 rounded-md mt-2 text-md md:text-xl ${
                isCorrect
                  ? "bg-green-400 text-white"
                  : isSelected
                  ? "bg-red-400 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {option}
              {selectedOption === "" && option === correctAnswer && (
                <span className="text-gray-600 ml-2">
                  {" "}
                  (You did not select an option)
                </span>
              )}
            </p>
          );
        })}

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 w-1/3 md:w-1/4 text-md md:text-lg font-semibold py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            className="px-4 w-1/3 md:w-1/4 text-md md:text-lg font-semibold py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
          >
            {currentIndex === responses.length - 1 ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
