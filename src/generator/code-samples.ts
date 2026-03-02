import type { ParsedOperation, OpenAPIServer } from "@/types/openapi";

export type Language = "curl" | "python" | "javascript" | "go" | "java" | "csharp";

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: "curl", label: "cURL" },
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "go", label: "Go" },
  { id: "java", label: "Java" },
  { id: "csharp", label: "C#" },
];

interface CodeSampleOptions {
  servers: OpenAPIServer[];
  authToken?: string;
}

export function generateCodeSample(
  op: ParsedOperation,
  language: Language,
  options: CodeSampleOptions = { servers: [{ url: "https://api.example.com" }] }
): string {
  const baseUrl = options.servers?.[0]?.url?.replace(/\/$/, "") || "https://api.example.com";
  const url = buildUrl(baseUrl, op.path, op.parameters || []);
  const hasBody = !!op.requestBody;
  const bodyExample = hasBody ? getBodyExample(op) : null;
  const method = op.method.toUpperCase();

  switch (language) {
    case "curl": return generateCurl(url, method, op, bodyExample);
    case "python": return generatePython(url, method, op, bodyExample);
    case "javascript": return generateJavaScript(url, method, op, bodyExample);
    case "go": return generateGo(url, method, op, bodyExample);
    case "java": return generateJava(url, method, op, bodyExample);
    case "csharp": return generateCSharp(url, method, op, bodyExample);
    default: return "";
  }
}

function buildUrl(base: string, path: string, parameters: ParsedOperation["parameters"] = []): string {
  let url = `${base}${path}`;
  // Replace path params with examples
  (parameters || [])
    .filter((p) => p.in === "path")
    .forEach((p) => {
      const example = getParamExample(p);
      url = url.replace(`{${p.name}}`, String(example));
    });
  // Add required query params
  const queryParams = (parameters || []).filter((p) => p.in === "query" && p.required);
  if (queryParams.length) {
    const qs = queryParams.map((p) => `${p.name}=${getParamExample(p)}`).join("&");
    url += `?${qs}`;
  }
  return url;
}

function getParamExample(p: { name: string; schema?: { type?: string | string[]; example?: unknown; format?: string } }): string {
  if (p.schema?.example !== undefined) return String(p.schema.example);
  const type = Array.isArray(p.schema?.type) ? p.schema?.type[0] : p.schema?.type;
  if (type === "integer" || type === "number") return "1";
  if (type === "boolean") return "true";
  if (p.schema?.format === "date") return "2024-01-01";
  if (p.schema?.format === "date-time") return "2024-01-01T00:00:00Z";
  if (p.schema?.format === "uuid") return "550e8400-e29b-41d4-a716-446655440000";
  return `{${p.name}}`;
}

function getBodyExample(op: ParsedOperation): string {
  if (!op.requestBody) return "{}";
  const content = op.requestBody.content;
  const mediaType = content?.["application/json"] || Object.values(content || {})[0];
  if (!mediaType) return "{}";

  if (mediaType.example) return JSON.stringify(mediaType.example, null, 2);

  const schema = mediaType.schema;
  if (!schema) return "{}";

  return JSON.stringify(schemaToExample(schema), null, 2);
}

function schemaToExample(schema: Record<string, unknown>, depth = 0): unknown {
  if (depth > 3) return null;
  if (schema.example !== undefined) return schema.example;

  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  if (schema.enum) return (schema.enum as unknown[])[0];
  if (type === "string") {
    if (schema.format === "date") return "2024-01-01";
    if (schema.format === "date-time") return "2024-01-01T00:00:00Z";
    if (schema.format === "email") return "user@example.com";
    if (schema.format === "uuid") return "550e8400-e29b-41d4-a716-446655440000";
    if (schema.format === "uri") return "https://example.com";
    return "string";
  }
  if (type === "integer" || type === "number") return 0;
  if (type === "boolean") return true;
  if (type === "array") {
    const items = schema.items as Record<string, unknown>;
    return items ? [schemaToExample(items, depth + 1)] : [];
  }
  if (type === "object" || schema.properties) {
    const props = schema.properties as Record<string, Record<string, unknown>> | undefined;
    if (!props) return {};
    return Object.fromEntries(
      Object.entries(props).map(([k, v]) => [k, schemaToExample(v as Record<string, unknown>, depth + 1)])
    );
  }
  return null;
}

function getHeaders(op: ParsedOperation): string[] {
  const headers: string[] = [];
  // Content-Type
  if (op.requestBody?.content?.["application/json"]) {
    headers.push("Content-Type: application/json");
  }
  // Auth headers from parameters
  (op.parameters || [])
    .filter((p) => p.in === "header")
    .forEach((p) => headers.push(`${p.name}: ${getParamExample(p)}`));
  return headers;
}

// --- Language generators ---

function generateCurl(
  url: string,
  method: string,
  op: ParsedOperation,
  body: string | null
): string {
  const headers = getHeaders(op);
  let cmd = `curl -X ${method} '${url}'`;
  cmd += ` \\\n  -H 'Authorization: Bearer YOUR_TOKEN'`;
  for (const h of headers) {
    cmd += ` \\\n  -H '${h}'`;
  }
  if (body) {
    cmd += ` \\\n  -d '${body.replace(/'/g, "\\'")}'`;
  }
  return cmd;
}

function generatePython(
  url: string,
  method: string,
  op: ParsedOperation,
  body: string | null
): string {
  const lines: string[] = [
    "import requests",
    "",
    `url = "${url}"`,
    `headers = {`,
    `    "Authorization": "Bearer YOUR_TOKEN",`,
  ];

  const headers = getHeaders(op);
  for (const h of headers) {
    const [k, v] = h.split(": ");
    lines.push(`    "${k}": "${v}",`);
  }
  lines.push("}");
  lines.push("");

  if (body) {
    lines.push(`payload = ${body.replace(/"([^"]+)":/g, '"$1":')}`);
    lines.push("");
    lines.push(`response = requests.${method.toLowerCase()}(url, json=payload, headers=headers)`);
  } else {
    lines.push(`response = requests.${method.toLowerCase()}(url, headers=headers)`);
  }
  lines.push("");
  lines.push("print(response.status_code)");
  lines.push("print(response.json())");
  return lines.join("\n");
}

function generateJavaScript(
  url: string,
  method: string,
  op: ParsedOperation,
  body: string | null
): string {
  const headers: Record<string, string> = {
    Authorization: "Bearer YOUR_TOKEN",
  };
  for (const h of getHeaders(op)) {
    const [k, v] = h.split(": ");
    headers[k] = v;
  }

  const headersStr = JSON.stringify(headers, null, 2)
    .split("\n")
    .map((l, i) => (i === 0 ? l : "  " + l))
    .join("\n");

  const lines: string[] = [
    `const response = await fetch("${url}", {`,
    `  method: "${method}",`,
    `  headers: ${headersStr},`,
  ];

  if (body) {
    lines.push(`  body: JSON.stringify(${body}),`);
  }
  lines.push("});");
  lines.push("");
  lines.push("const data = await response.json();");
  lines.push("console.log(data);");

  return lines.join("\n");
}

function generateGo(
  url: string,
  method: string,
  op: ParsedOperation,
  body: string | null
): string {
  const lines: string[] = ["package main", "", "import ("];

  if (body) lines.push('    "bytes"');
  lines.push('    "fmt"');
  lines.push('    "net/http"');
  if (body) lines.push('    "strings"');
  lines.push(")", "");
  lines.push("func main() {");

  if (body) {
    lines.push(`    body := strings.NewReader(\`${body}\`)`);
    lines.push(`    req, _ := http.NewRequest("${method}", "${url}", body)`);
  } else {
    lines.push(`    req, _ := http.NewRequest("${method}", "${url}", nil)`);
  }

  lines.push('    req.Header.Set("Authorization", "Bearer YOUR_TOKEN")');
  for (const h of getHeaders(op)) {
    const [k, v] = h.split(": ");
    lines.push(`    req.Header.Set("${k}", "${v}")`);
  }

  lines.push("", "    client := &http.Client{}");
  lines.push("    resp, err := client.Do(req)");
  lines.push("    if err != nil {");
  lines.push('        fmt.Println("Error:", err)');
  lines.push("        return");
  lines.push("    }");
  lines.push("    defer resp.Body.Close()");
  lines.push('    fmt.Println("Status:", resp.Status)');
  lines.push("}");

  return lines.join("\n");
}

function generateJava(
  url: string,
  method: string,
  op: ParsedOperation,
  body: string | null
): string {
  const lines: string[] = [
    "import okhttp3.*;",
    "",
    "public class ApiClient {",
    "    public static void main(String[] args) throws Exception {",
    "        OkHttpClient client = new OkHttpClient();",
    "",
  ];

  if (body) {
    lines.push(`        String json = ${JSON.stringify(body)};`);
    lines.push("        RequestBody requestBody = RequestBody.create(");
    lines.push('            json, MediaType.parse("application/json"));');
    lines.push("");
  }

  lines.push("        Request request = new Request.Builder()");
  lines.push(`            .url("${url}")`);

  const methodLower = method.toLowerCase();
  if (body) {
    if (methodLower === "post") lines.push("            .post(requestBody)");
    else if (methodLower === "put") lines.push("            .put(requestBody)");
    else if (methodLower === "patch") lines.push("            .patch(requestBody)");
    else lines.push(`            .method("${method}", requestBody)`);
  } else if (methodLower === "delete") {
    lines.push("            .delete()");
  } else {
    lines.push("            .get()");
  }

  lines.push('            .addHeader("Authorization", "Bearer YOUR_TOKEN")');
  for (const h of getHeaders(op)) {
    const [k, v] = h.split(": ");
    lines.push(`            .addHeader("${k}", "${v}")`);
  }
  lines.push("            .build();");
  lines.push("");
  lines.push("        try (Response response = client.newCall(request).execute()) {");
  lines.push("            System.out.println(response.code());");
  lines.push("            System.out.println(response.body().string());");
  lines.push("        }");
  lines.push("    }");
  lines.push("}");

  return lines.join("\n");
}

function generateCSharp(
  url: string,
  method: string,
  op: ParsedOperation,
  body: string | null
): string {
  const lines: string[] = [
    "using System.Net.Http;",
    "using System.Text;",
    "using System.Text.Json;",
    "",
    "var client = new HttpClient();",
    'client.DefaultRequestHeaders.Add("Authorization", "Bearer YOUR_TOKEN");',
    "",
  ];

  if (body) {
    lines.push(`var payload = ${JSON.stringify(body)};`);
    lines.push('var content = new StringContent(payload, Encoding.UTF8, "application/json");');
    lines.push("");
  }

  const methodTitle = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
  if (body) {
    lines.push(`var response = await client.${methodTitle}Async("${url}", content);`);
  } else {
    lines.push(`var response = await client.${methodTitle}Async("${url}");`);
  }

  lines.push("var result = await response.Content.ReadAsStringAsync();");
  lines.push("Console.WriteLine((int)response.StatusCode);");
  lines.push("Console.WriteLine(result);");

  return lines.join("\n");
}
