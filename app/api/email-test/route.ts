import { NextResponse } from "next/server";

import { sendEmail } from "../../../lib/email";
// Do not declare `runtime` here.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim() : "";

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    await sendEmail({
      to: email,
      subject: "Test Email from Your Website",
      text: "Your website's SMTP email configuration is working correctly.",
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;color:#111827">
          <h2 style="color:#4f46e5">SMTP Test Successful!</h2>
          <p>This is a test email sent from your website.</p>
          <p>Your SMTP configuration is working correctly.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email accepted for sending to ${email}.`,
    });
  } catch (error) {
    console.error("SMTP email error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to send email. Check your SMTP configuration and server logs.",
      },
      { status: 500 }
    );
  }
}