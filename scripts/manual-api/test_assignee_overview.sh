#!/bin/bash

# Test script for assignee sprint overview API
# This script tests the GET /api/private/v1/assignee/sprints/{sprintId}/overview endpoint

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:8080}"
SPRINT_ID="${SPRINT_ID:?Set SPRINT_ID to a sprint accessible to your assignee}"
JWT_TOKEN="${JWT_TOKEN:?Set JWT_TOKEN to your assignee access token}"

echo "Testing Assignee Sprint Overview API..."
echo "======================================"

# Test the overview endpoint
echo "Testing GET /api/private/v1/assignee/sprints/${SPRINT_ID}/overview"
echo ""

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  "${API_BASE_URL}/api/private/v1/assignee/sprints/${SPRINT_ID}/overview")

# Extract HTTP status code
http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
response_body=$(echo "$response" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $http_status"
echo "Response Body:"
echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
echo ""

# Check if the request was successful
if [ "$http_status" -eq 200 ]; then
    echo "✅ API call successful!"
elif [ "$http_status" -eq 404 ]; then
    echo "⚠️  Sprint not found or access denied (404)"
    echo "   This might be expected if the sprint ID doesn't exist or user doesn't have access"
elif [ "$http_status" -eq 401 ]; then
    echo "❌ Unauthorized (401) - Check your JWT token"
elif [ "$http_status" -eq 500 ]; then
    echo "❌ Internal Server Error (500) - Check backend logs"
else
    echo "❌ Unexpected status code: $http_status"
fi

echo ""
echo "Test completed."
