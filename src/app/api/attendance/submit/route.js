import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const gasUrl = process.env.GAS_URL;

    if (!gasUrl) {
      return NextResponse.json({ success: false, message: "Server misconfiguration (GAS_URL missing)" }, { status: 500 });
    }

    // Fetch dynamic settings from GAS
    let checkInLimit = "08:00";
    let checkOutLimit = "17:00";
    
    try {
        const settingsRes = await fetch(`${gasUrl}?action=getSettings`, {
            next: { revalidate: 60 } // revalidate every 60 seconds
        });
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.data) {
            checkInLimit = settingsData.data.checkInLimit || "08:00";
            checkOutLimit = settingsData.data.checkOutLimit || "17:00";
        }
    } catch(e) {
        // Gunakan default fallback jika gagal mengambil setting
        console.error("Gagal mengambil pengaturan jam absensi", e);
    }

    const limitInHour = parseInt(checkInLimit.split(":")[0], 10);
    const limitInMin = parseInt(checkInLimit.split(":")[1], 10);
    
    const limitOutHour = parseInt(checkOutLimit.split(":")[0], 10);
    const limitOutMin = parseInt(checkOutLimit.split(":")[1], 10);

    // Konversi jam server (UTC) ke jam lokal (Asia/Jakarta)
    const nowStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
    const localTime = new Date(nowStr);
    const jam = localTime.getHours();
    const menit = localTime.getMinutes();

    let statusKehadiran = "Tepat Waktu";
    const type = body.type || "Check In";

    if (type === "Check In") {
      // Aturan Check-in: Terlambat jika lewat dari batas
      if (jam > limitInHour || (jam === limitInHour && menit > limitInMin)) {
        statusKehadiran = "Terlambat";
      }
    } else if (type === "Check Out") {
      // Aturan Check-out: Pulang Cepat jika kurang dari batas
      if (jam < limitOutHour || (jam === limitOutHour && menit < limitOutMin)) {
        statusKehadiran = "Pulang Cepat";
      }
    }

    // Attach user info from session and calculated status
    const payload = {
      ...body,
      userId: session.user.id,
      userName: session.user.name,
      type: type,
      status: statusKehadiran // Menimpa "Hadir" yang dikirim oleh Frontend
    };

    const response = await fetch(`${gasUrl}?action=submitAttendance`, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
