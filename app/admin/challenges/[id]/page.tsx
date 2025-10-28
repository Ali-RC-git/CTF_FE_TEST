'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChallengeManagement } from '@/lib/hooks/useChallengeManagement';
import { ChallengeDetail } from '@/lib/api';

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params?.id as string;
  
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { fetchChallenge, deleteChallenge } = useChallengeManagement();

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        setIsLoading(true);
        const challengeData = await fetchChallenge(challengeId);
        setChallenge(challengeData);
      } catch (error) {
        console.error('Failed to load challenge:', error);
        setError('Failed to load challenge details');
      } finally {
        setIsLoading(false);
      }
    };

    if (challengeId) {
      loadChallenge();
    }
  }, [challengeId, fetchChallenge]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      try {
        await deleteChallenge(challengeId);
        setSuccessMessage('Challenge deleted successfully!');
        setTimeout(() => {
          router.push('/admin/challenges');
        }, 2000);
      } catch (error) {
        console.error('Failed to delete challenge:', error);
        setError('Failed to delete challenge');
      }
    }
  };

  const handleEdit = () => {
    router.push(`/admin/challenges/${challengeId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
        <span className="ml-2 text-text-secondary">Loading challenge...</span>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="text-center py-12">
        <div className="text-danger-color text-lg mb-4">❌</div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Challenge Not Found</h2>
        <p className="text-text-secondary mb-4">The challenge you're looking for doesn't exist or has been deleted.</p>
        <button
          onClick={() => router.push('/admin/challenges')}
          className="btn-primary"
        >
          Back to Challenges
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setSuccessMessage(null)}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
            {challenge.title}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              challenge.difficulty === 'Easy' ? 'bg-success-500/20 text-success-500' :
              challenge.difficulty === 'Medium' ? 'bg-warning-500/20 text-warning-500' :
              challenge.difficulty === 'Hard' ? 'bg-error-500/20 text-error-500' :
              'bg-accent-color/20 text-accent-color'
            }`}>
              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
            </span>
            <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs">
              {challenge.category}
            </span>
            <span className="text-text-secondary text-sm">
              {challenge.totalPoints} points
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="btn-secondary flex items-center gap-2"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger flex items-center gap-2"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Challenge Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Description</h2>
            <p className="text-text-secondary whitespace-pre-wrap">{challenge.description}</p>
          </div>

          {/* Scenario */}
          {challenge.scenario && (
            <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Scenario</h2>
              <p className="text-text-secondary whitespace-pre-wrap">{challenge.scenario}</p>
            </div>
          )}

          {/* Questions */}
          {challenge.questions && challenge.questions.length > 0 && (
            <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Questions ({challenge.questions.length})</h2>
              <div className="space-y-4">
                {challenge.questions.map((question, index) => (
                  <div key={question.id} className="border border-border-color rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-text-primary">Question {index + 1}</h3>
                      <span className="text-sm text-text-secondary">{question.points} points</span>
                    </div>
                    <p className="text-text-secondary text-sm mb-2">{question.description}</p>
                    <div className="text-xs text-text-secondary">
                      Type: {question.type.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Stats */}
          <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Status & Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  challenge.status === 'published' ? 'bg-success-500/20 text-success-500' :
                  challenge.status === 'draft' ? 'bg-warning-500/20 text-warning-500' :
                  'bg-danger-500/20 text-danger-500'
                }`}>
                  {challenge.status ? challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1) : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Solves:</span>
                <span className="text-text-primary">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Submissions:</span>
                <span className="text-text-primary">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Solve Rate:</span>
                <span className="text-text-primary">0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Avg. Time:</span>
                <span className="text-text-primary">
                  N/A
                </span>
              </div>
            </div>
          </div>

          {/* Challenge Info */}
          <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Challenge Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Created:</span>
                <span className="text-text-primary text-sm">
                  N/A
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Updated:</span>
                <span className="text-text-primary text-sm">
                  N/A
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Created by:</span>
                <span className="text-text-primary text-sm">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Time Estimate:</span>
                <span className="text-text-primary text-sm">{challenge.estimatedTime}</span>
              </div>
              {challenge.tags && (
                <div>
                  <span className="text-text-secondary text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-1 bg-background-secondary text-text-secondary rounded text-xs">
                      Available
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={handleEdit}
                className="w-full btn-secondary text-left"
              >
                ✏️ Edit Challenge
              </button>
              <button
                onClick={() => router.push(`/challenge/${challengeId}`)}
                className="w-full btn-secondary text-left"
              >
                👁️ View as Student
              </button>
              <button
                onClick={() => router.push(`/admin/challenges/${challengeId}/submissions`)}
                className="w-full btn-secondary text-left"
              >
                📊 View Submissions
              </button>
              <button
                onClick={() => router.push(`/admin/challenges/${challengeId}/analytics`)}
                className="w-full btn-secondary text-left"
              >
                📈 View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
