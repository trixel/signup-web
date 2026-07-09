import { NextRequest, NextResponse } from "next/server";
import { cobruFetch, getCobruApiUrl } from "@/lib/cobru";

export async function POST(request: NextRequest) {
  try {
    const { type, code } = (await request.json()) as {
      type: "email" | "phone";
      code: number;
    };

    if (!type || !code) {
      return NextResponse.json(
        { error: true, message: "Tipo y código son requeridos" },
        { status: 400 },
      );
    }

    const endpoint = type === "email" ? "/verify_email/" : "/verify_phone/";
    const data = await cobruFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }, getCobruApiUrl());

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: true, message: (error as Error).message },
      { status: 500 },
    );
  }
}
