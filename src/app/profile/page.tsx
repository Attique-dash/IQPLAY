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
import { FiMail, FiPhone } from 'react-icons/fi';
import { toast, ToastContainer } from "react-toastify";

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
      toast.error("Passwords do not match!");
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
  
      toast.success("Password updated successfully! Please log in again.");
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Error updating password:", );
        alert(error.message);
      } else {
        toast.error("An unknown error occurred:", );
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
<div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 md:p-6">
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transition-all transform hover:scale-[1.01] duration-300">
    {/* Profile Image with Glow Effect */}
    <div className="relative w-32 h-32 mx-auto -mt-20 rounded-full overflow-hidden border-4 border-white shadow-lg ring-4 ring-blue-200/50 hover:ring-blue-300/70 transition-all">
      <Image
        src={profile}
        alt="Profile"
        width={144}
        height={144}
        className="object-cover w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-100/20 rounded-full"></div>
    </div>

    {/* User Info Section */}
    <div className="text-center mt-6 space-y-2">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Welcome, {userInfo.firstName} {userInfo.lastName}!
      </h2>
      <p className="text-sm text-gray-500">Member since {new Date().toLocaleDateString()}</p>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
        <div className="flex items-center space-x-3 mb-3">
          <FiMail className="text-blue-500 text-lg" />
          <span className="text-gray-700">
            <span className="font-medium text-gray-900">Email:</span> {userInfo.email}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <FiPhone className="text-blue-500 text-lg" />
          <span className="text-gray-700">
            <span className="font-medium text-gray-900">Phone:</span> {userInfo.phoneNo || 'Not provided'}
          </span>
        </div>
      </div>
    </div>

    {/* Change Password Section */}
    <div className="mt-8">
      <h3 className="text-center mb-4 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
        Change Password
      </h3>
      
      {/* Current Password */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaUnlockKeyhole className="text-blue-500" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          name="PrevPass"
          value={changepass.PrevPass}
          onChange={handleInputChange}
          placeholder="New Password"
          required
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 pr-10 transition-all"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500 hover:text-blue-700"
        >
          {showPassword ? <BiSolidShow /> : <BiSolidHide />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaUnlockKeyhole className="text-blue-500" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          name="confPass"
          value={changepass.confPass}
          onChange={handleInputChange}
          placeholder="Confirm Password"
          required
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 pr-10 transition-all"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500 hover:text-blue-700"
        >
          {showPassword ? <BiSolidShow /> : <BiSolidHide />}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={changePassword}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          Set Password
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
          >
            Logout
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  </div>
</div>    </>
  );
}
