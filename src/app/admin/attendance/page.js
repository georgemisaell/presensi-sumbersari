"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Filter, Trash2, Edit } from "lucide-react";

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter state
  const [filterType, setFilterType] = useState("all"); // 'all', 'date', 'month'
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, [filterType, filterValue]);

  async function fetchAttendance() {
    setLoading(true);
    try {
      let url = "/api/admin/attendance";
      if (filterType === "date" && filterValue) {
        url += `?date=${filterValue}`;
      } else if (filterType === "month" && filterValue) {
        url += `?month=${filterValue}`;
      }

      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        // Sort descending by date and time
        const sorted = result.data.sort((a, b) => {
          const dtA = new Date(`${a.date}T${a.time}`);
          const dtB = new Date(`${b.date}T${b.time}`);
          return dtB - dtA;
        });
        setRecords(sorted);
      } else {
        setError(result.message || "Failed to load attendance records");
      }
    } catch (e) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, currentStatus) {
    const newStatus = prompt("Masukkan status baru (Hadir/Terlambat/Izin/Sakit):", currentStatus);
    if (!newStatus || newStatus === currentStatus) return;

    try {
      const res = await fetch("/api/admin/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAttendance(); // refresh
      } else {
        alert("Gagal update: " + data.message);
      }
    } catch (err) {
      alert("Error saat update");
    }
  }

  async function deleteRecord(id) {
    if (!confirm("Yakin ingin menghapus data presensi ini?")) return;
    
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAttendance(); // refresh
      } else {
        alert("Gagal hapus: " + data.message);
      }
    } catch (err) {
      alert("Error saat hapus");
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1>Data Presensi</h1>
        
        <div className="glass-card" style={{ padding: "0.5rem 1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
          <Filter size={18} color="var(--text-secondary)" />
          <select 
            className="input-field" 
            style={{ padding: "0.5rem", minWidth: "150px" }}
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterValue("");
            }}
          >
            <option value="all">Semua Data</option>
            <option value="date">Berdasarkan Tanggal</option>
            <option value="month">Berdasarkan Bulan</option>
          </select>

          {filterType === "date" && (
            <input 
              type="date" 
              className="input-field" 
              style={{ padding: "0.5rem" }}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          )}

          {filterType === "month" && (
            <input 
              type="month" 
              className="input-field" 
              style={{ padding: "0.5rem" }}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          )}
        </div>
      </div>

      {error && <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>Error: {error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Waktu</th>
              <th>Nama Pegawai</th>
              <th>Status</th>
              <th>Lokasi</th>
              <th>Foto</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                  <div className="flex-center"><div className="spinner"></div></div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>Belum ada data presensi</td>
              </tr>
            ) : (
              records.map((rec, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{rec.date}</td>
                  <td>{rec.time}</td>
                  <td>{rec.userName}</td>
                  <td>
                    <span className={`badge ${rec.status === 'Terlambat' ? 'badge-danger' : rec.status === 'Hadir' || rec.status === 'Tepat Waktu' ? 'badge-success' : 'badge-warning'}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td>
                    <a href={`https://maps.google.com/?q=${rec.latitude},${rec.longitude}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.875rem" }}>
                      Lihat Peta
                    </a>
                  </td>
                  <td>
                    {rec.photoUrl ? (
                      <a href={rec.photoUrl} target="_blank" rel="noreferrer">
                        <img src={rec.photoUrl} alt="Bukti" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)" }} />
                      </a>
                    ) : "-"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => updateStatus(rec.id, rec.status)} className="btn btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                        <Edit size={14} /> Update
                      </button>
                      <button onClick={() => deleteRecord(rec.id)} className="btn btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
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
