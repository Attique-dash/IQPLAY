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
import { toast, ToastContainer } from "react-toastify";

export default function Header() {
  interface UserName {
    firstName: string;
    lastName: string;
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserName(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserName(null);
            toast.success("Logout Successfully");
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
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
    <>
                <ToastContainer
                  position="top-center"
                  className="text-center font-semibold"
                />
    
    <nav className="bg-white border-gray-200 dark:bg-gray-800 w-full">
      <div className="max-w-screen-xl h-[5.5rem] flex items-center justify-between mx-auto p-2 relative">
        {/* Logo Section */}
        <div className="flex items-center">
          <Image
            src={logo}
            onClick={() => router.push("/")}
            className="h-10 w-[50px] mt-0 cursor-pointer"
            alt="Logo"
          />
          <div className="absolute left-1/2 md:left-[125px] transform -translate-x-1/2">
            <span className="text-2xl font-semibold dark:text-white">
              IQPLAY
            </span>
          </div>{" "}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-grow justify-center md:font-semibold">
          <ul className="flex flex-row space-x-8">
            <li>
              <a
                onClick={() => handleNavigation("/dashboard", true)}
                className="cursor-pointer text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-gray-400"
              >
                My Playtime
              </a>
            </li>{" "}
            <li>
              <a
                onClick={() => handleNavigation("/contact")}
                className="cursor-pointer text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-gray-400"
              >
                Contact Support
              </a>
            </li>
          </ul>
        </div>

        {/* User Profile / Login Button */}
        {userName ? (
          <div className="relative hidden md:flex">
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              onClick={toggleMenu}
            >
              <span>
                {userName.firstName} {userName.lastName}
              </span>
              {isMenuOpen ? <RxCross2 /> : <FaBars />}
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-9 w-48 bg-white hover:rounded-lg rounded-lg shadow-lg z-50">
                <ul>
                  <li>
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 hover:text-green-500 font-semibold hover:bg-gray-100"
                    >
                      Profile
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:text-red-500 font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden md:block">
            <button
              onClick={() => router.push("/login")}
              className="text-white bg-gradient-to-r from-blue-500 to-blue-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-900 dark:text-white text-2xl"
          >
            {isMenuOpen ? <RxCross2 /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-gray-800 text-white z-50 transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 shadow-lg`}
      >
        <button
          className="absolute top-4 right-4 text-white text-2xl"
          onClick={toggleMenu}
        >
          <RxCross2 />
        </button>

        <div className="flex flex-col items-start p-5 space-y-4">
          <Image
            src={logo}
            onClick={() => router.push("/")}
            className="h-12 w-[60px] mb-4 mt-0"
            alt="Logo"
          />
          <a
            onClick={() => handleNavigation("/dashboard", true)}
            className="cursor-pointer text-lg hover:text-blue-400"
          >
            My Playtime
          </a>
          <a
            onClick={() => handleNavigation("/contact")}
            className="cursor-pointer text-lg hover:text-blue-400"
          >
            Contact Support
          </a>
          {userName ? (
            <>
              <a
                href="/profile"
                className="text-lg bg-blue-500 p-2 text-white rounded-lg w-44 text-center"
              >
                Profile
              </a>
              <button
                onClick={handleLogout}
                className="text-lg bg-red-500 w-44 p-2 rounded-lg hover:text-red-400 text-center"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="text-lg bg-blue-500 p-2 text-white rounded-lg w-40 "
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
    </>
  );
}
