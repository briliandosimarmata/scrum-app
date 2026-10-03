#!/bin/bash
API_BASE_URL="${API_BASE_URL:-http://localhost:8080}"
SPRINT_ID="${SPRINT_ID:?Set SPRINT_ID to a sprint accessible to your assignee}"
JWT_TOKEN="${JWT_TOKEN:?Set JWT_TOKEN to your assignee access token}"


if [ -z "$JWT_TOKEN" ]; then
  echo "Failed to get JWT token"; exit 1;
fi

echo "GET tasks page 1"
RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "$API_BASE_URL/api/private/v1/assignee/sprints/$SPRINT_ID/tasks?limit=5")
CODE=$(echo "$RESP" | sed -n '$p' | cut -d: -f2)
BODY=$(echo "$RESP" | sed '$d')
echo "Status: $CODE"; echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

CURSOR=$(echo "$BODY" | jq -r '.data.nextCursor // empty')
if [ -n "$CURSOR" ]; then
  echo "\nGET tasks page 2"
  RESP2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    "$API_BASE_URL/api/private/v1/assignee/sprints/$SPRINT_ID/tasks?limit=5&cursor=$CURSOR")
  CODE2=$(echo "$RESP2" | sed -n '$p' | cut -d: -f2)
  BODY2=$(echo "$RESP2" | sed '$d')
  echo "Status: $CODE2"; echo "$BODY2" | jq . 2>/dev/null || echo "$BODY2"
fi
