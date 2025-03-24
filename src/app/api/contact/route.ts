import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const { name, email, phone, message } = await request.json();

  // Validate input
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Email options
  const mailOptions = {
    from: `"IQPLAY Contact Form" <${process.env.EMAIL_USER}>`, // Shows IQPLAY as sender
    to: process.env.RECEIVER_EMAIL,
    replyTo: email, // Allows replying directly to the submitter
    subject: `New Message from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      Message: ${message}
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Message From IQPLAY Website</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
          <p><strong style="color: #111827;">Name:</strong> <strong style="font-weight: 700; color: #1e40af;">${name}</strong></p>
          <p><strong style="color: #111827;">Email:</strong> ${email}</p>
          <p><strong style="color: #111827;">Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong style="color: #111827;">Message:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <p style="margin-top: 20px; color: #6b7280; font-size: 0.9em;">
          This message was sent via the IQPLAY website contact form.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Error sending email' },
      { status: 500 }
    );
  }
}