import { describe, expect, it } from 'vitest';
import { buildRequest, parseSpec, SpecError, toCurl, toFetch } from './openapi';
import { DEFAULT_GEN_OPTIONS } from './sampleGen';

const v3 = `
openapi: 3.0.0
info: { title: Pets }
servers:
  - url: https://api.{env}.example.com/v1
    variables: { env: { default: dev } }
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer }
  schemas:
    NewPet:
      type: object
      required: [name]
      properties:
        name: { type: string }
        age: { type: integer, minimum: 1, maximum: 3 }
        id: { type: string, readOnly: true }
paths:
  /pets/{petId}:
    parameters:
      - { name: petId, in: path, required: true, schema: { type: integer } }
    get:
      summary: Get pet
      parameters:
        - { name: verbose, in: query, schema: { type: boolean } }
  /pets:
    post:
      operationId: addPet
      security: [{ bearerAuth: [] }]
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/NewPet' }
`;

const v2 = JSON.stringify({
  swagger: '2.0',
  host: 'api.example.com',
  basePath: '/v2',
  schemes: ['https'],
  paths: {
    '/users': {
      post: {
        consumes: ['application/json'],
        parameters: [{ in: 'body', name: 'body', schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } }],
      },
    },
    '/login': {
      post: { consumes: ['application/x-www-form-urlencoded'], parameters: [{ in: 'formData', name: 'username', type: 'string' }] },
    },
  },
});

describe('openapi', () => {
  it('lists v3 operations and server url with variables', () => {
    const p = parseSpec(v3);
    expect(p.version).toBe('3');
    expect(p.baseUrl).toBe('https://api.dev.example.com/v1');
    expect(p.operations.map((o) => o.key)).toEqual(['GET /pets/{petId}', 'POST /pets']);
  });

  it('builds GET with path and query params', () => {
    const p = parseSpec(v3);
    const r = buildRequest(p, p.operations[0], DEFAULT_GEN_OPTIONS);
    expect(r.url).toMatch(/^https:\/\/api\.dev\.example\.com\/v1\/pets\/\d+\?verbose=(true|false)$/);
    expect(r.body).toBeUndefined();
  });

  it('builds POST body, skips readOnly, adds bearer auth', () => {
    const p = parseSpec(v3);
    const r = buildRequest(p, p.operations[1], DEFAULT_GEN_OPTIONS);
    expect(r.body).toMatchObject({ name: expect.any(String) });
    expect((r.body as Record<string, unknown>).id).toBeUndefined();
    expect(r.headers.Authorization).toBe('Bearer <token>');
    expect(r.headers['Content-Type']).toBe('application/json');
    expect(toCurl(r)).toContain("-H 'Authorization: Bearer <token>'");
    expect(toFetch(r)).toContain('fetch(');
  });

  it('handles swagger 2 body and formData', () => {
    const p = parseSpec(v2);
    expect(p.version).toBe('2');
    expect(p.baseUrl).toBe('https://api.example.com/v2');
    const body = buildRequest(p, p.operations[0], DEFAULT_GEN_OPTIONS);
    expect((body.body as { email: string }).email).toContain('@');
    const form = buildRequest(p, p.operations[1], DEFAULT_GEN_OPTIONS);
    expect(form.contentType).toBe('application/x-www-form-urlencoded');
    expect(toCurl(form)).toContain('--data-urlencode');
  });

  it('rejects non-openapi documents', () => {
    expect(() => parseSpec('{"a":1}')).toThrow(SpecError);
    expect(() => parseSpec('openapi: 3.0.0')).toThrow(/paths/);
  });
});
