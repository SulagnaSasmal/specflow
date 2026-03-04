// Request executor for Try-It Console - handles fetch, auth headers, CORS proxy

import type { ParsedOperation, OpenAPIParameter } from "@/types/openapi";
import type { TryItResponse, RequestBuilderConfig, AuthConfig } from "@/types/try-it";

/**
 * Execute an API request with auth, headers, and optional CORS proxy
 */
export async function executeRequest(
  operation: ParsedOperation,
  config: RequestBuilderConfig,
  authToken: string | undefined,
  corsProxyUrl: string | undefined,
  baseUrl: string
): Promise<TryItResponse> {
  const startTime = performance.now();

  try {
    const url = buildRequestUrl(baseUrl, operation, config.pathParams, config.queryParams);
    const headers = buildHeaders(config.headers, authToken, operation);
    const body = config.body ? JSON.parse(config.body) : undefined;

    const requestUrl = corsProxyUrl && !isLocalhost(url)
      ? `${corsProxyUrl}${url}`
      : url;

    const response = await fetch(requestUrl, {
      method: operation.method.toUpperCase(),
      headers,
      body: body ? JSON.stringify(body) : undefined,
      // CORS mode - will fail if CORS headers not present
      mode: corsProxyUrl ? "cors" : "cors",
    });

    const contentType = response.headers.get("content-type") || "";
    const bodyRaw = await response.text();
    let bodyParsed: unknown = bodyRaw;

    if (contentType.includes("application/json")) {
      try {
        bodyParsed = JSON.parse(bodyRaw);
      } catch {
        bodyParsed = bodyRaw;
      }
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const time = performance.now() - startTime;

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: bodyParsed,
      bodyRaw,
      time,
    };
  } catch (error) {
    const time = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return {
      status: 0,
      statusText: "Error",
      headers: {},
      body: null,
      bodyRaw: "",
      time,
      error: `Request failed: ${errorMessage}${corsProxyUrl ? " (CORS proxy may be required)" : ""}`,
    };
  }
}

/**
 * Build the full request URL with path and query parameters
 */
export function buildRequestUrl(
  baseUrl: string,
  operation: ParsedOperation,
  pathParams: Record<string, string>,
  queryParams: Record<string, string>
): string {
  let url = baseUrl;

  // Replace path parameters
  let path = operation.path;
  for (const [paramName, paramValue] of Object.entries(pathParams)) {
    path = path.replace(`{${paramName}}`, encodeURIComponent(paramValue));
  }

  url += path;

  // Add query parameters
  const queryParts: string[] = [];
  for (const [paramName, paramValue] of Object.entries(queryParams)) {
    if (paramValue) {
      queryParts.push(`${encodeURIComponent(paramName)}=${encodeURIComponent(paramValue)}`);
    }
  }

  if (queryParts.length > 0) {
    url += `?${queryParts.join("&")}`;
  }

  return url;
}

/**
 * Build request headers including auth, content-type, and custom headers
 */
export function buildHeaders(
  customHeaders: Record<string, string>,
  authToken: string | undefined,
  operation: ParsedOperation
): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  // Add authorization header if token provided
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
}

/**
 * Check if URL is localhost (for CORS proxy bypass)
 */
function isLocalhost(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "localhost" ||
      urlObj.hostname === "127.0.0.1" ||
      urlObj.hostname === "::1"
    );
  } catch {
    return false;
  }
}

/**
 * Parse parameter value as JSON if it looks like JSON, otherwise as string
 */
export function parseParamValue(value: string, schema: any): unknown {
  if (!value) return "";

  try {
    // If schema type is not string, try parsing as JSON
    if (schema?.type && schema.type !== "string") {
      return JSON.parse(value);
    }
  } catch {
    // Fall through to return as string
  }

  return value;
}

/**
 * Get placeholder text for parameter based on type and format
 */
export function getParamPlaceholder(param: OpenAPIParameter): string {
  const type = param.schema?.type || "string";
  const format = param.schema?.format;

  if (type === "integer") return "123";
  if (type === "number") return "3.14";
  if (type === "boolean") return "true";
  if (format === "date") return "2026-03-04";
  if (format === "date-time") return "2026-03-04T12:00:00Z";
  if (format === "email") return "user@example.com";
  if (format === "uuid") return "550e8400-e29b-41d4-a716-446655440000";
  if (param.example) return String(param.example);

  return `${param.name}...`;
}
