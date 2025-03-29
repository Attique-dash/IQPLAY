import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "../../../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is missing");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" // Match exactly with your installed Stripe types
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentMethodId, amount, userEmail, pac, rs } = body;

    // Validate required fields
    if (!paymentMethodId) throw new Error("Payment method ID is required");
    if (!amount) throw new Error("Amount is required");
    if (!userEmail) throw new Error("User email is required");
    if (!pac) throw new Error("Package is required");
    if (!rs) throw new Error("Amount string is required");

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount),
      currency: "pkr",
      payment_method: paymentMethodId,
      confirm: true,
      receipt_email: userEmail,
      metadata: { 
        userEmail,
        package: pac,
        amount: rs 
      },
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });

    // Save to Firestore - with enhanced error handling
    let firestoreSuccess = false;
    try {
      const docRef = await addDoc(collection(db, "payments"), {
        userEmail,
        package: pac,
        amount: rs,
        paymentIntentId: paymentIntent.id,
        createdAt: serverTimestamp(),
        status: paymentIntent.status,
        stripeAmount: amount, // Store the actual amount used in Stripe
        timestamp: new Date().toISOString()
      });
      firestoreSuccess = true;
      console.log("Firestore document written with ID: ", docRef.id);
    } catch (firestoreError) {
      console.error("Firestore save error:", firestoreError);
      // Send email/admin alert about Firestore failure
    }

    return NextResponse.json({ 
      success: true,
      firestoreSuccess,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      },
      clientSecret: paymentIntent.client_secret 
    });

  } catch (error: any) {
    console.error("API Error Details:", {
      error: error,
      message: error.message,
      stack: error.stack,
      type: error.type
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Payment processing failed",
        errorType: error.type || "api_error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: error.statusCode || 500 }
    );
  }
}