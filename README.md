# Scrum App

A personal Scrum project management application with separate project manager and assignee experiences. This monorepo contains the Angular frontend in `scrum-app-ui/` and the Spring Boot backend in `scrum-app-api/`.

Project managers create projects, maintain assignees and departments, plan sprints, edit and reorder tasks, inspect capacity, and view timelines. Registered assignees can choose their assigned sprints, view a task summary, update task status, and view their timeline.

## Repository layout

```text
scrum-app/
├── AGENTS.md                 # Shared instructions for AI contributors
├── README.md                 # Entry point and local setup
├── .env.example              # Configuration template; real .env is ignored
├── scrum-app-ui/             # Angular application; independent npm package
│   ├── AGENTS.md
│   ├── src/
│   └── mockups/              # Frontend design references, including assignee screens
├── scrum-app-api/            # Spring Boot application; independent Gradle build
│   ├── AGENTS.md
│   └── src/main/resources/db/migration/
├── docs/                     # Specification, architecture, API, setup, and known gaps
│   ├── design/legacy/        # Original root HTML mockups and requirements
│   └── history/              # Original Cursor implementation reports
└── scripts/manual-api/       # Existing API exploration scripts
```

Both applications are ordinary folders tracked by the root Git repository. They are built separately; there is no root npm workspace or combined Gradle build.

## Stack

| Part | Technologies in the source |
| --- | --- |
| Frontend | Angular 20, TypeScript 5.9, standalone components, zoneless change detection, signals, RxJS, Tailwind CSS 4, Angular CDK, Font Awesome |
| Backend | Spring Boot 3.5.6, Java 24 toolchain, Gradle 8.14.3 wrapper, Spring Security, Spring Data JPA, Bean Validation, Lombok |
| Database | PostgreSQL, Flyway migrations V1–V14, native SQL queries, JSONB holidays |
| Authentication | BCrypt passwords, JWT access and refresh tokens, user-to-assignee links |

Dependency versions come from the package manifests and lockfile, rather than the older design requirements. Use Node.js 24 for local development; the checked-in Angular tooling accepts `^20.19.0 || ^22.12.0 || >=24.0.0`. Install a JDK 24 and a PostgreSQL server. The Gradle wrapper is included.

## Start locally

For a fresh clone, create the root configuration file:

```bash
git clone https://github.com/briliandosimarmata/scrum-app.git
cd scrum-app
cp .env.example .env
chmod 600 .env
```

Fill in `DB_USERNAME` and `DB_PASSWORD`. Generate `JWT_SECRET` and `PROJECT_KEY_MASTER_KEY` separately with `openssl rand -hex 32`, and paste the results into `.env`. Each command creates a different value. Keep the project master key stable for an existing database.

The original imported working folder already has an ignored `.env` containing its preserved API development settings. See [development setup](docs/development.md) before changing those settings.

Create the development database and a login role matching `.env`, for example:

```bash
createuser --pwprompt scrum_app
createdb --owner=scrum_app scrum_app_dev
```

In a terminal at the repository root, export the environment and start the API:

```bash
set -a
source .env
set +a
cd scrum-app-api
./gradlew bootRun
```

Spring Boot does not automatically read `.env`. The API runs at `http://localhost:8080`, defaults to the `dev` profile, and applies Flyway migrations at startup. Development CORS allows `http://localhost:4200` and `http://127.0.0.1:4200`.

In a second terminal at the repository root:

```bash
cd scrum-app-ui
npm ci
npm start
```

Open `http://localhost:4200`. Register an account to start creating projects. For the assignee experience, a project owner creates an assignee record and generates a project key; an existing user then links their account through `/auth/assignee-registration` using their email, password, assignee code, and project key.

```bash
curl http://localhost:8080/api/public/v1/health
```

## Build and test commands

| Working folder | Command | Purpose |
| --- | --- | --- |
| `scrum-app-ui/` | `npm run build` | Production bundle; uses `environment.prod.ts` |
| `scrum-app-ui/` | `npm run build -- --configuration development` | Development bundle using the local API URL |
| `scrum-app-ui/` | `npm test -- --watch=false` | Existing Jasmine/Karma tests; requires Chrome |
| `scrum-app-api/` | `./gradlew bootJar` | Executable JAR without invoking tests |
| `scrum-app-api/` | `./gradlew test` | Existing context test; load API environment and supply its database |

The existing backend context test uses the default development profile unless overridden. The H2 test profile is not a verified replacement for the PostgreSQL queries. There is no configured end-to-end suite or CI pipeline. See [known gaps](docs/known-gaps.md).

The production frontend currently targets `https://scrum-api.brilliand.cloud/api`. Review `scrum-app-ui/src/environments/environment.prod.ts` and the API `prod` profile before deployment; that URL's availability was not checked during this import.

## Documentation

- [AI contributor instructions](AGENTS.md), with additional [frontend](scrum-app-ui/AGENTS.md) and [backend](scrum-app-api/AGENTS.md) instructions.
- [Project specification](docs/project-specification.md): workflows, implemented behavior, entities, and constraints.
- [Architecture](docs/architecture.md): source map, state, authorization, persistence, and integration.
- [API reference](docs/api.md): controller-derived endpoint catalog and request/response examples.
- [Development guide](docs/development.md): environment variables, profiles, builds, and manual scripts.
- [Known gaps](docs/known-gaps.md): source observations and areas needing verification or fixes.
- [Design references](docs/design/README.md) and [historical reports](docs/history/README.md).
- [Monorepo import notes](docs/monorepo-import.md).

## Project status

This is a development application with substantial frontend/API integration. The documentation describes source inspected during the monorepo import on 2026-10-03. It does not certify runtime correctness or treat historical Cursor test claims as current results. See the known gaps before extending scheduling, authentication, or assignee permissions.
