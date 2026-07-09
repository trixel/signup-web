import { NextRequest, NextResponse } from "next/server";
import { hasCobruCredentials } from "@/lib/cobru-auth";
import { cobruFetch, getCobruApiUrl } from "@/lib/cobru";
import type { CobruSubcategory } from "@/types/registration";

interface SubcategoriesResponse {
  error: boolean;
  message: CobruSubcategory[];
}

export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get("category_id");

  if (!categoryId) {
    return NextResponse.json(
      { error: true, message: "category_id es requerido" },
      { status: 400 },
    );
  }

  if (!hasCobruCredentials()) {
    return NextResponse.json(
      { error: true, message: "Credenciales Cobru no configuradas" },
      { status: 503 },
    );
  }

  try {
    const data = await cobruFetch<SubcategoriesResponse | CobruSubcategory[]>(
      `/subcategory?category_id=${categoryId}`,
      { method: "GET" },
      getCobruApiUrl(),
    );

    const subcategories = Array.isArray(data)
      ? data
      : Array.isArray(data.message)
        ? data.message
        : [];

    return NextResponse.json({ error: false, message: subcategories });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: (error as Error).message },
      { status: 500 },
    );
  }
}
