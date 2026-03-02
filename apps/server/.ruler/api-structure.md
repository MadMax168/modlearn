# API Structure (Server)

This document defines the current server API structure for `apps/server`.

## Core Principle

- oRPC is the primary API layer.
- Elysia is the HTTP host/runtime.
- Prefer oRPC procedures for all internal app APIs.
- Use raw Elysia routes only for exceptional cases (auth endpoints, OpenAPI docs, non-RPC behavior).

## Current Folder Structure

```text
apps/server/src/
├── modules/
│   ├── category/
│   │   ├── category.router.ts
│   │   ├── category.service.ts
│   │   ├── category.types.ts
│   │   ├── category.validators.ts
│   │   └── category.utils.ts
│   ├── genre/
│   │   ├── genre.router.ts
│   │   ├── genre.service.ts
│   │   ├── genre.types.ts
│   │   ├── genre.validators.ts
│   │   └── genre.utils.ts
│   ├── content/
│   │   ├── content.router.ts
│   │   ├── content.service.ts
│   │   ├── content.types.ts
│   │   ├── content.validators.ts
│   │   └── content.utils.ts
│   ├── playlist/
│   │   ├── playlist.router.ts
│   │   ├── playlist.service.ts
│   │   ├── playlist.types.ts
│   │   ├── playlist.validators.ts
│   │   └── playlist.utils.ts
│   ├── file/
│   │   ├── file.router.ts
│   │   ├── file.service.ts
│   │   ├── file.types.ts
│   │   └── file.validators.ts
│   ├── watch-progress/
│   │   ├── watch-progress.router.ts
│   │   ├── watch-progress.service.ts
│   │   ├── watch-progress.types.ts
│   │   └── watch-progress.validators.ts
│   └── admin-audit/
│       ├── admin-audit.service.ts
│       └── admin-audit.types.ts
├── orpc/
│   ├── context.ts
│   ├── context.types.ts
│   ├── error-mapper.ts
│   ├── index.ts
│   ├── openapi.ts
│   └── router.ts
└── index.ts
```

## Module Responsibilities

### `*.validators.ts`
- Owns Zod schemas and input validation rules.
- Router `.input(...)` should use these schemas.

### `*.types.ts`
- Owns module-specific TypeScript interfaces/types and domain errors.
- Service parameter/result types live here.

### `*.utils.ts`
- Owns pure helper functions.
- No side effects and no DB write/query behavior.
- Keep helpers local to module unless truly shared.

### `*.service.ts`
- Owns business logic and DB operations.
- Accepts typed params from module `*.types.ts`.
- Can use module `*.utils.ts` and validators-derived inputs.

## oRPC Layer Responsibilities

### `modules/*/*.router.ts`
- Defines public/protected/admin procedures.
- Calls service functions.
- Uses `publicProcedure`, `protectedProcedure`, and `adminProcedure` from `orpc/index.ts`.

### `orpc/error-mapper.ts`
- Central place for domain error mapping to `ORPCError`.
- Keep mappings consistent across routers and interceptors.

### `orpc/context.ts` and `orpc/context.types.ts`
- `context.types.ts` defines context input types.
- `context.ts` builds runtime context (`db`, `session`).

### `orpc/openapi.ts`
- Generates OpenAPI specs from `appRouter`.
- Defines tags and security scheme metadata.

## Rules

1. Use `@/...` path aliases for internal imports.
2. Do not add `*.handlers.ts` files for normal server modules.
3. Keep routers thin: validation + procedure wiring + error mapping.
4. Keep services focused on business logic and persistence.
5. Put reusable pure helpers in module `*.utils.ts`.
6. Use shared domain error mapping from `orpc/error-mapper.ts`.
7. Keep function signatures and API behavior stable during refactors unless explicitly requested.

## Testing Expectations

After structural refactors, run:

1. `bun run check-types`
2. `bun run test:server`
3. `bun x ultracite check`

All must pass before merge.
