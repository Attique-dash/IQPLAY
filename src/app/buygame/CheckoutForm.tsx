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


const CheckoutForm = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [country, setCountry] = useState("");
  const [pac, setPac] = useState("");
  const [rs, setRs] = useState("");

  const userId = userEmail;
  
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
  }, []);
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

  
    if (!stripe || !elements) {
      toast.error("Payment system is not ready. Please try again later.");
      setLoading(false);
      return;
    }
  
    try {
      // 1. Get card elements
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) throw new Error("Card information is missing.");
  
      // 2. Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardNumberElement,
      });
      if (stripeError) throw stripeError;
      if (!paymentMethod?.id) throw new Error("Failed to create payment method");
  
      // 3. Prepare payment data
      const amountInCents = parseInt(rs.replace(/[^0-9]/g, "")) * 100;
      const user = auth.currentUser;
      if (!user) throw new Error("User is not authenticated.");
      const token = await user.getIdToken();
  
      // 4. Construct API URL - guaranteed to be valid
      let apiUrl;
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        apiUrl = new URL('/api/payment', baseUrl).toString();
      } catch (urlError) {
        throw new Error("Failed to construct payment endpoint URL");
      }
  
      // 5. Make the API request
      const response = await fetch(apiUrl, {
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
        }),
      });
  
      // 6. Handle response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", response.status, response.statusText);
        throw new Error("Payment processing failed - invalid server response");
      }
  
      if (!response.ok) {
        console.error("Payment API Error:", {
          status: response.status,
          statusText: response.statusText,
          url: apiUrl,
          requestData: {
            amount: amountInCents,
            pac,
            rs
          },
          responseData: data
        });
        
        throw new Error(
          data?.message || 
          data?.error?.message || 
          `Payment failed (Status ${response.status})`
        );
      }
  
      // 7. Handle success
      if (data.paymentIntent?.status === "succeeded") {
        toast.success("Payment successful! Redirecting...");
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        throw new Error("Payment processing - check your email for confirmation");
      }
    } catch (err: any) {
      console.log("Payment Error:", err);
      
      // Handle specific Stripe card errors
      if (err.message.includes("card number is incorrect")) {
        toast.error(
          <div>
            <p>Your card number is incorrect</p>
            <p>Try test card: <strong>4242 4242 4242 4242</strong></p>
          </div>,
          {
            autoClose: 6000,
            closeButton: true,
          }
        );
      } else {
        toast.error(err.message || "Payment failed. Please try again.");
      }
      
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

      
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <ToastContainer
              position="top-center"
              className="text-center font-semibold"
            />
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">
          Buy Games
        </h2>

        <div className="border p-4 rounded-lg bg-gray-50 mb-4">
          <h3 className="text-lg font-medium text-gray-800">Your Order</h3>
          <div className="mt-2 space-y-2">
            <p className="flex justify-between text-gray-600">
              <span>Amount:</span> <span className="font-semibold">{rs}</span>
            </p>
            <p className="flex justify-between text-gray-600">
              <span>Number of Games:</span>{" "}
              <span className="font-semibold">{pac}</span>
            </p>
            <p className="flex justify-between text-gray-600 border-t pt-2">
              <span className="font-medium">Total:</span>{" "}
              <span className="font-semibold">{rs}</span>
            </p>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && (
          <p className="text-green-500 text-sm text-center">
            Payment Successful!
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Card Number
            </label>
            <CardNumberElement className="p-3 border border-gray-300 rounded-lg bg-gray-50" />
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Expiration Date
                </label>
                <CardExpiryElement className="p-3 border border-gray-300 rounded-lg bg-gray-50" />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Security Code (CVV)
                </label>
                <CardCvcElement className="p-3 border border-gray-300 rounded-lg bg-gray-50" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                required
              >
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="PK">Pakistan</option>
                <option value="IN">India</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 transition-all rounded-lg font-semibold flex justify-center"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
