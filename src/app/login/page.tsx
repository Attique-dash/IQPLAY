"use client";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaUser, FaPhone } from "react-icons/fa";
import "react-phone-input-2/lib/style.css";
import { FaUnlockKeyhole } from "react-icons/fa6";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { IoIosMail } from "react-icons/io";
import Image from "next/image";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import logo from "../../../public/images/logo.png";
import { useRouter } from "next/navigation";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const logoClick = () => {
    router.push("/");
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const PhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^0-9]/g, "");
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    if (value.length > 3) {
      value = value.replace(/^(\d{4})(\d{0,7})$/, "$1-$2");
    }
    setFormData((prevData) => ({
      ...prevData,
      phoneNo: value,
    }));
  };

  const handleFormSwitch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    setIsRegistering(!isRegistering);
    setError(null);
    setSuccess(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const inputs = Array.from(form.querySelectorAll('input'));
        const index = inputs.indexOf(e.currentTarget);
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        } else {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isRegistering) {
      if (
        !formData.firstName ||
        !formData.phoneNo ||
        !formData.email ||
        !formData.password
      ) {
        setError("Please fill in all fields");
        toast.error("Please fill in all fields");
        return;
      }
    } else {
      if (!formData.email || !formData.password) {
        setError("Please enter email and password");
        toast.error("Please enter email and password");
        return;
      }
    }

    const { firstName, lastName, phoneNo, email, password } = formData;

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        setSuccess("Your account has been created successfully");
        toast.success("Your account has been created successfully");

        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          phoneNo,
          email,
        });

        router.push("/dashboard");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Login successful");
        toast.success("Login successful");
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof Error && "code" in err) {
        switch (err.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            setError("Your email or password is incorrect");
            toast.error("Your email or password is incorrect");
            break;
          case "auth/invalid-email":
            setError("Invalid email format");
            toast.error("Invalid email format");
            break;
          case "auth/user-disabled":
            setError("This account has been disabled");
            toast.error("This account has been disabled");
            break;
          default:
            setError(err.message);
            toast.error(err.message);
        }
      } else {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-100 px-4 ${ isRegistering ? "mt-5 mb-5" : "" }`}>
      <div className="relative w-full max-w-6xl bg-white shadow-lg rounded-3xl overflow-hidden p-6">
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-amber-600"></div>
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-blue-400"></div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          <div className="absolute top-5 left-5 cursor-pointer">
            <Image
              onClick={logoClick}
              src={logo}
              alt="Logo"
              width={50}
              height={50}
              className="mt-0"
            />
          </div>
          <h4 className="text-2xl md:text-3xl font-bold font-serif text-blue-500 text-center md:ml-[150px]">
            {isRegistering ? (
              <>
                Welcome <span className="text-amber-600">to Game</span>
              </>
            ) : (
              <>
                Welcome <span className="text-amber-600">Back!</span>
              </>
            )}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="hidden md:block">
            <video
              src="/video/login.mp4"
              loop
              muted
              autoPlay
              className={`w-full h-auto md:h-[320px] object-contain rounded-md ${isRegistering ? "mt-14" : ""}`}
            />
          </div>
          <form
            onSubmit={handleSubmit}
            className={`mx-auto bg-gray-100 rounded-2xl shadow-md transition-all duration-300 w-full max-w-md p-6 min-h-[300px] ${
              isRegistering ? "min-h-[460px]" : ""
            }`}
          >
            <h2 className="text-2xl text-blue-600 font-bold text-center mb-5">
              {isRegistering ? "Create Account" : "Log In"}
            </h2>
            <ToastContainer
              position="top-center"
              className="text-center font-semibold"
            />
            {isRegistering && (
              <>
                <div className="mb-3 relative px-3">
                  <FaUser className="absolute text-xl top-3 left-5 text-cyan-600" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="First Name"
                    className="bg-gray-50 border md:h-[45px] border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>
                <div className="mb-3 relative px-3">
                  <FaUser className="absolute text-xl top-3 left-5 text-cyan-600" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Last Name"
                    className="bg-gray-50 border md:h-[45px] border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>
                <div className="mb-3 relative px-3">
                  <FaPhone className="absolute text-xl top-3 left-5 text-cyan-600" />
                  <input
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={PhoneInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Phone Number"
                    className="bg-gray-50 border md:h-[45px] border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>
              </>
            )}
            <div className="mb-3 relative px-3">
              <IoIosMail className="absolute text-2xl top-3 left-5 text-cyan-600" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Email"
                className="bg-gray-50 border md:h-[45px] border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="mb-3 relative px-3">
              <FaUnlockKeyhole className="absolute text-xl top-3 left-[22px] text-cyan-600" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Password"
                className="bg-gray-50 border pr-11 md:h-[45px] border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-3 text-blue-500 focus:outline-none right-6"
              >
                {showPassword ? (
                  <BiSolidShow className="text-2xl" />
                ) : (
                  <BiSolidHide className="text-2xl" />
                )}
              </button>
            </div>
            <div className="px-3">
              <button
                type="submit"
                className="w-full py-3 font-semibold text-base rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Submit
              </button>
            </div>
            <p className="mt-4 text-center text-base text-gray-600">
              {isRegistering ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={handleFormSwitch}
                    className="text-blue-500 hover:underline font-semibold"
                  >
                    Log In Here
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={handleFormSwitch}
                    className="text-blue-500 hover:underline font-semibold"
                  >
                    Register Here
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}