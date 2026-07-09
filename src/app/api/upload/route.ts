import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  clearCobruTokenCache,
  getCobruAuthHeaders,
  hasCobruCredentials,
  shouldRetryCobruAuth,
} from "@/lib/cobru-auth";
import { getHashKey } from "@/lib/cobru-hash";
import { getUploadUrl } from "@/lib/cobru";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];

function buildUploadFileName(
  documentNumber: string,
  nameSuffix: string,
  originalName: string,
): string {
  const ext = path.extname(originalName) || ".jpg";
  const safeNumber = documentNumber.replace(/\D/g, "") || "document";
  const safeSuffix = nameSuffix.replace(/[^a-zA-Z0-9-]/g, "") || "file";

  return `${safeNumber}-${safeSuffix}${ext}`;
}

interface CobruUploadResponse {
  result?: string;
  url?: string;
  message?: string;
  code_transaction?: string;
}

async function uploadToCobru(
  file: File,
  documentNumber: string,
  nameSuffix: string,
): Promise<string> {
  const uploadUrl = getUploadUrl();
  const file_name = buildUploadFileName(documentNumber, nameSuffix, file.name);
  const sign = getHashKey("documents");

  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("sign", sign);
  formData.append("file_type", "documents");
  formData.append("file_name", file_name);

  for (const forceRefresh of [false, true]) {
    const authHeaders = await getCobruAuthHeaders(forceRefresh);
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: authHeaders,
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as CobruUploadResponse | null;

    if (response.ok && data?.url) {
      return data.url;
    }

    if (data?.message) {
      throw new Error(data.message);
    }

    if (!shouldRetryCobruAuth(response.status, data)) {
      throw new Error(`Error al subir a Cobru (${response.status})`);
    }

    clearCobruTokenCache();
  }

  throw new Error("No se pudo subir el archivo a Cobru");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const documentNumber = String(formData.get("document_number") ?? "").trim();
    const nameSuffix = String(formData.get("name_suffix") ?? "file").trim();

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: true, message: "Archivo no proporcionado" },
        { status: 400 },
      );
    }

    if (!documentNumber) {
      return NextResponse.json(
        { error: true, message: "El número de documento es requerido para subir archivos" },
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

    if (!hasCobruCredentials()) {
      return NextResponse.json(
        {
          error: true,
          message: "Credenciales Cobru no configuradas para subir documentos",
        },
        { status: 503 },
      );
    }

    const url = await uploadToCobru(file, documentNumber, nameSuffix);

    return NextResponse.json({
      error: false,
      url,
      source: "cobru",
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: (error as Error).message },
      { status: 500 },
    );
  }
}
