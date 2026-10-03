# Scrum App API

The backend for [Scrum App](../README.md), built with Spring Boot 3.5.6, Java 24, PostgreSQL, Spring Security/JWT, JPA, Flyway, and Lombok.

## Local development

Configure PostgreSQL and root `.env` using the [development guide](../docs/development.md). From the monorepo root:

```bash
set -a
source .env
set +a
cd scrum-app-api
./gradlew bootRun
```

The API listens on port 8080 and defaults to `dev`. Flyway applies V1–V14 and JPA validates the schema. Credentials and keys come from exported environment variables; Spring Boot does not read `.env` automatically.

From this folder, `./gradlew bootJar` creates `build/libs/scrum-app-0.0.1-SNAPSHOT.jar`. `./gradlew test` runs the existing context test against the dev environment/database unless overridden. The H2 profile is not verified for PostgreSQL queries.

## Code and contracts

Source under `src/main/java/com/scrumku/scrumapp/` covers auth, master project/assignee/department data, sprints, tasks, assignee workflows, common DTOs/dropdowns, and configuration. Migrations live in `src/main/resources/db/migration/`.

- [Backend AI instructions](AGENTS.md)
- [API catalog](../docs/api.md)
- [Project specification](../docs/project-specification.md)
- [Architecture](../docs/architecture.md)
- [Known gaps](../docs/known-gaps.md)
- [Manual API helpers](../scripts/manual-api/README.md)

Public health is at `/api/public/v1/health`. Private routes require Bearer JWTs plus ownership/assignment checks. Responses use `success`, `message`, and optional `data`/`error` properties.
