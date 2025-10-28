'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createChallengeSchema, CreateChallengeData } from '@/lib/validation';
import { useChallengeManagement } from '@/lib/hooks/useChallengeManagement';
import { useToast } from '@/lib/hooks/useToast';
import { transformChallengeForCreate } from '@/lib/utils/challenge-transformer';

// Types for Questions and Artifacts
interface Hint {
  text: string;
  cost: number;
}

interface Question {
  id: string;
  title: string;
  text: string;
  flagFormat: string;
  correctAnswer: string;
  points: number;
  whyMatters: string;
  maxHints: number;
  pointsPerHint: number;
  hints: Hint[];
}

interface MCQOption {
  text: string;
  isCorrect: boolean;
}

interface MCQQuestion {
  id: string;
  title: string;
  text: string;
  options: MCQOption[];
  points: number;
  explanation: string;
}

interface FIBQuestion {
  id: string;
  title: string;
  text: string;
  blanks: string[];
  acceptableVariations: string[];
  points: number;
}

interface Artifact {
  id: string;
  name: string;
  description: string;
  url?: string;
}

export default function CreateChallengePage() {
  const router = useRouter();
  const { createChallenge } = useChallengeManagement();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'basic' | 'scenario' | 'questions' | 'mcq-fib' | 'preview'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  
  // Questions State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mcqQuestions, setMCQQuestions] = useState<MCQQuestion[]>([]);
  const [fibQuestions, setFIBQuestions] = useState<FIBQuestion[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  
  // Validation Error State
  const [questionErrors, setQuestionErrors] = useState<{[key: string]: any}>({});
  const [mcqErrors, setMCQErrors] = useState<{[key: string]: any}>({});
  const [fibErrors, setFIBErrors] = useState<{[key: string]: any}>({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateChallengeData>({
    resolver: zodResolver(createChallengeSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      category: 'OT/ICS Security',
      difficulty: 'Medium' as const,
      scenario: '',
      contextNotes: '',
      status: 'Draft' as const,
      tags: [],
    },
  });

  const formValues = watch();

  // Calculate total question points
  const calculateTotalQuestionPoints = () => {
    const flagPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const mcqPoints = mcqQuestions.reduce((sum, q) => sum + q.points, 0);
    const fibPoints = fibQuestions.reduce((sum, q) => sum + q.points, 0);
    return flagPoints + mcqPoints + fibPoints;
  };

  // Check if cumulative points exceed challenge points
  const validatePoints = () => {
    const totalQuestionPoints = calculateTotalQuestionPoints();
    const challengePoints = formValues.points || 0;
    return totalQuestionPoints <= challengePoints;
  };

  const onSubmit = async (data: CreateChallengeData) => {
    try {
      // Validate that at least one question is added
      const totalQuestions = questions.length + mcqQuestions.length + fibQuestions.length;
      if (totalQuestions === 0) {
        showError('Please add at least one question before submitting the challenge');
        return;
      }

      // Validate Flag questions have correct answers
      for (let i = 0; i < questions.length; i++) {
        if (!questions[i].correctAnswer || questions[i].correctAnswer.trim() === '') {
          showError(`Flag Question ${i + 1} (${questions[i].title || 'Untitled'}): Please enter a correct answer`);
          setActiveTab('questions');
          return;
        }
      }

      // Validate MCQ questions have at least one correct option selected
      for (let i = 0; i < mcqQuestions.length; i++) {
        const hasCorrectOption = mcqQuestions[i].options.some(opt => opt.isCorrect);
        if (!hasCorrectOption) {
          showError(`MCQ Question ${i + 1} (${mcqQuestions[i].title || 'Untitled'}): Please select at least one correct answer`);
          setActiveTab('mcq-fib');
          return;
        }
      }

      // Validate FIB questions have answers for all blanks
      for (let i = 0; i < fibQuestions.length; i++) {
        if (fibQuestions[i].blanks.length === 0) {
          showError(`Fill-in-Blank Question ${i + 1} (${fibQuestions[i].title || 'Untitled'}): Please add at least one blank`);
          setActiveTab('mcq-fib');
          return;
        }
        for (let j = 0; j < fibQuestions[i].blanks.length; j++) {
          if (!fibQuestions[i].blanks[j] || fibQuestions[i].blanks[j].trim() === '') {
            showError(`Fill-in-Blank Question ${i + 1} (${fibQuestions[i].title || 'Untitled'}): Please enter an answer for Blank ${j + 1}`);
            setActiveTab('mcq-fib');
            return;
          }
        }
      }

      setIsSubmitting(true);
      
      // Use custom category if "Other" was selected
      const finalCategory = showCustomCategory ? customCategory : data.category;
      
      // Calculate total points automatically (100 points per question)
      const calculatedPoints = calculateTotalQuestionPoints();
      
      // Prepare complete challenge data with all questions and artifacts
      const frontendData = {
        ...data,
        category: finalCategory,
        points: calculatedPoints, // Use calculated points instead of user input
        timeEstimate: data.timeEstimate,
        flag_questions: questions,
        mcq_questions: mcqQuestions,
        fib_questions: fibQuestions,
        artifacts: artifacts,
      };

      // Transform to backend format
      const backendPayload = transformChallengeForCreate(frontendData);
      
      // Debug: Log the payload being sent to backend
      console.log('📤 Publishing Challenge - Payload:', {
        endpoint: 'POST /api/v1/challenges/bulk-create/',
        payload: backendPayload,
        questionCounts: {
          flag_questions: questions.length,
          mcq_questions: mcqQuestions.length,
          fillblank_questions: fibQuestions.length,
          artifacts: artifacts.length,
        }
      });
      
      await createChallenge(backendPayload);
      console.log('✅ Challenge published successfully!');
      showSuccess('Challenge created successfully!');
      setTimeout(() => {
        router.push('/admin/challenges');
      }, 1500);
    } catch (error) {
      console.error('Error creating challenge:', error);
      showError(error instanceof Error ? error.message : 'Failed to create challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tag Management
  const handleAddTag = () => {
    if (tagInput.trim() && !formValues.tags?.includes(tagInput.trim())) {
      setValue('tags', [...(formValues.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', formValues.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  // Validation Functions
  const validateFlagQuestion = (question: Question, index: number) => {
    const errors: any = {};
    if (!question.title || question.title.trim() === '') {
      errors.title = 'Title is required';
    }
    if (!question.text || question.text.trim() === '') {
      errors.text = 'Question text is required';
    }
    if (!question.flagFormat || question.flagFormat.trim() === '') {
      errors.flagFormat = 'Flag format is required';
    }
    if (!question.correctAnswer || question.correctAnswer.trim() === '') {
      errors.correctAnswer = 'Correct answer is required';
    }
    
    const errorKey = question.id;
    if (Object.keys(errors).length > 0) {
      setQuestionErrors(prev => ({ ...prev, [errorKey]: errors }));
      showError(`Question ${index + 1}: Please fill in all required fields`);
      return false;
    } else {
      setQuestionErrors(prev => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
      showSuccess(`Question ${index + 1} saved successfully!`);
      return true;
    }
  };

  const validateMCQQuestion = (question: MCQQuestion, index: number) => {
    const errors: any = {};
    if (!question.title || question.title.trim() === '') {
      errors.title = 'Title is required';
    }
    if (!question.text || question.text.trim() === '') {
      errors.text = 'Question text is required';
    }
    const hasCorrect = question.options.some(opt => opt.isCorrect);
    if (!hasCorrect) {
      errors.options = 'Please select at least one correct answer';
    }
    const emptyOptions = question.options.some(opt => !opt.text || opt.text.trim() === '');
    if (emptyOptions) {
      errors.optionTexts = 'All option texts are required';
    }
    
    const errorKey = question.id;
    if (Object.keys(errors).length > 0) {
      setMCQErrors(prev => ({ ...prev, [errorKey]: errors }));
      showError(`MCQ Question ${index + 1}: Please fill in all required fields`);
      return false;
    } else {
      setMCQErrors(prev => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
      showSuccess(`MCQ Question ${index + 1} saved successfully!`);
      return true;
    }
  };

  const validateFIBQuestion = (question: FIBQuestion, index: number) => {
    const errors: any = {};
    if (!question.title || question.title.trim() === '') {
      errors.title = 'Title is required';
    }
    if (!question.text || question.text.trim() === '') {
      errors.text = 'Question text is required';
    }
    if (question.blanks.length === 0) {
      errors.blanks = 'At least one blank is required';
    } else {
      const emptyBlanks = question.blanks.some(blank => !blank || blank.trim() === '');
      if (emptyBlanks) {
        errors.blanks = 'All blanks must have answers';
      }
    }
    
    const errorKey = question.id;
    if (Object.keys(errors).length > 0) {
      setFIBErrors(prev => ({ ...prev, [errorKey]: errors }));
      showError(`Fill-in-Blank Question ${index + 1}: Please fill in all required fields`);
      return false;
    } else {
      setFIBErrors(prev => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
      showSuccess(`Fill-in-Blank Question ${index + 1} saved successfully!`);
      return true;
    }
  };

  // Question Management
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      title: `Q${questions.length + 1}. New Question`,
      text: '',
      flagFormat: '',
      correctAnswer: '',
      points: 100, // Fixed at 100 points
      whyMatters: '',
      maxHints: 3,
      pointsPerHint: 25, // Fixed at 25 points per hint
      hints: [{ text: '', cost: 25 }], // Fixed at 25 points cost
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addHint = (questionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].hints.length < 3) {
      updated[questionIndex].hints.push({ text: '', cost: 25 });
      setQuestions(updated);
    }
  };

  const removeHint = (questionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].hints.length > 0) {
      updated[questionIndex].hints.pop();
      setQuestions(updated);
    }
  };

  const updateHint = (questionIndex: number, hintIndex: number, updates: Partial<Hint>) => {
    const updated = [...questions];
    updated[questionIndex].hints[hintIndex] = { ...updated[questionIndex].hints[hintIndex], ...updates };
    setQuestions(updated);
  };

  // MCQ Management
  const addMCQQuestion = () => {
    const newMCQ: MCQQuestion = {
      id: `mcq${mcqQuestions.length + 1}`,
      title: `Q${mcqQuestions.length + 1}. New MCQ`,
      text: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      points: 100, // Fixed at 100 points
      explanation: '',
    };
    setMCQQuestions([...mcqQuestions, newMCQ]);
  };

  const updateMCQQuestion = (index: number, updates: Partial<MCQQuestion>) => {
    const updated = [...mcqQuestions];
    updated[index] = { ...updated[index], ...updates };
    setMCQQuestions(updated);
  };

  const removeMCQQuestion = (index: number) => {
    setMCQQuestions(mcqQuestions.filter((_, i) => i !== index));
  };

  const updateMCQOption = (questionIndex: number, optionIndex: number, updates: Partial<MCQOption>) => {
    const updated = [...mcqQuestions];
    updated[questionIndex].options[optionIndex] = { ...updated[questionIndex].options[optionIndex], ...updates };
    setMCQQuestions(updated);
  };

  // FIB Management
  const addFIBQuestion = () => {
    const newFIB: FIBQuestion = {
      id: `fib${fibQuestions.length + 1}`,
      title: `Q${fibQuestions.length + 1}. New Fill-in-Blank`,
      text: '',
      blanks: [''],
      acceptableVariations: [],
      points: 100, // Fixed at 100 points
    };
    setFIBQuestions([...fibQuestions, newFIB]);
  };

  const updateFIBQuestion = (index: number, updates: Partial<FIBQuestion>) => {
    const updated = [...fibQuestions];
    updated[index] = { ...updated[index], ...updates };
    setFIBQuestions(updated);
  };

  const removeFIBQuestion = (index: number) => {
    setFIBQuestions(fibQuestions.filter((_, i) => i !== index));
  };

  const addBlank = (questionIndex: number) => {
    const updated = [...fibQuestions];
    updated[questionIndex].blanks.push('');
    setFIBQuestions(updated);
  };

  const updateBlank = (questionIndex: number, blankIndex: number, value: string) => {
    const updated = [...fibQuestions];
    updated[questionIndex].blanks[blankIndex] = value;
    setFIBQuestions(updated);
  };

  // Artifact Management
  const addArtifact = () => {
    const newArtifact: Artifact = {
      id: `artifact${artifacts.length + 1}`,
      name: '',
      description: '',
    };
    setArtifacts([...artifacts, newArtifact]);
  };

  const updateArtifact = (index: number, updates: Partial<Artifact>) => {
    const updated = [...artifacts];
    updated[index] = { ...updated[index], ...updates };
    setArtifacts(updated);
  };

  const removeArtifact = (index: number) => {
    setArtifacts(artifacts.filter((_, i) => i !== index));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500 bg-opacity-20 text-green-500';
      case 'Medium': return 'bg-yellow-500 bg-opacity-20 text-yellow-500';
      case 'Hard': return 'bg-red-500 bg-opacity-20 text-red-500';
      case 'Expert': return 'bg-purple-500 bg-opacity-20 text-purple-500';
      default: return 'bg-gray-500 bg-opacity-20 text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-500 bg-opacity-20 text-green-500';
      case 'Draft': return 'bg-yellow-500 bg-opacity-20 text-yellow-500';
      case 'Archived': return 'bg-red-500 bg-opacity-20 text-red-500';
      default: return 'bg-gray-500 bg-opacity-20 text-gray-500';
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0) + 
                      mcqQuestions.reduce((sum, q) => sum + q.points, 0) + 
                      fibQuestions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="min-h-screen bg-primary-bg p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-dark to-accent-color rounded-lg flex items-center justify-center text-white font-bold text-xl">
                C
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
                  Challenge Management
                </h1>
                <p className="text-text-secondary text-sm">
                  Create and manage cybersecurity challenges for the training platform
                </p>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${getDifficultyColor(formValues.difficulty)}`}>
                {formValues.difficulty}
              </span>
              <span className="flex items-center gap-2 text-text-secondary text-sm">
                <span>🔒</span>
                <span>{formValues.category}</span>
              </span>
              <span className="flex items-center gap-2 text-text-secondary text-sm">
                <span>⏱️</span>
                <span>Estimated: {formValues.timeEstimate} mins</span>
              </span>
              <span className="flex items-center gap-2 text-text-secondary text-sm">
                <span>🏆</span>
                <span className="text-accent-light font-bold">{calculateTotalQuestionPoints()} pts total</span>
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${getStatusBadge(formValues.status)}`}>
                {formValues.status}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="btn-secondary flex items-center gap-2"
            >
              <span>📋</span>
              Back to Admin Panel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              className="btn-primary flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save Changes
                </>
              )}
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this challenge?')) {
                  router.back();
                }
              }}
              className="btn-danger flex items-center gap-2"
            >
              <span>🗑️</span>
              Delete Challenge
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-color mb-6 overflow-x-auto">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'scenario', label: 'Scenario & Artifacts' },
            { id: 'questions', label: 'Flag-Based Questions' },
            { id: 'mcq-fib', label: 'MCQ & Fill-in-Blanks' },
            { id: 'preview', label: 'Preview' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-accent-light border-b-2 border-accent-color'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
              <h2 className="text-xl font-semibold text-accent-light mb-6 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Challenge Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Challenge Title
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                    placeholder="Enter challenge title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-danger-color">{errors.title.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Category
                    </label>
                    <select
                      {...register('category')}
                      onChange={(e) => {
                        setValue('category', e.target.value);
                        setShowCustomCategory(e.target.value === 'Other');
                      }}
                      className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                    >
                      <option value="OT/ICS Security">OT/ICS Security</option>
                      <option value="Network Security">Network Security</option>
                      <option value="Web Application Security">Web Application Security</option>
                      <option value="Digital Forensics">Digital Forensics</option>
                      <option value="Cryptography">Cryptography</option>
                      <option value="Other">Other</option>
                    </select>
                    {showCustomCategory && (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category"
                        className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color mt-2"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Difficulty
                    </label>
                    <select
                      {...register('difficulty')}
                      className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Time Estimate (minutes)
                  </label>
                  <input
                    {...register('timeEstimate', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                    defaultValue={60}
                    min="0"
                  />
                </div>

                <div className="bg-blue-500 bg-opacity-10 border-l-4 border-blue-500 rounded p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <strong className="text-text-primary">Total Points: Calculated Automatically</strong>
                      <p className="text-text-secondary text-sm mt-1">
                        Each question is worth 100 points. Total challenge points = Number of questions × 100
                      </p>
                      <p className="text-accent-light text-sm mt-1 font-semibold">
                        Current: {calculateTotalQuestionPoints()} points ({questions.length + mcqQuestions.length + fibQuestions.length} questions)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Challenge Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color resize-vertical"
                    placeholder="A comprehensive cybersecurity challenge covering various aspects..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-danger-color">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('scenario')}
                className="btn-primary flex items-center gap-2"
              >
                Next
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Scenario & Artifacts Tab */}
        {activeTab === 'scenario' && (
          <div className="space-y-6">
            <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
              <h2 className="text-xl font-semibold text-accent-light mb-6 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Scenario Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Scenario Text
                  </label>
                  <textarea
                    {...register('scenario')}
                    rows={6}
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color resize-vertical"
                    placeholder="A water treatment plant's engineering workstation shows signs of unauthorized activity..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    OT/ICS Context Notes
                  </label>
                  <textarea
                    {...register('contextNotes')}
                    rows={4}
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color resize-vertical"
                    placeholder="- The engineering workstation is used by OT staff to manage PLC setpoints..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
              <h2 className="text-xl font-semibold text-accent-light mb-6 flex items-center gap-2">
                <span className="text-2xl">📁</span>
                Challenge Artifacts
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Artifacts Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color resize-vertical"
                    placeholder="Download and analyze these files to solve the challenge:"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {artifacts.map((artifact, index) => (
                    <div
                      key={artifact.id}
                      className="bg-secondary-bg border border-border-color rounded-lg p-4 hover:border-accent-color transition-all cursor-pointer"
                    >
                      <input
                        type="text"
                        value={artifact.name}
                        onChange={(e) => updateArtifact(index, { name: e.target.value })}
                        className="w-full bg-transparent border-none text-text-primary font-semibold mb-2 focus:outline-none"
                        placeholder="Artifact name"
                      />
                      <input
                        type="text"
                        value={artifact.description}
                        onChange={(e) => updateArtifact(index, { description: e.target.value })}
                        className="w-full bg-transparent border-none text-text-secondary text-sm focus:outline-none"
                        placeholder="Description"
                      />
                      <button
                        onClick={() => removeArtifact(index)}
                        className="mt-2 text-danger-color text-xs hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={addArtifact}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <span>➕</span>
                    Add Artifact
                  </button>
                  <button
                    type="button"
                    className="btn-primary flex items-center gap-2"
                  >
                    <span>📥</span>
                    Upload Artifacts
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className="btn-secondary flex items-center gap-2"
              >
                <span>←</span>
                Previous
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className="btn-primary flex items-center gap-2"
              >
                Next
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Flag-Based Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
              <h2 className="text-xl font-semibold text-accent-light mb-6 flex items-center gap-2">
                <span className="text-2xl">❓</span>
                Flag-Based Questions ({questions.length} Questions, {questions.reduce((sum, q) => sum + q.points, 0)} Points Total)
              </h2>

              <div className="bg-secondary-bg bg-opacity-10 border-l-4 border-accent-color rounded p-4 mb-6">
                <strong className="text-text-primary">Hint System:</strong>
                <span className="text-text-secondary ml-2">
                  Each question can have up to 3 hints. Each hint reduces the score by 25 points. Students can use 1-3 hints per question.
                </span>
              </div>

              <div className="space-y-6">
                {questions.map((question, qIndex) => {
                  const currentErrors = questionErrors[question.id] || {};
                  return (
                  <div
                    key={question.id}
                    className="bg-secondary-bg rounded-lg p-6 border border-border-color"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <input
                        type="text"
                        value={question.title}
                        onChange={(e) => updateQuestion(qIndex, { title: e.target.value })}
                        className={`flex-1 bg-transparent border-none text-text-primary text-lg font-semibold focus:outline-none cursor-pointer hover:text-accent-light ${currentErrors.title ? 'border-b-2 border-red-500' : ''}`}
                        placeholder="Question Title *"
                      />
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-accent-color text-white rounded-full text-sm font-bold">
                          100 pts
                        </span>
                      </div>
                    </div>
                    {currentErrors.title && <p className="text-red-500 text-xs mb-2">{currentErrors.title}</p>}

                    <div className="flex gap-4 text-sm text-text-secondary mb-4">
                      <span>Hint Cost: <strong className="text-accent-light">{question.pointsPerHint} pts each</strong></span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Question Text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                          rows={3}
                          className={`w-full px-4 py-3 bg-primary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 ${currentErrors.text ? 'border-red-500 focus:ring-red-500' : 'border-border-color focus:ring-accent-color'}`}
                          placeholder="Enter the question text..."
                        />
                        {currentErrors.text && <p className="text-red-500 text-xs mt-1">{currentErrors.text}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div> 
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Flag Format <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={question.flagFormat}
                            onChange={(e) => updateQuestion(qIndex, { flagFormat: e.target.value })}
                            className={`w-full px-4 py-3 bg-primary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 ${currentErrors.flagFormat ? 'border-red-500 focus:ring-red-500' : 'border-border-color focus:ring-accent-color'}`}
                            placeholder="ex: CRDF {flag}"
                          />
                          {currentErrors.flagFormat && <p className="text-red-500 text-xs mt-1">{currentErrors.flagFormat}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Correct Answer <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={question.correctAnswer}
                            onChange={(e) => updateQuestion(qIndex, { correctAnswer: e.target.value })}
                            className={`w-full px-4 py-3 bg-primary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 ${currentErrors.correctAnswer ? 'border-red-500 focus:ring-red-500' : 'border-border-color focus:ring-accent-color'}`}
                            placeholder="Enter correct answer"
                          />
                          {currentErrors.correctAnswer && <p className="text-red-500 text-xs mt-1">{currentErrors.correctAnswer}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Why This Matters (OT Context)
                        </label>
                        <textarea
                          value={question.whyMatters}
                          onChange={(e) => updateQuestion(qIndex, { whyMatters: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-3 bg-primary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                          placeholder="Explain the OT security relevance..."
                        />
                      </div>

                      {/* Hint Configuration */}
                      <div className="bg-opacity-10 rounded-lg p-4">
                        {/* Hints */}
                        <div className="space-y-3">
                          {question.hints.map((hint, hIndex) => (
                            <div key={hIndex} className="bg-secondary-bg border border-border-color rounded-lg p-4 relative">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-accent-light">Hint {hIndex + 1}</span>
                                <div className="flex items-center gap-2">
                                  <span className="px-3 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 rounded-full text-xs font-semibold">
                                    -25 points
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...questions];
                                      updated[qIndex].hints.splice(hIndex, 1);
                                      setQuestions(updated);
                                    }}
                                    className="text-danger-color hover:text-red-600 transition-colors p-1"
                                    title="Remove hint"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <textarea
                                value={hint.text}
                                onChange={(e) => updateHint(qIndex, hIndex, { text: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                                placeholder="Enter hint text..."
                              />
                            </div>
                          ))}
                        </div>

                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => addHint(qIndex)}
                            disabled={question.hints.length >= 3}
                            className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add Hint
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => validateFlagQuestion(question, qIndex)}
                          className="btn-primary text-sm"
                        >
                          Save Question
                        </button>
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="btn-danger text-sm"
                        >
                          Remove Question
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="btn-primary flex items-center gap-2"
                >
                  <span>➕</span>
                  Add Question
                </button>
                <button
                  type="button"
                  className="btn-secondary flex items-center gap-2"
                >
                  <span>📥</span>
                  Bulk Import Questions
                </button>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('scenario')}
                className="btn-secondary flex items-center gap-2"
              >
                <span>←</span>
                Previous
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mcq-fib')}
                className="btn-primary flex items-center gap-2"
              >
                Next
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* MCQ & Fill-in-Blank Tab */}
        {activeTab === 'mcq-fib' && (
          <div className="space-y-6">
            <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
              <h2 className="text-xl font-semibold text-accent-light mb-6 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Multiple Choice & Fill-in-the-Blank Questions ({mcqQuestions.length + fibQuestions.length} Questions, {mcqQuestions.reduce((sum, q) => sum + q.points, 0) + fibQuestions.reduce((sum, q) => sum + q.points, 0)} Points Total)
              </h2>

              <p className="text-text-secondary mb-6">
                Create multiple choice and fill-in-the-blank questions for knowledge assessment. No hints available for these question types.
              </p>

              <div className="space-y-6">
                {/* MCQ Questions */}
                {mcqQuestions.map((mcq, qIndex) => {
                  const currentErrors = mcqErrors[mcq.id] || {};
                  return (
                  <div
                    key={mcq.id}
                    className="bg-secondary-bg rounded-lg p-6 border border-border-color"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={mcq.title}
                          onChange={(e) => updateMCQQuestion(qIndex, { title: e.target.value })}
                          className={`flex-1 bg-transparent border-none text-text-primary text-lg font-semibold focus:outline-none cursor-pointer hover:text-accent-light ${currentErrors.title ? 'border-b-2 border-red-500' : ''}`}
                          placeholder="MCQ Question Title *"
                        />
                        <span className="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-xs font-bold">
                          MCQ
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-accent-color text-white rounded-full text-sm font-bold">
                        100 pts
                      </span>
                    </div>
                    {currentErrors.title && <p className="text-red-500 text-xs mb-2">{currentErrors.title}</p>}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Question Text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={mcq.text}
                          onChange={(e) => updateMCQQuestion(qIndex, { text: e.target.value })}
                          rows={3}
                          className={`w-full px-4 py-3 bg-primary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 ${currentErrors.text ? 'border-red-500 focus:ring-red-500' : 'border-border-color focus:ring-accent-color'}`}
                          placeholder="Enter the question..."
                        />
                        {currentErrors.text && <p className="text-red-500 text-xs mt-1">{currentErrors.text}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Options <span className="text-red-500">* (Select one correct answer)</span>
                        </label>
                        <div className="space-y-2">
                          {mcq.options.map((option, oIndex) => (
                            <div key={oIndex} className={`flex items-center gap-2 p-3 bg-primary-bg rounded-lg border ${currentErrors.options || currentErrors.optionTexts ? 'border-red-500' : 'border-border-color'}`}>
                              <input
                                type="radio"
                                name={`mcq-${qIndex}`}
                                checked={option.isCorrect}
                                onChange={() => {
                                  const updated = [...mcqQuestions];
                                  updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
                                    ...opt,
                                    isCorrect: i === oIndex
                                  }));
                                  setMCQQuestions(updated);
                                }}
                                className="text-accent-color w-4 h-4"
                              />
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => updateMCQOption(qIndex, oIndex, { text: e.target.value })}
                                className="flex-1 px-3 py-2 bg-secondary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                                placeholder={`Option ${oIndex + 1} *`}
                              />
                            </div>
                          ))}
                        </div>
                        {currentErrors.options && <p className="text-red-500 text-xs mt-1">{currentErrors.options}</p>}
                        {currentErrors.optionTexts && <p className="text-red-500 text-xs mt-1">{currentErrors.optionTexts}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Explanation (shown after answer)
                        </label>
                        <textarea
                          value={mcq.explanation}
                          onChange={(e) => updateMCQQuestion(qIndex, { explanation: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-3 bg-primary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                          placeholder="Explain why this is the correct answer..."
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => validateMCQQuestion(mcq, qIndex)}
                          className="btn-primary text-sm"
                        >
                          Save Question
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMCQQuestion(qIndex)}
                          className="btn-danger text-sm"
                        >
                          Remove Question
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}

                {/* FIB Questions */}
                {fibQuestions.map((fib, qIndex) => {
                  const currentErrors = fibErrors[fib.id] || {};
                  return (
                  <div
                    key={fib.id}
                    className="bg-secondary-bg rounded-lg p-6 border border-border-color"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={fib.title}
                          onChange={(e) => updateFIBQuestion(qIndex, { title: e.target.value })}
                          className={`flex-1 bg-transparent border-none text-text-primary text-lg font-semibold focus:outline-none cursor-pointer hover:text-accent-light ${currentErrors.title ? 'border-b-2 border-red-500' : ''}`}
                          placeholder="Fill-in-Blank Question Title *"
                        />
                        <span className="px-3 py-1 bg-orange-500 bg-opacity-20 text-orange-400 rounded-full text-xs font-bold">
                          Fill-in-Blank
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-accent-color text-white rounded-full text-sm font-bold">
                        100 pts
                      </span>
                    </div>
                    {currentErrors.title && <p className="text-red-500 text-xs mb-2">{currentErrors.title}</p>}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Question Text with Blanks <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={fib.text}
                          onChange={(e) => updateFIBQuestion(qIndex, { text: e.target.value })}
                          rows={3}
                          className={`w-full px-4 py-3 bg-primary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 ${currentErrors.text ? 'border-red-500 focus:ring-red-500' : 'border-border-color focus:ring-accent-color'}`}
                          placeholder="Programmable Logic Controllers (PLCs) are industrial computers used to control ______ processes..."
                        />
                        {currentErrors.text && <p className="text-red-500 text-xs mt-1">{currentErrors.text}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Correct Answers for Blanks <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {fib.blanks.map((blank, bIndex) => (
                            <div key={bIndex} className={`bg-orange-500 bg-opacity-10 border border-dashed rounded p-3 ${currentErrors.blanks ? 'border-red-500' : 'border-orange-500'}`}>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-xs text-orange-400 font-medium">Blank {bIndex + 1} *</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...fibQuestions];
                                    updated[qIndex].blanks.splice(bIndex, 1);
                                    setFIBQuestions(updated);
                                  }}
                                  className="text-danger-color hover:text-red-600 transition-colors p-1"
                                  title="Remove blank"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <input
                                type="text"
                                value={blank}
                                onChange={(e) => updateBlank(qIndex, bIndex, e.target.value)}
                                className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none"
                                placeholder="Correct answer *"
                              />
                            </div>
                          ))}
                        </div>
                        {currentErrors.blanks && <p className="text-red-500 text-xs mt-1">{currentErrors.blanks}</p>}
                        <button
                          type="button"
                          onClick={() => addBlank(qIndex)}
                          className="mt-2 px-4 py-2 bg-orange-500 text-white rounded flex items-center gap-2 hover:bg-orange-600"
                        >
                          + Add Blank
                        </button>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => validateFIBQuestion(fib, qIndex)}
                          className="btn-primary text-sm"
                        >
                          Save Question
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFIBQuestion(qIndex)}
                          className="btn-danger text-sm"
                        >
                          Remove Question
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={addMCQQuestion}
                  className="btn-primary flex items-center gap-2"
                >
                  <span>➕</span>
                  Add Multiple Choice
                </button>
                <button
                  type="button"
                  onClick={addFIBQuestion}
                  className="btn-primary flex items-center gap-2"
                >
                  <span>➕</span>
                  Add Fill-in-Blank
                </button>
                <button
                  type="button"
                  className="btn-secondary flex items-center gap-2"
                >
                  <span>📥</span>
                  Bulk Import Questions
                </button>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className="btn-secondary flex items-center gap-2"
              >
                <span>←</span>
                Previous
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="btn-primary flex items-center gap-2"
              >
                Next
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Challenge Overview */}
            <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                {formValues.title || 'Untitled Challenge'}
              </h2>
              
              <div className="flex gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-secondary-bg bg-opacity-20 text-accent-color rounded-full text-sm font-semibold">
                  {showCustomCategory ? customCategory || 'Other' : formValues.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  formValues.difficulty === 'Easy' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                  formValues.difficulty === 'Medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                  formValues.difficulty === 'Hard' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                  'bg-purple-500 bg-opacity-20 text-purple-400'
                }`}>
                  {formValues.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-sm font-semibold">
                  {formValues.points} Base Points
                </span>
                <span className="px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-sm font-semibold">
                  {questions.reduce((sum, q) => sum + q.points, 0) + 
                   mcqQuestions.reduce((sum, q) => sum + q.points, 0) + 
                   fibQuestions.reduce((sum, q) => sum + q.points, 0)} Total Question Points
                </span>
              </div>

              <p className="text-text-secondary mb-4">{formValues.description || 'No description provided'}</p>

              {formValues.scenario && (
                <div className="mt-4 p-4 bg-secondary-bg rounded-lg border border-border-color">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">📖 Scenario</h3>
                  <p className="text-text-secondary text-sm whitespace-pre-wrap">{formValues.scenario}</p>
                </div>
              )}

              {formValues.contextNotes && (
                <div className="mt-4 p-4 bg-secondary-bg rounded-lg border border-border-color">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">📝 Context Notes</h3>
                  <p className="text-text-secondary text-sm whitespace-pre-wrap">{formValues.contextNotes}</p>
                </div>
              )}
            </div>

            {/* CTF/Flag Questions Preview */}
            {questions.length > 0 && (
              <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
                <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span>🚩</span>
                  CTF/Flag Questions ({questions.length})
                </h3>
                
                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <div key={q.id} className="p-4 bg-secondary-bg rounded-lg border border-border-color">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-text-primary">Q{index + 1}: {q.title}</h4>
                        <span className="px-3 py-1 text-white rounded-full text-sm font-bold">
                          {q.points} pts
                        </span>
                      </div>
                      
                      <p className="text-text-secondary text-sm mb-2">{q.text}</p>
                      
                      {q.flagFormat && (
                        <div className="text-xs text-text-secondary mb-2">
                          Flag Format: <code className="bg-primary-bg px-2 py-1 rounded">{q.flagFormat}</code>
                        </div>
                      )}
                      
                      {q.whyMatters && (
                        <div className="text-xs text-text-secondary mb-2 italic">
                          💡 Why this matters: {q.whyMatters}
                        </div>
                      )}
                      
                      {q.hints.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <h5 className="text-sm font-semibold text-text-primary">Hints ({q.hints.length}):</h5>
                          {q.hints.map((hint, hIndex) => (
                            <div key={hIndex} className="flex items-start gap-2 text-sm">
                              <span className="text-warning-color font-semibold">💡 Hint {hIndex + 1}:</span>
                              <span className="text-text-secondary flex-1">{hint.text}</span>
                              <span className="text-danger-color font-semibold">-{hint.cost} pts</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MCQ Questions Preview */}
            {mcqQuestions.length > 0 && (
              <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
                <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span>✅</span>
                  Multiple Choice Questions ({mcqQuestions.length})
                </h3>
                
                <div className="space-y-4">
                  {mcqQuestions.map((q, index) => (
                    <div key={q.id} className="p-4 bg-secondary-bg rounded-lg border border-border-color">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-text-primary">Q{questions.length + index + 1}: {q.title}</h4>
                        <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">
                          {q.points} pts
                        </span>
                      </div>
                      
                      <p className="text-text-secondary text-sm mb-3">{q.text}</p>
                      
                      <div className="space-y-2 mb-3">
                        {q.options.map((opt, optIndex) => (
                          <div key={optIndex} className={`flex items-center gap-2 p-2 rounded ${opt.isCorrect ? 'bg-green-500 bg-opacity-10 border border-green-500' : 'bg-primary-bg'}`}>
                            <input 
                              type="radio" 
                              disabled 
                              checked={opt.isCorrect}
                              className="text-accent-color"
                            />
                            <span className="text-text-primary text-sm">{opt.text}</span>
                            {opt.isCorrect && <span className="text-green-400 text-xs ml-auto">✓ Correct</span>}
                          </div>
                        ))}
                      </div>
                      
                      {q.explanation && (
                        <div className="text-xs text-text-secondary bg-primary-bg p-2 rounded">
                          <span className="font-semibold">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fill-in-the-Blank Questions Preview */}
            {fibQuestions.length > 0 && (
              <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
                <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span>📝</span>
                  Fill-in-the-Blank Questions ({fibQuestions.length})
                </h3>
                
                <div className="space-y-4">
                  {fibQuestions.map((q, index) => (
                    <div key={q.id} className="p-4 bg-secondary-bg rounded-lg border border-border-color">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-text-primary">
                          Q{questions.length + mcqQuestions.length + index + 1}: {q.title}
                        </h4>
                        <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold">
                          {q.points} pts
                        </span>
                      </div>
                      
                      <p className="text-text-secondary text-sm mb-2">{q.text}</p>
                      
                      <div className="text-xs text-text-secondary">
                        <span className="font-semibold">Blanks to fill:</span> {q.blanks.length}
                      </div>
                      
                      {q.acceptableVariations.length > 0 && (
                        <div className="text-xs text-text-secondary mt-2">
                          <span className="font-semibold">Acceptable answers include variations</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Artifacts Preview */}
            {artifacts.length > 0 && (
              <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
                <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span>📎</span>
                  Artifacts ({artifacts.length})
                </h3>
                
                <div className="space-y-2">
                  {artifacts.map((artifact, index) => (
                    <div key={artifact.id} className="p-3 bg-secondary-bg rounded-lg border border-border-color">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📄</span>
                        <div className="flex-1">
                          <h4 className="text-text-primary font-semibold text-sm">{artifact.name}</h4>
                          {artifact.description && (
                            <p className="text-text-secondary text-xs">{artifact.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
              <h3 className="text-xl font-semibold text-text-primary mb-4">📊 Challenge Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-color">{questions.length}</div>
                  <div className="text-xs text-text-secondary">CTF Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{mcqQuestions.length}</div>
                  <div className="text-xs text-text-secondary">MCQ Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{fibQuestions.length}</div>
                  <div className="text-xs text-text-secondary">FIB Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning-color">
                    {questions.reduce((sum, q) => sum + q.hints.length, 0)}
                  </div>
                  <div className="text-xs text-text-secondary">Total Hints</div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons for Preview Tab */}
            <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('mcq-fib')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <span>←</span>
                  Previous
                </button>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <span>↶</span>
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    className="btn-primary flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        Publish Challenge
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
