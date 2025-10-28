#!/bin/bash

# Test script for Challenge Creation API
# Usage: ./scripts/test-challenge-create.sh <admin_bearer_token>

BEARER_TOKEN=$1
BASE_URL="http://localhost:8000"

if [ -z "$BEARER_TOKEN" ]; then
  echo "Error: Please provide a bearer token"
  echo "Usage: ./scripts/test-challenge-create.sh <admin_bearer_token>"
  exit 1
fi

echo "=========================================="
echo "Testing Challenge Bulk Create API"
echo "=========================================="
echo ""
echo "Endpoint: POST $BASE_URL/api/v1/challenges/bulk-create/"
echo ""

# Test payload matching the user's specification
curl -X POST "$BASE_URL/api/v1/challenges/bulk-create/" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "title": "SQL Injection Challenge - Test",
  "category": "Web Application Security",
  "difficulty": "medium",
  "total_points": 150,
  "time_estimate_minutes": 45,
  "status": "published",
  "description": "Test your SQL injection skills by exploiting a vulnerable login form",
  "scenario": "You have discovered a web application with a login form that may be vulnerable to SQL injection.",
  "context_note": "This challenge simulates a real-world SQL injection vulnerability.",
  "preview_enabled": true,
  "max_attempts": 3,
  "artifacts": [
    {
      "file_name": "vulnerable_login.html",
      "file_url": "https://example.com/artifacts/login.html",
      "description": "Screenshot of the vulnerable login form"
    }
  ],
  "flag_questions": [
    {
      "question_text": "What is the administrator password?",
      "correct_flag": "FLAG{adm1n_p@ssw0rd_2024}",
      "flag_format": "FLAG{...}",
      "points": 50,
      "max_attempts": 3,
      "why_matters": "Understanding SQL injection helps you protect databases",
      "context": "The password is stored in the users table with username admin",
      "hints": [
        {
          "hint_text": "Try using OR 1=1 in the username field",
          "cost": "5.00",
          "reveal_order": 1
        },
        {
          "hint_text": "Use UNION SELECT to extract data from the users table",
          "cost": "10.00",
          "reveal_order": 2
        }
      ]
    }
  ],
  "mcq_questions": [
    {
      "question_text": "Which SQL keyword is commonly used in injection attacks?",
      "explanation": "UNION is used to combine results of multiple SELECT statements",
      "points": 20,
      "options": [
        {
          "option_text": "JOIN",
          "is_correct": false,
          "option_order": 1
        },
        {
          "option_text": "UNION",
          "is_correct": true,
          "option_order": 2
        },
        {
          "option_text": "MERGE",
          "is_correct": false,
          "option_order": 3
        }
      ]
    }
  ],
  "fillblank_questions": [
    {
      "question_text": "Complete the SQL injection payload: OR 1=1 __",
      "explanation": "The double dash (--) is used to comment out the rest of the query",
      "points": 25,
      "max_attempts": 3,
      "accepted_answers": [
        {
          "accepted_answer": "--",
          "blank_index": 1
        },
        {
          "accepted_answer": "-- ",
          "blank_index": 1
        }
      ]
    }
  ]
}' | jq '.' || echo "Note: Install jq for formatted output"

echo ""
echo "=========================================="
echo "Test Complete"
echo "=========================================="
echo ""
echo "Expected Response:"
echo "  - Status Code: 201 Created"
echo "  - Response Body: Challenge object with ID"
echo ""
echo "Common Errors:"
echo "  - 401: Invalid or missing bearer token"
echo "  - 403: User is not an admin"
echo "  - 400: Invalid request format or missing required fields"
echo "  - 500: Server error"

