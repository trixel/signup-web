const TOKEN_TTL_MS = 50 * 60 * 1000; // fallback si no se puede leer el exp del JWT
const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000; // renovar 1 min antes de expirar

let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

export function getCobruApiKey(): string | undefined {
  return process.env.COBRU_API_KEY?.trim();
}

export function getCobruRefreshToken(): string | undefined {
  return process.env.COBRU_REFRESH_TOKEN?.trim();
}

export function hasCobruCredentials(): boolean {
  return Boolean(getCobruApiKey() && getCobruRefreshToken());
}

export function getMissingCobruCredentialsMessage(): string {
  if (process.env.VERCEL) {
    return "Faltan credenciales Cobru en Vercel. Ve a Project Settings → Environment Variables y agrega COBRU_API_KEY y COBRU_REFRESH_TOKEN, luego redeploy.";
  }

  return "Faltan credenciales Cobru. Configura COBRU_API_KEY y COBRU_REFRESH_TOKEN en .env.local y reinicia el servidor.";
}

export function clearCobruTokenCache(): void {
  cachedAccessToken = null;
  tokenExpiresAt = 0;
}

function getTokenExpiryMs(accessToken: string): number {
  try {
    const [, payload] = accessToken.split(".");
    if (!payload) return Date.now() + TOKEN_TTL_MS;

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { exp?: number };

    if (typeof decoded.exp === "number") {
      return decoded.exp * 1000 - TOKEN_EXPIRY_BUFFER_MS;
    }
  } catch {
    // usar TTL por defecto
  }

  return Date.now() + TOKEN_TTL_MS;
}

function isAuthErrorMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("token not valid") ||
    normalized.includes("token is invalid") ||
    normalized.includes("token has expired") ||
    normalized.includes("authentication credentials were not provided") ||
    normalized.includes("credenciales de autenticación")
  );
}

export function mapCobruAuthError(message: string): string {
  if (isAuthErrorMessage(message)) {
    return "La sesión con Cobru expiró. Reinicia el servidor de desarrollo (npm run dev). Si persiste, actualiza COBRU_REFRESH_TOKEN en .env.local.";
  }

  return message;
}

export async function getCobruAccessToken(forceRefresh = false): Promise<string> {
  const apiKey = getCobruApiKey();
  const refreshToken = getCobruRefreshToken();

  if (!apiKey || !refreshToken) {
    throw new Error(getMissingCobruCredentialsMessage());
  }

  if (
    !forceRefresh &&
    cachedAccessToken &&
    Date.now() < tokenExpiresAt
  ) {
    return cachedAccessToken;
  }

  const baseUrl = (process.env.COBRU_API_URL ?? "https://dev.cobru.co").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/token/refresh/`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const data = (await response.json().catch(() => null)) as {
    access?: string;
    detail?: string;
    message?: string | { detail?: string };
  };

  if (!response.ok || !data?.access) {
    clearCobruTokenCache();

    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : typeof data?.message === "string"
          ? data.message
          : typeof data?.message === "object" && data.message?.detail
            ? data.message.detail
            : "No se pudo obtener el access token";

    throw new Error(mapCobruAuthError(detail));
  }

  cachedAccessToken = data.access;
  tokenExpiresAt = getTokenExpiryMs(data.access);
  return cachedAccessToken;
}

export async function getCobruAuthHeaders(
  forceRefresh = false,
): Promise<Record<string, string>> {
  const apiKey = getCobruApiKey();
  const accessToken = await getCobruAccessToken(forceRefresh);

  return {
    Accept: "application/json",
    "x-api-key": apiKey!,
    Authorization: `Bearer ${accessToken}`,
  };
}

/** Headers con Bearer del usuario (login vía POST /token/). */
export function getCobruUserAuthHeaders(userAccessToken: string): Record<string, string> {
  const apiKey = getCobruApiKey();
  if (!apiKey) {
    throw new Error(getMissingCobruCredentialsMessage());
  }

  return {
    Accept: "application/json",
    "x-api-key": apiKey,
    Authorization: `Bearer ${userAccessToken}`,
  };
}

/**
 * Login del usuario recién registrado.
 * POST {COBRU_API_URL}/token/ con username + password.
 */
export async function loginCobruUser(
  username: string,
  password: string,
): Promise<{ access: string; refresh?: string }> {
  const apiKey = getCobruApiKey();
  if (!apiKey) {
    throw new Error(getMissingCobruCredentialsMessage());
  }

  const baseUrl = (process.env.COBRU_API_URL ?? "https://dev.cobru.co").replace(
    /\/$/,
    "",
  );

  const response = await fetch(`${baseUrl}/token/`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = (await response.json().catch(() => null)) as {
    access?: string;
    refresh?: string;
    detail?: string;
    message?: string | { detail?: string };
  };

  if (!response.ok || !data?.access) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : typeof data?.message === "string"
          ? data.message
          : typeof data?.message === "object" && data.message?.detail
            ? data.message.detail
            : "No se pudo iniciar sesión del usuario";

    throw new Error(mapCobruAuthError(detail));
  }

  return { access: data.access, refresh: data.refresh };
}

export function shouldRetryCobruAuth(
  status: number,
  data: { detail?: string; message?: unknown } | null,
): boolean {
  if (status !== 401 && status !== 403) return false;

  const parts: string[] = [];
  if (typeof data?.detail === "string") parts.push(data.detail);
  if (typeof data?.message === "string") parts.push(data.message);

  return parts.some((part) => isAuthErrorMessage(part));
}
