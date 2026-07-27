"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Phone, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let rawNomorHp = e.target.nomorHp.value;
    const password = e.target.password.value;

    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(rawNomorHp)) {
      setError("Nomor HP hanya boleh berisi angka.");
      setLoading(false);
      return;
    }

    let nomorHp = rawNomorHp;
    if (rawNomorHp.startsWith("0")) {
      nomorHp = "62" + rawNomorHp;
    } else if (rawNomorHp.startsWith("62")) {
      nomorHp = rawNomorHp;
    } else {
      nomorHp = "62" + rawNomorHp;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomorHp, password }),
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
    <div className="theme-light" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="flex-center" style={{ flex: 1, padding: "2rem" }}>
        <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: "400px" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="flex-center" style={{ marginBottom: "1.5rem" }}>
              <img src="/logo-kabupaten-madiun.webp" alt="Logo Kabupaten Madiun" style={{ width: "250px", height: "auto" }} />
            </div>
            <h2>Selamat Datang</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Silakan login untuk melanjutkan</p>
          </div>

          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", fontSize: "0.875rem", textAlign: "center", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Nomor HP (WhatsApp)</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "1rem", color: "var(--text-secondary)", fontWeight: "500", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Phone size={18} />
                  <span>+62</span>
                </div>
                <input type="tel" name="nomorHp" required className="input-field" placeholder="81234567890" style={{ paddingLeft: "4.5rem" }} pattern="[0-9]+" title="Nomor HP hanya boleh berisi angka" />
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
              {loading ? <div className="spinner"></div> : "Login"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Belum punya akun? <Link href="/register" style={{ fontWeight: 600, color: "var(--primary)" }}>Daftar di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
