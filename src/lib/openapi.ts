import YAML from "yaml";

export type ParsedEndpoint = {
  method: string;
  path: string;
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: any[];
  requestBody?: any;
  responses?: any;
  tags?: string[];
};

export type ParsedSpec = {
  title: string;
  version: string;
  description?: string;
  endpoints: ParsedEndpoint[];
  schemas: string[];
  servers: any[];
  tags: any[];
};

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options"];

function parseRawSpec(content: string) {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Spec content is empty");

  let parsed: any;
  try {
    parsed = trimmed.startsWith("{") ? JSON.parse(trimmed) : YAML.parse(trimmed);
  } catch (error) {
    throw new Error(`Invalid OpenAPI YAML/JSON: ${(error as Error).message}`);
  }

  if (!parsed || typeof parsed !== "object") throw new Error("Spec must be a YAML or JSON object");
  if (!parsed.paths || typeof parsed.paths !== "object") throw new Error("OpenAPI spec must include a paths object");
  return parsed;
}

function resolveRef(root: any, value: any, seen = new Set<string>()): any {
  if (!value || typeof value !== "object") return value;
  const ref = value.$ref;
  if (typeof ref !== "string" || !ref.startsWith("#/")) return value;
  if (seen.has(ref)) return value;
  seen.add(ref);

  const target = ref
    .slice(2)
    .split("/")
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"))
    .reduce((node, key) => node?.[key], root);

  if (!target) return value;
  return resolveSchema(root, target, seen);
}

function resolveSchema(root: any, schema: any, seen = new Set<string>()): any {
  if (!schema || typeof schema !== "object") return schema;
  const deref = resolveRef(root, schema, seen);
  if (deref !== schema) return deref;

  if (Array.isArray(schema)) return schema.map((item) => resolveSchema(root, item, new Set(seen)));

  const out: any = { ...schema };
  if (out.properties) {
    out.properties = Object.fromEntries(
      Object.entries(out.properties).map(([key, value]) => [key, resolveSchema(root, value, new Set(seen))]),
    );
  }
  if (out.items) out.items = resolveSchema(root, out.items, new Set(seen));
  for (const key of ["oneOf", "anyOf", "allOf"]) {
    if (Array.isArray(out[key])) out[key] = out[key].map((item: any) => resolveSchema(root, item, new Set(seen)));
  }
  return out;
}

function resolveMediaSchemas(root: any, value: any) {
  if (!value?.content) return value;
  const next = { ...value, content: { ...value.content } };
  for (const [type, media] of Object.entries(next.content)) {
    const mediaObj = media as any;
    next.content[type] = {
      ...mediaObj,
      schema: resolveSchema(root, mediaObj?.schema),
    };
  }
  return next;
}

function resolveResponses(root: any, responses: any) {
  if (!responses || typeof responses !== "object") return responses || {};
  return Object.fromEntries(
    Object.entries(responses).map(([code, response]) => [code, resolveMediaSchemas(root, resolveRef(root, response))]),
  );
}

export function parseOpenApiSpec(content: string): ParsedSpec {
  const parsed = parseRawSpec(content);
  const endpoints: ParsedEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(parsed.paths || {})) {
    const commonParameters = Array.isArray((pathItem as any)?.parameters) ? (pathItem as any).parameters : [];
    for (const method of HTTP_METHODS) {
      const op = (pathItem as any)?.[method];
      if (!op) continue;
      const parameters = [...commonParameters, ...(Array.isArray(op.parameters) ? op.parameters : [])].map((param) =>
        resolveRef(parsed, param),
      );
      endpoints.push({
        method: method.toUpperCase(),
        path,
        operationId: op.operationId,
        summary: op.summary,
        description: op.description,
        parameters,
        requestBody: resolveMediaSchemas(parsed, resolveRef(parsed, op.requestBody)),
        responses: resolveResponses(parsed, op.responses),
        tags: op.tags || [],
      });
    }
  }

  return {
    title: parsed.info?.title || "Untitled API",
    version: parsed.info?.version || "1.0.0",
    description: parsed.info?.description,
    endpoints,
    schemas: Object.keys(parsed.components?.schemas || {}),
    servers: parsed.servers || [],
    tags: parsed.tags || [],
  };
}

export function generateValue(schema: any): any {
  if (!schema) return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (Array.isArray(schema.examples) && schema.examples.length) return schema.examples[0];
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];
  if (Array.isArray(schema.oneOf) && schema.oneOf.length) return generateValue(schema.oneOf[0]);
  if (Array.isArray(schema.anyOf) && schema.anyOf.length) return generateValue(schema.anyOf[0]);
  if (Array.isArray(schema.allOf) && schema.allOf.length) {
    return schema.allOf.reduce((acc: any, item: any) => {
      const value = generateValue(item);
      return typeof value === "object" && !Array.isArray(value) ? { ...acc, ...value } : value;
    }, {});
  }

  const type = schema.type || (schema.properties ? "object" : schema.items ? "array" : "string");
  const formats: Record<string, () => any> = {
    email: () => "user@example.com",
    uri: () => "https://example.com/resource",
    url: () => "https://example.com/resource",
    date: () => new Date().toISOString().split("T")[0],
    "date-time": () => new Date().toISOString(),
    uuid: () => crypto.randomUUID(),
    password: () => "********",
    hostname: () => "api.example.com",
    ipv4: () => "127.0.0.1",
  };
  if (schema.format && formats[schema.format]) return formats[schema.format]();

  switch (type) {
    case "object": {
      const obj: any = {};
      for (const [key, value] of Object.entries(schema.properties || {})) obj[key] = generateValue(value);
      return obj;
    }
    case "array":
      return [generateValue(schema.items || { type: "string" })];
    case "string":
      return schema.title ? String(schema.title).toLowerCase().replace(/\s+/g, "_") : "string";
    case "integer":
      return Number.isFinite(schema.minimum) ? schema.minimum : 1;
    case "number":
      return Number.isFinite(schema.minimum) ? schema.minimum : 1.25;
    case "boolean":
      return true;
    case "null":
      return null;
    default:
      return null;
  }
}

export function compareOpenApiSpecs(oldContent: string, newContent: string) {
  const oldSpec = parseOpenApiSpec(oldContent);
  const newSpec = parseOpenApiSpec(newContent);
  const oldMap = new Map(oldSpec.endpoints.map((endpoint) => [`${endpoint.method}:${endpoint.path}`, endpoint]));
  const newMap = new Map(newSpec.endpoints.map((endpoint) => [`${endpoint.method}:${endpoint.path}`, endpoint]));
  const changes: any[] = [];

  const requiredBodyFields = (endpoint: ParsedEndpoint) =>
    new Set<string>(endpoint.requestBody?.content?.["application/json"]?.schema?.required || []);
  const responseProps = (endpoint: ParsedEndpoint) => {
    const okCode = Object.keys(endpoint.responses || {}).find((code) => code.startsWith("2")) || "200";
    return endpoint.responses?.[okCode]?.content?.["application/json"]?.schema?.properties || {};
  };

  for (const [key] of oldMap) {
    if (!newMap.has(key)) {
      const [method, ...rest] = key.split(":");
      changes.push({
        severity: "breaking",
        type: "endpoint_removed",
        path: `${method} ${rest.join(":")}`,
        message: "Endpoint removed — existing clients can receive 404",
        suggestion: "Keep the endpoint during a deprecation window or add a versioned replacement.",
      });
    }
  }

  for (const [key, nextEndpoint] of newMap) {
    const [method, ...rest] = key.split(":");
    const display = `${method} ${rest.join(":")}`;
    const previousEndpoint = oldMap.get(key);

    if (!previousEndpoint) {
      changes.push({ severity: "info", type: "endpoint_added", path: display, message: "New endpoint added." });
      continue;
    }

    const oldRequired = requiredBodyFields(previousEndpoint);
    const newRequired = requiredBodyFields(nextEndpoint);
    for (const field of newRequired) {
      if (!oldRequired.has(field)) {
        changes.push({
          severity: "breaking",
          type: "required_field_added",
          path: `${display} → body.${field}`,
          message: `New required field added: "${field}"`,
          suggestion: "Make it optional with a default, or ship the change behind a new API version.",
        });
      }
    }
    for (const field of oldRequired) {
      if (!newRequired.has(field)) {
        changes.push({ severity: "info", type: "required_field_removed", path: `${display} → body.${field}`, message: `Required field removed: "${field}".` });
      }
    }

    const oldProps = responseProps(previousEndpoint);
    const newProps = responseProps(nextEndpoint);
    for (const [field, newProp] of Object.entries(newProps)) {
      const oldProp = oldProps[field];
      if (oldProp && oldProp.type !== (newProp as any).type) {
        changes.push({
          severity: "breaking",
          type: "response_type_changed",
          path: `${display} → response.${field}`,
          message: `Response type changed: ${oldProp.type || "unknown"} → ${(newProp as any).type || "unknown"}`,
          suggestion: "Preserve the previous type until clients migrate.",
        });
      }
    }
    for (const field of Object.keys(oldProps)) {
      if (!newProps[field]) {
        changes.push({
          severity: "warning",
          type: "response_field_removed",
          path: `${display} → response.${field}`,
          message: `Response field removed: "${field}"`,
          suggestion: "Confirm no clients depend on this field before release.",
        });
      }
    }
    for (const field of Object.keys(newProps)) {
      if (!oldProps[field]) changes.push({ severity: "info", type: "response_field_added", path: `${display} → response.${field}`, message: `New response field: "${field}".` });
    }
  }

  return {
    oldVersion: oldSpec.version,
    newVersion: newSpec.version,
    changes,
    breaking: changes.filter((change) => change.severity === "breaking").length,
    warnings: changes.filter((change) => change.severity === "warning").length,
    info: changes.filter((change) => change.severity === "info").length,
    parsedData: newSpec,
  };
}
