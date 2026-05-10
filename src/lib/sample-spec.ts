export const SAMPLE_SPEC_YAML = `openapi: 3.0.3
info:
  title: Petstore API
  version: 1.0.0
  description: A sample Petstore API to demonstrate Flowt.
servers:
  - url: https://api.petstore.example.com/v1
tags:
  - name: Pets
  - name: Users
paths:
  /pets:
    get:
      tags: [Pets]
      summary: List all pets
      operationId: listPets
      parameters:
        - name: limit
          in: query
          schema: { type: integer, minimum: 1, maximum: 100 }
      responses:
        "200":
          description: A list of pets.
          content:
            application/json:
              schema:
                type: array
                items: { $ref: "#/components/schemas/Pet" }
    post:
      tags: [Pets]
      summary: Create a pet
      operationId: createPet
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, species]
              properties:
                name: { type: string }
                species: { type: string, enum: [dog, cat, bird] }
                tag: { type: string }
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Pet" }
  /pets/{id}:
    get:
      tags: [Pets]
      summary: Get pet by id
      operationId: getPet
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string, format: uuid }
      responses:
        "200":
          description: A pet
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Pet" }
    delete:
      tags: [Pets]
      summary: Delete pet
      responses:
        "204": { description: Deleted }
  /users:
    get:
      tags: [Users]
      summary: List users
      responses:
        "200":
          description: ok
          content:
            application/json:
              schema:
                type: array
                items: { $ref: "#/components/schemas/User" }
    post:
      tags: [Users]
      summary: Create user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, name]
              properties:
                email: { type: string, format: email }
                name: { type: string }
      responses:
        "201":
          description: created
          content:
            application/json:
              schema: { $ref: "#/components/schemas/User" }
components:
  schemas:
    Pet:
      type: object
      required: [id, name, species]
      properties:
        id: { type: string, format: uuid }
        name: { type: string }
        species: { type: string, enum: [dog, cat, bird] }
        tag: { type: string }
        createdAt: { type: string, format: date-time }
    User:
      type: object
      required: [id, email, name]
      properties:
        id: { type: string, format: uuid }
        email: { type: string, format: email }
        name: { type: string }
        createdAt: { type: string, format: date-time }
`;
