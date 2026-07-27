"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Phone, Lock, User, Briefcase } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const name = e.target.name.value;
    const nomorHp = e.target.nomorHp.value;
    const jabatan = e.target.jabatan.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const nameRegex = /^[a-zA-Z\s.,']+$/;
    if (!nameRegex.test(name)) {
      setError("Nama tidak boleh mengandung karakter spesial/angka.");
      setLoading(false);
      return;
    }

    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(nomorHp)) {
      setError("Nomor HP hanya boleh berisi angka.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nomorHp, jabatan, password }),
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
              <input type="text" name="name" required className="input-field" placeholder="John Doe" style={{ paddingLeft: "2.75rem" }} pattern="[a-zA-Z\s.,']+" title="Nama hanya boleh berisi huruf" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Nomor HP (WhatsApp)</label>
            <div style={{ position: "relative" }}>
              <Phone size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input type="tel" name="nomorHp" required className="input-field" placeholder="081234567890" style={{ paddingLeft: "2.75rem" }} pattern="[0-9]+" title="Nomor HP hanya boleh berisi angka" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Jabatan</label>
            <div style={{ position: "relative" }}>
              <Briefcase size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <select name="jabatan" required className="input-field" style={{ paddingLeft: "2.75rem", appearance: "none" }} defaultValue="">
                <option value="" disabled>Pilih Jabatan</option>
                <option value="Kepala Desa">Kepala Desa</option>
                <option value="Sekretaris Desa">Sekretaris Desa</option>
                <option value="Kaur Keuangan">Kaur Keuangan</option>
                <option value="Kaur Perencanaan">Kaur Perencanaan</option>
                <option value="Kaur Umum dan TU">Kaur Umum dan TU</option>
                <option value="Kasi Pemerintahan">Kasi Pemerintahan</option>
                <option value="Kasi Pelayanan">Kasi Pelayanan</option>
                <option value="Kamituwo Dusun Kenep">Kamituwo Dusun Kenep</option>
                <option value="Karyawan Desa">Karyawan Desa</option>
              </select>
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
