"use client";

import { useEffect, useState } from "react";
import { Users, CheckCircle, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      const res = await fetch("/api/admin/dashboard");
      const result = await res.json();
      if (result.success) {
        setData(result.stats);
      } else {
        setError(result.message || "Failed to load stats");
      }
    } catch (e) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex-center" style={{ minHeight: "60vh" }}><div className="spinner"></div></div>;
  if (error) return <div style={{ color: "var(--danger)" }}>Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: "2rem" }}>Dashboard Overview</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "1rem", borderRadius: "50%" }}>
            <Users size={32} color="var(--success)" />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Hadir Hari Ini</p>
            <h2 style={{ fontSize: "2rem" }}>{data.todayAttendance}</h2>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1.125rem" }}>Kehadiran 7 Hari Terakhir</h3>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}
                  itemStyle={{ color: 'white' }}
                />
                <Line type="monotone" dataKey="count" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 4, fill: "var(--accent-color)" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1.125rem" }}>Status Kehadiran Keseluruhan</h3>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.statusChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}
                  itemStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
