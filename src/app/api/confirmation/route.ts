import { NextRequest, NextResponse } from "next/server";
import { cobruFetchAsUser, getCobruApiUrl } from "@/lib/cobru";

export async function POST(request: NextRequest) {
  try {
    const { phone, email, access_token } = (await request.json()) as {
      phone?: boolean;
      email?: boolean;
      access_token?: string;
    };

    if (!access_token?.trim()) {
      return NextResponse.json(
        {
          error: true,
          message: "Se requiere el token del usuario para enviar códigos",
        },
        { status: 401 },
      );
    }

    const data = await cobruFetchAsUser(
      "/request_confirmation/",
      access_token.trim(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: !!phone, email: !!email }),
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
