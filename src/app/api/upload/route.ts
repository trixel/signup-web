import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  clearCobruTokenCache,
  getCobruAuthHeaders,
  hasCobruCredentials,
  shouldRetryCobruAuth,
} from "@/lib/cobru-auth";
import { getCobruApiUrl, getUploadUrl } from "@/lib/cobru";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];

async function uploadToCobru(file: File): Promise<string | null> {
  if (!hasCobruCredentials()) return null;

  const uploadUrl = getUploadUrl();
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("document", file, file.name);

  try {
    for (const forceRefresh of [false, true]) {
      const authHeaders = await getCobruAuthHeaders(forceRefresh);
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (!data) return null;

        const url =
          data.url ??
          data.message?.url ??
          data.message ??
          data.file_url ??
          data.data?.url;

        return typeof url === "string" ? url : null;
      }

      const data = await response.json().catch(() => null);
      if (!shouldRetryCobruAuth(response.status, data)) {
        return null;
      }

      clearCobruTokenCache();
    }

    return null;
  } catch {
    return null;
  }
}

async function uploadLocally(
  file: File,
  request: NextRequest,
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);

  const origin = request.nextUrl.origin;
  return `${origin}/uploads/${filename}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: true, message: "Archivo no proporcionado" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: true,
          message: "Tipo de archivo no permitido. Usa JPG, PNG, WEBP o PDF.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: true, message: "El archivo supera el límite de 10 MB" },
        { status: 400 },
      );
    }

    let url = await uploadToCobru(file);

    if (!url) {
      url = await uploadLocally(file, request);
    }

    return NextResponse.json({
      error: false,
      url,
      source: url.includes(getCobruApiUrl()) ? "cobru" : "local",
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: (error as Error).message },
      { status: 500 },
    );
  }
}
