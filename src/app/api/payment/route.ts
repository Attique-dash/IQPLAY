import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "../../../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is missing");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia"
});

export async function POST(req: NextRequest) {
  // Set CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

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

    // Save to Firestore
    let firestoreSuccess = false;
    try {
      const docRef = await addDoc(collection(db, "payments"), {
        userEmail,
        package: pac,
        amount: rs,
        paymentIntentId: paymentIntent.id,
        createdAt: serverTimestamp(),
        status: paymentIntent.status,
        stripeAmount: amount,
        timestamp: new Date().toISOString()
      });
      firestoreSuccess = true;
    } catch (firestoreError) {
      console.error("Firestore save error:", firestoreError);
    }

    return new NextResponse(JSON.stringify({ 
      success: true,
      firestoreSuccess,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    }), { headers });

  } catch (error: any) {
    console.error("Payment Error:", error);
    return new NextResponse(JSON.stringify({ 
      success: false, 
      message: error.message || "Payment processing failed",
      errorType: error.type || "api_error"
    }), { 
      status: error.statusCode || 500,
      headers 
    });
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new NextResponse(null, { headers });
}