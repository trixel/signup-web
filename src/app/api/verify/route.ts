import { NextRequest, NextResponse } from "next/server";
import { cobruFetchAsUser, getCobruApiUrl } from "@/lib/cobru";

export async function POST(request: NextRequest) {
  try {
    const { type, code, access_token } = (await request.json()) as {
      type: "email" | "phone";
      code: number;
      access_token?: string;
    };

    if (!type || !code) {
      return NextResponse.json(
        { error: true, message: "Tipo y código son requeridos" },
        { status: 400 },
      );
    }

    if (!access_token?.trim()) {
      return NextResponse.json(
        {
          error: true,
          message: "Se requiere el token del usuario para verificar",
        },
        { status: 401 },
      );
    }

    const endpoint = type === "email" ? "/verify_email/" : "/verify_phone/";
    const data = await cobruFetchAsUser(
      endpoint,
      access_token.trim(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      },
      getCobruApiUrl(),
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: true, message: (error as Error).message },
      { status: 500 },
    );
  }
}
