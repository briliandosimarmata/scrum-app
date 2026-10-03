#!/bin/bash
API_BASE_URL="${API_BASE_URL:-http://localhost:8080}"
SPRINT_ID="${SPRINT_ID:?Set SPRINT_ID to a sprint accessible to your assignee}"
TASK_ID="${TASK_ID:?Set TASK_ID to a task assigned to your assignee}"
JWT_TOKEN="${JWT_TOKEN:?Set JWT_TOKEN to your assignee access token}"


if [ -z "$JWT_TOKEN" ]; then
  echo "Failed to get JWT token"; exit 1;
fi

echo "PATCH update status"
RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PATCH \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}' \
  "$API_BASE_URL/api/private/v1/assignee/sprints/$SPRINT_ID/tasks/$TASK_ID/status")
CODE=$(echo "$RESP" | sed -n '$p' | cut -d: -f2)
BODY=$(echo "$RESP" | sed '$d')
echo "Status: $CODE"; echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
