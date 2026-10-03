# Known gaps from source inspection

These observations were recorded during the 2026-10-03 monorepo import. They are based on source inspection, not executed reproductions. They remain in the application unless a later change explicitly fixes them. Severity/order here reflects likely impact and is not a completed security audit.

## Permissions and authentication

| Observation | Evidence | Consequence / next work |
| --- | --- | --- |
| Assignee status restrictions only exist in the UI | `assignee/controller/AssigneeSprintController.java` converts `StatusUpdateRequest.status` using the full task enum; update service/repository does not restrict allowed target statuses | A linked assignee can request CLOSED directly. Enforce the intended status set on the backend and validate the request |
| JWT filter does not reject refresh tokens as access tokens | `auth/JwtAuthenticationFilter.java` calls `JwtService.validateToken`, which checks subject/expiry; refresh tokens have a `type: refresh` claim | Token type is not part of private-route validation. Add an explicit access-token check |
| JWT interceptor overwrites existing Authorization headers | `scrum-app-ui/src/app/core/interceptors/jwt.interceptor.ts` always sets the stored access token; `AuthService.refreshToken()` supplies a refresh token in that same header | Refresh requests can send the access token instead. Preserve intentional headers or scope the interceptor |
| Expired access tokens trigger logout rather than refresh | `core/interceptors/error.interceptor.ts` handles 401 by calling logout and routing to login | Issued refresh tokens do not provide automatic session renewal |
| Enrollment logs plaintext project keys | `auth/service/AssigneeRegistrationService.java` logs submitted keys, including at INFO | Remove secret values from logging and review existing local logs before distributing them |
| Logout has no server revocation | `auth/controller/AuthController.java` acknowledges client-side removal | A previously issued token remains valid until expiry; evaluate revocation if required |

Backend paths in tables are relative to `scrum-app-api/src/main/java/com/scrumku/scrumapp/`; frontend core paths are relative to `scrum-app-ui/src/app/` unless otherwise stated.

## Scheduling, capacity, and timeline

| Observation | Evidence | Consequence / next work |
| --- | --- | --- |
| Capacity formulas disagree on weekends | `sprint/entity/Sprint.java#getTotalWorkDays` skips weekends; `SprintRepository#getSprintWorkDaysNative` subtracts holiday count from all calendar days | UI/full sprint workdays and manager capacity summaries can differ. Decide a canonical rule and share it |
| Timeline duration uses integer HALF_UP rounding | Both timeline services divide points/day with `RoundingMode.HALF_UP` | Small tasks can round to zero; holiday and inclusive-end calculations vary. Define duration/end-date semantics |
| Manager no-holiday tasks do not advance the next start date | `SprintService#setTimelineTasks`, empty-holiday branch adds a bar then continues | Tasks for the same assignee may overlap |
| Assignee no-holiday tasks are not appended to output | `AssigneeSprintService#setTimelineTasks`, empty-holiday branch sets dates and continues before `taskItems.add` | Tasks can disappear when no later holidays exist |
| Timeline end-date maximum comparator is reversed | Both services call `.max` with `item2.endDate.compareTo(item1.endDate)` | The selected date may be the earliest, preventing the expected range extension |
| Nullable department is dereferenced by timeline generation | Both services call `task.getDepartment().getId()`; task creation permits no department | A valid task without a department can fail timeline generation |
| Assignee timeline chooses only the first linked assignee in a sprint | `AssigneeSprintService#setTimelineTasks` uses the first `userAssignee` row | Multi-link accounts can receive incomplete timeline output |
| Timeline holidays and task arrays are not always populated | Assignee timeline construction omits the holidays field on the accessible-sprint path; empty branches can leave arrays unset | Frontend types assume fields that can be omitted/null |
| Dependencies are not used as a scheduling constraint | Timeline methods process ordered task lists; they do not resolve dependency dates | A dependency field does not imply dependency-aware scheduling |

## Contracts, validation, and persistence

- **Cursor decoding:** `AssigneeSprintService#getAssigneeTasks` splits JSON fields on every `:`. ISO timestamps contain colons, so the `createdAt` field can be skipped. `TaskRepository#findUserAssigneeTasksPagedNative` needs all cursor fields to apply its tuple predicate. Later pages may repeat the first page. Use a real JSON parser and validate the page limit/cursor.
- **Status request validation:** the assignee PATCH body is not annotated with `@Valid`; null/invalid strings can fail enum conversion and reach generic 500 handling. Return structured validation errors instead.
- **Null response fields:** `ApiResponse` uses `NON_NULL`, while the main TypeScript envelope requires `data` and `error`. Update types/consumers to account for optional properties when working on contracts.
- **Audit date types:** some TypeScript models declare audit dates as `Date`, but JSON transport does not instantiate dates. Convert explicitly or declare strings.
- **Capacity lookup scope:** manager assignee/department summaries validate the owned project and master record, then load sprint capacity by sprint UUID alone. Validate that the sprint belongs to the same addressed project as well.
- **Department membership:** task service validates assignee/department project membership, but does not enforce that a selected assignee is actually a member of the selected department. The UI's dropdown dependency is not backend enforcement.
- **Update validation timing:** `TaskService#updateTask` mutates a managed entity before returning some validation errors. With transactions/JPA dirty checking, confirm invalid updates cannot be flushed when an error envelope is returned.
- **Transactions and versions:** many services catch broad exceptions and return envelopes inside transactional methods; native updates can bypass JPA version increments. Review rollback and concurrency behavior before relying on those paths.
- **Project-key digest migration:** V14 adds a nullable digest and a unique index but no backfill. Existing encrypted keys can fail enrollment lookup until regenerated or backfilled using the existing master key.
- **Counter cleanup:** V10's task counter table has no project foreign key. Project deletion can leave task counter rows.

## Validation coverage and operational setup

The backend has one generated context test, with no explicit profile. The frontend includes scaffold/component tests; no configured end-to-end suite, CI pipeline, or lint script was found. Manual scripts have limited assertions and do not build a complete assignee fixture automatically.

`application-test.yml` uses H2 and disables Flyway, while the base profile retains a PostgreSQL dialect. PostgreSQL-specific repositories, JSONB mappings, migrations, and partial indexes need database integration coverage. The H2 profile is not a verified substitute.

The dev profile enables verbose security/SQL logging and configures `flyway.clean-disabled: false`. Production has different defaults. The checked-in production frontend domain was retained as configuration; its live availability and deployment setup were not checked.

Comments, attachments, notifications, live collaboration, time tracking, and reporting proposals from design notes have no application implementation identified in this inspection. Historical reports' checkmarks are not current test results.
