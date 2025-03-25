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

const CheckoutForm = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [country, setCountry] = useState("");
  const [pac, setPac] = useState("");
  const [rs, setRs] = useState("");

  const userId = userEmail;
  
  useEffect(() => {
    // Client-side URL parsing
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setPac(params.get("pac") || "");
      setRs(params.get("rs") || "");
    }
  }, []);

  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();


    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          setUserEmail(user.email);
        } else {
          router.push("/login");
        }
      });
      return () => unsubscribe();
    }, []);
    console.log("email : ", userEmail);
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe is not properly initialized.");
      setLoading(false);
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      setError("Card information is missing.");
      setLoading(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardNumberElement,
    });

    if (error) {
      setError(error.message ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const amountInCents = parseInt(rs.replace(/[^0-9]/g, "")) * 100;

    const user = auth.currentUser;
    if (!user) {
      setError("User is not authenticated.");
      setLoading(false);
      return;
    }

    const token = await user.getIdToken(); 

    const response = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,
        amount: amountInCents,
        userEmail, 
        pac,
        rs,
      }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Payment failed:", errorText);
      setError(`Payment failed: ${response.status} ${response.statusText}`);
      setLoading(false);
      return;
    }

    const data = await response.json();

    if (data.success) {
      setSuccess(true);
      router.push("/dashboard");
    } else {
      setError(data.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
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
