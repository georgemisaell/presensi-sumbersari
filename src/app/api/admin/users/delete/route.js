import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const gasUrl = process.env.GAS_URL;

    if (!gasUrl) {
      return NextResponse.json({ success: false, message: "Server misconfiguration" }, { status: 500 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
    }

    const payload = {
      action: "deleteUser",
      userId: userId
    };

    const response = await fetch(`${gasUrl}?action=deleteUser`, {
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
