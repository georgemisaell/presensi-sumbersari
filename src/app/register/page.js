"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to login on success
        router.push("/login?registered=true");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-center min-h-screen">
      <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: "450px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="flex-center" style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--accent-gradient)", margin: "0 auto 1rem" }}>
            <UserPlus size={32} color="white" />
          </div>
          <h2>Create Account</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Join Presensi Sumbersari today</p>
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", fontSize: "0.875rem", textAlign: "center", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input type="text" name="name" required className="input-field" placeholder="John Doe" style={{ paddingLeft: "2.75rem" }} />
            </div>
          </div>

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
              <input type="password" name="password" required className="input-field" placeholder="••••••••" style={{ paddingLeft: "2.75rem" }} minLength={6} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input type="password" name="confirmPassword" required className="input-field" placeholder="••••••••" style={{ paddingLeft: "2.75rem" }} minLength={6} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? <div className="spinner"></div> : "Register Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Already have an account? <Link href="/login" style={{ fontWeight: 600 }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
