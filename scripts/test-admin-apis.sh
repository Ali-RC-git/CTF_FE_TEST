#!/bin/bash

# Test script for admin scoreboard APIs
# Replace the values below with your actual admin token and event ID

ADMIN_TOKEN="your_admin_token_here"
EVENT_ID="7c7f0abc-446e-4e3c-aaca-b30695cfb270"

echo "🧪 Testing Admin Scoreboard API Endpoints"
echo "========================================"

echo ""
echo "1. Testing GET /api/v1/admin/events/active/"
echo "curl -H \"Authorization: Bearer \$ADMIN_TOKEN\" \\"
echo "     http://localhost:8000/api/v1/admin/events/active/"
echo ""

# Uncomment and run the actual curl command:
# curl -H "Authorization: Bearer $ADMIN_TOKEN" \
#      http://localhost:8000/api/v1/admin/events/active/ | jq .

echo ""
echo "2. Testing GET /api/v1/admin/events/\$EVENT_ID/scoreboard/"
echo "curl -H \"Authorization: Bearer \$ADMIN_TOKEN\" \\"
echo "     http://localhost:8000/api/v1/admin/events/\$EVENT_ID/scoreboard/"
echo ""

# Uncomment and run the actual curl command:
# curl -H "Authorization: Bearer $ADMIN_TOKEN" \
#      http://localhost:8000/api/v1/admin/events/$EVENT_ID/scoreboard/ | jq .

echo ""
echo "3. Testing GET /api/v1/admin/events/\$EVENT_ID/scoreboard/settings/"
echo "curl -H \"Authorization: Bearer \$ADMIN_TOKEN\" \\"
echo "     http://localhost:8000/api/v1/admin/events/\$EVENT_ID/scoreboard/settings/"
echo ""

# Uncomment and run the actual curl command:
# curl -H "Authorization: Bearer $ADMIN_TOKEN" \
#      http://localhost:8000/api/v1/admin/events/$EVENT_ID/scoreboard/settings/ | jq .

echo ""
echo "💡 Test the frontend by navigating to:"
echo "   - Admin: /admin/scoreboard-test (API testing interface)"
echo "   - Admin: /admin/scoreboard (Live scoreboard management)"
echo "   - User: /scoreboard (Public scoreboard view)"

echo ""
echo "📋 Instructions:"
echo "1. Replace 'your_admin_token_here' with your actual admin token"
echo "2. Replace the EVENT_ID with a valid event ID from your backend"
echo "3. Uncomment the curl commands to run them"
echo "4. Use 'jq .' to pretty-print JSON responses"
echo "5. Update the TypeScript interfaces based on the actual API responses"
echo ""
echo "💡 Tip: Get admin token by logging in as admin and copying from browser dev tools"
echo "💡 Tip: Get event IDs from the active events endpoint response"
