"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Filter, Trash2, Edit, Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state
  const [filterType, setFilterType] = useState("date"); // 'all', 'date', 'month'
  const [filterValue, setFilterValue] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filterAttendanceType, setFilterAttendanceType] = useState("all"); // 'all', 'Check In', 'Check Out'

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

    // Optimistic Update
    const originalRecords = [...records];
    setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));

    try {
      const res = await fetch("/api/admin/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        setRecords(originalRecords); // Revert
        alert("Gagal update: " + data.message);
      }
    } catch (err) {
      setRecords(originalRecords); // Revert
      alert("Error saat update");
    }
  }

  async function deleteRecord(id) {
    if (!confirm("Yakin ingin menghapus data presensi ini?")) return;

    // Optimistic UI Update
    const originalRecords = [...records];
    setRecords(records.filter(r => r.id !== id));

    try {
      const res = await fetch("/api/admin/attendance", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!data.success) {
        setRecords(originalRecords); // Revert
        alert("Gagal hapus: " + data.message);
      }
    } catch (err) {
      setRecords(originalRecords); // Revert
      alert("Error saat hapus");
    }
  }

  const filteredRecords = records.filter(rec => {
    if (filterAttendanceType === "all") return true;
    const recType = rec.type || "Check In";
    return recType === filterAttendanceType;
  });

  function exportToExcel() {
    if (filteredRecords.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    const exportData = filteredRecords.map((rec) => ({
      "Tanggal": rec.date,
      "Waktu": rec.time,
      "Nama Pegawai": rec.userName,
      "Jabatan": rec.jabatan || "-",
      "Tipe Presensi": rec.type || "Check In",
      "Status": rec.status,
      "Latitude": rec.latitude,
      "Longitude": rec.longitude,
      "Lokasi Maps": `https://maps.google.com/?q=${rec.latitude},${rec.longitude}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Presensi");
    
    const fileName = `Data_Presensi_${filterType === "all" ? "Semua" : filterValue}_${filterAttendanceType}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, marginBottom: "1rem" }}>Data Presensi</h1>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          
          <div className="glass-card" style={{ padding: "0.5rem 1rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={16} color="var(--text-secondary)" />
            </div>
            
            <select
              className="input-field"
              style={{ padding: "0.5rem", minWidth: "130px", width: "auto", border: "none", background: "rgba(255,255,255,0.5)" }}
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue("");
              }}
            >
              <option value="all">Semua Data</option>
              <option value="date">Tanggal</option>
              <option value="month">Bulan</option>
            </select>

            {filterType === "date" && (
              <input
                type="date"
                className="input-field"
                style={{ padding: "0.5rem", minWidth: "140px", width: "auto", border: "none", background: "rgba(255,255,255,0.5)" }}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            )}

            {filterType === "month" && (
              <input
                type="month"
                className="input-field"
                style={{ padding: "0.5rem", minWidth: "140px", width: "auto", border: "none", background: "rgba(255,255,255,0.5)" }}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            )}

            <div style={{ width: "1px", height: "20px", background: "var(--glass-border)", margin: "0" }}></div>

            <select
              className="input-field"
              style={{ padding: "0.5rem", minWidth: "130px", width: "auto", border: "none", background: "rgba(255,255,255,0.5)" }}
              value={filterAttendanceType}
              onChange={(e) => setFilterAttendanceType(e.target.value)}
            >
              <option value="all">Semua Tipe</option>
              <option value="Check In">Check In</option>
              <option value="Check Out">Check Out</option>
            </select>
          </div>

          <button 
            onClick={exportToExcel} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
              color: "white", 
              border: "none", 
              padding: "0.6rem 1.25rem", 
              borderRadius: "var(--radius-md)", 
              fontWeight: "500", 
              fontSize: "0.875rem",
              cursor: "pointer", 
              boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 12px -2px rgba(16, 185, 129, 0.4)"; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(16, 185, 129, 0.3)"; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(1px)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
          >
            <Download size={18} /> Export Excel
          </button>
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
              <th>Jabatan</th>
              <th>Tipe</th>
              <th>Status</th>
              <th>Lokasi</th>
              <th>Foto</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "2rem" }}>
                  <div className="flex-center"><div className="spinner"></div></div>
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "2rem" }}>Belum ada data presensi pada filter yang dipilih</td>
              </tr>
            ) : (
              filteredRecords.map((rec, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{rec.date}</td>
                  <td>{rec.time}</td>
                  <td>{rec.userName}</td>
                  <td>{rec.jabatan || "-"}</td>
                  <td>
                    <span className={`badge ${rec.type === 'Check Out' ? 'badge-primary' : 'badge-secondary'}`}>
                      {rec.type || 'Check In'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${rec.status === 'Terlambat' || rec.status === 'Pulang Cepat' ? 'badge-danger' : rec.status === 'Hadir' || rec.status === 'Tepat Waktu' ? 'badge-success' : 'badge-warning'}`}>
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
                      <a href={rec.photoUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.875rem" }}>
                        Bukti
                      </a>
                    ) : "-"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => updateStatus(rec.id, rec.status)} className="btn-action btn-action-edit">
                        <Edit size={14} /> Update
                      </button>
                      <button onClick={() => deleteRecord(rec.id)} className="btn-action btn-action-delete">
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
