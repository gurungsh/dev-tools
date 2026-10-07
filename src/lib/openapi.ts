/* eslint-disable @typescript-eslint/no-explicit-any */
import { parse as parseYaml } from 'yaml';
import { clone, Generator, resolveRef, type GenOptions, type Schema } from './sampleGen';

export interface OperationInfo {
  key: string;
  method: string;
  path: string;
  summary?: string;
  operationId?: string;
  operation: any;
  pathItem: any;
}

export interface ParsedSpec {
  spec: any;
  version: '2' | '3';
  title?: string;
  baseUrl: string;
  operations: OperationInfo[];
}

export interface RequestParam {
  name: string;
  in: string;
  required: boolean;
  value: unknown;
}

export interface GeneratedRequest {
  method: string;
  path: string;
  url: string;
  query: [string, string][];
  headers: Record<string, string>;
  params: RequestParam[];
  contentType?: string;
  body?: unknown;
}

const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export class SpecError extends Error {}

export function parseSpec(text: string): ParsedSpec {
  let spec: any;
  try {
    spec = parseYaml(text);
  } catch (e) {
    throw new SpecError(`Could not parse as JSON or YAML: ${(e as Error).message.split('\n')[0]}`);
  }
  if (!spec || typeof spec !== 'object') throw new SpecError('The document is empty or not an object.');
  const version = spec.swagger?.toString().startsWith('2') ? '2' : spec.openapi?.toString().startsWith('3') ? '3' : null;
  if (!version) throw new SpecError('Not a Swagger 2.0 or OpenAPI 3.x document (missing "swagger" / "openapi" field).');
  if (!spec.paths || typeof spec.paths !== 'object') throw new SpecError('The document has no "paths".');

  const operations: OperationInfo[] = [];
  for (const [path, pathItem] of Object.entries<any>(spec.paths)) {
    const item = deref(spec, pathItem);
    for (const method of METHODS) {
      const operation = item?.[method];
      if (!operation) continue;
      operations.push({
        key: `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase(),
        path,
        summary: operation.summary,
        operationId: operation.operationId,
        operation,
        pathItem: item,
      });
    }
  }

  return { spec, version, title: spec.info?.title, baseUrl: baseUrlOf(spec, version), operations };
}

function baseUrlOf(spec: any, version: '2' | '3'): string {
  if (version === '3') {
    const server = spec.servers?.[0];
    if (!server?.url) return 'http://localhost';
    // Substitute server variables with their defaults.
    return String(server.url).replace(/\{(\w+)\}/g, (_m, v) => server.variables?.[v]?.default ?? v).replace(/\/$/, '');
  }
  const scheme = spec.schemes?.[0] ?? 'https';
  return `${scheme}://${spec.host ?? 'localhost'}${spec.basePath ?? ''}`.replace(/\/$/, '');
}

function deref(root: any, node: any): any {
  let cur = node;
  const seen = new Set<string>();
  while (cur && typeof cur.$ref === 'string' && !seen.has(cur.$ref)) {
    seen.add(cur.$ref);
    cur = resolveRef(root, cur.$ref) ?? {};
  }
  return cur;
}

function isJson(ct: string): boolean {
  return /json/i.test(ct);
}

export function buildRequest(parsed: ParsedSpec, op: OperationInfo, opts: GenOptions): GeneratedRequest {
  const { spec, version } = parsed;
  const gen = new Generator(spec, opts);

  // Merge path-level and operation-level parameters (operation wins).
  const merged = new Map<string, any>();
  for (const p of [...(op.pathItem.parameters ?? []), ...(op.operation.parameters ?? [])]) {
    const r = deref(spec, p);
    if (r?.name) merged.set(`${r.in}:${r.name}`, r);
  }

  const params: RequestParam[] = [];
  const formData: Record<string, unknown> = {};
  let body: unknown;
  let contentType: string | undefined;

  for (const p of merged.values()) {
    if (p.in === 'body') {
      body = gen.generate(p.schema, 'body');
      contentType = op.operation.consumes?.[0] ?? spec.consumes?.[0] ?? 'application/json';
      continue;
    }
    const schema: Schema = version === '3' ? (p.schema ?? Object.values<any>(p.content ?? {})[0]?.schema ?? { type: 'string' }) : p;
    let value: unknown;
    if (opts.useExamples && p.example !== undefined) value = clone(p.example);
    else if (opts.useExamples && p.examples && typeof p.examples === 'object') value = clone(Object.values<any>(p.examples)[0]?.value);
    else value = gen.generate(schema, p.name);
    if (p.in === 'formData') {
      formData[p.name] = value;
      continue;
    }
    params.push({ name: p.name, in: p.in, required: !!p.required || p.in === 'path', value });
  }

  if (version === '2' && Object.keys(formData).length) {
    body = formData;
    contentType = op.operation.consumes?.[0] ?? spec.consumes?.[0] ?? 'application/x-www-form-urlencoded';
  }

  if (version === '3' && op.operation.requestBody) {
    const rb = deref(spec, op.operation.requestBody);
    const content: Record<string, any> = rb?.content ?? {};
    const types = Object.keys(content);
    contentType = types.find((t) => t === 'application/json') ?? types.find(isJson) ?? types[0];
    if (contentType) {
      const media = content[contentType];
      if (opts.useExamples && media.example !== undefined) body = clone(media.example);
      else if (opts.useExamples && media.examples && typeof media.examples === 'object' && Object.keys(media.examples).length) {
        body = clone(deref(spec, Object.values<any>(media.examples)[0])?.value);
      } else body = gen.generate(media.schema ?? {}, 'body');
    }
  }

  // Skip optional params if requested (path params are always needed).
  const used = params.filter((p) => p.required || opts.includeOptional);

  let path = op.path;
  const query: [string, string][] = [];
  const headers: Record<string, string> = {};
  for (const p of used) {
    if (p.in === 'path') path = path.replace(`{${p.name}}`, encodeURIComponent(String(p.value)));
    else if (p.in === 'query') {
      if (Array.isArray(p.value)) p.value.forEach((v) => query.push([p.name, String(v)]));
      else query.push([p.name, typeof p.value === 'object' ? JSON.stringify(p.value) : String(p.value)]);
    } else if (p.in === 'header') headers[p.name] = String(p.value);
  }

  const auth = authHeader(spec, op.operation);
  if (auth && !Object.keys(headers).some((h) => h.toLowerCase() === auth[0].toLowerCase())) headers[auth[0]] = auth[1];
  if (body !== undefined && contentType) headers['Content-Type'] = contentType;

  const qs = query.length ? `?${query.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}` : '';
  return { method: op.method, path, url: `${parsed.baseUrl}${path}${qs}`, query, headers, params: used, contentType, body };
}

function authHeader(spec: any, operation: any): [string, string] | undefined {
  const security = operation.security ?? spec.security;
  if (!Array.isArray(security) || !security.length) return undefined;
  const schemes = spec.components?.securitySchemes ?? spec.securityDefinitions ?? {};
  for (const req of security) {
    for (const name of Object.keys(req)) {
      const s = deref(spec, schemes[name]);
      if (!s) continue;
      if (s.type === 'http' && /bearer/i.test(s.scheme ?? '')) return ['Authorization', 'Bearer <token>'];
      if (s.type === 'http' && /basic/i.test(s.scheme ?? '')) return ['Authorization', 'Basic <credentials>'];
      if (s.type === 'basic') return ['Authorization', 'Basic <credentials>'];
      if (s.type === 'apiKey' && s.in === 'header') return [s.name, '<api-key>'];
      if (s.type === 'oauth2' || s.type === 'openIdConnect') return ['Authorization', 'Bearer <token>'];
    }
  }
  return undefined;
}

// ---------- snippets ----------
const q = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;

export function toCurl(req: GeneratedRequest): string {
  const lines = [`curl -X ${req.method} ${q(req.url)}`];
  for (const [k, v] of Object.entries(req.headers)) {
    if (k === 'Content-Type' && req.contentType === 'multipart/form-data') continue; // curl sets the boundary itself
    lines.push(`-H ${q(`${k}: ${v}`)}`);
  }
  if (req.body !== undefined) {
    const obj = req.body && typeof req.body === 'object' ? (req.body as Record<string, unknown>) : null;
    const ct = req.contentType ?? 'application/json';
    if (obj && ct === 'application/x-www-form-urlencoded') {
      for (const [k, v] of Object.entries(obj)) lines.push(`--data-urlencode ${q(`${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)}`);
    } else if (obj && ct === 'multipart/form-data') {
      for (const [k, v] of Object.entries(obj)) lines.push(`-F ${q(`${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)}`);
    } else {
      lines.push(`-d ${q(typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2))}`);
    }
  }
  return lines.join(' \\\n  ');
}

export function toFetch(req: GeneratedRequest): string {
  const init: string[] = [`  method: '${req.method}'`];
  if (Object.keys(req.headers).length) init.push(`  headers: ${indent(JSON.stringify(req.headers, null, 2), 2)}`);
  if (req.body !== undefined) {
    const ct = req.contentType ?? 'application/json';
    if (ct === 'application/x-www-form-urlencoded' && req.body && typeof req.body === 'object') {
      init.push(`  body: new URLSearchParams(${indent(JSON.stringify(req.body, null, 2), 2)})`);
    } else if (ct === 'multipart/form-data') {
      init.push(`  body: Object.entries(${indent(JSON.stringify(req.body, null, 2), 2)}).reduce((f, [k, v]) => (f.append(k, String(v)), f), new FormData())`);
    } else {
      init.push(`  body: JSON.stringify(${indent(JSON.stringify(req.body, null, 2), 2)})`);
    }
  }
  return `const response = await fetch(${JSON.stringify(req.url)}, {\n${init.join(',\n')},\n});\nconst data = await response.json();`;
}

function indent(s: string, n: number): string {
  return s.split('\n').map((l, i) => (i === 0 ? l : ' '.repeat(n) + l)).join('\n');
}
