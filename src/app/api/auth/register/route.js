import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const gasUrl = process.env.GAS_URL;

    if (!gasUrl) {
      return NextResponse.json({ success: false, message: "Server misconfiguration (GAS_URL missing)" }, { status: 500 });
    }

    if (body.password) {
      const secret = process.env.JWT_SECRET || "default_secret";
      body.password = crypto.createHash("sha256").update(body.password + secret).digest("hex");
      console.log("[REGISTER] Email:", body.email, " | Hashed Password:", body.password);
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
