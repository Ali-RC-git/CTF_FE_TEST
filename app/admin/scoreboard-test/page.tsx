'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventsAPI } from '@/lib/api/events';
import { useToast } from '@/lib/hooks/useToast';

interface APITestResult {
  endpoint: string;
  method: string;
  status: 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
}

export default function ScoreboardAPITestPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [results, setResults] = useState<APITestResult[]>([]);
  const [testEventId, setTestEventId] = useState('7c7f0abc-446e-4e3c-aaca-b30695cfb270');

  const addResult = (result: APITestResult) => {
    setResults(prev => [...prev.filter(r => r.endpoint !== result.endpoint), result]);
  };

  const testAPI = async (endpoint: string, method: string, testFn: () => Promise<any>) => {
    addResult({ endpoint, method, status: 'loading' });

    try {
      const data = await testFn();
      addResult({ endpoint, method, status: 'success', data });
      showSuccess(`✅ ${endpoint} - Success`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addResult({ endpoint, method, status: 'error', error: errorMessage });
      showError(`❌ ${endpoint} - ${errorMessage}`);
    }
  };

  const runAllTests = async () => {
    setResults([]);

    // Test 1: Get active events
    await testAPI('/api/v1/admin/events/active/', 'GET', async () => {
      const response = await eventsAPI.getActiveEvents();
      // Transform to show both raw and formatted data
      return {
        raw: response,
        formatted: {
          count: response.count,
          current_time: response.current_time,
          total_events: (response.active_events || []).length,
          events: (response.active_events || []).slice(0, 3).map(event => ({
            id: event.id,
            name: event.name,
            code: event.event_code,
            active: event.is_active,
            total_teams: event.total_teams,
            total_challenges: event.total_challenges,
            has_scoreboard: event.has_scoreboard,
            is_scoreboard_frozen: event.is_scoreboard_frozen,
            created_by: event.created_by,
            created_at: event.created_at,
          }))
        }
      };
    });

    // Test 2: Get event leaderboard
    await testAPI(`/api/v1/admin/events/${testEventId}/scoreboard/`, 'GET', async () => {
      const response = await eventsAPI.getEventLeaderboard(testEventId);
      return {
        event_info: {
          id: response.event_info.id,
          name: response.event_info.name,
          code: response.event_info.event_code,
          active: response.event_info.is_active,
          total_teams: response.event_info.total_teams,
          total_challenges: response.event_info.total_challenges,
        },
        leaderboard_data: {
          total_teams: response.leaderboard.total_teams,
          last_updated: response.leaderboard.last_updated,
          is_frozen: response.leaderboard.is_frozen,
        },
        leaderboard_count: response.leaderboard.teams?.length || 0,
        top_teams: (response.leaderboard.teams || []).slice(0, 3).map(team => ({
          rank: team.rank,
          team_name: team.team_name,
          total_score: team.total_score,
          challenges_completed: team.challenges_completed,
          challenges_in_progress: team.challenges_in_progress,
          total_attempts: team.total_attempts,
        }))
      };
    });

    // Test 3: Get scoreboard settings
    await testAPI(`/api/v1/admin/events/${testEventId}/scoreboard/settings/`, 'GET', async () => {
      const response = await eventsAPI.getScoreboardSettings(testEventId);
      return {
        raw: response,
        formatted: {
          event_id: response.event || response.id,
          event_name: response.event_name,
          event_code: response.event_code,
          refresh_interval_seconds: response.refresh_interval_seconds,
          auto_refresh_enabled: response.auto_refresh_enabled,
          is_public: response.is_public,
          show_team_names: response.show_team_names,
          show_scores: response.show_scores,
          show_solve_times: response.show_solve_times,
          freeze_strategy: response.freeze_strategy,
          is_frozen: response.is_frozen,
          should_freeze: response.should_freeze,
          freeze_at: response.freeze_at,
          tie_break_by_time: response.tie_break_by_time,
          tie_break_by_attempts: response.tie_break_by_attempts,
        }
      };
    });
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-primary-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              🧪 Scoreboard API Test
            </h1>
            <p className="text-text-secondary">
              Test the admin scoreboard API endpoints and view response structures
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Back to Admin
          </button>
        </div>


        {/* Test Controls */}
        <div className="bg-card-bg rounded-lg p-6 border border-border-color mb-8">
          <h2 className="text-lg font-semibold text-accent-light mb-4">
            Test Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Test Event ID
              </label>
              <input
                type="text"
                value={testEventId}
                onChange={(e) => setTestEventId(e.target.value)}
                className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-text-primary"
                placeholder="Enter event ID..."
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={runAllTests}
                className="px-4 py-2 bg-accent-color hover:bg-accent-dark text-white rounded-lg font-medium transition-colors"
              >
                🚀 Run All Tests
              </button>
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          <div className="text-sm text-text-secondary">
            <p><strong>Admin endpoints being tested:</strong></p>
            <ul className="mt-2 space-y-1">
              <li>• GET /api/v1/admin/events/active/ - Active events list (admin only)</li>
              <li>• GET /api/v1/admin/events/{'{event_id}'}/scoreboard/ - Event scoreboard (admin only)</li>
              <li>• GET /api/v1/admin/events/{'{event_id}'}/scoreboard/settings/ - Scoreboard settings (admin only)</li>
            </ul>
            <p className="mt-2 text-xs text-yellow-400">
              Response format: <code>{'{count, active_events[], current_time}'}</code>
            </p>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={index} className="bg-card-bg rounded-lg border border-border-color overflow-hidden">
              <div className="p-4 border-b border-border-color bg-secondary-bg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${result.status === 'loading' ? 'animate-spin' : result.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {result.status === 'loading' ? '⏳' : result.status === 'success' ? '✅' : '❌'}
                    </span>
                    <div>
                      <div className="font-medium text-text-primary">{result.method} {result.endpoint}</div>
                      <div className="text-sm text-text-secondary">
                        Status: {result.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {result.status === 'loading' && (
                  <div className="text-text-secondary">Loading...</div>
                )}

                {result.status === 'error' && (
                  <div className="text-red-400">
                    <div className="font-medium mb-2">Error:</div>
                    <pre className="text-sm bg-red-500/10 p-3 rounded border border-red-500/20 overflow-auto">
                      {result.error}
                    </pre>
                  </div>
                )}

                {result.status === 'success' && result.data && (
                  <div>
                    <div className="font-medium mb-2 text-green-400">Response:</div>
                    <pre className="text-sm bg-green-500/10 p-3 rounded border border-green-500/20 overflow-auto max-h-96">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}

          {results.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              <div className="text-lg mb-2">No Tests Run</div>
              <div className="text-sm">Click "Run All Tests" to test the API endpoints</div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-400 mb-2">📋 Instructions</h3>
          <ol className="text-sm text-blue-200 space-y-1">
            <li>1. <strong>Admin Authentication:</strong> Ensure you're logged in as an admin user</li>
            <li>2. <strong>Update Event ID:</strong> Replace the default event ID with a valid event ID from your backend</li>
            <li>3. <strong>Run Tests:</strong> Click "Run All Tests" to test all admin API endpoints</li>
            <li>4. <strong>Review Responses:</strong> Check the formatted JSON responses to understand the data structure</li>
            <li>5. <strong>Update Types:</strong> Update TypeScript interfaces in <code>lib/api/events.ts</code> based on actual responses</li>
            <li>6. <strong>Fix Components:</strong> Use this information to fix any field mapping issues in components</li>
          </ol>
          <div className="mt-3 text-xs text-blue-300">
            <p><strong>Expected Response Structure:</strong></p>
            <p>• Active Events: <code>{'{count, active_events[], current_time}'}</code></p>
            <p>• Event Fields: <code>{'id, event_code, name, description, starts_at, ends_at, is_active, total_teams, total_challenges, has_scoreboard, is_scoreboard_frozen'}</code></p>
            <p>• Leaderboard: <code>{'{event_id, event_name, event_code, is_active, is_frozen, leaderboard[]}'}</code></p>
            <p>• Settings: <code>{'{refresh_interval_seconds, auto_refresh_enabled, ...}'}</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
