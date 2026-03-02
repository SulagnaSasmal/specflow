// Core OpenAPI 3.x TypeScript types for SpecFlow

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "head" | "options" | "trace";

export interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
  contact?: {
    name?: string;
    email?: string;
    url?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
  termsOfService?: string;
}

export interface OpenAPIServer {
  url: string;
  description?: string;
  variables?: Record<string, { default: string; enum?: string[]; description?: string }>;
}

export interface OpenAPISchema {
  type?: string | string[];
  format?: string;
  title?: string;
  description?: string;
  default?: unknown;
  example?: unknown;
  examples?: unknown[];
  enum?: unknown[];
  const?: unknown;
  // String
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  // Number
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number | boolean;
  exclusiveMaximum?: number | boolean;
  multipleOf?: number;
  // Array
  items?: OpenAPISchema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  // Object
  properties?: Record<string, OpenAPISchema>;
  required?: string[];
  additionalProperties?: boolean | OpenAPISchema;
  minProperties?: number;
  maxProperties?: number;
  // Composition
  oneOf?: OpenAPISchema[];
  anyOf?: OpenAPISchema[];
  allOf?: OpenAPISchema[];
  not?: OpenAPISchema;
  // Refs (resolved by parser)
  $ref?: string;
  // Nullable
  nullable?: boolean;
  // Read/write only
  readOnly?: boolean;
  writeOnly?: boolean;
  // Deprecated
  deprecated?: boolean;
  // Extensions
  "x-compliance"?: ComplianceExtension;
  [key: string]: unknown;
}

export interface OpenAPIParameter {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: OpenAPISchema;
  example?: unknown;
  examples?: Record<string, { value: unknown; summary?: string; description?: string }>;
}

export interface OpenAPIRequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, { schema?: OpenAPISchema; example?: unknown; examples?: Record<string, unknown> }>;
}

export interface OpenAPIResponse {
  description: string;
  headers?: Record<string, { description?: string; schema?: OpenAPISchema }>;
  content?: Record<string, { schema?: OpenAPISchema; example?: unknown; examples?: Record<string, unknown> }>;
}

export interface OpenAPISecurityScheme {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect" | "mutualTLS";
  description?: string;
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
  flows?: {
    implicit?: OAuthFlow;
    password?: OAuthFlow;
    clientCredentials?: OAuthFlow;
    authorizationCode?: OAuthFlow;
  };
  openIdConnectUrl?: string;
}

export interface OAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface ComplianceExtension {
  regulations?: string[];
  "data-classification"?: "public" | "internal" | "confidential" | "restricted";
  "audit-required"?: boolean;
  "retention-days"?: number;
  notes?: string;
}

export interface ParsedOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  method: HttpMethod;
  path: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: Record<string, OpenAPIResponse>;
  security?: Array<Record<string, string[]>>;
  deprecated?: boolean;
  "x-compliance"?: ComplianceExtension;
}

export interface ParsedTag {
  name: string;
  description?: string;
  operations: ParsedOperation[];
}

export interface ParsedSpec {
  info: OpenAPIInfo;
  servers: OpenAPIServer[];
  tags: ParsedTag[];
  operations: ParsedOperation[];
  components: {
    schemas?: Record<string, OpenAPISchema>;
    securitySchemes?: Record<string, OpenAPISecurityScheme>;
  };
  rawSpec: unknown;
  validationErrors?: ValidationError[];
}

export interface ValidationError {
  message: string;
  path?: string;
  line?: number;
}

export interface SearchIndexItem {
  id: string;
  type: "endpoint" | "schema" | "tag";
  title: string;
  description?: string;
  method?: HttpMethod;
  path?: string;
  tag?: string;
  operationId?: string;
}
