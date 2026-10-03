#!/bin/bash

# Test script for User Roles API with existing assignee user
# This script tests the /api/private/v1/user/roles endpoint with a user who has assignee roles

BASE_URL="${BASE_URL:-http://localhost:8080}"

echo "=== Testing User Roles API with Assignee User ==="
echo

# Use existing test credentials from assignee registration
EMAIL="${TEST_EMAIL:?Set TEST_EMAIL to an existing test account email}"
PASSWORD="${TEST_PASSWORD:?Set TEST_PASSWORD to a disposable test account password}"

echo "1. Logging in with existing user..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/public/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\"
  }")

echo "Login response: $LOGIN_RESPONSE"
echo

# Extract token from login response
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to login or get token"
    exit 1
fi

echo "✅ User logged in successfully"
echo

echo "2. Testing User Roles API..."
USER_ROLES_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/private/v1/user/roles" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "User Roles response: $USER_ROLES_RESPONSE"
echo

# Check if response is successful
SUCCESS=$(echo "$USER_ROLES_RESPONSE" | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
    echo "✅ User Roles API test successful!"

    # Extract role information
    IS_PROJECT_MANAGER=$(echo "$USER_ROLES_RESPONSE" | jq -r '.data.isProjectManager // false')
    IS_ASSIGNEE=$(echo "$USER_ROLES_RESPONSE" | jq -r '.data.isAssignee // false')

    echo "📊 Role Information:"
    echo "   - isProjectManager: $IS_PROJECT_MANAGER"
    echo "   - isAssignee: $IS_ASSIGNEE"

    if [ "$IS_PROJECT_MANAGER" = "true" ] && [ "$IS_ASSIGNEE" = "true" ]; then
        echo "✅ Expected result: User has both project manager and assignee roles"
    elif [ "$IS_PROJECT_MANAGER" = "true" ] && [ "$IS_ASSIGNEE" = "false" ]; then
        echo "ℹ️  User is project manager but not assignee (no assignee registration yet)"
    else
        echo "⚠️  Unexpected result: User roles don't match expected values"
    fi
else
    echo "❌ User Roles API test failed!"
    ERROR_MESSAGE=$(echo "$USER_ROLES_RESPONSE" | jq -r '.message // "Unknown error"')
    echo "Error: $ERROR_MESSAGE"
fi

echo
echo "=== Test completed ==="
