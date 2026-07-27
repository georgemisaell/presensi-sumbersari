"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardCheck, Clock, LogOut, X, User as UserIcon } from "lucide-react";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen, adminUser, handleLogout }) {
  const pathname = usePathname();

  return (
    <aside className={`glass-panel admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ padding: "1.5rem 1rem", justifyContent: "space-between", background: "#0f172a" }}>
      <div>
        <div style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          <img src="/logo-kabupaten-madiun.webp" alt="Logo Madiun" style={{ width: "200px", height: "auto", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", fontWeight: "normal", lineHeight: "1.4" }}>
            Desa Sumbersari, Kec. Saradan,<br />Kab. Madiun
          </h2>
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(false)}
            style={{ position: "absolute", right: 0, top: 0 }}
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link href="/admin/dashboard" onClick={() => setSidebarOpen(false)} className="btn" style={{ justifyContent: "flex-start", background: pathname === "/admin/dashboard" ? "#6366f1" : "transparent", color: pathname === "/admin/dashboard" ? "#ffffff" : "var(--text-secondary)", boxShadow: "none", padding: "0.75rem 1rem", borderRadius: "0.5rem" }}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/users" onClick={() => setSidebarOpen(false)} className="btn" style={{ justifyContent: "flex-start", background: pathname === "/admin/users" ? "#6366f1" : "transparent", color: pathname === "/admin/users" ? "#ffffff" : "var(--text-secondary)", boxShadow: "none", padding: "0.75rem 1rem", borderRadius: "0.5rem" }}>
            <Users size={18} /> User Management
          </Link>
          <Link href="/admin/attendance" onClick={() => setSidebarOpen(false)} className="btn" style={{ justifyContent: "flex-start", background: pathname === "/admin/attendance" ? "#6366f1" : "transparent", color: pathname === "/admin/attendance" ? "#ffffff" : "var(--text-secondary)", boxShadow: "none", padding: "0.75rem 1rem", borderRadius: "0.5rem" }}>
            <ClipboardCheck size={18} /> Data Presensi
          </Link>
          <Link href="/admin/settings" onClick={() => setSidebarOpen(false)} className="btn" style={{ justifyContent: "flex-start", background: pathname === "/admin/settings" ? "#6366f1" : "transparent", color: pathname === "/admin/settings" ? "#ffffff" : "var(--text-secondary)", boxShadow: "none", padding: "0.75rem 1rem", borderRadius: "0.5rem" }}>
            <Clock size={18} /> Pengaturan Jam
          </Link>
        </nav>
      </div>

      <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            <UserIcon size={24} color="#0f172a" />
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: "600", color: "#f8fafc", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{adminUser?.name || "Admin User"}</p>
            <p style={{ margin: 0, fontSize: "0.65rem", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>ADMINISTRATOR</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn"
          style={{ width: "100%", justifyContent: "center", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "0.75rem 1rem", borderRadius: "0.5rem" }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
