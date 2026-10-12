export const EXAMPLE_JSON = `{
  "id": "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "age": 34,
  "active": true,
  "balance": 1250.75,
  "createdAt": "2024-03-15T10:30:00Z",
  "address": { "street": "12 Main St", "city": "Springfield", "zip": "62704" },
  "orders": [
    { "orderId": 1001, "total": 59.9, "status": "shipped" }
  ]
}`;

export const EXAMPLE_SPEC = `openapi: 3.0.3
info:
  title: Pet Store
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
  schemas:
    Owner:
      type: object
      required: [firstName, email]
      properties:
        firstName: { type: string }
        email: { type: string, format: email }
        phone: { type: string }
    NewPet:
      type: object
      required: [name, species]
      properties:
        id: { type: string, format: uuid, readOnly: true }
        name: { type: string, minLength: 2, maxLength: 20 }
        species: { type: string, enum: [dog, cat, bird] }
        age: { type: integer, minimum: 0, maximum: 20 }
        vaccinated: { type: boolean }
        birthDate: { type: string, format: date }
        tags:
          type: array
          items: { type: string }
          maxItems: 3
        owner: { $ref: '#/components/schemas/Owner' }
paths:
  /pets:
    get:
      summary: List pets
      parameters:
        - { name: limit, in: query, schema: { type: integer, minimum: 1, maximum: 50 } }
        - { name: species, in: query, schema: { type: string, enum: [dog, cat, bird] } }
    post:
      summary: Add a pet
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewPet'
  /pets/{petId}:
    put:
      summary: Update a pet
      parameters:
        - { name: petId, in: path, required: true, schema: { type: string, format: uuid } }
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewPet'
`;
