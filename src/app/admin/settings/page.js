"use client";

import { useEffect, useState } from "react";
import { Clock, Save } from "lucide-react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [settings, setSettings] = useState({
    checkInLimit: "08:00",
    checkOutLimit: "17:00",
  });

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings");
      const result = await res.json();
      if (result.success && result.data) {
        setSettings({
          checkInLimit: result.data.checkInLimit || "08:00",
          checkOutLimit: result.data.checkOutLimit || "17:00",
        });
      } else {
        setError(result.message || "Failed to load settings");
      }
    } catch (e) {
      setError("An error occurred while fetching settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await res.json();
      if (result.success) {
        setMessage("Pengaturan berhasil disimpan.");
      } else {
        setError(result.message || "Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex-center" style={{ minHeight: "60vh" }}><div className="spinner"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex-responsive" style={{ marginBottom: "2rem" }}>
        <h1>Pengaturan Jam Absensi</h1>
      </div>

      <div className="glass-card" style={{ width: "100%" }}>
        {error && (
          <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" }}>
            {error}
          </div>
        )}
        
        {message && (
          <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="input-group">
            <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clock size={16} /> Batas Jam Check-in (Lebih dari ini dianggap Terlambat)
            </label>
            <input
              type="time"
              className="input-field"
              value={settings.checkInLimit}
              onChange={(e) => setSettings({ ...settings, checkInLimit: e.target.value })}
              required
            />
            <small style={{ color: "var(--text-secondary)", marginTop: "0.5rem", display: "block" }}>
              Contoh: Jika diatur 08:00, absen masuk pukul 08:01 akan tercatat sebagai &quot;Terlambat&quot;.
            </small>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clock size={16} /> Batas Jam Check-out (Kurang dari ini dianggap Pulang Cepat)
            </label>
            <input
              type="time"
              className="input-field"
              value={settings.checkOutLimit}
              onChange={(e) => setSettings({ ...settings, checkOutLimit: e.target.value })}
              required
            />
            <small style={{ color: "var(--text-secondary)", marginTop: "0.5rem", display: "block" }}>
              Contoh: Jika diatur 17:00, absen pulang pukul 16:59 akan tercatat sebagai &quot;Pulang Cepat&quot;.
            </small>
          </div>

          <button type="submit" className="btn btn-indigo" disabled={saving} style={{ marginTop: "1rem", justifyContent: "center" }}>
            {saving ? <div className="spinner"></div> : <><Save size={18} /> Simpan Pengaturan</>}
          </button>
        </form>
      </div>
    </div>
  );
}
