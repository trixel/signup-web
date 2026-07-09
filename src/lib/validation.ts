import type { ValidationErrorCode } from "@/types/registration";

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const MAX_NAME_LENGTH = 50;
const INVISIBLE_CHARS = /[\u200B-\u200D\uFEFF\u00AD\u2060]/g;

/** Normaliza mientras el usuario escribe, sin quitar espacios al final. */
export function normalizeNameInput(value: string): string {
  return value
    .normalize("NFC")
    .replace(INVISIBLE_CHARS, "")
    .replace(/\s{2,}/g, " ");
}

/** Normaliza antes de enviar a Cobru. */
export function sanitizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function toTitleCaseWord(word: string): string {
  if (!word) return word;
  return word.charAt(0).toLocaleUpperCase("es") + word.slice(1).toLocaleLowerCase("es");
}

/** Limpia y formatea el nombre antes de enviar a Cobru (sin caracteres invisibles). */
export function prepareNameForCobru(value: string): string {
  return sanitizeName(
    value
      .normalize("NFC")
      .replace(INVISIBLE_CHARS, "")
      .replace(/[^\p{L}\s'-]/gu, ""),
  )
    .split(" ")
    .filter(Boolean)
    .map(toTitleCaseWord)
    .join(" ");
}

function countWords(value: string): string[] {
  return sanitizeName(value).split(" ").filter((word) => word.length > 0);
}

function normalizeForComparison(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function namesAreEquivalent(first: string, last: string): boolean {
  const normalizedFirst = normalizeForComparison(first);
  const normalizedLast = normalizeForComparison(last);

  if (!normalizedFirst || !normalizedLast) return false;
  if (normalizedFirst === normalizedLast) return true;

  // Cobru también rechaza si el apellido ya está incluido en el nombre completo.
  const firstWords = countWords(first).map((word) => normalizeForComparison(word));
  const lastWords = countWords(last).map((word) => normalizeForComparison(word));

  if (lastWords.length === 1 && firstWords.includes(lastWords[0])) {
    return true;
  }

  return false;
}

export function validateFullName(
  firstName: string,
  lastName: string,
): ValidationErrorCode | null {
  const first = prepareNameForCobru(firstName);
  const last = prepareNameForCobru(lastName);
  const firstWords = countWords(first);
  const lastWords = countWords(last);

  if (firstWords.length < 1) {
    return "NAME_REQUIRED";
  }

  if (lastWords.length < 1) {
    return "LAST_REQUIRED";
  }

  if (namesAreEquivalent(first, last)) {
    return "NAME_SAME";
  }

  for (const word of [...firstWords, ...lastWords]) {
    if (word.length < 2) {
      return "WORD_MIN_LENGTH";
    }
    if (word.length > MAX_NAME_LENGTH) {
      return "WORD_MAX_LENGTH";
    }
    if (!NAME_REGEX.test(word)) {
      return "LETTERS_ONLY";
    }
    if (/^(.)\1{2,}$/i.test(word)) {
      return "REPEATED_CHARS";
    }
  }

  return null;
}

export function getMaxNameLength(): number {
  return MAX_NAME_LENGTH;
}

export function formatCobruError(
  data: unknown,
  context?: { firstName?: string; lastName?: string },
): string {
  if (!data || typeof data !== "object") {
    return "Error al procesar la solicitud";
  }

  const record = data as Record<string, unknown>;

  if (Array.isArray(record.non_field_errors) && record.non_field_errors.length > 0) {
    const messages = record.non_field_errors.map((item) =>
      mapCobruMessage(String(item), context),
    );
    return messages.join(". ");
  }

  if (typeof record.error === "string") {
    try {
      const parsed = JSON.parse(record.error) as Record<string, unknown>;
      if (Array.isArray(parsed.non_field_errors)) {
        return parsed.non_field_errors
          .map((item) => mapCobruMessage(String(item), context))
          .join(". ");
      }
      if (typeof parsed.error === "string") {
        return parsed.error;
      }
    } catch {
      return record.error;
    }
  }

  if (typeof record.detail === "string") {
    return mapCobruMessage(record.detail, context);
  }

  if (typeof record.message === "string") {
    return mapCobruMessage(record.message, context);
  }

  if (record.message && typeof record.message === "object") {
    const parts: string[] = [];
    for (const [field, value] of Object.entries(record.message as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        parts.push(`${field}: ${value.map(String).join(", ")}`);
      } else if (typeof value === "string") {
        parts.push(`${field}: ${value}`);
      }
    }
    if (parts.length > 0) return parts.join(". ");
  }

  return JSON.stringify(data);
}

function mapCobruMessage(
  message: string,
  context?: { firstName?: string; lastName?: string },
): string {
  const normalized = message.trim();

  if (
    normalized.toLowerCase().includes("token not valid") ||
    normalized.toLowerCase().includes("token is invalid") ||
    normalized.toLowerCase().includes("token has expired")
  ) {
    return "La sesión con Cobru expiró. Reinicia el servidor (npm run dev). Si persiste, actualiza COBRU_REFRESH_TOKEN en .env.local.";
  }

  if (normalized === "Invalid full name.") {
    const sent =
      context?.firstName && context?.lastName
        ? ` Enviado: "${context.firstName}" / "${context.lastName}".`
        : "";

    return `El nombre no fue aceptado.${sent} Debe coincidir exactamente con tu documento de identidad: nombre y apellido distintos, solo letras, sin abreviaturas.`;
  }

  return normalized;
}
