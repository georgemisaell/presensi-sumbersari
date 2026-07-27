"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Menu } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.role === "admin") {
          setAdminUser(data.user);
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
      <AdminSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        adminUser={adminUser} 
        handleLogout={handleLogout} 
      />

      {/* Main Content */}
      <main className="admin-main theme-light">
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
