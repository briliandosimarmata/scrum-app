# Frontend contributor instructions

These instructions supplement the root `AGENTS.md` for `scrum-app-ui/`.

## Structure and conventions

- Angular 20 standalone application with zoneless change detection. Preserve the bootstrap/provider setup in `src/app/app.config.ts`.
- Routes are lazy loaded through `src/app/app.routes.ts` and `features/auth/auth.routes.ts`.
- Keep feature screens in `src/app/features/`, singleton integration/state services in `src/app/core/services/`, and reusable components/interfaces in `src/app/shared/`.
- Follow `.cursor/rules/cursor.mdc` when adding Angular code: strict TypeScript, `inject()`, signals/computed values, `input()`/`output()`, OnPush change detection, native template control flow, and reactive forms for new form work. Existing code is mixed; avoid unrelated rewrites.
- Use the existing Tailwind CSS 4/PostCSS, SCSS, Font Awesome, and shared components before introducing another UI system.
- Mockups under `mockups/` are design references, not running routes or authoritative API contracts.

## Integration and state

- Shared DTOs/enums live in `src/app/shared/interfaces/index.ts`. Update them with corresponding backend contract changes.
- HTTP services use `environment.apiUrl`, which already ends with `/api`; preserve `/public/v1` and `/private/v1` path suffixes.
- Manager browser routes use a project code. `projectGuard` resolves UUIDs and caches them in `LayoutService`; scoped API calls use those UUIDs.
- `LayoutService` owns manager project/sprint context. `AssigneeLayoutService` owns assignee sprint context. Auth and per-user role preference live in `AuthService`/local storage.
- Role guards guide navigation. Backend ownership/assignment checks remain mandatory.
- The main services call the real API. `MockApiService` is a retained simulation, not a global offline switch.
- My Tasks uses five-item cursor pages and offers only TODO/IN_PROGRESS/DONE; keep closed tasks hidden.
- Use the toast service for feedback and provide loading/empty/error states.
- Backend JSON omits null fields and timestamps arrive as strings. Handle missing `data`, `error`, `nextCursor`, and timeline fields defensively.
- Read `../docs/known-gaps.md` before modifying JWT headers/refresh handling or timelines.

## Commands

Run from this folder: `npm ci`, `npm start`, `npm run build`, `npm run build -- --configuration development`, or `npm test -- --watch=false` as appropriate to the requested work.

Production replaces `src/environments/environment.ts` with `environment.prod.ts`, currently targeting `https://scrum-api.brilliand.cloud/api`. Development uses localhost:8080. The root `.env` is for the backend and is not read by the browser build.

Existing tests use Jasmine/Karma and Chrome. There is no configured end-to-end runner or lint npm script. Keep `package-lock.json` synchronized when intentionally changing dependencies; leave `node_modules/`, `.angular/`, and `dist/` ignored.
