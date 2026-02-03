#!/bin/bash
# ===========================================
# QuizTube Smoke Test Script
# Verifies deployment health after deployment
# ===========================================

set -e

# Configuration
SITE_URL=${SITE_URL:-"http://localhost"}
API_URL=${API_URL:-"http://localhost:3001"}
MAX_RETRIES=${MAX_RETRIES:-5}
RETRY_DELAY=${RETRY_DELAY:-10}

echo "========================================="
echo "QuizTube Smoke Tests"
echo "========================================="
echo "Site URL: $SITE_URL"
echo "API URL: $API_URL"
echo "Max Retries: $MAX_RETRIES"
echo "========================================="
echo ""

# Track test results
PASSED=0
FAILED=0

# Function to check an endpoint
check_endpoint() {
  local url=$1
  local name=$2
  local expected_status=${3:-200}

  echo "Testing: $name"

  for i in $(seq 1 $MAX_RETRIES); do
    echo "  Attempt $i/$MAX_RETRIES..."

    # Make request and capture status code
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$url" 2>/dev/null || echo "000")

    if [ "$status" -eq "$expected_status" ]; then
      echo "  [PASS] Status: $status (expected: $expected_status)"
      ((PASSED++))
      return 0
    fi

    echo "  [RETRY] Status: $status (expected: $expected_status)"

    if [ $i -lt $MAX_RETRIES ]; then
      sleep $RETRY_DELAY
    fi
  done

  echo "  [FAIL] Final status: $status (expected: $expected_status)"
  ((FAILED++))
  return 1
}

# Function to check health endpoint with JSON validation
check_health() {
  local url=$1

  echo "Testing: API Health Check"

  for i in $(seq 1 $MAX_RETRIES); do
    echo "  Attempt $i/$MAX_RETRIES..."

    # Make request and capture response
    response=$(curl -s --max-time 30 "$url" 2>/dev/null || echo '{"status":"error"}')

    # Parse status from JSON
    status=$(echo "$response" | jq -r '.status' 2>/dev/null || echo "error")

    if [ "$status" = "healthy" ]; then
      echo "  [PASS] API is healthy"

      # Check individual services
      db_status=$(echo "$response" | jq -r '.services.database // "unknown"' 2>/dev/null)
      redis_status=$(echo "$response" | jq -r '.services.redis // "unknown"' 2>/dev/null)

      echo "    Database: $db_status"
      echo "    Redis: $redis_status"

      ((PASSED++))
      return 0
    fi

    echo "  [RETRY] Status: $status"

    if [ $i -lt $MAX_RETRIES ]; then
      sleep $RETRY_DELAY
    fi
  done

  echo "  [FAIL] API health check failed"
  ((FAILED++))
  return 1
}

# Function to check response contains expected content
check_content() {
  local url=$1
  local name=$2
  local expected_content=$3

  echo "Testing: $name"

  for i in $(seq 1 $MAX_RETRIES); do
    echo "  Attempt $i/$MAX_RETRIES..."

    response=$(curl -s --max-time 30 "$url" 2>/dev/null || echo "")

    if echo "$response" | grep -q "$expected_content"; then
      echo "  [PASS] Content contains: $expected_content"
      ((PASSED++))
      return 0
    fi

    echo "  [RETRY] Content not found"

    if [ $i -lt $MAX_RETRIES ]; then
      sleep $RETRY_DELAY
    fi
  done

  echo "  [FAIL] Expected content not found: $expected_content"
  ((FAILED++))
  return 1
}

echo ""
echo "Running tests..."
echo ""

# Test 1: Frontend loads
check_endpoint "$SITE_URL" "Frontend" 200 || true

# Test 2: Frontend contains expected content
check_content "$SITE_URL" "Frontend HTML" "</html>" || true

# Test 3: API health check
check_health "$API_URL/api/health" || true

# Test 4: API returns proper 404
check_endpoint "$API_URL/api/nonexistent-route" "API 404 Handler" 404 || true

# Test 5: Static assets (JS/CSS) are accessible
check_endpoint "$SITE_URL/assets/" "Static Assets Directory" || true

# Test 6: API CORS headers (preflight)
echo "Testing: CORS Preflight"
cors_response=$(curl -s -o /dev/null -w "%{http_code}" \
  -X OPTIONS \
  -H "Origin: $SITE_URL" \
  -H "Access-Control-Request-Method: POST" \
  --max-time 10 \
  "$API_URL/api/auth/login" 2>/dev/null || echo "000")

if [ "$cors_response" -eq "200" ] || [ "$cors_response" -eq "204" ]; then
  echo "  [PASS] CORS preflight OK"
  ((PASSED++))
else
  echo "  [FAIL] CORS preflight failed: $cors_response"
  ((FAILED++))
fi

# Summary
echo ""
echo "========================================="
echo "Smoke Test Results"
echo "========================================="
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "========================================="

if [ $FAILED -gt 0 ]; then
  echo ""
  echo "SMOKE TESTS FAILED"
  exit 1
else
  echo ""
  echo "ALL SMOKE TESTS PASSED"
  exit 0
fi
