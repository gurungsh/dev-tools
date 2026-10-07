import { describe, expect, it } from 'vitest';
import { DEFAULT_GEN_OPTIONS, generateFromSample, generateFromSchema, inferSchema } from './sampleGen';

const o = { ...DEFAULT_GEN_OPTIONS };

describe('generateFromSchema', () => {
  const schema = {
    type: 'object',
    required: ['id', 'email', 'status'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      status: { type: 'string', enum: ['a', 'b'] },
      age: { type: 'integer', minimum: 5, maximum: 7 },
      tags: { type: 'array', items: { type: 'string' }, minItems: 3 },
      created: { type: 'string', format: 'date-time' },
      secret: { type: 'string', readOnly: true },
    },
  };

  it('is deterministic per seed', () => {
    expect(generateFromSchema(schema, { ...o, seed: 7 })).toEqual(generateFromSchema(schema, { ...o, seed: 7 }));
    expect(generateFromSchema(schema, { ...o, seed: 7 })).not.toEqual(generateFromSchema(schema, { ...o, seed: 8 }));
  });

  it('respects formats, enums, constraints and readOnly', () => {
    const v = generateFromSchema(schema, o);
    expect(v.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(v.email).toMatch(/^[^@]+@[^@]+\.[a-z]+$/);
    expect(['a', 'b']).toContain(v.status);
    expect(v.age).toBeGreaterThanOrEqual(5);
    expect(v.age).toBeLessThanOrEqual(7);
    expect(v.tags).toHaveLength(3);
    expect(new Date(v.created).toISOString()).toBe(v.created);
    expect(v.secret).toBeUndefined();
  });

  it('can omit optional fields', () => {
    const v = generateFromSchema(schema, { ...o, includeOptional: false });
    expect(Object.keys(v).sort()).toEqual(['email', 'id', 'status']);
  });

  it('prefers examples when enabled', () => {
    const s = { type: 'object', properties: { n: { type: 'string', example: 'fixed' } } };
    expect(generateFromSchema(s, o).n).toBe('fixed');
    expect(generateFromSchema(s, { ...o, useExamples: false }).n).not.toBe('fixed');
  });

  it('resolves $ref, allOf and survives cycles', () => {
    const root = {
      components: {
        schemas: {
          Base: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } },
          Pet: { allOf: [{ $ref: '#/components/schemas/Base' }, { type: 'object', properties: { name: { type: 'string' } } }] },
          Node: { type: 'object', properties: { child: { $ref: '#/components/schemas/Node' }, v: { type: 'integer' } } },
        },
      },
    };
    const pet = generateFromSchema({ $ref: '#/components/schemas/Pet' }, o, root);
    expect(typeof pet.id).toBe('number');
    expect(typeof pet.name).toBe('string');
    const node = generateFromSchema({ $ref: '#/components/schemas/Node' }, o, root);
    expect(node.v).toBeTypeOf('number');
  });

  it('uses property-name hints', () => {
    const v = generateFromSchema({ type: 'object', properties: { firstName: { type: 'string' }, phone: { type: 'string' } } }, o);
    expect(v.phone).toMatch(/^\+1-/);
    expect(v.firstName).toMatch(/^[A-Z]/);
  });
});

describe('sample JSON mode', () => {
  const sample = { id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301', n: 5, price: 9.5, ok: true, tags: ['x', 'y'], items: [{ a: 1 }, { a: 2, b: 'z' }], when: '2024-05-01T10:00:00Z', nothing: null };

  it('keeps the shape but changes values', () => {
    const v = generateFromSample(sample, { ...o, seed: 3 });
    expect(Object.keys(v)).toEqual(Object.keys(sample));
    expect(v.id).not.toBe(sample.id);
    expect(v.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Number.isInteger(v.n)).toBe(true);
    expect(typeof v.price).toBe('number');
    expect(typeof v.ok).toBe('boolean');
    expect(Array.isArray(v.tags)).toBe(true);
    expect(v.items[0]).toHaveProperty('a');
    expect(v.nothing).toBeNull();
  });

  it('infers array element union with optional keys', () => {
    const s = inferSchema(sample);
    expect(s.properties.items.items.required).toEqual(['a']);
    expect(Object.keys(s.properties.items.items.properties)).toEqual(['a', 'b']);
  });
});
