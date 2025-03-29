"use client"; // Add this at the top for client-side interactivity

import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  // Handler function for navigation
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 mt-10">
      <div className="mx-auto w-full justify-items-center">
        <div className="grid grid-cols-2 gap-8 px-4 py-5 lg:py-[1rem ] sm:grid-cols-3 w-[inherit] text-center">
          <div>
            <h2 className="mb-6 text-lg font-semibold text-gray-900 uppercase dark:text-white">
              Games
            </h2>
            <ul className="text-gray-500 dark:text-gray-400 font-medium text">
              <li className="mb-4">
                <button
                  onClick={() => handleNavigation("/")}
                  className="hover:underline hover:underline-offset-2 hover:text-blue-500"
                >
                  About
                </button>
              </li>
              <li className="mb-4">
                <button
                  onClick={() => handleNavigation("/")}
                  className="hover:underline hover:underline-offset-2 hover:text-blue-500"
                >
                  How Start
                </button>
              </li>
              <li className="mb-4">
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className="hover:underline hover:underline-offset-2 hover:text-blue-500"
                >
                  Browse Game
                </button>
              </li>
              <li className="mb-4">
                <button
                  onClick={() => handleNavigation("/?showCards=true")}
                  className="hover:underline hover:underline-offset-2 hover:text-blue-500"
                >
                  Buying
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-6 text-lg font-semibold text-gray-900 uppercase dark:text-white">
              Help center
            </h2>
            <ul className="text-gray-500 dark:text-gray-400 font-medium">
              <li className="mb-4">
                <button
                  onClick={() => handleNavigation("/contact")}
                  className="hover:underline hover:underline-offset-2 hover:text-blue-500"
                >
                  Send Mail
                </button>
              </li>
              <li className="mb-4">
                <button
                  onClick={() => handleNavigation("/contact")}
                  className="hover:underline hover:underline-offset-2 hover:text-blue-500"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-6 text-lg font-semibold text-gray-900 uppercase dark:text-white">
              Game Rules
            </h2>
            <ul className="text-gray-500 dark:text-gray-400 font-medium">
              <li className="mb-4">
                <button
                  onClick={() => handleNavigation("/")}
                  className="hover:underline hover:underline-offset-2 hover:text-blue-500"
                >
                  Privacy Policy
                </button>
              </li>
              <li className="mb-4">
                <button
                  onClick={() => handleNavigation("/?showCards=true")}
                  className="hover:underline hover:underline-offset-2 hover:text-blue-500"
                >
                  Buy the Game
                </button>
              </li>
            </ul>
          </div>
          <div></div>
        </div>
        <div className="px-4 py-6 bg-gray-100 dark:bg-gray-700 w-[inherit] sm:flex sm:items-center sm:justify-center">
          <span className="text-base font-semibold text-gray-500 dark:text-gray-300 text-center">
            © 2025{" "}
            <button
              onClick={() => handleNavigation("/")}
              className="hover:text-blue-500"
            >
              IQPLAY
            </button>
            . Play smarter, win award.
          </span>
        </div>
      </div>
    </footer>
  );
}
