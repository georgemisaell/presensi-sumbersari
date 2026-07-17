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

    // Attach user info from session
    const payload = {
      ...body,
      userId: session.user.id,
      userName: session.user.name,
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
