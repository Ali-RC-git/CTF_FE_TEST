'use client';

import { useState } from 'react';
import { ChallengeQuestion } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import HintSystem from './HintSystem';

interface QuestionsSectionProps {
  questions: ChallengeQuestion[];
  onSubmitAnswer?: (questionId: string, answer: string | string[], questionType: string) => Promise<{ correct: boolean; message?: string }>;
  onUseHint?: (questionId: string, hintId: string, cost: number) => void;
  revealedHints?: { [questionId: string]: string[] };
  submissions?: { [key: string]: { feedback: string; isCorrect: boolean; showExplanation: boolean } };
  onSubmissionsChange?: (submissions: { [key: string]: { feedback: string; isCorrect: boolean; showExplanation: boolean } }) => void;
  className?: string;
}

export default function QuestionsSection({ questions, onSubmitAnswer, onUseHint, revealedHints = {}, submissions: externalSubmissions, onSubmissionsChange, className = '' }: QuestionsSectionProps) {
  const { t } = useLanguage();
  const [flagInputs, setFlagInputs] = useState<{ [key: string]: string }>({});
  const [mcqSelections, setMcqSelections] = useState<{ [key: string]: string }>({});
  const [fibInputs, setFibInputs] = useState<{ [key: string]: { [blankId: string]: string } }>({});
  const [internalSubmissions, setInternalSubmissions] = useState<{ [key: string]: { feedback: string; isCorrect: boolean; showExplanation: boolean } }>({});
  const [isSubmitting, setIsSubmitting] = useState<{ [key: string]: boolean }>({});
  
  // Use external submissions if provided, otherwise use internal state
  const submissions = externalSubmissions || internalSubmissions;

  const handleFlagChange = (questionId: string, value: string) => {
    setFlagInputs(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMcqSelect = (questionId: string, optionId: string) => {
    setMcqSelections(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleFibChange = (questionId: string, blankId: string, value: string) => {
    setFibInputs(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [blankId]: value
      }
    }));
  };

  const handleSubmit = async (questionId: string, question: ChallengeQuestion) => {
    if (!onSubmitAnswer) return;

    setIsSubmitting(prev => ({ ...prev, [questionId]: true }));

    try {
      let answer: string | string[];
      
      if (question.type === 'flag') {
        answer = flagInputs[questionId];
        if (!answer || !answer.trim()) {
          alert('Please enter a flag before submitting.');
          setIsSubmitting(prev => ({ ...prev, [questionId]: false }));
          return;
        }
      } else if (question.type === 'mcq') {
        answer = mcqSelections[questionId];
        if (!answer) {
          alert('Please select an answer before submitting.');
          setIsSubmitting(prev => ({ ...prev, [questionId]: false }));
          return;
        }
      } else if (question.type === 'fib') {
        const blanks = question.blanks || [];
        answer = blanks.map(blank => fibInputs[questionId]?.[blank.id] || '');
        if (answer.some(a => !a.trim())) {
          alert('Please fill in all blanks before submitting.');
          setIsSubmitting(prev => ({ ...prev, [questionId]: false }));
          return;
        }
      } else {
        setIsSubmitting(prev => ({ ...prev, [questionId]: false }));
        return;
      }

      const result = await onSubmitAnswer(questionId, answer, question.type);
      
      const newSubmissions = {
        ...submissions,
        [questionId]: {
          feedback: result.message || (result.correct ? 'Correct!' : 'Incorrect answer.'),
          isCorrect: result.correct,
          showExplanation: true
        }
      };
      
      if (onSubmissionsChange) {
        onSubmissionsChange(newSubmissions);
      } else {
        setInternalSubmissions(newSubmissions);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      const errorSubmissions = {
        ...submissions,
        [questionId]: {
          feedback: 'Error submitting answer. Please try again.',
          isCorrect: false,
          showExplanation: false
        }
      };
      
      if (onSubmissionsChange) {
        onSubmissionsChange(errorSubmissions);
      } else {
        setInternalSubmissions(errorSubmissions);
      }
    } finally {
      setIsSubmitting(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleUseHint = (questionId: string, hintId: string, cost: number) => {
    if (onUseHint) {
      onUseHint(questionId, hintId, cost);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Solved':
        return 'text-green-400';
      case 'In Progress':
        return 'text-yellow-400';
      case 'Failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getQuestionTypeBadge = (type: string) => {
    switch (type) {
      case 'mcq':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 ml-2">MCQ</span>;
      case 'fib':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-500/20 text-orange-400 ml-2">Fill-in-Blank</span>;
      case 'flag':
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-400 ml-2">CTF</span>;
    }
  };

  return (
    <div className={`${className}`}>
      <div className="bg-[#35215a] rounded-lg p-6 border border-[#4a2d7a]">
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">❓</div>
          <h2 className="text-[#f0e6ff] text-xl font-semibold">Questions</h2>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-[#2d1b4e] rounded-lg p-5 border border-[#4a2d7a]">
              {/* Question Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[#f0e6ff] text-lg font-semibold flex items-center">
                  Q{index + 1}. {question.title}
                  {getQuestionTypeBadge(question.type)}
                </h3>
                <span className="bg-[#8a4fff] text-white text-sm px-3 py-1 rounded-full font-bold whitespace-nowrap">
                  {question.points} pts
                </span>
              </div>

              {/* Question Description */}
              <p className="text-[#f0e6ff] text-sm mb-4 leading-relaxed">
                {question.description}
              </p>

              {/* CTF/Flag Question Type */}
              {question.type === 'flag' && (
                <>
              {/* Flag Format */}
                  {question.flagFormat && (
                    <div className="bg-[#6fcf97]/10 border border-[#6fcf97] rounded-lg p-3 mb-4">
                      <p className="text-[#6fcf97] text-sm font-mono">
                  Flag format: {question.flagFormat}
                </p>
              </div>
                  )}

              {/* Instructions */}
                  {question.instructions && question.instructions.length > 0 && (
              <div className="mb-4">
                      <h4 className="text-[#f0e6ff] text-sm font-medium mb-2">Step-by-step:</h4>
                      <ol className="list-decimal list-inside space-y-1 pl-2">
                  {question.instructions.map((instruction, idx) => (
                          <li key={idx} className="text-[#c2b0e6] text-sm">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
                  )}

              {/* Why This Matters */}
                  {question.whyThisMatters && (
                    <div className="bg-[#8a4fff]/10 border-l-4 border-[#8a4fff] rounded-r-lg p-4 mb-4">
                      <p className="text-[#f0e6ff] text-sm">
                        <span className="font-medium">Why this matters:</span> {question.whyThisMatters}
                </p>
              </div>
                  )}

              {/* Flag Submission */}
                  <div className="bg-[#2d1b4e] rounded-lg p-5 border border-[#4a2d7a] mb-4">
                    <div className="flex space-x-3 mb-4">
                <input
                  type="text"
                        placeholder={`Enter flag: ${question.flagFormat?.split('<')[0] || 'flag'}...`}
                  value={flagInputs[question.id] || ''}
                  onChange={(e) => handleFlagChange(question.id, e.target.value)}
                        disabled={submissions[question.id] !== undefined || isSubmitting[question.id]}
                        className="flex-1 bg-[#1a102b] border border-[#4a2d7a] text-[#f0e6ff] placeholder-[#c2b0e6] px-4 py-3 rounded-lg focus:outline-none focus:border-[#8a4fff] font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                        onClick={() => handleSubmit(question.id, question)}
                        disabled={submissions[question.id] !== undefined || isSubmitting[question.id]}
                        className="bg-gradient-to-r from-[#6b30e6] to-[#8a4fff] hover:opacity-90 text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                        {isSubmitting[question.id] ? '⏳ Checking...' : submissions[question.id]?.isCorrect ? '✅ Solved' : 'Submit Flag'}
                </button>
              </div>

                    {/* Submission Feedback */}
                    {submissions[question.id] && (
                      <div className={`p-4 rounded-lg border ${submissions[question.id].isCorrect ? 'bg-[#6fcf97]/10 border-[#6fcf97] text-[#6fcf97]' : 'bg-[#eb5757]/10 border-[#eb5757] text-[#eb5757]'}`}>
                        {submissions[question.id].feedback}
                      </div>
                    )}

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-3 mt-4 text-sm text-[#c2b0e6]">
                      <span>Status:</span>
                      <div className="flex-1 h-1.5 bg-[#1a102b] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#6b30e6] to-[#8a4fff] rounded-full transition-all duration-500"
                          style={{ width: submissions[question.id]?.isCorrect ? '100%' : '0%' }}
                        ></div>
                      </div>
                      <span className={submissions[question.id]?.isCorrect ? 'text-[#6fcf97]' : ''}>
                        {submissions[question.id]?.isCorrect ? 'Solved' : 'Not attempted'}
                </span>
              </div>

                    {/* Attempts Counter */}
                    {question.attempts !== undefined && (
                      <div className="text-sm text-[#c2b0e6] mt-2">
                        Attempts: {question.attempts}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* MCQ Question Type */}
              {question.type === 'mcq' && (
                <>
                  {/* MCQ Options */}
                  <div className="mb-4">
                    {question.options?.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => !submissions[question.id] && handleMcqSelect(question.id, option.id)}
                        className={`flex items-start gap-3 p-3 mb-2 rounded-lg border cursor-pointer transition-all ${
                          mcqSelections[question.id] === option.id
                            ? 'bg-[#4da6ff]/10 border-[#4da6ff]'
                            : 'bg-[#2d1b4e] border-[#4a2d7a] hover:border-[#4da6ff] hover:bg-[#4da6ff]/5'
                        } ${submissions[question.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`mcq-${question.id}`}
                          checked={mcqSelections[question.id] === option.id}
                          onChange={() => handleMcqSelect(question.id, option.id)}
                          disabled={submissions[question.id] !== undefined}
                          className="mt-1"
                        />
                        <label className="text-[#f0e6ff] text-sm flex-1 cursor-pointer">
                          {option.text}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  {submissions[question.id]?.showExplanation && question.explanation && (
                    <div className="bg-[#8a4fff]/10 border-l-4 border-[#8a4fff] rounded-r-lg p-4 mb-4">
                      <p className="text-[#f0e6ff] text-sm">
                        <span className="font-medium">Explanation:</span> {question.explanation}
                      </p>
                    </div>
                  )}

                  {/* MCQ Submission */}
                  <div className="mb-4">
                    <button
                      onClick={() => handleSubmit(question.id, question)}
                      disabled={submissions[question.id] !== undefined || isSubmitting[question.id]}
                      className="bg-gradient-to-r from-[#6b30e6] to-[#8a4fff] hover:opacity-90 text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {isSubmitting[question.id] ? '⏳ Checking...' : submissions[question.id]?.isCorrect ? '✅ Solved' : 'Submit Answer'}
                    </button>

                    {/* Submission Feedback */}
                    {submissions[question.id] && (
                      <div className={`p-4 rounded-lg border mt-4 ${submissions[question.id].isCorrect ? 'bg-[#6fcf97]/10 border-[#6fcf97] text-[#6fcf97]' : 'bg-[#eb5757]/10 border-[#eb5757] text-[#eb5757]'}`}>
                        {submissions[question.id].feedback}
                      </div>
                    )}

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-3 mt-4 text-sm text-[#c2b0e6]">
                      <span>Status:</span>
                      <div className="flex-1 h-1.5 bg-[#1a102b] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#6b30e6] to-[#8a4fff] rounded-full transition-all duration-500"
                          style={{ width: submissions[question.id]?.isCorrect ? '100%' : '0%' }}
                        ></div>
                      </div>
                      <span className={submissions[question.id]?.isCorrect ? 'text-[#6fcf97]' : ''}>
                        {submissions[question.id]?.isCorrect ? 'Solved' : 'Not attempted'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Fill in the Blank Question Type */}
              {question.type === 'fib' && (
                <>
                  {/* FIB Blanks */}
                  <div className="mb-4 space-y-4">
                    {question.blanks?.map((blank) => (
                      <div key={blank.id}>
                        <label className="block text-[#f0e6ff] text-sm font-medium mb-2">
                          {blank.label}
                        </label>
                        <input
                          type="text"
                          value={fibInputs[question.id]?.[blank.id] || ''}
                          onChange={(e) => handleFibChange(question.id, blank.id, e.target.value)}
                          disabled={submissions[question.id] !== undefined}
                          placeholder="Enter your answer"
                          className="w-full bg-[#1a102b] border border-[#4a2d7a] text-[#f0e6ff] placeholder-[#c2b0e6] px-4 py-2 rounded-lg focus:outline-none focus:border-[#ff9966] disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  {submissions[question.id]?.showExplanation && question.explanation && (
                    <div className="bg-[#8a4fff]/10 border-l-4 border-[#8a4fff] rounded-r-lg p-4 mb-4">
                      <p className="text-[#f0e6ff] text-sm">
                        <span className="font-medium">Explanation:</span> {question.explanation}
                      </p>
                    </div>
                  )}

                  {/* FIB Submission */}
                  <div className="mb-4">
                    <button
                      onClick={() => handleSubmit(question.id, question)}
                      disabled={submissions[question.id] !== undefined || isSubmitting[question.id]}
                      className="bg-gradient-to-r from-[#6b30e6] to-[#8a4fff] hover:opacity-90 text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {isSubmitting[question.id] ? '⏳ Checking...' : submissions[question.id]?.isCorrect ? '✅ Solved' : 'Submit Answers'}
                    </button>

                    {/* Submission Feedback */}
                    {submissions[question.id] && (
                      <div className={`p-4 rounded-lg border mt-4 ${submissions[question.id].isCorrect ? 'bg-[#6fcf97]/10 border-[#6fcf97] text-[#6fcf97]' : 'bg-[#eb5757]/10 border-[#eb5757] text-[#eb5757]'}`}>
                        {submissions[question.id].feedback}
                      </div>
                    )}

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-3 mt-4 text-sm text-[#c2b0e6]">
                      <span>Status:</span>
                      <div className="flex-1 h-1.5 bg-[#1a102b] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#6b30e6] to-[#8a4fff] rounded-full transition-all duration-500"
                          style={{ width: submissions[question.id]?.isCorrect ? '100%' : '0%' }}
                        ></div>
                      </div>
                      <span className={submissions[question.id]?.isCorrect ? 'text-[#6fcf97]' : ''}>
                        {submissions[question.id]?.isCorrect ? 'Solved' : 'Not attempted'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Hint System (for all question types) */}
              {question.hints && question.hints.length > 0 && (
                <div className="mt-4">
                  <HintSystem
                    hints={question.hints.map(hint => ({
                      id: hint.id,
                      text: hint.text,
                      cost: hint.cost,
                      maxUses: hint.maxUses,
                      revealed: (revealedHints[question.id] || []).includes(hint.id),
                      revealOrder: (hint as any).revealOrder || 0
                    }))}
                    onUseHint={(hintId, cost) => {
                      if (onUseHint) {
                        onUseHint(question.id, hintId, cost);
                      }
                    }}
                    questionPoints={question.points}
                    revealedHintsCount={(revealedHints[question.id] || []).length}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
