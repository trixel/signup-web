import { NextRequest, NextResponse } from "next/server";
import {
  getMissingCobruCredentialsMessage,
  hasCobruCredentials,
  loginCobruUser,
} from "@/lib/cobru-auth";

export async function POST(request: NextRequest) {
  try {
    if (!hasCobruCredentials()) {
      return NextResponse.json(
        { error: true, message: getMissingCobruCredentialsMessage() },
        { status: 503 },
      );
    }

    const { username, password } = (await request.json()) as {
      username?: string;
      password?: string;
    };

    if (!username?.trim() || !password) {
      return NextResponse.json(
        { error: true, message: "Usuario y contraseña son requeridos" },
        { status: 400 },
      );
    }

    const tokens = await loginCobruUser(username.trim(), password);

    return NextResponse.json({
      error: false,
      access: tokens.access,
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: (error as Error).message },
      { status: 500 },
    );
  }
}
