import { NextResponse } from "next/server";
import { setSession } from "@/lib/session";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();

    const phoneRegex = /^[0-9]+$/;
    if (body.nomorHp && !phoneRegex.test(body.nomorHp)) {
      return NextResponse.json({ success: false, message: "Nomor HP hanya boleh berisi angka." }, { status: 400 });
    }

    const gasUrl = process.env.GAS_URL;

    if (!gasUrl) {
      return NextResponse.json({ success: false, message: "Server misconfiguration (GAS_URL missing)" }, { status: 500 });
    }

    if (body.password) {
      const secret = process.env.JWT_SECRET || "default_secret";
      body.password = crypto.createHash("sha256").update(body.password + secret).digest("hex");
      console.log("[LOGIN] Nomor HP:", body.nomorHp, " | Hashed Password:", body.password);
    }

    const response = await fetch(`${gasUrl}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.success && data.user) {
      await setSession(data.user);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
