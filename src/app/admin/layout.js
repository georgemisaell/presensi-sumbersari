"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, CalendarDays, LogOut, Loader2, Menu, X } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`glass-panel admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ marginBottom: "2rem", paddingLeft: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.25rem", background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Presensi Admin</h2>
          <button 
            className="mobile-menu-btn" 
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link href="/admin/dashboard" onClick={() => setSidebarOpen(false)} className={`btn ${pathname === "/admin/dashboard" ? "btn-primary" : ""}`} style={{ justifyContent: "flex-start", background: pathname === "/admin/dashboard" ? "" : "transparent", boxShadow: "none" }}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/users" onClick={() => setSidebarOpen(false)} className={`btn ${pathname === "/admin/users" ? "btn-primary" : ""}`} style={{ justifyContent: "flex-start", background: pathname === "/admin/users" ? "" : "transparent", boxShadow: "none" }}>
            <Users size={18} /> Data Users
          </Link>
          <Link href="/admin/attendance" onClick={() => setSidebarOpen(false)} className={`btn ${pathname === "/admin/attendance" ? "btn-primary" : ""}`} style={{ justifyContent: "flex-start", background: pathname === "/admin/attendance" ? "" : "transparent", boxShadow: "none" }}>
            <CalendarDays size={18} /> Data Presensi
          </Link>
          <Link href="/admin/settings" onClick={() => setSidebarOpen(false)} className={`btn ${pathname === "/admin/settings" ? "btn-primary" : ""}`} style={{ justifyContent: "flex-start", background: pathname === "/admin/settings" ? "" : "transparent", boxShadow: "none" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg> Pengaturan Jam
          </Link>
        </nav>

        <button onClick={handleLogout} className="btn" style={{ justifyContent: "flex-start", color: "var(--danger)", background: "transparent", border: "1px solid rgba(239,68,68,0.2)" }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="container" style={{ maxWidth: "1200px", padding: 0 }}>
          {/* Mobile Header for Sidebar Toggle */}
          {!sidebarOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }} className="mobile-only-header">
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
            </div>
          )}
          
          {children}
        </div>
      </main>
    </div>
  );
}
