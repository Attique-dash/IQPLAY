"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import logo from "../../../public/images/logo.png";

export default function Review() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameId = searchParams.get("gameId");

  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  if (loading) {
    return <p className="text-center text-lg">Loading review...</p>;
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
              <header className="w-full h-[5.5rem] flex items-center bg-gray-800 text-white py-4 shadow-lg">
        <div className="flex-shrink-0 ml-10">
          <Image src={logo} alt="Logo" width={50} height={50} className="mt-0" />
        </div>
        <h1 className="flex-grow text-3xl font-bold text-center">
           Review Answers
        </h1>
        <button
          onClick={() => router.push(`/creategame?gameId=${gameId}`)}
          className="ml-auto bg-red-500 font-semibold text-white px-4 py-2 rounded-lg mr-10 w-24"
        >
          Exit
        </button>
      </header>

      <div className="bg-white shadow-lg rounded-lg p-6 mt-6 w-3/4">
        <p className="text-3xl font-semibold mt-4 text-gray-700 text-center">{question}</p>
        <p className="text-lg text-gray-500 font-semibold mt-2">Answered by: <span className="font-bold text-gray-600"> {player} </span> </p>

        {options.map((option: string, i: number) => {
          const isCorrect = option === correctAnswer;
          const isSelected = option === selectedOption;

          return (
            <p
              key={i}
              className={`p-2 rounded-md mt-2 text-xl ${
                isCorrect
                  ? "bg-green-400 text-white"
                  : isSelected
                  ? "bg-red-400 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {option}
              {selectedOption === "" && option === correctAnswer ? (
                <span className="text-gray-600 ml-2">
                  {" "}
                  (You did not select an option)
                </span>
              ) : null}
            </p>
          );
        })}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 w-1/4 text-lg font-semibold py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            className="px-4 w-1/4 text-lg font-semibold py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
          >
            {currentIndex === responses.length - 1 ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
