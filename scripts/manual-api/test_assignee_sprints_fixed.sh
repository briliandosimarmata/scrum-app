#!/bin/bash

# Complete test for Assignee Sprints API

BASE_URL="${BASE_URL:-http://localhost:8080/api}"
CONTENT_TYPE="Content-Type: application/json"

echo "==================================="
echo "Assignee Sprints API Test"
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

# Extract access token (note: it's "token", not "accessToken")
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token"
  exit 1
fi

echo "✓ Login successful"
echo ""

echo "Step 3: Get Assignee Sprints"
SPRINTS_RESPONSE=$(curl -s -X GET "$BASE_URL/private/v1/assignee/sprints" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$SPRINTS_RESPONSE" | python3 -m json.tool
echo ""

# Check success
SUCCESS=$(echo "$SPRINTS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('success', False))" 2>/dev/null)

if [ "$SUCCESS" = "True" ]; then
  echo "✓ API call successful"
  SPRINT_COUNT=$(echo "$SPRINTS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', {}).get('sprints', [])))" 2>/dev/null)
  echo "Total sprints found: $SPRINT_COUNT"
else
  echo "❌ API call failed"
fi

echo ""
echo "==================================="
echo "Test completed"
echo "==================================="
