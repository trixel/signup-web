import {
  clearCobruTokenCache,
  getCobruAuthHeaders,
  shouldRetryCobruAuth,
} from "./cobru-auth";
import { formatCobruError } from "./validation";

const DEFAULT_API_URL = "https://dev.cobru.co";
const DEFAULT_PROD_URL = "https://prod.cobru.co";

export function getCobruApiUrl(): string {
  return process.env.COBRU_API_URL ?? DEFAULT_API_URL;
}

export function getCobruProdUrl(): string {
  return process.env.COBRU_PROD_URL ?? DEFAULT_PROD_URL;
}

export function getCobruBrand(): string {
  return process.env.COBRU_BRAND ?? "TRIXEL";
}

export function getUploadUrl(): string {
  const base = getCobruApiUrl().replace(/\/$/, "");
  return process.env.COBRU_UPLOAD_URL ?? `${base}/base/upload_file/`;
}

function getNameContext(body: RequestInit["body"]) {
  if (!body || typeof body !== "string") return undefined;

  try {
    const parsed = JSON.parse(body) as {
      first_name?: string;
      last_name?: string;
    };

    if (parsed.first_name || parsed.last_name) {
      return {
        firstName: parsed.first_name,
        lastName: parsed.last_name,
      };
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export async function cobruFetch<T>(
  path: string,
  options: RequestInit = {},
  baseUrl?: string,
): Promise<T> {
  const url = `${baseUrl ?? getCobruApiUrl()}${path}`;
  const nameContext = getNameContext(options.body);

  async function request(forceRefresh: boolean) {
    const authHeaders = await getCobruAuthHeaders(forceRefresh);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });

    const data = (await response.json().catch(() => null)) as T & {
      error?: boolean;
      message?: unknown;
      detail?: string;
    };

    return { response, data };
  }

  let { response, data } = await request(false);

  if (shouldRetryCobruAuth(response.status, data)) {
    clearCobruTokenCache();
    ({ response, data } = await request(true));
  }

  if (!response.ok) {
    throw new Error(
      formatCobruError(data, nameContext) || `Error Cobru (${response.status})`,
    );
  }

  return data;
}
