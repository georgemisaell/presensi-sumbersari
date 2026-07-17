"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, Send, LogOut } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState("");
  const [photoBase64, setPhotoBase64] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    // Basic client-side check. Real security is in the API routes.
    // In a real app, we'd fetch the session from an API route.
    // Let's create a quick API route to check session: GET /api/auth/session
    checkSession();
  }, []);

  async function checkSession() {
    try {
      // For simplicity, we can fetch from an endpoint we need to create
      // For now, if there's a cookie, let's assume we are logged in, but we need user details.
      // Let's just create a quick /api/auth/me endpoint later or just rely on server components.
      // Since this is a client component, I will add a fetch to /api/auth/me
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    } catch (e) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function getLocation() {
    setLocError("");
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        setLocError("Unable to retrieve your location. Please grant permission.");
      }
    );
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      alert("Camera access denied or not available.");
    }
  }

  function takePhoto() {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.8);
      setPhotoBase64(dataUrl);
      
      // Stop camera stream
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStreamActive(false);
    }
  }

  function retakePhoto() {
    setPhotoBase64(null);
    startCamera();
  }

  async function submitAttendance() {
    if (!location || !photoBase64) return;
    
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/attendance/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          photoBase64: photoBase64,
          status: "Hadir"
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Presensi berhasil dicatat!");
        setPhotoBase64(null);
      } else {
        setMessage("Gagal: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setMessage("Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex-center min-h-screen"><div className="spinner"></div></div>;
  if (!user) return null;

  return (
    <div className="container" style={{ padding: "2rem 1.5rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2>Halo, {user.name}!</h2>
          <p style={{ color: "var(--text-secondary)" }}>Silakan lakukan presensi hari ini.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: "0.5rem 1rem" }}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <main className="glass-card animate-fade-in" style={{ maxWidth: "600px", margin: "0 auto" }}>
        
        {/* Step 1: Location */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <MapPin size={20} color="var(--accent-color)" /> Lokasi Saat Ini
          </h3>
          
          {location ? (
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "1rem", borderRadius: "var(--radius-md)", color: "var(--success)" }}>
              Lokasi berhasil didapatkan: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </div>
          ) : (
            <div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Kami perlu mendeteksi lokasi Anda untuk presensi.</p>
              <button onClick={getLocation} className="btn btn-primary" style={{ width: "100%" }}>
                <MapPin size={18} /> Dapatkan Lokasi
              </button>
              {locError && <p style={{ color: "var(--danger)", marginTop: "0.5rem", fontSize: "0.875rem" }}>{locError}</p>}
            </div>
          )}
        </div>

        {/* Step 2: Camera */}
        {location && (
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Camera size={20} color="var(--accent-color)" /> Ambil Foto Selfie
            </h3>

            {!photoBase64 ? (
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-md)", overflow: "hidden", position: "relative" }}>
                {!streamActive && (
                  <div className="flex-center" style={{ height: "250px" }}>
                    <button onClick={startCamera} className="btn btn-secondary">
                      <Camera size={18} /> Buka Kamera
                    </button>
                  </div>
                )}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  style={{ width: "100%", display: streamActive ? "block" : "none" }}
                ></video>
                {streamActive && (
                  <div style={{ position: "absolute", bottom: "1rem", left: "0", right: "0", display: "flex", justifyContent: "center" }}>
                    <button onClick={takePhoto} className="btn btn-primary" style={{ borderRadius: "50%", width: "60px", height: "60px", padding: 0 }}>
                      <Camera size={24} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <img src={photoBase64} alt="Selfie" style={{ width: "100%", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }} />
                <button onClick={retakePhoto} className="btn btn-secondary" style={{ position: "absolute", bottom: "1rem", left: "50%", transform: "translateX(-50%)" }}>
                  Ulangi Foto
                </button>
              </div>
            )}
            
            {/* Hidden canvas for capturing the frame */}
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
          </div>
        )}

        {/* Submit Action */}
        {location && photoBase64 && (
          <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "1.5rem", marginTop: "1rem" }}>
            {message && (
              <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", textAlign: "center", background: message.includes("berhasil") ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: message.includes("berhasil") ? "var(--success)" : "var(--danger)" }}>
                {message}
              </div>
            )}
            
            <button 
              onClick={submitAttendance} 
              className="btn btn-primary" 
              style={{ width: "100%", padding: "1rem" }} 
              disabled={submitting || message.includes("berhasil")}
            >
              {submitting ? <div className="spinner"></div> : <><Send size={18} /> Kirim Presensi</>}
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
