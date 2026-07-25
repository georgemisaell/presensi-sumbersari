import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const gasUrl = process.env.GAS_URL;

    if (!gasUrl) {
      return NextResponse.json({ success: false, message: "Server misconfiguration" }, { status: 500 });
    }

    const response = await fetch(`${gasUrl}?action=getDashboardStats`, {
      method: "GET",
      // disable caching for fresh data
      cache: "no-store" 
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
