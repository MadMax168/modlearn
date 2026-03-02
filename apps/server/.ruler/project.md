# Project Rules

## Imports

- Always use `@`-prefixed aliases for internal imports.
- Avoid relative imports for cross-folder server modules.

## Server Structure

- Keep module shape consistent: `*.router.ts`, `*.service.ts`, `*.types.ts`, `*.validators.ts`, optional `*.utils.ts`.
- Do not introduce `*.handlers.ts` as an extra layer unless explicitly required.

## Router Conventions

- Keep oRPC router files thin.
- Centralize domain error mapping in `src/orpc/error-mapper.ts`.
- Keep oRPC context input types in `src/orpc/context.types.ts`.
