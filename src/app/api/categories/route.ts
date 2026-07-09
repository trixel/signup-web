import { NextResponse } from "next/server";
import { hasCobruCredentials } from "@/lib/cobru-auth";
import { cobruFetch, getCobruApiUrl } from "@/lib/cobru";
import type { CobruCategory } from "@/types/registration";

interface CategoriesResponse {
  error: boolean;
  message: CobruCategory[];
}

export async function GET() {
  if (!hasCobruCredentials()) {
    return NextResponse.json(
      {
        error: true,
        message:
          "Configura COBRU_API_KEY y COBRU_REFRESH_TOKEN en .env.local y reinicia el servidor.",
      },
      { status: 503 },
    );
  }

  try {
    const data = await cobruFetch<CategoriesResponse | CobruCategory[]>(
      "/category/",
      { method: "GET" },
      getCobruApiUrl(),
    );

    const categories = Array.isArray(data)
      ? data
      : Array.isArray(data.message)
        ? data.message
        : [];

    return NextResponse.json({ error: false, message: categories });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: (error as Error).message },
      { status: 500 },
    );
  }
}
