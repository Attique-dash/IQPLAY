import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "../../../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

// Initialize Stripe with proper error handling
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" // Match exactly with your installed Stripe types
});

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
      status: paymentIntent.status,
    });

    return NextResponse.json({ 
      success: true, 
      paymentIntent,
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error: any) {
    console.error("Payment API Error:", error);
    const errorMessage = error.raw?.message || error.message || "Payment failed";
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        errorDetails: error.type || undefined 
      },
      { status: error.statusCode || 500 }
    );
  }
}