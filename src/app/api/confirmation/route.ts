import { NextRequest, NextResponse } from "next/server";
import { cobruFetch, getCobruApiUrl } from "@/lib/cobru";

export async function POST(request: NextRequest) {
  try {
    const { phone, email } = (await request.json()) as {
      phone?: boolean;
      email?: boolean;
    };

    const data = await cobruFetch("/request_confirmation/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: !!phone, email: !!email }),
    }, getCobruApiUrl());

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: true, message: (error as Error).message },
      { status: 500 },
    );
  }
}
