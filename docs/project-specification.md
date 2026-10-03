# Project specification derived from source

Snapshot: 2026-10-03. This document describes the imported Angular and Spring Boot source. The original HTML requirements are retained under `design/legacy/`; where they differ, the behavior below follows the code. Runtime behavior was not tested as part of this documentation import.

## Product purpose and users

Scrum App helps an individual project owner organize team members, departments, sprint work, task assignments, dependencies, and capacity. A second experience lets team members work on tasks through linked assignee records.

| Actor | How the code identifies them | Experience |
| --- | --- | --- |
| Account holder | `users` record; email/password authentication | Register, sign in, receive access/refresh tokens |
| Project manager | All authenticated users are eligible; ownership is `projects.user_id` | Manage their own projects and scoped resources |
| Assignee | At least one `user_assignees` link | Choose sprints containing assigned tasks, view summaries/tasks/timeline |

These are contextual capabilities. There is no persisted global manager/assignee role enum on `User`. `UserRoleService` always returns `isProjectManager: true` and derives `isAssignee` from account links.

## Authentication and role selection

1. Register with first name, last name, email, and password, or sign in with email and password.
2. The backend returns `token`, `refreshToken`, and user information. Passwords are stored with BCrypt.
3. The frontend persists authentication in local storage. `AuthService` exposes signals and an observable authentication state.
4. A user without an assignee link is routed to the project list. A linked user can choose the project manager or assignee experience on `/role-selection`.
5. The selected role is stored per user in local storage. Route guards use it for navigation; backend access comes from ownership and account links.
6. Logout clears client authentication. The public logout endpoint acknowledges the request and does not revoke JWTs on the server.

Refresh token issuance and a refresh endpoint exist. Automatic refresh on an expired access token is not implemented in the interceptor; inspect the refresh/header issues in [known gaps](known-gaps.md).

## Project manager workflow

1. Create a project with a name, four-character alphanumeric code, and optional description and thumbnail URL.
2. Enter the project through its code-based browser route. The guard resolves the project UUID and caches project context in `LayoutService`.
3. Maintain project assignees and departments. Assign department memberships and an optional priority department per assignee.
4. Create a sprint with a date range, story points per day, and a list of specific holidays.
5. Select that sprint in the project layout. Create backlog tasks, set points/status/priority, assign departments and assignees, and select optional dependencies.
6. Reorder tasks using the UI and persist explicit `taskOrder` values through the reorder API.
7. Inspect project totals, department work/capacity, assignee work/capacity, and the sprint timeline.
8. Generate or rotate a project enrollment key and share it with the corresponding assignee code to let an existing account link itself.

## Assignee enrollment and workflow

Enrollment is a public API because it authenticates the supplied email/password within the service. It links an existing user to an existing assignee; it is not account creation.

The registration request contains `email`, `password`, `assigneeCode`, and the plaintext `projectKey`. The service authenticates the account, computes an HMAC digest to find the project, checks `keyExpiresAt`, looks up the assignee within that project, rejects duplicate or already-linked assignments, and creates the link.

After selecting the assignee role:

1. The sprint list aggregates sprints across linked assignees where tasks are assigned. It includes project information, department names, and task counts, ordered by sprint start date descending.
2. Choosing a sprint validates access and caches the context in `AssigneeLayoutService`.
3. The dashboard shows sprint dates/duration, project information, department names, and counts for all four task statuses.
4. My Tasks loads cursor-based pages of five tasks, hides `CLOSED`, and offers `TODO`, `IN_PROGRESS`, and `DONE` status changes.
5. The timeline displays backend-calculated task date ranges with month navigation.

The manager code allows an account to be linked to several assignees, including across projects. Assignee list/overview queries aggregate links; the assignee timeline currently processes only the first matching link. This and the backend status restriction are documented gaps.

## Implemented feature map

| Area | Frontend evidence | Backend evidence |
| --- | --- | --- |
| Authentication and enrollment | `features/auth/`, `core/services/auth.service.ts` | `auth/controller/`, `auth/service/` |
| Project cards, CRUD, project key, dashboard totals | `features/projects/`, `features/dashboard/` | `master/project/` |
| Assignee master data | `features/masters/assignee/` | `master/assignee/` |
| Departments and member priorities | `features/masters/department/` | `master/department/` |
| Sprint modal, date/holiday selection | `features/sprints/sprint-modal/` | `sprint/` |
| Backlog editing, dependencies, reordering | `features/sprints/backlog/`, `core/services/task.service.ts` | `task/` |
| Department and assignee task/capacity summaries | `features/sprints/department-tasks/`, `assignee-tasks/` | Master-data summary endpoints and native task queries |
| Manager timeline | `features/sprints/timeline/` | `SprintService.getSprintTimeline` |
| Assignee sprint/dashboard/tasks/timeline | `features/assignee/`, `core/services/sprint.service.ts` | `assignee/` |
| API connection status and toasts | `core/services/connection-status.service.ts`, shared toast components | Public health endpoint |

Frontend paths in this table are relative to `scrum-app-ui/src/app/`; backend paths are relative to `scrum-app-api/src/main/java/com/scrumku/scrumapp/`.

## Data model

| Entity/table | Main fields and relationships | Constraints in source/schema |
| --- | --- | --- |
| `User` / `users` | UUID, email, first/last name, BCrypt password, active, version, timestamps | Unique email |
| `Project` / `projects` | UUID, name/code, description, thumbnail URL, owner, encrypted project key, digest, key expiry, version, timestamps | Code unique per owner; digest unique when present |
| `Assignee` / `assignees` | UUID, generated code, name, project, version, timestamps | Code unique per project |
| `Department` / `departments` | UUID, generated code, name, project, version, timestamps | Code unique per project |
| `DepartmentMember` / `department_members` | Department, assignee, `isPriority`, version, timestamps | Unique membership; partial unique index permits only one priority membership per assignee |
| `Sprint` / `sprints` | UUID, name, points/day, start/end dates, JSONB specific holidays, project, version, timestamps | End date after start date; points/day positive |
| `Task` / `tasks` | UUID, generated code, description, story points, status, priority, order, project, sprint, optional assignee/department/dependency, version, timestamps | Positive points; enum checks; code unique per project; no self-dependency |
| `UserAssignee` / `user_assignees` | User, assignee, timestamps | User can link many records; each assignee can link only one user |
| Counter tables | Assignee/department counters by project and prefix; task counters by project and project code | Atomic SQL counters used to create display codes |

The schema is defined by Flyway V1–V14, not by mock JSON objects. Most entities use optimistic version fields and auditing timestamps. SQL and native queries also update timestamps directly in some paths.

Deletion cascades from users to owned projects and from projects to master data/sprints/tasks. Task assignee, department, and dependency references use `ON DELETE SET NULL`. The task service additionally blocks deletion when dependent tasks exist. `task_counters.project_id` has no foreign key in V10; do not assume every counter row is removed automatically.

## Validation and display codes

- Project request: name 2–20 characters, code exactly four alphanumeric characters, description/thumbnail URL at most 500 characters. Creation checks uniqueness per owner and normalizes the code to uppercase.
- Sprint request: name 2–100 characters; non-null points/day, dates, and holiday array. The service validates date ordering; positive points/day is also a database constraint.
- Task request: description non-null and at most 500 characters; the service rejects blank text. Points must be 1–100. Status, priority, and sprint UUID are required.
- Assignee code: first two project-code characters + two name initials + a hyphen and three-digit counter, such as `SCAB-001`.
- Department code: project code + name initials + counter, such as `SCRU-FE-1`.
- Task code: project code + `-T` + counter, such as `SCRU-T1`. A timestamp fallback exists when counter generation fails.
- Task service checks project ownership, sprint/project consistency, same-project optional references, and dependency cycles. Dependencies are project-scoped and are not restricted to the same sprint by that validation.
- Department member updates are explicit operations; `markForDelete` removes a member. Setting priority clears priority in other departments for that assignee.

## Capacity and timeline behavior

Capacity summaries currently use the native repository formula:

```text
workDays = endDate - startDate + 1 - length(specificHolidays)
assigneeCapacity = workDays * storyPointsPerDay
assigneeCapacityLeft = assigneeCapacity - assignedStoryPoints
departmentCapacity = workDays * storyPointsPerDay * memberCount
departmentCapacityLeft = departmentCapacity - storyPointsForDepartmentMembers
```

This formula includes weekends unless they are explicitly present in the holiday array. In contrast, `Sprint.getTotalWorkDays()` counts only weekdays and excludes holidays. These are different current implementations; see the gap register before choosing a canonical rule.

Timeline services estimate a task duration by dividing its story points by sprint points/day and rounding to an integer with `HALF_UP`, then adjust dates around explicitly configured holidays. They do not implement a dependency-aware scheduling engine. There are defects around no-holiday tasks, task advancement, maximum end date, null departments, and multiple assignee links.

## UI routes

| Route | Purpose |
| --- | --- |
| `/auth/login`, `/auth/register` | Account authentication |
| `/auth/assignee-registration` | Link an existing account to an assignee |
| `/role-selection` | Choose manager or assignee context |
| `/projects` | Project list |
| `/projects/:projectCode/dashboard` | Project totals |
| `/projects/:projectCode/masters/assignee` | Assignee master data |
| `/projects/:projectCode/masters/department` | Departments and members |
| `/projects/:projectCode/sprints/backlog` | Selected sprint backlog |
| `/projects/:projectCode/sprints/department-tasks` | Department tasks/capacity |
| `/projects/:projectCode/sprints/assignee-tasks` | Assignee tasks/capacity |
| `/projects/:projectCode/sprints/timeline` | Manager timeline |
| `/assignee-dashboard/sprints` | Assigned sprint list |
| `/assignee-dashboard/sprints/:sprintId/dashboard` | Assignee sprint overview |
| `/assignee-dashboard/sprints/:sprintId/my-tasks` | Paginated assigned tasks and status updates |
| `/assignee-dashboard/sprints/:sprintId/timeline` | Assignee timeline |

The root route redirects to role selection; the wildcard route redirects to projects. Feature routes are lazy loaded. Project sprint selection lives in `LayoutService`, while assignee URLs include a sprint UUID.

## Features without an implementation found

No application implementation was found for task comments, file attachments/uploads, tracked working time, notifications, live multi-user synchronization, burndown reports, or an administrative role system. Thumbnail URLs are strings, not a file upload feature. Treat optional enhancements in the original requirements and historical reports as proposals.
