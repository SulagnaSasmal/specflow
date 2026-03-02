import type {
  ParsedSpec,
  ParsedOperation,
  ParsedTag,
  HttpMethod,
  ValidationError,
} from "@/types/openapi";

// Dynamically import swagger-parser (browser-compatible)
async function getParser() {
  const SwaggerParser = (await import("swagger-parser")).default;
  return SwaggerParser;
}

export async function parseSpec(input: string | object): Promise<ParsedSpec> {
  const SwaggerParser = await getParser();

  const errors: ValidationError[] = [];
  let rawSpec: Record<string, unknown>;

  try {
    // If string, parse YAML/JSON first
    if (typeof input === "string") {
      const yaml = (await import("js-yaml")).default;
      const trimmed = input.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        rawSpec = JSON.parse(trimmed);
      } else {
        rawSpec = yaml.load(trimmed) as Record<string, unknown>;
      }
    } else {
      rawSpec = input as Record<string, unknown>;
    }

    // Validate and dereference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = await (SwaggerParser as any).dereference(rawSpec);

    return buildParsedSpec(api as Record<string, unknown>, rawSpec, errors);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push({ message });

    // Try to return partial spec even on error
    if (rawSpec!) {
      try {
        return buildParsedSpec(rawSpec, rawSpec, errors);
      } catch {
        // fall through
      }
    }

    return {
      info: { title: "Unknown API", version: "0.0.0" },
      servers: [],
      tags: [],
      operations: [],
      components: {},
      rawSpec: rawSpec! || {},
      validationErrors: errors,
    };
  }
}

function buildParsedSpec(
  api: Record<string, unknown>,
  rawSpec: unknown,
  errors: ValidationError[]
): ParsedSpec {
  const info = (api.info as Record<string, unknown>) || {};
  const servers = (api.servers as unknown[]) || [{ url: "/" }];
  const paths = (api.paths as Record<string, unknown>) || {};
  const components = (api.components as Record<string, unknown>) || {};

  // Collect tag definitions
  const tagDefs = ((api.tags as Array<Record<string, unknown>>) || []).reduce<
    Record<string, string>
  >((acc, t) => {
    acc[t.name as string] = (t.description as string) || "";
    return acc;
  }, {});

  // Parse all operations
  const operations: ParsedOperation[] = [];
  const tagMap: Record<string, ParsedOperation[]> = {};

  for (const [path, pathItem] of Object.entries(paths)) {
    const methods: HttpMethod[] = [
      "get", "post", "put", "patch", "delete", "head", "options", "trace",
    ];

    for (const method of methods) {
      const op = (pathItem as Record<string, unknown>)[method] as Record<
        string,
        unknown
      > | undefined;
      if (!op) continue;

      const operation: ParsedOperation = {
        method,
        path,
        operationId: op.operationId as string | undefined,
        summary: op.summary as string | undefined,
        description: op.description as string | undefined,
        tags: (op.tags as string[]) || ["Default"],
        parameters: parseParameters(
          [
            ...((pathItem as Record<string, unknown>).parameters as unknown[] || []),
            ...((op.parameters as unknown[]) || []),
          ]
        ),
        requestBody: op.requestBody
          ? parseRequestBody(op.requestBody as Record<string, unknown>)
          : undefined,
        responses: parseResponses(
          (op.responses as Record<string, unknown>) || {}
        ),
        security: op.security as Array<Record<string, string[]>> | undefined,
        deprecated: (op.deprecated as boolean) || false,
        "x-compliance": op["x-compliance"] as ParsedOperation["x-compliance"],
      };

      operations.push(operation);

      const opTags = operation.tags?.length ? operation.tags : ["Default"];
      for (const tag of opTags) {
        if (!tagMap[tag]) tagMap[tag] = [];
        tagMap[tag].push(operation);
      }
    }
  }

  // Build tag array preserving spec order
  const allTagNames = [
    ...(api.tags as Array<{ name: string }> || []).map((t) => t.name),
    ...Object.keys(tagMap).filter(
      (t) => !(api.tags as Array<{ name: string }> || []).some((d) => d.name === t)
    ),
  ];

  const tags: ParsedTag[] = allTagNames
    .filter((name) => tagMap[name]?.length)
    .map((name) => ({
      name,
      description: tagDefs[name],
      operations: tagMap[name] || [],
    }));

  return {
    info: {
      title: (info.title as string) || "API Documentation",
      version: (info.version as string) || "1.0.0",
      description: info.description as string | undefined,
      contact: info.contact as ParsedSpec["info"]["contact"],
      license: info.license as ParsedSpec["info"]["license"],
      termsOfService: info.termsOfService as string | undefined,
    },
    servers: servers as ParsedSpec["servers"],
    tags,
    operations,
    components: {
      schemas: components.schemas as ParsedSpec["components"]["schemas"],
      securitySchemes: components.securitySchemes as ParsedSpec["components"]["securitySchemes"],
    },
    rawSpec,
    validationErrors: errors.length ? errors : undefined,
  };
}

function parseParameters(params: unknown[]): ParsedOperation["parameters"] {
  if (!params?.length) return undefined;
  return params
    .filter(Boolean)
    .filter((p) => p && typeof p === "object" && "name" in (p as object))
    .map((p) => p as NonNullable<ParsedOperation["parameters"]>[number]);
}

function parseRequestBody(body: Record<string, unknown>): ParsedOperation["requestBody"] {
  return {
    description: body.description as string | undefined,
    required: (body.required as boolean) || false,
    content: (body.content as NonNullable<ParsedOperation["requestBody"]>["content"]) || {},
  };
}

function parseResponses(
  responses: Record<string, unknown>
): ParsedOperation["responses"] {
  const result: ParsedOperation["responses"] = {};
  for (const [code, resp] of Object.entries(responses)) {
    const r = resp as Record<string, unknown>;
    result[code] = {
      description: (r.description as string) || "",
      headers: r.headers as ParsedOperation["responses"][string]["headers"],
      content: r.content as ParsedOperation["responses"][string]["content"],
    };
  }
  return result;
}

export function getOperationId(op: ParsedOperation): string {
  return op.operationId || `${op.method}-${op.path.replace(/\//g, "-").replace(/[{}]/g, "")}`;
}
