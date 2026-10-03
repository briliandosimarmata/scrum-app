# Backend contributor instructions

These instructions supplement the root `AGENTS.md` for `scrum-app-api/`.

## Structure and conventions

- Spring Boot 3.5.6 application in package `com.scrumku.scrumapp`, using Java 24 and the Gradle 8.14.3 wrapper.
- Keep domain code in `auth/`, `master/`, `sprint/`, `task/`, `assignee/`, and `common/`, following their controller/service/repository/entity/DTO layout.
- Controllers handle HTTP mapping/status and extract the current user through `SecurityUtils`. Services implement validation/transactions. Repositories handle JPA/native SQL.
- Use existing `ApiResponse<T>` factories and error-code conventions. Check controller statuses rather than assuming all service failures map to the same status.
- Validate request DTOs with Bean Validation and keep frontend interfaces aligned.
- UUID is the resource identity. Display codes must not replace ownership checks.
- Lombok annotation processing is configured; preserve existing constructor injection conventions.

## Authorization and persistence

- Public API paths are allowed by the filter chain; enrollment authenticates supplied credentials. Private routes require JWT authentication plus domain ownership/assignment checks.
- Project manager capability applies to every account; access to a project must match its owner UUID.
- Assignee access derives from `user_assignees` and tasks. Account/assignee IDs are distinct; queries must scope by the current user and relevant project/sprint/task.
- Enforce intended permissions on the backend. The existing assignee CLOSED restriction is a known gap, not an approved capability.
- Use PostgreSQL for native SQL integration. Do not assume H2 supports JSONB, partial indexes, upserts, aggregations, tuple cursors, or the Flyway schema.
- Native projections often use `Object[]`; keep SQL column order and Java mapping synchronized.
- Preserve applied migrations V1–V14; add a new migration for schema changes. Normal configuration uses Flyway and JPA schema validation.
- Review JPA/native write paths for optimistic versions, timestamps, rollback, and nullable relationships.
- Keep code counters atomic; preserve dependency cycle validation and dependent-task deletion restrictions.
- Read `../docs/known-gaps.md` before changing scheduling/capacity, status handling, cursors, project keys, or JWT validation.

## Configuration and commands

Load root `.env` into the shell before execution; see `../docs/development.md`. Required dev/prod values are `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and `PROJECT_KEY_MASTER_KEY`. Keep secrets and plaintext project keys out of source, docs, and logs.

Use a 64-character hexadecimal project master key for AES-256. Preserve it for existing databases; encrypted keys and HMAC digests depend on it. Represent new configuration safely in root `.env.example`.

Run from this folder: `./gradlew bootRun`, `./gradlew bootJar`, `./gradlew test`, or `./gradlew build` as appropriate. Build/test invoke the existing context test, which defaults to dev and needs its environment/database. The H2 test profile is unverified for native queries.

Keep `gradlew`, `gradlew.bat`, and `gradle/wrapper/gradle-wrapper.jar` tracked. Keep `.gradle/`, `build/`, `bin/`, logs, IDE state, credentials, and database exports ignored.
