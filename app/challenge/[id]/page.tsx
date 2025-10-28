'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChallengeHeader from '@/components/challenge/ChallengeHeader';
import ChallengeContext from '@/components/challenge/ChallengeContext';
import ArtifactsSection from '@/components/challenge/ArtifactsSection';
import QuestionsSection from '@/components/challenge/QuestionsSection';
import ToolsResourcesSection from '@/components/challenge/ToolsResourcesSection';
import ChallengeProgressSection from '@/components/challenge/ChallengeProgressSection';
import { ChallengeDetail } from '@/lib/types';
import { challengesAPI, APIError, authAPI } from '@/lib/api';
import { mapBackendChallengeToFrontend } from '@/lib/utils/api-mappers';

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = params?.id as string;
  const eventId = searchParams?.get('eventId') || '';
  const [userTeamId, setUserTeamId] = useState<string | null>(null);

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [challengeStartTime] = useState<string>(new Date().toISOString());
  const [revealedHints, setRevealedHints] = useState<{ [questionId: string]: string[] }>({});
  const [submissions, setSubmissions] = useState<{ [key: string]: { feedback: string; isCorrect: boolean; showExplanation: boolean } }>({});
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);

  // Fetch user profile to get team ID
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await authAPI.getProfile();
        // Try to get team ID from profile if available
        if (profile && (profile as any).current_team?.team_id) {
          setUserTeamId((profile as any).current_team.team_id);
        } else if (profile && (profile as any).teams && (profile as any).teams.length > 0) {
          // Fallback: use first team if current_team is not set
          setUserTeamId((profile as any).teams[0].team_id);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Don't block challenge loading if profile fetch fails
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch challenge data and progress from API
  useEffect(() => {
    const fetchChallengeAndProgress = async () => {
      if (!challengeId) return;

      try {
        setLoading(true);
        
        // Fetch challenge details using centralized API
        const backendData = await challengesAPI.getChallenge(challengeId);
        
        // Map backend response to frontend format
        const mappedChallenge = mapBackendChallengeToFrontend(backendData);
        
        setChallenge(mappedChallenge);

        // If we have eventId and teamId, fetch progress from Redis
        if (eventId && userTeamId) {
          try {
            // Start or resume the challenge
            await challengesAPI.startOrResumeChallenge(challengeId, eventId);
            
            // Fetch existing progress
            const progressResponse = await challengesAPI.getChallengeProgressRedis(
              challengeId,
              eventId,
              userTeamId
            );

            if (progressResponse.success && progressResponse.data) {
              const progress = progressResponse.data;
              
              // Restore time spent
              setTimeSpent(progress.total_time_spent_seconds || 0);
              
              // Restore submissions and revealed hints
              const restoredSubmissions: { [key: string]: any } = {};
              const restoredHints: { [key: string]: string[] } = {};
              
              if (progress.questions) {
                Object.entries(progress.questions).forEach(([questionId, questionData]) => {
                  if (questionData.answer_submitted) {
                    restoredSubmissions[questionId] = {
                      feedback: questionData.is_correct 
                        ? '✓ Correct! Points awarded.' 
                        : '✗ Incorrect answer.',
                      isCorrect: questionData.is_correct,
                      showExplanation: true,
                    };
                  }
                  
                  // Restore hints (assuming hints are tracked by count)
                  if (questionData.hints_used_count > 0) {
                    // We'll need to mark hints as revealed based on count
                    // This is a simplified version - you may need to track which specific hints
                    restoredHints[questionId] = [];
                  }
                });
              }
              
              setSubmissions(restoredSubmissions);
              setRevealedHints(restoredHints);
              
              console.log('Progress restored from Redis:', {
                timeSpent: progress.total_time_spent_seconds,
                questionsAnswered: progress.total_questions_answered,
                totalPoints: progress.total_points_earned,
              });
            }
          } catch (progressErr) {
            console.log('No existing progress found or error loading progress:', progressErr);
            // If no progress exists, start fresh (this is fine for new challenges)
          }
        }
      } catch (err) {
        console.error('Error fetching challenge:', err);
        if (err instanceof APIError) {
          setError(err.getGeneralError() || 'Failed to load challenge');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load challenge');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userTeamId !== null) {
      // Wait for userTeamId to be loaded before fetching
      fetchChallengeAndProgress();
    }
  }, [challengeId, eventId, userTeamId]);

  // Timer to track time spent on challenge
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Timer tracking only - no auto-save
  // Progress will be updated on answer submission events only

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToChallenges = () => {
    router.push('/challenges');
  };

  const handleGetHint = () => {
    console.log('Getting hint...');
    // Handle get hint logic here
  };

  const handleDownloadAll = () => {
    console.log('Downloading all artifacts...');
    // Handle download all logic here
  };

  const handleDownloadArtifact = (artifactId: string) => {
    console.log(`Downloading artifact: ${artifactId}`);
    // Handle download artifact logic here
  };

  const handleSubmitAnswer = async (
    questionId: string, 
    answer: string | string[], 
    questionType: string
  ): Promise<{ correct: boolean; message?: string }> => {
    try {
      console.log(`Submitting ${questionType} answer for question ${questionId}:`, answer);
      
      // Call API to submit answer using centralized API with bearer token
      const result = await challengesAPI.submitAnswer(challengeId, questionId, {
        answer,
        questionType: questionType as 'flag' | 'mcq' | 'fib'
      });
      
      // Get hints used for this question
      const question = challenge?.questions.find(q => q.id === questionId);
      const hintsUsed = revealedHints[questionId]?.length || 0;
      
      // Save progress to Redis if we have eventId and teamId
      if (eventId && userTeamId) {
        try {
          await challengesAPI.saveProgress(challengeId, {
            eventId,
            teamId: userTeamId,
            questionId,
            answer,
            hintsUsed,
            isCorrect: result.correct
          });
          console.log('Progress saved to Redis');
        } catch (saveErr) {
          console.error('Error saving progress to Redis (non-blocking):', saveErr);
          // Don't fail the submission if progress save fails
        }
      }
      
      // Update challenge state if question was solved
      if (result.correct && challenge) {
        setChallenge({
          ...challenge,
          questions: challenge.questions.map(q =>
            q.id === questionId
              ? { ...q, status: 'Solved', solved: true, attempts: (q.attempts || 0) + 1 }
              : q
          )
        });
      } else if (!result.correct && challenge) {
        // Update attempts count even for incorrect answers
        setChallenge({
          ...challenge,
          questions: challenge.questions.map(q =>
            q.id === questionId
              ? { ...q, attempts: (q.attempts || 0) + 1 }
              : q
          )
        });
      }

      return {
        correct: result.correct,
        message: result.message || (result.correct ? '✓ Correct! Points awarded.' : '✗ Incorrect answer.')
      };
    } catch (err) {
      console.error('Error submitting answer:', err);
      if (err instanceof APIError) {
        return {
          correct: false,
          message: err.getGeneralError() || 'Error submitting answer. Please try again.'
        };
      }
      return {
        correct: false,
        message: 'Error submitting answer. Please try again.'
      };
    }
  };

  const handleUseHint = (questionId: string, hintId: string, cost: number) => {
    if (!challenge) return;

    // Check if hint is already revealed
    if (revealedHints[questionId]?.includes(hintId)) {
      console.log('Hint already revealed');
      return;
    }

    // Reveal the hint
    setRevealedHints(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), hintId]
    }));

    // Update the question points by reducing the hint cost
    setChallenge(prevChallenge => {
      if (!prevChallenge) return prevChallenge;

      return {
        ...prevChallenge,
        questions: prevChallenge.questions.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              points: Math.max(0, q.points - cost), // Reduce points, don't go below 0
              hintsUsed: (q.hintsUsed || 0) + 1
            };
          }
          return q;
        })
      };
    });

    console.log(`Revealed hint ${hintId} for question ${questionId} (cost: ${cost} points)`);
  };

  const handleToolClick = (toolId: string) => {
    console.log(`Opening tool: ${toolId}`);
    // Handle tool click logic here
  };

  const handleSubmitChallenge = async () => {
    if (!challenge || !eventId || !userTeamId) {
      alert('Cannot submit challenge: Missing required information (event ID or team ID)');
      return;
    }

    // Check if all questions have been attempted
    const attemptedQuestions = Object.keys(submissions);
    if (attemptedQuestions.length === 0) {
      alert('Please attempt at least one question before submitting the challenge.');
      return;
    }

    const confirmation = window.confirm(
      `Are you sure you want to submit this challenge?\n\n` +
      `Questions attempted: ${attemptedQuestions.length}/${challenge.questions.length}\n` +
      `This will finalize your submission and update the leaderboard.`
    );

    if (!confirmation) return;

    setIsSubmittingChallenge(true);

    try {
      // Prepare questions data
      const questionsData = challenge.questions.map((question) => {
        const submission = submissions[question.id];
        const hintsUsed = revealedHints[question.id]?.length || 0;

        return {
          questionId: question.id,
          questionType: question.type,
          answer: submission ? 'submitted' : '', // You may want to track actual answers
          hintsUsed,
          isCorrect: submission?.isCorrect || false,
          points: question.points,
        };
      });

      const result = await challengesAPI.submitCompleteChallenge(challengeId, {
        eventId,
        teamId: userTeamId,
        challengeStartTime,
        totalTimeSpent: timeSpent,
        questionsData,
      });

      if (result.success) {
        alert(
          `Challenge submitted successfully!\n\n` +
          `Total Score: ${result.data?.totalScore || 0} points\n` +
          `Completed Questions: ${result.data?.completedQuestions || 0}/${result.data?.totalQuestions || 0}\n\n` +
          `Your score has been updated on the leaderboard!`
        );
        // Navigate back to events page or challenges list
        router.push('/events');
      } else {
        alert(`Failed to submit challenge: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Error submitting challenge:', error);
      alert(`Error submitting challenge: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmittingChallenge(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a102b] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8a4fff] mb-4"></div>
            <p className="text-[#c2b0e6] text-lg">Loading challenge...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-[#1a102b] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-[#f0e6ff] mb-4">Challenge Not Found</h2>
            <p className="text-[#c2b0e6] mb-6">{error || 'The challenge you are looking for does not exist.'}</p>
            <button
              onClick={handleBackToChallenges}
              className="bg-gradient-to-r from-[#6b30e6] to-[#8a4fff] hover:opacity-90 text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold"
            >
              Back to Challenges
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a102b] flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Challenge Header */}
          <ChallengeHeader
            challenge={challenge}
            onBack={handleBackToChallenges}
            onGetHint={handleGetHint}
            className="mb-8"
          />

          {/* Timer Section */}
          <div className="bg-[#2d1b4e] rounded-lg p-4 text-center mb-8 border border-[#4a2d7a]">
            <div className="text-sm text-[#c2b0e6] mb-1">Time spent on this challenge:</div>
            <div className="text-2xl font-bold text-[#a67cff] font-mono">{formatTime(timeSpent)}</div>
          </div>

          {/* Challenge Context - Only show if scenario exists */}
          {challenge.scenario && (
            <ChallengeContext
              challenge={challenge}
              className="mb-8"
            />
          )}

          {/* Artifacts Section - Only show if artifacts exist */}
          {challenge.artifacts && challenge.artifacts.length > 0 && (
            <ArtifactsSection
              challenge={challenge}
              onDownloadAll={handleDownloadAll}
              onDownloadArtifact={handleDownloadArtifact}
              className="mb-8"
            />
          )}

          {/* Questions Section */}
          <QuestionsSection
            questions={challenge.questions || []}
            onSubmitAnswer={handleSubmitAnswer}
            onUseHint={handleUseHint}
            revealedHints={revealedHints}
            submissions={submissions}
            onSubmissionsChange={setSubmissions}
            className="mb-8"
          />

          {/* Submit Challenge Button */}
          {eventId && userTeamId && challenge.questions.length > 0 && (
            <div className="bg-[#35215a] rounded-lg p-6 border border-[#4a2d7a] mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-[#f0e6ff] text-lg font-semibold mb-2">Ready to Submit?</h3>
                  <p className="text-[#c2b0e6] text-sm">
                    Questions attempted: <span className="text-[#8a4fff] font-semibold">{Object.keys(submissions).length}/{challenge.questions.length}</span>
                    {Object.keys(submissions).length < challenge.questions.length && (
                      <span className="text-yellow-400 ml-2">⚠️ You haven't attempted all questions</span>
                    )}
                  </p>
                  <p className="text-[#c2b0e6] text-xs mt-1">
                    Once submitted, cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleSubmitChallenge}
                  disabled={isSubmittingChallenge || Object.keys(submissions).length === 0}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 text-white px-8 py-3 rounded-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {isSubmittingChallenge ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Challenge
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tools & Resources Section - Only show if tools exist */}
          {challenge.tools && challenge.tools.length > 0 && (
            <ToolsResourcesSection
              challenge={challenge}
              onToolClick={handleToolClick}
              className="mb-8"
            />
          )}

          {/* Challenge Progress Section */}
          <ChallengeProgressSection
            challenge={challenge}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
