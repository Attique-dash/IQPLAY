"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import logo from "../../public/images/logo.png";
import { FaBars } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Header() {
  interface UserName {
    firstName: string;
    lastName: string;
  }

  const [isClick, setIsClick] = useState(false);
  const [userName, setUserName] = useState<UserName | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data() as UserName);
          } else {
            console.error("No user data found!");
          }
        } catch (error) {
          if (error instanceof Error) {
            console.error("Error fetching user data:", error.message);
          } else {
            console.error("An unknown error occurred:", error);
          }
        }
      } else {
        setUserName(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const goToHome = () => {
    router.push("/");
  };


  const toggle = () => {
    setIsClick(!isClick);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserName(null);
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error logging out:", error.message);
      } else {
        console.error("An unknown error occurred:", error);
      }
    }
  };

  const handleNavigation = (path: string, requireLogin: boolean = false) => {
    if (requireLogin && !userName) {
      router.push("/login");
    } else {
      router.push(path);
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
    <nav className="bg-white border-gray-200 dark:bg-gray-800">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-2">
        <a className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
          <Image src={logo} onClick={goToHome} className="h-10 w-[50px] mb-[15px]" alt="Logo" />
        </a>
        <span className="self-center text-2xl ml-3 font-semibold whitespace-nowrap dark:text-white">
          IQPLAY
        </span>

        <div className="flex-grow flex justify-center">
          <ul className="flex flex-row space-x-8">
            <li>
              <a
                onClick={() => handleNavigation("/dashboard", true)}
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white cursor-pointer"
              >
                My playtime
              </a>
            </li>
            <li>
              <a
                onClick={() => handleNavigation("/about")}
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white cursor-pointer"
              >
                How can I start?
              </a>
            </li>
            <li>
              <a
                onClick={() => handleNavigation("/contact")}
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white cursor-pointer"
              >
                Contact Support
              </a>
            </li>
          </ul>
        </div>

        {userName ? (
          <div className="relative">
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              onClick={toggle}
            >
              <span>
                {userName.firstName} {userName.lastName}
              </span>
              {isClick ? <RxCross2 /> : <FaBars />}
            </button>
            {isClick && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
                <ul>
                  <li>
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex md:order-2 space-x-3">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-semibold rounded-lg px-5 py-2.5"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
