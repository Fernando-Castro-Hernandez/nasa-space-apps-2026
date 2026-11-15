// Utilidades HTTP del Worker: respuestas JSON, errores con código y lectura
// del cuerpo con límite de tamaño.
import type { ApiErrorBody, Locale } from "../src/api/contract";
import { DEFAULT_LOCALE, isLocale } from "../src/i18n/translate";

/** Error que se le devuelve tal cual a la app, con su código HTTP. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export const errorResponse = (status: number, message: string) =>
  json({ error: message } satisfies ApiErrorBody, status);

/** Bytes con su propio búfer: sirven como cuerpo de una respuesta. */
export type Bytes = Uint8Array<ArrayBuffer>;

/** Lee el cuerpo sin pasar de `maxBytes`; no confía solo en Content-Length. */
export async function readBytes(
  request: Request,
  maxBytes: number,
): Promise<Bytes> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new HttpError(413, "El archivo es muy grande");
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > maxBytes)
    throw new HttpError(413, "El archivo es muy grande");
  return bytes;
}

export async function readJson(
  request: Request,
  maxBytes = 20_000,
): Promise<Record<string, unknown>> {
  const bytes = await readBytes(request, maxBytes);
  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HttpError(400, "El cuerpo no es JSON válido");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body))
    throw new HttpError(400, "Se esperaba un objeto JSON");
  return body as Record<string, unknown>;
}

/** Idioma de la petición. Si no viene, inglés (el idioma oficial). */
export function parseLocale(value: unknown): Locale {
  if (value === undefined || value === null || value === "")
    return DEFAULT_LOCALE;
  if (!isLocale(value))
    throw new HttpError(400, '"locale" debe ser "en" o "es"');
  return value;
}

/** Texto obligatorio, recortado y dentro del límite. */
export function requireText(value: unknown, field: string, max: number) {
  if (typeof value !== "string" || !value.trim())
    throw new HttpError(400, `Falta "${field}"`);
  const text = value.trim();
  if (text.length > max)
    throw new HttpError(400, `"${field}" pasa de ${max} caracteres`);
  return text;
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk)
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

export function fromBase64(text: string): Bytes {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
