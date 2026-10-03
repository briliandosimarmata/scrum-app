# API reference

This catalog is derived from controller annotations in `scrum-app-api/src/main/java/com/scrumku/scrumapp/`. It describes the imported implementation, including current limitations. It is not a generated OpenAPI document or a record of live requests.

Development server: `http://localhost:8080`. Paths below include `/api`; the frontend environment's `apiUrl` already includes that prefix.

## Authentication and response envelope

Private requests require:

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

Controllers return `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

```json
{
  "success": false,
  "message": "validation error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation summary",
    "errors": [
      {
        "code": "FIELD_VALIDATION_ERROR",
        "message": "Field constraint message",
        "field": "name"
      }
    ]
  }
}
```

These examples illustrate the shapes. Null fields are omitted by the backend, so a successful void response may have no `data`, and a successful response normally has no `error`. Global exception handling maps validation to 400, bad credentials to 401, access denied to 403, and unexpected exceptions to 500. Service errors are often mapped by individual controllers to 400 or 404; do not assume all missing resources use the same HTTP status.

All resource IDs below are UUIDs. `{projectId}` identifies the project, while `{id}`, `{taskId}`, `{sprintId}`, `{assigneeId}`, and `{departmentId}` identify the corresponding resource. `{code}` is the owner's four-character project code.

## Public endpoints

| Method | Path | Request / result |
| --- | --- | --- |
| GET | `/api/public/v1/health` | Service health DTO in the API envelope |
| POST | `/api/public/v1/auth/register` | `firstName`, `lastName`, `email`, `password` → `AuthResponse`; 201 on success, 400 on service error |
| POST | `/api/public/v1/auth/login` | `email`, `password` → `AuthResponse`; 200/401 |
| POST | `/api/public/v1/auth/refresh` | Refresh token in Authorization header, optional `Bearer ` prefix; returns new `AuthResponse`; 200/401 |
| POST | `/api/public/v1/auth/logout` | Acknowledges client logout; no server token revocation |
| POST | `/api/public/v1/assignee-registration` | `email`, `password`, `assigneeCode`, `projectKey` → linked user/assignee/project information |

`AuthResponse` contains `token`, `refreshToken`, and `user`. The access-token property is `token`, not `accessToken`. The public enrollment service validates credentials and project enrollment information inside its own flow.

`GET /actuator/health` is also permitted by the security chain and uses Spring Actuator's response shape rather than `ApiResponse`. Actuator exposes health/info in configuration; other requests still follow the filter-chain authentication rules.

## Account roles

| Method | Path | Data |
| --- | --- | --- |
| GET | `/api/private/v1/user/roles` | `{ "isProjectManager": true, "isAssignee": boolean }` |

Role flags describe available experiences. Project management endpoints still require project ownership; assignee endpoints filter by account-to-assignee links.

## Projects

Controller: `master/project/controller/ProjectController.java`.

| Method | Path | Data / purpose |
| --- | --- | --- |
| GET | `/api/private/v1/projects` | `{ projects: ProjectResponse[] }` for the current owner |
| POST | `/api/private/v1/projects` | Create a project using `ProjectRequest` |
| GET | `/api/private/v1/projects/{id}` | Owned `ProjectResponse` |
| GET | `/api/private/v1/projects/code/{code}` | Resolve an owned project by its display code |
| PUT | `/api/private/v1/projects/{id}` | Update project using `ProjectRequest` |
| DELETE | `/api/private/v1/projects/{id}` | Delete owned project and cascading resources |
| GET | `/api/private/v1/projects/{id}/summary` | `totalTasks`, `totalSprints`, `totalDepartments`, `totalAssignees` |
| POST | `/api/private/v1/projects/{id}/keys` | Generate/rotate enrollment key; returns project data with displayable key |

`ProjectRequest` contains `name`, `code`, optional `description`, and optional `thumbnailUrl`. See [project specification](project-specification.md) for field limits. Project responses include the UUID, display code, timestamps, and optionally the decrypted enrollment key for the owner.

## Assignee master data

Controller: `master/assignee/controller/AssigneeController.java`. All paths in this table start with `/api/private/v1/projects/{projectId}/assignees`.

| Method | Suffix | Data / purpose |
| --- | --- | --- |
| GET | empty | `{ assignees: AssigneeResponse[], totalCount }` |
| POST | empty | Create assignee from `name`; generated code is returned |
| GET | `/{id}` | Assignee record |
| PUT | `/{id}` | Update assignee name |
| DELETE | `/{id}` | Delete assignee |
| GET | `/{assigneeId}/sprints/{sprintId}/tasks` | Manager view: assignee name, total capacity, capacity left, task rows |

## Departments and members

Controller: `master/department/controller/DepartmentController.java`. Prefix: `/api/private/v1/projects/{projectId}/departments`.

| Method | Suffix | Data / purpose |
| --- | --- | --- |
| GET | empty | `{ departments: DepartmentWithMembersResponse[], totalCount }` |
| POST | empty | Create department with members |
| GET | `/{id}` | Department with member details |
| GET | `/{id}/basic` | Basic department fields |
| PUT | `/{id}` | Update department and explicit member operations |
| DELETE | `/{id}` | Delete department |
| GET | `/{id}/assignees` | Assignees belonging to the department, including priority flags |
| GET | `/{departmentId}/sprints/{sprintId}/tasks` | Department name, total story points, team capacity left, task rows |

The department request includes `name`, `projectId`, and `members`. A member operation has `assigneeId`, `isPriority`, and optional `id`/`markForDelete`. On update, `markForDelete: true` removes the membership; other operations add/update it. Selecting a priority membership clears the same assignee's priority in other departments.

## Sprints

Controller: `sprint/controller/SprintController.java`. Prefix: `/api/private/v1/projects/{projectId}/sprints`.

| Method | Suffix | Data / purpose |
| --- | --- | --- |
| GET | empty | `{ sprints: [{ id, name }] }` for selection |
| POST | empty | Create sprint using `SprintRequest` |
| GET | `/{id}` | Full sprint data, including holiday list and calculated workdays |
| PUT | `/{id}` | Update sprint using `SprintRequest` |
| DELETE | `/{id}` | Delete sprint and cascading tasks |
| GET | `/{sprintId}/timeline` | `startDate`, `endDate`, `holidays`, `taskColumn`, `taskBars` |

Example sprint body:

```json
{
  "name": "Sprint 1",
  "storyPointsPerDay": 5,
  "startDate": "2026-10-05",
  "endDate": "2026-10-16",
  "specificHolidays": ["2026-10-09"]
}
```

The controller supplies project context from the path. Dates use `YYYY-MM-DD`; end must follow start. The holiday list must be present, including `[]` when empty.

## Tasks

Controller: `task/controller/TaskController.java`. Prefix: `/api/private/v1/projects/{projectId}/tasks`.

| Method | Suffix | Data / purpose |
| --- | --- | --- |
| POST | empty | Create task; 201 on success |
| PUT | `/{taskId}` | Replace editable fields using `TaskRequest` |
| GET | `/sprint/{sprintId}` | `TaskResponse[]` for the project/sprint |
| DELETE | `/{taskId}` | Delete a task if it has no dependents |
| PUT | `/reorder` | Persist explicit `{ taskOrders: [{ taskId, taskOrder }] }` |

Example task body:

```json
{
  "description": "Implement the sprint selection screen",
  "storyPoints": 5,
  "status": "TODO",
  "priority": "HIGH",
  "sprintId": "00000000-0000-0000-0000-000000000001",
  "assigneeId": null,
  "departmentId": null,
  "dependencyTaskId": null
}
```

The UUID is illustrative; use an actual sprint in the addressed project. Optional assignee, department, and dependency fields can be omitted or null. On update, null clears those associations. The dependency property is `dependencyTaskId`. Task code and order are generated/set by the backend, with order changes sent to `/reorder`.

Responses include code, resource IDs, display names, dependency code, order, version, and audit timestamps. The API does not expose a separate task detail GET route in this controller.

## Scoped dropdowns

Controller: `common/dropdown/controller/DropdownController.java`. Prefix: `/api/private/v1/projects/{projectId}/dropdowns`.

| Method | Suffix | Data |
| --- | --- | --- |
| GET | `/departments` | Dropdown options with department metadata |
| GET | `/assignees` | Assignee dropdown options, with department metadata |
| GET | `/tasks?sprintId={sprintId}` | Task/dependency options for a sprint |

Option fields include `id`, `name`, optional display/badge fields, and optional `metadata`. Status and priority options also exist as frontend enum-derived options rather than dedicated API controllers.

## Assignee experience

Controller: `assignee/controller/AssigneeSprintController.java`. Prefix: `/api/private/v1/assignee`.

| Method | Suffix | Data / purpose |
| --- | --- | --- |
| GET | `/sprints` | `{ sprints: AssigneeSprintItem[] }`, aggregated across account links |
| GET | `/sprints/{sprintId}` | Accessible sprint/project/task-count/department information; 404 on missing/inaccessible sprint |
| GET | `/sprints/{sprintId}/overview` | Sprint information, project information, four status counts, departments |
| GET | `/sprints/{sprintId}/tasks?limit=5&cursor=...` | `{ tasks: TaskItem[], nextCursor? }`; excludes closed tasks |
| PATCH | `/sprints/{sprintId}/tasks/{taskId}/status` | `{ "status": "IN_PROGRESS" }` → successful void response; 404 when the task is inaccessible |
| GET | `/sprints/{sprintId}/timeline` | `sprintId`, date range, holidays if populated, and task timeline items |

Sprint items contain `id`, `name`, `startDate`, `endDate`, `taskCount`, `project` (`id`, `name`, `thumbnailUrl`, `description`), and `departments`.

Task page items contain `taskId`, `taskCode`, `taskDescription`, `storyPoints`, `status`, `priority`, `order`, optional dependency code, and department name. Page ordering is task order, priority rank (high to low), creation timestamp, then UUID. The cursor is URL-safe Base64 JSON produced by the server; clients should pass it back unchanged. The default page limit is five. `nextCursor` may be absent when there is no next page.

The UI only offers TODO/IN_PROGRESS/DONE status updates. The current controller converts any valid backend status enum, including CLOSED, without enforcing that UI restriction. Invalid enum strings can become 500 responses because the body is not validated. Pagination decoding and timeline output also have source-visible defects; see [known gaps](known-gaps.md).
