import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "../../../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

// Initialize Stripe with proper error handling
let stripe: Stripe;

try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
  }

  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia", // Must exactly match your installed Stripe types version
  });
} catch (err) {
  console.error("Stripe initialization failed:", err);
  throw new Error("Payment system configuration error");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentMethodId, amount, userEmail, pac, rs } = body;

    // Validate required fields
    if (!paymentMethodId || !amount || !userEmail || !pac || !rs) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "pkr",
      payment_method: paymentMethodId,
      confirm: true,
      receipt_email: userEmail,
      metadata: { email: userEmail },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    // Save payment to Firestore
    await addDoc(collection(db, "payments"), {
      userEmail,
      package: pac,
      amount: rs,
      paymentIntentId: paymentIntent.id,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, paymentIntent });
  } catch (error: any) {  // Note the explicit error type
    console.error("Payment API Error:", error);
    const errorMessage = error.raw?.message || error.message || "Payment failed";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}