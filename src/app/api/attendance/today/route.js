import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const gasUrl = process.env.GAS_URL;

    if (!gasUrl) {
      return NextResponse.json({ success: false, message: "Server misconfiguration (GAS_URL missing)" }, { status: 500 });
    }

    const userId = session.user.id;

    // Build the GET request to Google Apps Script
    // We'll pass action=getTodayUserAttendance and the userId
    const response = await fetch(`${gasUrl}?action=getTodayUserAttendance&userId=${userId}`, {
      method: "GET",
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
