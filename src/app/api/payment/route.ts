import { NextRequest, NextResponse } from "next/server";
import * as Stripe from "stripe";
import { db } from "../../../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const stripe = new Stripe.Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentMethodId, amount, userEmail, pac, rs } = body;

    if (!paymentMethodId || !amount || !userEmail || !pac || !rs) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    console.log("Received Payment Data:", body);

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
    
    await addDoc(collection(db, "payments"), {
      userEmail,
      package: pac,
      amount: rs,
      paymentIntentId: paymentIntent.id,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, paymentIntent });
  } catch (error) {
    console.error("Payment API Error:", error);
    
    return NextResponse.json({ success: false, message: "Payment failed" }, { status: 500 });
  }
}
