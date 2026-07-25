"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, CalendarDays, LogOut, Loader2 } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.role === "admin") {
          setLoading(false);
        } else {
          router.push("/");
        }
      } else {
        router.push("/login");
      }
    } catch (e) {
      router.push("/login");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) return <div className="flex-center min-h-screen"><Loader2 className="spinner" size={32} /></div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="glass-panel" style={{ width: "260px", padding: "1.5rem", borderRadius: "0", borderTop: "none", borderBottom: "none", borderLeft: "none", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "2rem", paddingLeft: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Presensi Admin</h2>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link href="/admin/dashboard" className={`btn ${pathname === "/admin/dashboard" ? "btn-primary" : ""}`} style={{ justifyContent: "flex-start", background: pathname === "/admin/dashboard" ? "" : "transparent", boxShadow: "none" }}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/users" className={`btn ${pathname === "/admin/users" ? "btn-primary" : ""}`} style={{ justifyContent: "flex-start", background: pathname === "/admin/users" ? "" : "transparent", boxShadow: "none" }}>
            <Users size={18} /> Data Users
          </Link>
          <Link href="/admin/attendance" className={`btn ${pathname === "/admin/attendance" ? "btn-primary" : ""}`} style={{ justifyContent: "flex-start", background: pathname === "/admin/attendance" ? "" : "transparent", boxShadow: "none" }}>
            <CalendarDays size={18} /> Data Presensi
          </Link>
        </nav>

        <button onClick={handleLogout} className="btn" style={{ justifyContent: "flex-start", color: "var(--danger)", background: "transparent", border: "1px solid rgba(239,68,68,0.2)" }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <div className="container" style={{ maxWidth: "1200px", padding: 0 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
