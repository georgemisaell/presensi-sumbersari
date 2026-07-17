"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { UserCog } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const result = await res.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.message || "Failed to load users");
      }
    } catch (e) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex-center" style={{ minHeight: "60vh" }}><div className="spinner"></div></div>;
  if (error) return <div style={{ color: "var(--danger)" }}>Error: {error}</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Data Users</h1>
        <div className="badge badge-success">Total: {users.length} Users</div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined At</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>No users found</td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={idx}>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    {user.id ? user.id.substring(0, 8) + '...' : '-'}
                  </td>
                  <td style={{ fontWeight: 500 }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-success'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    {user.createdAt ? format(new Date(user.createdAt), "dd MMM yyyy, HH:mm") : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
