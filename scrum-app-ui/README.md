# Scrum App UI

The Angular frontend for [Scrum App](../README.md). It contains the project manager and assignee experiences, using Angular 20 standalone components, zoneless change detection, signals, RxJS, Tailwind CSS 4, SCSS, Angular CDK, and Font Awesome.

## Local development

Start the backend using the root setup guide, then run from this folder:

```bash
npm ci
npm start
```

Open `http://localhost:4200`. Development API requests go to `http://localhost:8080/api`. Use Node.js 24; the locked Angular tooling accepts `^20.19.0 || ^22.12.0 || >=24.0.0`.

```bash
npm run build
npm run build -- --configuration development
npm test -- --watch=false
```

Production replaces `src/environments/environment.ts` with `environment.prod.ts`, currently using `https://scrum-api.brilliand.cloud/api`. Output is under `dist/scrum-app-ui/`. Existing Jasmine/Karma tests require Chrome. There is no configured end-to-end suite or lint npm script.

## Source map

- `src/app/features/`: auth/role selection, projects, manager layout/dashboard, master data, sprint/backlog/summaries/timeline, and assignee screens.
- `src/app/core/`: API services, auth/context state, guards, HTTP interceptors, toasts, and connection status.
- `src/app/shared/`: DTOs/enums and dropdown, modal, toast, and user-menu components.
- `src/app/app.routes.ts`: lazy application routes; manager URLs use project codes, assignee URLs include sprint UUIDs.
- `mockups/`: static design references, including additional assignee feature mockups.

## Documentation

- [Frontend AI instructions](AGENTS.md)
- [Project specification](../docs/project-specification.md)
- [Architecture and integration](../docs/architecture.md)
- [API reference](../docs/api.md)
- [Development configuration](../docs/development.md)
- [Known gaps](../docs/known-gaps.md)

The root `.env` configures the backend; frontend API URLs are build-time TypeScript values. Mockups and `MockApiService` are references/simulation, while the main routed features call the real API.
