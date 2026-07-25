"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-center min-h-screen">
      <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="flex-center" style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--accent-gradient)", margin: "0 auto 1rem" }}>
            <LogIn size={32} color="white" />
          </div>
          <h2>Welcome Back</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Login to access your dashboard</p>
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", fontSize: "0.875rem", textAlign: "center", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input type="email" name="email" required className="input-field" placeholder="you@example.com" style={{ paddingLeft: "2.75rem" }} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input type="password" name="password" required className="input-field" placeholder="••••••••" style={{ paddingLeft: "2.75rem" }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? <div className="spinner"></div> : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Don't have an account? <Link href="/register" style={{ fontWeight: 600 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
