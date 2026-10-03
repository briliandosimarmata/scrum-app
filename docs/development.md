# Development guide

## Prerequisites and installation

- Node.js 24 and npm. The locked Angular tooling accepts Node `^20.19.0 || ^22.12.0 || >=24.0.0`.
- JDK 24, selected by the Java toolchain in `scrum-app-api/build.gradle`.
- PostgreSQL and a database role with access to the configured database and permission to create the application schema objects.
- The included Gradle 8.14.3 wrapper; a separate global Gradle installation is unnecessary.
- For manual API scripts: Bash, curl, jq, and Python 3 where used.

Run `npm ci` inside `scrum-app-ui/` to reproduce its `package-lock.json`. Each application remains independently buildable. There is no root dependency install step.

## Environment setup

On a fresh clone, copy root `.env.example` to `.env`, set its values, and protect it with `chmod 600 .env`. Shell-quote values containing spaces or shell metacharacters. Never commit the filled-in file.

The original working folder's ignored `.env` preserves its previous database credentials, dev JWT secret, and project master key. Original configuration/script files are also kept under ignored `.local-backups/originals/`. These local files are absent from GitHub clones.

Before starting the backend, run from the repository root in Bash or Zsh:

```bash
set -a
source .env
set +a
cd scrum-app-api
./gradlew bootRun
```

Spring Boot uses exported variables; it does not load `.env` itself. Required secret variables have no committed fallback after the import.

| Variable | Usage / default |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `dev` by default; use `prod` for production configuration |
| `DATABASE_URL` | JDBC URL; dev fallback `jdbc:postgresql://localhost:5432/scrum_app_dev`, prod fallback points to `scrum_app_prod` |
| `DB_USERNAME`, `DB_PASSWORD` | Required PostgreSQL credentials for dev/prod |
| `JWT_SECRET` | Required signing secret; use a high-entropy value of at least 32 characters |
| `JWT_EXPIRATION` | Base fallback 86400000 ms; prod fallback 3600000 ms; dev profile currently fixes 86400000 |
| `JWT_REFRESH_EXPIRATION` | Base fallback 604800000 ms; prod fallback 86400000 ms; dev profile currently fixes 604800000 |
| `PROJECT_KEY_MASTER_KEY` | Required hex-encoded AES key; use 64 hex characters for AES-256 |
| `PROJECT_KEY_EXPIRATION_DAYS` | Default 30 |
| `PROJECT_KEY_LENGTH` | Default 8 alphanumeric characters |
| `CORS_ALLOWED_ORIGINS` | Required in prod; dev profile fixes localhost/127.0.0.1 origins on port 4200 |
| `CORS_ALLOWED_METHODS` | Required in prod; dev profile fixes GET,POST,PUT,DELETE,OPTIONS,PATCH |
| `CORS_ALLOWED_HEADERS`, `CORS_ALLOW_CREDENTIALS` | Main defaults `*` and `true`; dev/prod currently specify these directly |
| `SERVER_PORT` | Spring configuration override for port; YAML default is 8080 |

Generate the two cryptographic secrets separately with `openssl rand -hex 32`. Store the results securely and reuse them for the same environment/database. JWT secret changes invalidate existing tokens. Project master key changes require planning for existing encrypted keys and their HMAC lookup digests.

## Database and profiles

Create the database and role matching `.env`, for example with `createuser --pwprompt scrum_app` and `createdb --owner=scrum_app scrum_app_dev`. PostgreSQL must be available before normal API startup.

| Profile | Database/configuration behavior |
| --- | --- |
| Base | Default active profile dev; JPA validates the schema; Flyway enabled with migration/checksum validation |
| `dev` | PostgreSQL development database; detailed SQL/security/application logging; allows Flyway clean through configuration; fixed local CORS and token lifetimes |
| `prod` | PostgreSQL, environment credentials/keys/CORS, reduced logging, log file under `logs/`, Flyway clean disabled |
| `test` | H2 in memory, Flyway disabled, JPA `create-drop`; inherits the main PostgreSQL dialect unless separately overridden |

The test profile does not prove compatibility with PostgreSQL-specific SQL or JSONB mappings. The sole backend context test has no explicit test profile; a normal `./gradlew test` uses dev configuration unless the environment changes it.

Flyway migrations V1–V14 define the existing schema. Add later migrations for schema changes instead of modifying applied files. Existing databases with pre-V14 enrollment keys may have no digest; key regeneration or a deliberate backfill is needed for digest-based enrollment lookup.

## Frontend configuration

`src/environments/environment.ts` uses `http://localhost:8080/api`. `environment.prod.ts` uses `https://scrum-api.brilliand.cloud/api`. Both set a 5000 ms toast timeout. Angular's production build replaces the dev environment file with the production file.

These are frontend build-time values, not automatic reads from the root `.env`. Changing backend port/origin requires updating the frontend API URL or CORS configuration accordingly. The dev CORS profile supports port 4200; a different UI port needs corresponding API configuration.

```bash
cd scrum-app-ui
npm start
npm run build
npm run build -- --configuration development
```

The production build uses bundle/style budgets from `angular.json`. Output is under `dist/scrum-app-ui/` (the application builder may place browser assets in its `browser/` directory). The router expects SPA fallback support when hosted.

## Backend build and execution

From `scrum-app-api/`, after loading the environment for application execution:

```bash
./gradlew bootJar
java -jar build/libs/scrum-app-0.0.1-SNAPSHOT.jar
```

`bootJar` packages the API without invoking tests. `./gradlew build` also invokes checks/tests and therefore needs the environment/database expected by the context test. Use `SPRING_PROFILES_ACTIVE=prod` for production execution after setting production credentials, database URL, secrets, and CORS values.

The API exposes `GET /api/public/v1/health` and public Actuator health at `/actuator/health`. Only the first follows the custom response envelope.

## Existing checks and manual scripts

Frontend unit/component tests use Jasmine/Karma and a Chrome launcher:

```bash
cd scrum-app-ui
npm test -- --watch=false
```

Backend has one `@SpringBootTest` context test:

```bash
cd scrum-app-api
./gradlew test
```

Manual API scripts live in [scripts/manual-api](../scripts/manual-api/README.md). They are exploratory helpers with limited assertions and sometimes print full responses containing tokens. Some create users or update tasks. Supply disposable test account credentials or an assignee access token through environment variables and run them intentionally against a local development API.

No tests or application builds were run during the documentation/import task. Git content, ignore rules, credential exposure, and the pushed repository are checked as part of the import; these checks do not establish runtime correctness.
