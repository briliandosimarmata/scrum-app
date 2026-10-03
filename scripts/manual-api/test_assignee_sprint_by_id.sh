#!/bin/bash

# Test script for Get Assignee Sprint by ID API

BASE_URL="${BASE_URL:-http://localhost:8080/api}"
CONTENT_TYPE="Content-Type: application/json"

echo "==================================="
echo "Test: Get Assignee Sprint by ID API"
echo "==================================="
echo ""

# Generate unique email for testing
TIMESTAMP=$(date +%s)
EMAIL="${TEST_EMAIL:-testuser.$(date +%s)@example.com}"
PASSWORD="${TEST_PASSWORD:?Set TEST_PASSWORD to a disposable test account password}"

echo "Step 1: Register new user"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/public/v1/auth/register" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "$REGISTER_RESPONSE" | python3 -m json.tool
echo ""

echo "Step 2: Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/public/v1/auth/login" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | python3 -m json.tool
echo ""

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token"
  exit 1
fi

echo "✓ Login successful"
echo ""

# Test with a fake sprint ID first (should return 404)
FAKE_SPRINT_ID="00000000-0000-0000-0000-000000000000"

echo "Step 3: Try to access a non-existent sprint (should fail)"
echo "Sprint ID: $FAKE_SPRINT_ID"
SPRINT_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/private/v1/assignee/sprints/$FAKE_SPRINT_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_STATUS=$(echo "$SPRINT_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$SPRINT_RESPONSE" | sed '/HTTP_STATUS/d')

echo "$RESPONSE_BODY" | python3 -m json.tool
echo "HTTP Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "404" ]; then
  echo "✓ Correctly returned 404 for non-existent sprint"
else
  echo "❌ Expected 404 but got $HTTP_STATUS"
fi

echo ""
echo "==================================="
echo "Note: To test with a real sprint:"
echo "1. Create a project as project manager"
echo "2. Create an assignee"
echo "3. Create a sprint"
echo "4. Assign tasks to the assignee"
echo "5. Register the user as that assignee"
echo "6. Then use the sprint ID in this test"
echo "==================================="
