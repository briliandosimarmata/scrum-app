#!/bin/bash

# Test script for Assignee Sprints API
# This script will test the complete flow of getting sprints for an assignee

BASE_URL="${BASE_URL:-http://localhost:8080/api}"
CONTENT_TYPE="Content-Type: application/json"

echo "==================================="
echo "Testing Assignee Sprints API"
echo "==================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test credentials
EMAIL="${TEST_EMAIL:?Set TEST_EMAIL to an existing test account email}"
PASSWORD="${TEST_PASSWORD:?Set TEST_PASSWORD to a disposable test account password}"

echo "${YELLOW}Step 1: Login${NC}"
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
  echo "${RED}❌ Failed to get access token. Login failed.${NC}"
  exit 1
fi

echo "${GREEN}✓ Login successful${NC}"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo ""

echo "${YELLOW}Step 2: Get Assignee Sprints${NC}"
SPRINTS_RESPONSE=$(curl -s -X GET "$BASE_URL/private/v1/assignee/sprints" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$SPRINTS_RESPONSE" | python3 -m json.tool
echo ""

# Check if request was successful
SUCCESS=$(echo "$SPRINTS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('success', False))" 2>/dev/null)

if [ "$SUCCESS" = "True" ]; then
  echo "${GREEN}✓ Successfully retrieved assignee sprints${NC}"

  # Count sprints
  SPRINT_COUNT=$(echo "$SPRINTS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', {}).get('sprints', [])))" 2>/dev/null)
  echo "Total sprints: $SPRINT_COUNT"
else
  echo "${RED}❌ Failed to retrieve assignee sprints${NC}"
fi

echo ""
echo "==================================="
echo "Test completed"
echo "==================================="
