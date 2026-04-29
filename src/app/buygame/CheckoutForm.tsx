"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { auth } from "../../firebase/firebaseConfig"; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { FaGamepad, FaShieldAlt, FaLock, FaCreditCard, FaCalendarAlt, FaShieldVirus, FaArrowLeft } from "react-icons/fa";
import { MdPayment, MdVerified } from "react-icons/md";

const CheckoutForm = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [country, setCountry] = useState("");
  const [pac, setPac] = useState("");
  const [rs, setRs] = useState("");
  const [cardComplete, setCardComplete] = useState({ number: false, expiry: false, cvc: false });

  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setPac(params.get("pac") || "");
      setRs(params.get("rs") || "");
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleCardChange = (elementType: string, event: any) => {
    setCardComplete(prev => ({
      ...prev,
      [elementType]: event.complete
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      toast.error("Payment system is not ready. Please try again later.");
      setLoading(false);
      return;
    }

    if (!country) {
      toast.error("Please select your country");
      setLoading(false);
      return;
    }

    try {
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) throw new Error("Card information is missing.");

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardNumberElement,
      });
      if (stripeError) throw stripeError;
      if (!paymentMethod?.id) throw new Error("Failed to create payment method");

      const amountInCents = parseInt(rs.replace(/[^0-9]/g, "")) * 100;
      const user = auth.currentUser;
      if (!user) throw new Error("User is not authenticated.");
      const token = await user.getIdToken();

      const response = await fetch('/api/payment', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: amountInCents,
          userEmail, 
          pac,
          rs,
          country,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Payment processing failed - invalid server response");
      }

      if (!response.ok) {
        throw new Error(
          data?.message || 
          data?.error?.message || 
          `Payment failed (Status ${response.status})`
        );
      }

      if (data.paymentIntent?.status === "succeeded") {
        toast.success("Payment successful! Redirecting to dashboard...");
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        throw new Error("Payment processing - check your email for confirmation");
      }
    } catch (err: any) {
      if (err.message.includes("card number is incorrect")) {
        toast.error(
          <div>
            <p>Your card number is incorrect</p>
            <p className="text-xs mt-1">Try test card: <strong className="text-[#fbbf24]">4242 4242 4242 4242</strong></p>
          </div>,
          { autoClose: 6000 }
        );
      } else {
        toast.error(err.message || "Payment failed. Please try again.");
      }
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = cardComplete.number && cardComplete.expiry && cardComplete.cvc && country && !loading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c15] via-[#0f1222] to-[#0a0c15]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        .font-display {
          font-family: 'Space Grotesk', monospace;
        }
        
        .StripeElement {
          padding: 12px 16px;
          background: #1e1e2f;
          border: 1px solid #1e2a4a;
          border-radius: 12px;
          color: #ffffff;
          transition: all 0.2s;
        }
        
        .StripeElement--focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 2px rgba(124,58,237,0.2);
          outline: none;
        }
        
        .StripeElement--invalid {
          border-color: #ef4444;
        }
        
        .StripeElement--complete {
          border-color: #10b981;
        }
      `}</style>

      <Header />
      <ToastContainer
        position="top-center"
        toastStyle={{
          background: "#1e1e2f",
          color: "#fff",
          borderRadius: "16px",
          border: "1px solid #1e2a4a",
        }}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 mb-4">
            <MdPayment className="text-[#7c3aed] text-sm" />
            <span className="text-xs font-medium text-[#c084fc] uppercase tracking-wider">Secure Checkout</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent">
            Complete Your Purchase
          </h1>
          <p className="text-[#94a3b8] mt-2">Get ready to unleash the gaming experience!</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-[#0f1222]/80 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-[#7c3aed] to-[#c084fc] p-4">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <FaGamepad />
                  Order Summary
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#1e2a4a]">
                  <span className="text-[#94a3b8]">Package</span>
                  <span className="text-white font-semibold">{pac} Games</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-[#1e2a4a]">
                  <span className="text-[#94a3b8]">Price</span>
                  <span className="text-white font-semibold">{rs} PKR</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-2xl font-display font-bold bg-gradient-to-r from-[#7c3aed] to-[#c084fc] bg-clip-text text-transparent">
                    {rs} PKR
                  </span>
                </div>
              </div>

              {/* Security Badges */}
              <div className="border-t border-[#1e2a4a] p-6 bg-[#0a0c15]/50">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <FaLock className="text-[#10b981] text-xs" />
                    <span className="text-[#94a3b8]">Secure 256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MdVerified className="text-[#10b981] text-xs" />
                    <span className="text-[#94a3b8]">PCI DSS Compliant</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FaShieldAlt className="text-[#10b981] text-xs" />
                    <span className="text-[#94a3b8]">Fraud Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Form - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-[#0f1222]/80 backdrop-blur-sm rounded-2xl border border-[#1e2a4a] p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#c084fc] flex items-center justify-center">
                  <FaCreditCard className="text-white text-lg" />
                </div>
                <h2 className="font-display text-xl font-bold text-white">Payment Details</h2>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-sm flex items-center gap-2">
                  <MdVerified />
                  Payment Successful! Redirecting...
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Country Selection */}
                <div>
                  <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                    Country / Region *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1e1e2f] border border-[#1e2a4a] rounded-xl text-white focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition"
                    required
                  >
                    <option value="">Select your country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="PK">Pakistan</option>
                    <option value="IN">India</option>
                    <option value="AE">UAE</option>
                    <option value="SA">Saudi Arabia</option>
                  </select>
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                    Card Number *
                  </label>
                  <CardNumberElement
                    onChange={(e) => handleCardChange("number", e)}
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#ffffff",
                          "::placeholder": { color: "#4a5568" },
                        },
                      },
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Expiry Date */}
                  <div>
                    <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                      Expiration Date *
                    </label>
                    <CardExpiryElement
                      onChange={(e) => handleCardChange("expiry", e)}
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#ffffff",
                            "::placeholder": { color: "#4a5568" },
                          },
                        },
                      }}
                    />
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-[#94a3b8] text-sm font-medium mb-2">
                      Security Code (CVV) *
                    </label>
                    <CardCvcElement
                      onChange={(e) => handleCardChange("cvc", e)}
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#ffffff",
                            "::placeholder": { color: "#4a5568" },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Test Card Info */}
                <div className="p-3 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20">
                  <p className="text-[#c084fc] text-xs font-medium mb-1">💳 Test Card Information</p>
                  <p className="text-[#94a3b8] text-xs">
                    Use: <span className="text-white font-mono">4242 4242 4242 4242</span> | Exp: Any future date | CVV: Any 3 digits
                  </p>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                  whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#7c3aed]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="animate-spin">
                        <path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4"/>
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      Pay {rs} PKR
                      <MdPayment size={18} />
                    </>
                  )}
                </motion.button>

                {/* Secure Payment Notice */}
                <div className="flex items-center justify-center gap-2 text-center text-xs text-[#4a5568]">
                  <FaLock size={10} />
                  <span>Your payment is secure and encrypted</span>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-white transition"
          >
            <FaArrowLeft size={14} />
            Back to Packages
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutForm;