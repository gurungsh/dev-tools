/* eslint-disable @typescript-eslint/no-explicit-any */
// Seeded dummy-data generator driven by JSON Schema / OpenAPI schema objects.
// Works fully offline; supports $ref (local), allOf/oneOf/anyOf, enums, formats and constraints.

export type Schema = Record<string, any>;

export interface GenOptions {
  seed: number;
  /** Include properties that are not listed in `required`. */
  includeOptional: boolean;
  /** Default number of items for arrays without minItems/maxItems. */
  arrayLength: number;
  /** Use `example` values from the schema when present. */
  useExamples: boolean;
  /** Omit readOnly properties (they are not sent in requests). */
  skipReadOnly: boolean;
}

export const DEFAULT_GEN_OPTIONS: GenOptions = {
  seed: 1,
  includeOptional: true,
  arrayLength: 2,
  useExamples: true,
  skipReadOnly: true,
};

export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery', 'Quinn', 'Priya', 'Liam', 'Mei', 'Omar', 'Sofia'];
const LAST = ['Smith', 'Johnson', 'Lee', 'Garcia', 'Brown', 'Khan', 'Nguyen', 'Silva', 'Muller', 'Kim', 'Patel', 'Rossi', 'Tanaka', 'Cohen'];
const CITIES = ['Springfield', 'Riverton', 'Lakewood', 'Fairview', 'Georgetown', 'Brookfield', 'Kingston', 'Ashland'];
const COUNTRIES = ['United States', 'Canada', 'Germany', 'Japan', 'Brazil', 'India', 'Australia', 'France'];
const STREETS = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Park Rd', 'Elm St', 'Hill Blvd'];
const WORDS = ['alpha', 'bravo', 'delta', 'echo', 'lorem', 'ipsum', 'dolor', 'amet', 'nova', 'pixel', 'orbit', 'maple', 'river', 'stone', 'cloud', 'ember', 'quartz', 'harbor'];
const DOMAINS = ['example.com', 'example.org', 'test.dev', 'acme.io'];

export class Generator {
  private rng: () => number;
  private refStack: string[] = [];

  constructor(private root: Schema, private opts: GenOptions) {
    this.rng = mulberry32(opts.seed);
  }

  // ---------- primitives ----------
  private pick<T>(arr: T[]): T {
    return arr[Math.floor(this.rng() * arr.length)];
  }
  private int(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min + 1)) + min;
  }
  private word(): string {
    return this.pick(WORDS);
  }
  private hex(n: number): string {
    let s = '';
    for (let i = 0; i < n; i++) s += this.int(0, 15).toString(16);
    return s;
  }
  private uuid(): string {
    return `${this.hex(8)}-${this.hex(4)}-4${this.hex(3)}-${this.pick(['8', '9', 'a', 'b'])}${this.hex(3)}-${this.hex(12)}`;
  }
  private date(): Date {
    // Deterministic range: 2020-01-01 .. 2030-12-31
    const start = Date.UTC(2020, 0, 1);
    const end = Date.UTC(2030, 11, 31);
    return new Date(start + Math.floor(this.rng() * (end - start)));
  }
  private sentence(words = 6): string {
    const s = Array.from({ length: words }, () => this.word()).join(' ');
    return s[0].toUpperCase() + s.slice(1) + '.';
  }

  // ---------- $ref ----------
  resolve(schema: Schema): Schema {
    let s = schema;
    const seen = new Set<string>();
    while (s && typeof s.$ref === 'string' && !seen.has(s.$ref)) {
      seen.add(s.$ref);
      s = this.deref(s.$ref);
    }
    return s;
  }
  private deref(ref: string): Schema {
    return resolveRef(this.root, ref) ?? {};
  }

  // ---------- main ----------
  generate(schema: Schema | undefined, name = '', depth = 0): any {
    if (!schema || typeof schema !== 'object') return this.stringFor(name, {});
    if (depth > 12) return null;

    if (typeof schema.$ref === 'string') {
      const ref = schema.$ref;
      // Break reference cycles: allow each ref to appear at most twice on the stack.
      if (this.refStack.filter((r) => r === ref).length >= 2) return null;
      this.refStack.push(ref);
      try {
        return this.generate(this.deref(ref), name, depth + 1);
      } finally {
        this.refStack.pop();
      }
    }

    if (this.opts.useExamples && schema.example !== undefined) return clone(schema.example);
    if (schema.const !== undefined) return clone(schema.const);
    if (Array.isArray(schema.enum) && schema.enum.length) return clone(this.pick(schema.enum));
    if (schema.default !== undefined && this.opts.useExamples) return clone(schema.default);

    if (Array.isArray(schema.allOf)) {
      const { allOf, ...rest } = schema;
      const merged = allOf.reduce((acc: Schema, part: Schema) => mergeSchemas(acc, this.flatten(part)), this.flatten(rest));
      return this.generate(merged, name, depth + 1);
    }
    const alt = schema.oneOf ?? schema.anyOf;
    if (Array.isArray(alt) && alt.length) {
      const { oneOf: _o, anyOf: _a, ...rest } = schema;
      void _o; void _a;
      const choice = alt.find((s: Schema) => s?.type !== 'null') ?? alt[0];
      return this.generate(Object.keys(rest).length ? mergeSchemas(rest, this.flatten(choice)) : choice, name, depth + 1);
    }

    let type: string | undefined = Array.isArray(schema.type) ? schema.type.find((t: string) => t !== 'null') : schema.type;
    if (!type) type = schema.properties || schema.additionalProperties ? 'object' : schema.items ? 'array' : undefined;

    switch (type) {
      case 'object':
        return this.object(schema, depth);
      case 'array':
        return this.array(schema, name, depth);
      case 'integer':
        return this.integer(schema, name);
      case 'number':
        return this.number(schema, name);
      case 'boolean':
        return this.rng() < 0.5;
      case 'null':
        return null;
      case 'string':
      default:
        return this.stringFor(name, schema);
    }
  }

  /** Resolve $ref chains and nested allOf into a single plain schema. */
  private flatten(schema: Schema): Schema {
    const s = this.resolve(schema);
    if (!s || !Array.isArray(s.allOf)) return s ?? {};
    const { allOf, ...rest } = s;
    return allOf.reduce((acc: Schema, part: Schema) => mergeSchemas(acc, this.flatten(part)), rest);
  }

  private object(schema: Schema, depth: number): Record<string, any> {
    const out: Record<string, any> = {};
    const props: Record<string, Schema> = schema.properties ?? {};
    const required: string[] = Array.isArray(schema.required) ? schema.required : [];
    for (const [key, sub] of Object.entries(props)) {
      const resolved = this.resolve(sub);
      if (this.opts.skipReadOnly && resolved?.readOnly) continue;
      if (!required.includes(key) && !this.opts.includeOptional) continue;
      out[key] = this.generate(sub, key, depth + 1);
    }
    const ap = schema.additionalProperties;
    if (ap && typeof ap === 'object' && Object.keys(props).length === 0) {
      for (let i = 1; i <= 2; i++) out[`key${i}`] = this.generate(ap, `key${i}`, depth + 1);
    }
    return out;
  }

  private array(schema: Schema, name: string, depth: number): any[] {
    const min = schema.minItems ?? 0;
    const max = schema.maxItems ?? Infinity;
    const len = Math.min(Math.max(this.opts.arrayLength, min), max);
    return Array.from({ length: len }, () => this.generate(schema.items ?? {}, singular(name), depth + 1));
  }

  private integer(schema: Schema, name: string): number {
    let [lo, hi] = this.range(schema, name, 1, 1000);
    lo = Math.ceil(lo);
    hi = Math.floor(hi);
    if (hi < lo) hi = lo;
    let v = this.int(lo, hi);
    if (schema.multipleOf) {
      const m = schema.multipleOf;
      v = Math.min(Math.max(Math.round(v / m) * m, Math.ceil(lo / m) * m), hi);
    }
    return v;
  }

  private number(schema: Schema, name: string): number {
    const [lo, hi] = this.range(schema, name, 1, 1000);
    let v = lo + this.rng() * (hi - lo);
    v = schema.multipleOf ? Math.round(v / schema.multipleOf) * schema.multipleOf : Math.round(v * 100) / 100;
    return Math.min(Math.max(v, lo), hi);
  }

  private range(schema: Schema, name: string, defLo: number, defHi: number): [number, number] {
    const n = name.toLowerCase();
    if (/age$/.test(n)) [defLo, defHi] = [18, 90];
    else if (/year/.test(n)) [defLo, defHi] = [1990, 2030];
    else if (/(count|quantity|qty|total|number)$/.test(n)) [defLo, defHi] = [1, 20];
    else if (/(percent|rate|score)/.test(n)) [defLo, defHi] = [0, 100];
    else if (/(price|amount|cost|balance)/.test(n)) [defLo, defHi] = [5, 500];
    else if (/lat/.test(n)) [defLo, defHi] = [-90, 90];
    else if (/(lng|lon)/.test(n)) [defLo, defHi] = [-180, 180];
    let lo = schema.minimum ?? defLo;
    let hi = schema.maximum ?? defHi;
    if (schema.exclusiveMinimum !== undefined) lo = typeof schema.exclusiveMinimum === 'number' ? schema.exclusiveMinimum + (schema.type === 'integer' ? 1 : 0.01) : lo + 1;
    if (schema.exclusiveMaximum !== undefined) hi = typeof schema.exclusiveMaximum === 'number' ? schema.exclusiveMaximum - (schema.type === 'integer' ? 1 : 0.01) : hi - 1;
    if (schema.minimum !== undefined && schema.maximum === undefined && hi < lo) hi = lo + 1000;
    if (schema.maximum !== undefined && schema.minimum === undefined && lo > hi) lo = hi - 1000;
    return [lo, hi];
  }

  // ---------- strings ----------
  private stringFor(name: string, schema: Schema): string {
    let s = this.byFormat(schema.format) ?? this.byName(name) ?? this.words(schema);
    const min = schema.minLength ?? 0;
    const max = schema.maxLength ?? Infinity;
    while (s.length < min) s += this.word();
    if (s.length > max) s = s.slice(0, max);
    return s;
  }

  private words(schema: Schema): string {
    const max = schema.maxLength ?? Infinity;
    const n = max < 12 ? 1 : 2;
    return Array.from({ length: n }, () => this.word()).join(' ');
  }

  private byFormat(format?: string): string | undefined {
    switch (format) {
      case 'uuid': case 'guid': return this.uuid();
      case 'date-time': return this.date().toISOString();
      case 'date': return this.date().toISOString().slice(0, 10);
      case 'time': return this.date().toISOString().slice(11, 19);
      case 'email': return this.email();
      case 'uri': case 'url': case 'iri': return `https://${this.pick(DOMAINS)}/${this.word()}/${this.int(1, 999)}`;
      case 'hostname': return `${this.word()}.${this.pick(DOMAINS)}`;
      case 'ipv4': return `${this.int(1, 223)}.${this.int(0, 255)}.${this.int(0, 255)}.${this.int(1, 254)}`;
      case 'ipv6': return Array.from({ length: 8 }, () => this.hex(4)).join(':');
      case 'byte': return btoa(this.sentence(3));
      case 'binary': return this.hex(16);
      case 'password': return this.hex(12);
      case 'phone': return this.phone();
      default: return undefined;
    }
  }

  private email(): string {
    return `${this.pick(FIRST)}.${this.pick(LAST)}@${this.pick(DOMAINS)}`.toLowerCase();
  }
  private phone(): string {
    return `+1-${this.int(200, 999)}-${this.int(200, 999)}-${this.int(1000, 9999)}`;
  }

  private byName(name: string): string | undefined {
    const n = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!n) return undefined;
    if (n.includes('email')) return this.email();
    if (n.includes('firstname') || n === 'givenname') return this.pick(FIRST);
    if (n.includes('lastname') || n === 'surname' || n === 'familyname') return this.pick(LAST);
    if (n.includes('username') || n === 'login' || n === 'handle') return `${this.pick(FIRST)}${this.int(1, 99)}`.toLowerCase();
    if (n === 'name' || n === 'fullname' || n.endsWith('personname')) return `${this.pick(FIRST)} ${this.pick(LAST)}`;
    if (n.includes('phone') || n.includes('mobile') || n === 'tel') return this.phone();
    if (n.includes('city') || n === 'town') return this.pick(CITIES);
    if (n.includes('country')) return this.pick(COUNTRIES);
    if (n.includes('street') || n === 'address' || n === 'address1' || n === 'addressline1') return `${this.int(1, 9999)} ${this.pick(STREETS)}`;
    if (n.includes('zip') || n.includes('postal')) return String(this.int(10000, 99999));
    if (n === 'state' || n === 'province') return this.pick(['CA', 'NY', 'TX', 'WA', 'FL']);
    if (n.includes('url') || n.includes('website') || n.includes('link')) return this.byFormat('uri');
    if (n.includes('password') || n.includes('secret') || n.includes('token')) return this.hex(24);
    if (n === 'id' || n.endsWith('id') || n.includes('uuid') || n.includes('guid')) return this.uuid();
    if (n.includes('currency')) return this.pick(['USD', 'EUR', 'GBP', 'JPY']);
    if (n.includes('status')) return this.pick(['active', 'pending', 'inactive']);
    if (n.includes('color') || n.includes('colour')) return `#${this.hex(6)}`;
    if (n.includes('createdat') || n.includes('updatedat') || n.endsWith('at') || n.includes('timestamp') || n.includes('datetime')) return this.date().toISOString();
    if (n.includes('date') || n.includes('birthday') || n === 'dob') return this.date().toISOString().slice(0, 10);
    if (n.includes('description') || n.includes('comment') || n.includes('message') || n.includes('note') || n.includes('summary') || n.includes('bio')) return this.sentence(7);
    if (n.includes('title') || n.includes('subject')) return this.sentence(3).replace(/\.$/, '');
    if (n.includes('company') || n.includes('organization') || n.includes('organisation')) return `${this.pick(LAST)} ${this.pick(['Ltd', 'Inc', 'LLC', 'Group'])}`;
    return undefined;
  }
}

// ---------- helpers ----------
export function clone<T>(v: T): T {
  return v === undefined ? v : JSON.parse(JSON.stringify(v));
}

function singular(name: string): string {
  return name.replace(/ies$/i, 'y').replace(/s$/i, '');
}

export function resolveRef(root: Schema, ref: string): Schema | undefined {
  if (!ref.startsWith('#')) return undefined; // remote refs are unavailable offline
  const parts = ref.slice(1).split('/').filter(Boolean).map((p) => decodeURIComponent(p).replace(/~1/g, '/').replace(/~0/g, '~'));
  let cur: any = root;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/** Shallow-ish merge used for allOf: unions properties and required, later schemas win for scalars. */
export function mergeSchemas(a: Schema, b: Schema): Schema {
  const out: Schema = { ...a, ...b };
  if (a.properties || b.properties) out.properties = { ...(a.properties ?? {}), ...(b.properties ?? {}) };
  if (a.required || b.required) out.required = [...new Set([...(a.required ?? []), ...(b.required ?? [])])];
  return out;
}

// ---------- infer a schema from sample JSON ----------
const RE = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  dateTime: /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  uri: /^https?:\/\/\S+$/i,
  ipv4: /^(\d{1,3}\.){3}\d{1,3}$/,
};

export function inferSchema(value: unknown): Schema {
  if (value === null) return { type: 'null' };
  if (Array.isArray(value)) {
    const items = value.map(inferSchema).reduce<Schema | undefined>((acc, s) => (acc ? unionSchemas(acc, s) : s), undefined);
    return { type: 'array', items: items ?? {} };
  }
  switch (typeof value) {
    case 'boolean':
      return { type: 'boolean' };
    case 'number':
      return Number.isInteger(value)
        ? { type: 'integer', minimum: value >= 0 ? 0 : value * 2, maximum: value >= 0 ? Math.max(10, value * 2) : 0 }
        : { type: 'number', minimum: value >= 0 ? 0 : value * 2, maximum: value >= 0 ? Math.max(10, value * 2) : 0 };
    case 'string': {
      const s: Schema = { type: 'string' };
      if (RE.uuid.test(value)) s.format = 'uuid';
      else if (RE.dateTime.test(value)) s.format = 'date-time';
      else if (RE.date.test(value)) s.format = 'date';
      else if (RE.email.test(value)) s.format = 'email';
      else if (RE.uri.test(value)) s.format = 'uri';
      else if (RE.ipv4.test(value)) s.format = 'ipv4';
      return s;
    }
    case 'object': {
      const props: Record<string, Schema> = {};
      for (const [k, v] of Object.entries(value as object)) props[k] = inferSchema(v);
      return { type: 'object', properties: props, required: Object.keys(props) };
    }
    default:
      return {};
  }
}

/** Combine two inferred schemas (e.g. array elements) into one that covers both. */
function unionSchemas(a: Schema, b: Schema): Schema {
  if (a.type === 'object' && b.type === 'object') {
    const props: Record<string, Schema> = { ...a.properties };
    for (const [k, v] of Object.entries<Schema>(b.properties ?? {})) props[k] = props[k] ? unionSchemas(props[k], v) : v;
    const required = (a.required ?? []).filter((k: string) => (b.required ?? []).includes(k));
    return { type: 'object', properties: props, required };
  }
  if (a.type === 'array' && b.type === 'array') return { type: 'array', items: unionSchemas(a.items ?? {}, b.items ?? {}) };
  if ((a.type === 'integer' || a.type === 'number') && (b.type === 'integer' || b.type === 'number')) {
    return { type: a.type === 'number' || b.type === 'number' ? 'number' : 'integer', minimum: Math.min(a.minimum ?? 0, b.minimum ?? 0), maximum: Math.max(a.maximum ?? 10, b.maximum ?? 10) };
  }
  if (a.type === 'null') return b;
  if (b.type === 'null') return a;
  return a;
}

export function generateFromSchema(schema: Schema, opts: GenOptions, root: Schema = schema): any {
  return new Generator(root, opts).generate(schema);
}

/** Generate dummy data with the same shape as a sample JSON value. */
export function generateFromSample(sample: unknown, opts: GenOptions): any {
  return generateFromSchema(inferSchema(sample), { ...opts, useExamples: false });
}
