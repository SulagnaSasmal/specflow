// Try-It Console types for Phase 2 interactive features

import type { ParsedOperation, OpenAPIParameter, OpenAPISecurityScheme, OAuthFlow } from "./openapi";

export interface TryItResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  bodyRaw: string;
  time: number; // milliseconds
  error?: string;
}

export interface TryItRequest {
  id: string; // unique identifier
  timestamp: string; // ISO 8601
  method: string;
  path: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  response: TryItResponse;
}

export interface AuthConfig {
  scheme: string; // "BearerAuth", "ApiKeyAuth", etc.
  type: "http" | "apiKey" | "oauth2" | "openIdConnect";
  name?: string; // for apiKey: header name or query param name
  in?: "header" | "query" | "cookie"; // for apiKey
  value?: string; // token or API key value
  username?: string; // for basic auth
  password?: string; // for basic auth
  oauthFlow?: OAuthFlow; // OAuth 2.0 flow details
}

export interface RequestBuilderConfig {
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body?: string; // JSON string
  authScheme?: string; // which auth scheme to use
}

export interface WebhookEvent {
  name: string;
  summary: string;
  description?: string;
  eventType: string;
  payload: unknown;
  example?: unknown;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number[];
  };
  signatureInfo?: {
    algorithm: string;
    header: string;
  };
}

export interface ServerConfig {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariable>;
}

export interface ServerVariable {
  default: string;
  enum?: string[];
  description?: string;
}

export interface ParameterInputProps {
  name: string;
  parameter: OpenAPIParameter;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export interface ResponseDisplayProps {
  response: TryItResponse | null;
  isLoading?: boolean;
  error?: string;
}

export interface AuthPanelProps {
  spec: any; // ParsedSpec
  onAuthChange: () => void;
}

export interface RequestBuilderProps {
  operation: ParsedOperation;
  servers?: ServerConfig[];
  onExecute: (config: RequestBuilderConfig) => void;
  isLoading?: boolean;
  response?: TryItResponse | null;
}
