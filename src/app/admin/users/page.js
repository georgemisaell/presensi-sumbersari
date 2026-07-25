"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { UserCog, Edit, Trash2 } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", role: "", status: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleUpdateStatus(userId, status) {
    if (!confirm(`Are you sure you want to ${status} this user?`)) return;

    // Optimistic UI Update
    const originalUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, status: status } : u));

    try {
      const res = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      const result = await res.json();
      if (!result.success) {
        setUsers(originalUsers); // Revert on failure
        alert("Failed: " + result.message);
      }
    } catch (e) {
      setUsers(originalUsers); // Revert on error
      alert("Error updating user status");
    }
  }

  async function handleDelete(userId) {
    if (!confirm(`Are you sure you want to delete this user? (Soft delete)`)) return;

    // Optimistic UI Update
    const originalUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, status: "deleted" } : u));

    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const result = await res.json();
      if (!result.success) {
        setUsers(originalUsers); // Revert on failure
        alert("Failed: " + result.message);
      }
    } catch (e) {
      setUsers(originalUsers); // Revert on error
      alert("Error deleting user");
    }
  }

  function openEditModal(user) {
    setEditingUser(user.id);
    setEditFormData({ name: user.name, role: user.role, status: user.status || "approved" });
  }

  async function submitEdit(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser,
          name: editFormData.name,
          role: editFormData.role,
          status: editFormData.status
        }),
      });
      const result = await res.json();
      if (result.success) {
        setUsers(users.map(u => u.id === editingUser ? { ...u, ...editFormData } : u));
        setEditingUser(null);
        alert(`User updated successfully!`);
      } else {
        alert("Failed: " + result.message);
      }
    } catch (err) {
      alert("Error updating user");
    }
  }

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
      <div className="flex-responsive" style={{ marginBottom: "2rem" }}>
        <h1>Data Users</h1>
        <div className="badge badge-success">Total: {users.filter(u => u.status !== 'deleted').length} Active Users</div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>No users found</td>
              </tr>
            ) : (
              users.map((user, idx) => {
                if (user.status === 'deleted') return null; // Hide deleted users
                return (
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
                    <td>
                      <span className={`badge ${user.status === 'pending' ? 'badge-warning' : user.status === 'rejected' ? 'badge-danger' : 'badge-success'}`}>
                        {user.status || 'approved'}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      {user.createdAt ? format(new Date(user.createdAt), "dd MMM yyyy, HH:mm") : "-"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {user.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(user.id, "approved")}
                              style={{ padding: "0.25rem 0.5rem", background: "var(--success)", color: "white", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", border: "none", cursor: "pointer" }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(user.id, "rejected")}
                              style={{ padding: "0.25rem 0.5rem", background: "var(--danger)", color: "white", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", border: "none", cursor: "pointer" }}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openEditModal(user)}
                              style={{ padding: "0.25rem 0.5rem", background: "var(--primary)", color: "white", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                            >
                              <Edit size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              style={{ padding: "0.25rem 0.5rem", background: "var(--danger)", color: "white", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="glass-card animate-fade-in" style={{ width: "400px", maxWidth: "90%", padding: "2rem", background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ marginBottom: "1.5rem", color: "var(--text-primary)" }}>Edit User</h3>
            <form onSubmit={submitEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Role</label>
                <select
                  className="input-field"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                >
                  <option value="user" style={{ background: "var(--bg-secondary)" }}>User</option>
                  <option value="admin" style={{ background: "var(--bg-secondary)" }}>Admin</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Status</label>
                <select
                  className="input-field"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="approved" style={{ background: "var(--bg-secondary)" }}>Approved</option>
                  <option value="pending" style={{ background: "var(--bg-secondary)" }}>Pending</option>
                  <option value="rejected" style={{ background: "var(--bg-secondary)" }}>Rejected</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
