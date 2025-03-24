"use client";
import React, { useState } from "react";
import { FaUser } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { FaPhone, FaMessage } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [wordCount, setWordCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number input
    if (name === "phone") {
      // Only allow numbers and limit to 11 digits
      if (!/^\d{0,11}$/.test(value)) return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const words = e.target.value.split(/\s+/).filter(Boolean);
    if (words.length <= 500) {
      setFormData(prev => ({
        ...prev,
        message: e.target.value
      }));
      setWordCount(words.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation (keep your existing validation)
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error("Please enter a valid email");
      return;
    }
    
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    } else if (formData.phone.length < 10) {
      toast.error("Phone number must be at least 10 digits");
      return;
    }
    
    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return;
    }
  
    try {
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Message sent successfully!",);
        
        // Reset form
        setFormData({
          name: "",
          phone: "",
          email: "",
          message: ""
        });
        setWordCount(0);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again later.");
      console.error("Submission error:", error);
    }
  };

  return (
    <div className="font-[sans-serif] p-4 mt-[5px]">
      <ToastContainer
        position="top-center"
        className="text-center font-semibold"
        autoClose={3000}
      />
      <div className="max-w-6xl mx-auto relative bg-white shadow-[0_2px_10px_-3px_rgba(186,186,186,0.7)] rounded-3xl overflow-hidden">
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-orange-500"></div>
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-blue-400"></div>

        <div className="grid md:grid-cols-2 gap-8 py-8 px-6">
          <div className="hidden md:block content-center text-center flex-col items-center justify-center">
            <div className="relative group">
              <video
                src="/video/contact.mp4"
                loop
                muted
                autoPlay
                className="shrink-0 aspect-[250/196] object-contain opacity-100"
              />
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="rounded-tl-3xl rounded-bl-3xl max-md:-order-1"
          >
            <h2 className="text-2xl text-blue-600 font-bold text-center mb-3">
              Contact us
            </h2>
            <p className="text-center text-lg mb-3 text-orange-500">
              To help you out. Faced any issues? Write the details here.
            </p>
            <div className="max-w-md mx-auto space-y-3 relative">
              <FaUser className="text-cyan-600 text-lg absolute top-7 ml-3" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Name"
                className="w-full pl-10 bg-gray-100 rounded-md py-3 px-4 text-base outline-none border border-gray-100 focus:border-blue-600 focus:bg-transparent transition-all"
              />
              <IoIosMail className="text-cyan-600 text-2xl absolute top-[75px] ml-[9px]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Email"
                className="w-full pl-10 bg-gray-100 rounded-md py-3 px-4 text-base outline-none border border-gray-100 focus:border-blue-600 focus:bg-transparent transition-all"
              />
              <FaPhone className="text-cyan-600 text-xl absolute top-[140px] ml-[9px]" />
              <input
                type="tel"  // Changed from "phone" to "tel" for better semantic meaning
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="Phone No."
                className="w-full pl-10 bg-gray-100 rounded-md py-3 px-4 text-base outline-none border border-gray-100 focus:border-blue-600 focus:bg-transparent transition-all"
              />
              <FaMessage className="text-cyan-600 text-xl absolute top-[203px] ml-[9px]" />
              <textarea
                placeholder="Message here..."
                name="message"
                value={formData.message}
                onChange={handleMessageChange}
                rows={5}
                className="w-full pl-10 bg-gray-100 rounded-md px-4 text-base pt-3 outline-none border border-gray-100 focus:border-blue-600 focus:bg-transparent transition-all"
              ></textarea>
              <p className="text-sm font-light absolute text-blue-600 top-[295px] left-[335px] mt-1">
                {wordCount} / 500 words
              </p>

              <button
                type="submit"
                className="text-white w-full relative bg-blue-500 hover:bg-blue-600 rounded-md text-sm px-6 py-3 !mt-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16px"
                  height="16px"
                  fill="#fff"
                  className="mr-2 inline"
                  viewBox="0 0 548.244 548.244"
                >
                  <path
                    fillRule="evenodd"
                    d="M392.19 156.054 211.268 281.667 22.032 218.58C8.823 214.168-.076 201.775 0 187.852c.077-13.923 9.078-26.24 22.338-30.498L506.15 1.549c11.5-3.697 24.123-.663 32.666 7.88 8.542 8.543 11.577 21.165 7.879 32.666L390.89 525.906c-4.258 13.26-16.575 22.261-30.498 22.338-13.923.076-26.316-8.823-30.728-22.032l-63.393-190.153z"
                    clipRule="evenodd"
                    data-original="#000000"
                  />
                </svg>
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}