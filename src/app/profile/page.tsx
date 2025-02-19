"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import profile from "../../../public/images/profile.jpg";
import { FaUnlockKeyhole } from "react-icons/fa6";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";

export default function Profile() {
  interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    phoneNo: string;
  }

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [changepass, setChangepass] = useState({
    PrevPass: "",
    confPass: "",
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserInfo(userDoc.data() as UserInfo);
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
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChangepass({ ...changepass, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const changePassword = async () => {
    if (!auth.currentUser ) {
      console.error("No authenticated user.");
      return;
    }
  
    if (changepass.PrevPass !== changepass.confPass) {
      alert("Passwords do not match!");
      return;
    }
  
    try {
      const user = auth.currentUser ;
      console.log("Current user:", user);

      const currentPassword = prompt("Enter your pervious password to confirm:");
      console.log("Entered current password:", currentPassword);
      if (!currentPassword) return;
  
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      console.log("Credential:", credential);

      await reauthenticateWithCredential(user, credential);
  
      await updatePassword(user, changepass.PrevPass);
  
      alert("Password updated successfully! Please log in again.");
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating password:", error.message);
        alert(error.message);
      } else {
        console.error("An unknown error occurred:", error);
      }
    }
  };    

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error logging out:", error.message);
      } else {
        console.error("An unknown error occurred:", error);
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

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-red-500">
          Failed to load user data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-yellow-500 p-6">
        <div
          className={`bg-white rounded-xl shadow-lg w-full max-w-md p-6 transition-all`}
        >
          <div className="relative w-36 h-36 mx-auto -mt-20 shadow-md rounded-2xl overflow-hidden border-4 border-gray-500">
            <Image
              src={profile}
              alt="Profile"
              width={250}
              height={250}
              className="object-cover rounded-2xl mt-0"
            />
          </div>
          <div className="text-center mt-4">
            <h2 className="text-xl font-bold text-blue-500">
              Welcome, {userInfo.firstName} {userInfo.lastName}!
            </h2>
            <p className="text-xl font-semibold text-yellow-500">Your Info</p>
            <p className="text-gray-600 text-lg">
              <strong className="text-blue-500 text-left">Email:</strong> {userInfo.email}
            </p>
            <p className="text-gray-600 text-lg">
              <strong className="text-blue-500 text-left">Phone:</strong> {userInfo.phoneNo}
            </p>
          </div>
          <p className="text-xl font-semibold text-yellow-500 text-center">Change Password</p>
          <div className="mb-3 relative px-3 mt-4">
            <FaUnlockKeyhole className="absolute text-xl top-2 left-[22px] text-cyan-600" />
            <input
              type={showPassword ? "text" : "password"}
              name="PrevPass"
              value={changepass.PrevPass}
              onChange={handleInputChange}
              placeholder="New Password"
              required
              className="bg-gray-50 border pr-11 md:h-[40px] border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute top-2 text-blue-500 focus:outline-none right-6"
            >
              {showPassword ? (
                <BiSolidShow className="text-2xl" />
              ) : (
                <BiSolidHide className="text-2xl" />
              )}
            </button>
          </div>
          <div className="mb-3 relative px-3">
            <FaUnlockKeyhole className="absolute text-xl top-2 left-[22px] text-cyan-600" />
            <input
              type={showPassword ? "text" : "password"}
              name="confPass"
              value={changepass.confPass}
              onChange={handleInputChange}
              placeholder="Confirm Password"
              required
              className="bg-gray-50 border pr-11 md:h-[40px] border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute top-2 text-blue-500 focus:outline-none right-6"
            >
              {showPassword ? (
                <BiSolidShow className="text-2xl" />
              ) : (
                <BiSolidHide className="text-2xl" />
              )}
            </button>
          </div>
          <button
            onClick={changePassword}
            className="w-full mt-2 py-2 px-4 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition"
          >
           Set Password
          </button>

          <button
            onClick={handleLogout}
            className="w-full mt-4 py-2 px-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
