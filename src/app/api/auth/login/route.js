import { NextResponse } from "next/server";
import { setSession } from "@/lib/session";

export async function POST(request) {
  try {
    const body = await request.json();
    const gasUrl = process.env.GAS_URL;

    if (!gasUrl) {
      return NextResponse.json({ success: false, message: "Server misconfiguration (GAS_URL missing)" }, { status: 500 });
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
