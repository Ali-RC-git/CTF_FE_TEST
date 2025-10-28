/**
 * Test script for scoreboard API endpoints
 * Run this to verify API responses and update types accordingly
 */

import { eventsAPI } from '../lib/api/events';

// Test function to verify API responses
async function testScoreboardAPIs() {
  console.log('🧪 Testing Scoreboard API Endpoints...\n');

  try {
    // Test 1: Get active events
    console.log('1. Testing GET /admin/events/active/');
    try {
      const activeEvents = await eventsAPI.getActiveEvents();
      console.log('✅ Active events response:');
      console.log(JSON.stringify(activeEvents, null, 2));
      console.log(`Found ${activeEvents.active_events?.length || 0} active events\n`);
    } catch (error) {
      console.log('❌ Failed to fetch active events:');
      console.log(error);
      console.log('');
    }

    // Test 2: Test with a sample event ID (you'll need to replace this with a real event ID)
    const testEventId = '7c7f0abc-446e-4e3c-aaca-b30695cfb270'; // Replace with actual event ID

    console.log(`2. Testing GET /admin/events/${testEventId}/scoreboard/`);
    try {
      const leaderboard = await eventsAPI.getEventLeaderboard(testEventId);
      console.log('✅ Event leaderboard response:');
      console.log(JSON.stringify(leaderboard, null, 2));
      console.log(`Found ${leaderboard.leaderboard.teams?.length || 0} teams in leaderboard\n`);
    } catch (error) {
      console.log('❌ Failed to fetch leaderboard:');
      console.log(error);
      console.log('');
    }

    console.log(`3. Testing GET /admin/events/${testEventId}/scoreboard/settings/`);
    try {
      const settings = await eventsAPI.getScoreboardSettings(testEventId);
      console.log('✅ Scoreboard settings response:');
      console.log(JSON.stringify(settings, null, 2));
      console.log('');
    } catch (error) {
      console.log('❌ Failed to fetch scoreboard settings:');
      console.log(error);
      console.log('');
    }

  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testScoreboardAPIs();
}

export { testScoreboardAPIs };
