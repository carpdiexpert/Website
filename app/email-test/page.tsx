
"use client";

import { useState } from "react";

export default function EmailTestPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function sendTestEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/email-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      setSuccess(response.ok);
      setMessage(
        data.message ||
          (response.ok ? "Email sent successfully!" : "Failed to send email.")
      );

      if (response.ok) {
        setEmail("");
      }
    } catch {
      setSuccess(false);
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="email-test-page">
      <form className="email-test-card" onSubmit={sendTestEmail}>
        <div className="email-test-icon">✉</div>

        <h1>SMTP Email Test</h1>
        <p>Send a test email using your configured Gmail SMTP server.</p>

        <label htmlFor="recipient-email">
          Recipient Email Address
        </label>

        <input
          id="recipient-email"
          type="email"
          placeholder="recipient@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending Email..." : "Send Test Email"}
        </button>

        {message && (
          <div
            className={`email-test-message ${
              success ? "success" : "error"
            }`}
            role="status"
          >
            {message}
          </div>
        )}
      </form>

      <style jsx>{`
        .email-test-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #f5f7fb;
          font-family: Arial, sans-serif;
        }

        .email-test-card {
          width: 100%;
          max-width: 440px;
          padding: 36px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
        }

        .email-test-icon {
          display: grid;
          place-items: center;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 28px;
          margin-bottom: 22px;
        }

        h1 {
          margin: 0 0 10px;
          color: #111827;
          font-size: 25px;
        }

        p {
          margin: 0 0 28px;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }

        label {
          display: block;
          margin-bottom: 9px;
          color: #374151;
          font-size: 14px;
          font-weight: 600;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          padding: 14px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          outline: none;
          font-size: 15px;
          color: #111827;
          background: #ffffff;
        }

        input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        button {
          width: 100%;
          margin-top: 20px;
          padding: 14px;
          border: none;
          border-radius: 10px;
          background: #4f46e5;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }

        button:hover:not(:disabled) {
          background: #4338ca;
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .email-test-message {
          margin-top: 18px;
          padding: 12px;
          border-radius: 9px;
          font-size: 14px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .success {
          background: #ecfdf5;
          color: #047857;
        }

        .error {
          background: #fef2f2;
          color: #b91c1c;
        }

        @media (max-width: 480px) {
          .email-test-card {
            padding: 26px 22px;
          }
        }
      `}</style>
    </main>
  );
}
