import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();

    const nameRegex = /^[a-zA-Z\s.,']+$/;
    if (body.name && !nameRegex.test(body.name)) {
      return NextResponse.json({ success: false, message: "Nama tidak boleh mengandung karakter spesial/angka." }, { status: 400 });
    }

    const phoneRegex = /^[0-9]+$/;
    if (body.nomorHp && !phoneRegex.test(body.nomorHp)) {
      return NextResponse.json({ success: false, message: "Nomor HP hanya boleh berisi angka." }, { status: 400 });
    }

    const gasUrl = process.env.GAS_URL;

    if (!gasUrl) {
      return NextResponse.json({ success: false, message: "Server misconfiguration (GAS_URL missing)" }, { status: 500 });
    }

    // Check for duplicate nomorHp
    try {
      const usersResponse = await fetch(`${gasUrl}?action=getUsers`, {
        method: "GET",
        cache: "no-store",
      });
      const usersData = await usersResponse.json();
      
      if (usersData.success && Array.isArray(usersData.data)) {
        const existingUser = usersData.data.find(
          (u) => String(u.nomorHp) === String(body.nomorHp) && u.status !== 'deleted'
        );
        
        if (existingUser) {
          return NextResponse.json({ success: false, message: "Nomor HP sudah terdaftar." }, { status: 400 });
        }
      }
    } catch (err) {
      console.error("[REGISTER] Failed to fetch users for duplicate check:", err);
      return NextResponse.json({ success: false, message: "Gagal memverifikasi data pengguna." }, { status: 500 });
    }

    if (body.password) {
      const secret = process.env.JWT_SECRET || "default_secret";
      body.password = crypto.createHash("sha256").update(body.password + secret).digest("hex");
      console.log("[REGISTER] Nomor HP:", body.nomorHp, " | Hashed Password:", body.password);
    }

    const response = await fetch(`${gasUrl}?action=register`, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
