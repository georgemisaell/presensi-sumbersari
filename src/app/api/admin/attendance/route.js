import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

async function verifyAdmin() {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function GET(request) {
  try {
    await verifyAdmin();
    const gasUrl = process.env.GAS_URL;
    if (!gasUrl) throw new Error("Server misconfiguration");

    // Pass along query parameters if any (e.g. ?date=YYYY-MM-DD or ?month=YYYY-MM)
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    
    let url = `${gasUrl}?action=getAttendance`;
    if (date) url += `&date=${date}`;
    else if (month) url += `&month=${month}`;

    const response = await fetch(url, { method: "GET", cache: "no-store" });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function PUT(request) {
  try {
    await verifyAdmin();
    const gasUrl = process.env.GAS_URL;
    if (!gasUrl) throw new Error("Server misconfiguration");

    const body = await request.json();
    const response = await fetch(`${gasUrl}?action=updateAttendance`, {
      method: "POST", // GAS only natively supports POST and GET in Web Apps
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(request) {
  try {
    await verifyAdmin();
    const gasUrl = process.env.GAS_URL;
    if (!gasUrl) throw new Error("Server misconfiguration");

    const body = await request.json(); // { id: "..." }
    const response = await fetch(`${gasUrl}?action=deleteAttendance`, {
      method: "POST", // GAS only natively supports POST and GET
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
