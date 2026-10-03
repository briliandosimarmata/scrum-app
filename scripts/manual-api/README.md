# Manual API helpers

These eight scripts were moved from the original root folder. They explore assignee and role endpoints; they are not an automated test suite. They require a running local API, curl, Bash, jq and/or Python 3. Some assertions only print failures rather than returning a failure exit code.

Hardcoded credentials and the saved JWT were removed. Supply credentials through environment variables. Original script copies are retained only in ignored `.local-backups/originals/` on the imported machine.

| Script | Required variables | Behavior |
| --- | --- | --- |
| `test_user_roles_api.sh` | `TEST_PASSWORD`; optional `TEST_EMAIL` | Registers a new account and reads its role flags |
| `test_user_roles_existing.sh` | `TEST_EMAIL`, `TEST_PASSWORD` | Logs in an existing account and reads roles |
| `test_assignee_sprints.sh` | `TEST_EMAIL`, `TEST_PASSWORD` | Logs in and requests the assignee sprint list |
| `test_assignee_sprints_fixed.sh` | `TEST_PASSWORD`; optional `TEST_EMAIL` | Registers/logs in a new account and reads its sprint list |
| `test_assignee_sprint_by_id.sh` | `TEST_PASSWORD`; optional `TEST_EMAIL` | Registers/logs in and checks a deliberately nonexistent sprint |
| `test_assignee_overview.sh` | `JWT_TOKEN`, `SPRINT_ID` | Reads the overview for an accessible sprint |
| `test_assignee_tasks.sh` | `JWT_TOKEN`, `SPRINT_ID` | Reads task pages using the returned cursor |
| `test_update_task_status.sh` | `JWT_TOKEN`, `SPRINT_ID`, `TASK_ID` | Updates an assigned task to IN_PROGRESS |

New-account scripts generate a timestamp-based email when `TEST_EMAIL` is omitted. A new account has no linked assignee automatically, so an empty sprint list is expected. To explore populated data, create a project, assignee, sprint, and assigned task as an owner, generate the project key, then enroll the account through the assignee registration API.

`BASE_URL` is overridable for account/login scripts: defaults are `http://localhost:8080/api` for sprint scripts and `http://localhost:8080` for role scripts. `API_BASE_URL` is overridable for the JWT/ID scripts and defaults to `http://localhost:8080`.

Use disposable test data. Some scripts print complete login/registration responses containing tokens; do not publish captured output. Token prefix preview lines were removed. The sprint-list helper was corrected to read the backend's `data.token` property.

For example, after setting the required variables in your shell, run from the root:

```bash
bash scripts/manual-api/test_user_roles_existing.sh
bash scripts/manual-api/test_assignee_overview.sh
```

No scripts were invoked as part of the monorepo documentation import.
