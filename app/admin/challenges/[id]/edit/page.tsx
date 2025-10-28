'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createChallengeSchema, CreateChallengeData } from '@/lib/validation';
import { useChallengeManagement } from '@/lib/hooks/useChallengeManagement';
import { useToast } from '@/lib/hooks/useToast';
import { challengeService } from '@/lib/services/challengeService';
import { transformChallengeForUpdate } from '@/lib/utils/challenge-transformer';

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

export default function EditChallengePage() {
  const router = useRouter();
  const params = useParams();
  const challengeId = params?.id as string;
  const { showSuccess, showError } = useToast();
  const { fetchChallenge, updateChallenge } = useChallengeManagement();
  
  const [activeTab, setActiveTab] = useState<'basic' | 'scenario' | 'questions' | 'mcq-fib' | 'preview'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeEstimate, setTimeEstimate] = useState<number>(60); // Default 60 minutes
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
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'OT/ICS Security',
      difficulty: 'Medium',
      points: 100,
      timeEstimate: 60,
      scenario: '',
      contextNotes: '',
      status: 'Draft',
    } as CreateChallengeData,
  });

  const formValues = watch();

  // Fetch challenge data on mount
  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        setIsLoading(true);
        const challenge = await challengeService.getChallengeById(challengeId);
        
        // Map API fields to form fields
        if (challenge.title) setValue('title', challenge.title);
        if (challenge.description) setValue('description', challenge.description);
        if (challenge.category) {
          const predefinedCategories = ['OT/ICS Security', 'Network Security', 'Web Application Security', 'Digital Forensics', 'Cryptography'];
          if (predefinedCategories.includes(challenge.category)) {
            setValue('category', challenge.category);
          } else {
            // Custom category
            setValue('category', 'Other');
            setShowCustomCategory(true);
            setCustomCategory(challenge.category);
          }
        }
        
        // Map difficulty (API returns lowercase, form expects capitalized)
        if (challenge.difficulty) {
          const difficultyMap = {
            'easy': 'Easy' as const,
            'medium': 'Medium' as const,
            'hard': 'Hard' as const,
            'expert': 'Expert' as const
          };
          const mappedDifficulty = difficultyMap[challenge.difficulty.toLowerCase() as keyof typeof difficultyMap] || 'Medium';
          setValue('difficulty', mappedDifficulty);
        }
        
        // Map points (API uses total_points)
        if (challenge.total_points !== undefined) setValue('points', challenge.total_points);
        
        // Map time estimate
        if (challenge.time_estimate_minutes !== null && challenge.time_estimate_minutes !== undefined) {
          setTimeEstimate(challenge.time_estimate_minutes);
        }
        
        // Map scenario
        if (challenge.scenario) setValue('scenario', challenge.scenario);
        
        // Map context notes (API uses context_note)
        if (challenge.context_note) setValue('contextNotes', challenge.context_note);
        
        // Map status (API uses is_draft/is_published)
        if (challenge.is_published) {
          setValue('status', 'Published');
        } else if (challenge.is_draft) {
          setValue('status', 'Draft');
        } else if (challenge.status) {
          // Fallback to status field if present
          const statusMap = {
            'draft': 'Draft' as const,
            'published': 'Published' as const,
            'archived': 'Archived' as const
          };
          const mappedStatus = statusMap[challenge.status.toLowerCase() as keyof typeof statusMap] || 'Draft';
          setValue('status', mappedStatus);
        }

        // Map flag questions
        if (challenge.flag_questions && challenge.flag_questions.length > 0) {
          const mappedQuestions = challenge.flag_questions.map((q: any) => ({
            id: q.id,
            title: q.question_text || '', // Use question_text as title
            text: q.question_text || '',
            flagFormat: q.flag_format || '',
            correctAnswer: '', // API doesn't return this for security
            points: q.points || 0,
            whyMatters: q.why_matters || '',
            maxHints: q.hint_count || 0,
            pointsPerHint: q.total_hint_cost || 0,
            hints: (q.hints || []).map((h: any) => ({
              text: h.hint_text,
              cost: parseFloat(h.cost) || 0
            }))
          }));
          setQuestions(mappedQuestions);
        }
        
        // Map MCQ questions
        if (challenge.mcq_questions && challenge.mcq_questions.length > 0) {
          const mappedMCQ = challenge.mcq_questions.map((q: any) => ({
            id: q.id,
            title: q.question_text || '', // Use question_text as title
            text: q.question_text || '',
            options: (q.options || []).map((opt: any) => ({
              text: opt.option_text,
              isCorrect: opt.is_correct || false
            })),
            points: q.points || 0,
            explanation: q.explanation || ''
          }));
          setMCQQuestions(mappedMCQ);
        }
        
        // Map fill-in-blank questions
        if (challenge.fillblank_questions && challenge.fillblank_questions.length > 0) {
          const mappedFIB = challenge.fillblank_questions.map((q: any) => ({
            id: q.id,
            title: q.question_text || '',
            text: q.question_text || '',
            blanks: q.blanks || [''],
            acceptableVariations: q.acceptable_variations || [],
            points: q.points || 0
          }));
          setFIBQuestions(mappedFIB);
        }
        
        // Map artifacts
        if (challenge.artifacts && challenge.artifacts.length > 0) {
          const mappedArtifacts = challenge.artifacts.map((a: any) => ({
            id: a.id,
            name: a.file_name || '',
            description: a.description || '',
            url: a.file_url || ''
          }));
          setArtifacts(mappedArtifacts);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching challenge:', error);
        showError('Failed to load challenge data');
        setIsLoading(false);
        // Keep default values (draft state) if fetch fails
      }
    };

    if (challengeId) {
      fetchChallengeData();
    }
  }, [challengeId, setValue]);

  // Transform frontend data to backend format
  const transformChallengeForUpdate = (frontendData: any) => {
    return {
      // Basic fields
      title: frontendData.title,
      category: frontendData.category,
      difficulty: frontendData.difficulty.toLowerCase(), // Must be lowercase
      total_points: frontendData.points, // Changed from points
      time_estimate_minutes: timeEstimate || 30,
      status: frontendData.status.toLowerCase(), // Must be lowercase
      description: frontendData.description,
      scenario: frontendData.scenario,
      context_note: frontendData.contextNotes, // Changed from contextNotes
      preview_enabled: frontendData.previewEnabled ?? true,
      
      // Flag questions
      flag_questions: (questions || []).map(fq => ({
        question_text: fq.text, // Changed from text
        flag_format: fq.flagFormat,
        correct_flag: fq.correctAnswer, // Changed from correctAnswer
        why_matters: fq.whyMatters, // Changed from whyMatters
        context: "",
        points: fq.points,
        hints: (fq.hints || []).map((hint, index) => ({
          hint_text: hint.text, // Changed from text
          cost: parseFloat(hint.cost.toString()).toFixed(2), // Must be string with decimals
          reveal_order: index + 1 // Add reveal order
        }))
      })),
      
      // MCQ questions
      mcq_questions: (mcqQuestions || []).map(mcq => ({
        question_text: mcq.text, // Changed from text
        explanation: mcq.explanation || "",
        points: mcq.points,
        options: (mcq.options || []).map((opt, index) => ({
          option_text: opt.text, // Changed from text
          is_correct: opt.isCorrect, // Changed from isCorrect
          option_order: index + 1 // Add option order
        }))
      })),
      
      // Fill-in-the-blank questions
      fillblank_questions: (fibQuestions || []).map(fib => ({
        question_text: fib.text, // Changed from text
        explanation: "",
        points: fib.points,
        max_attempts: 3,
        accepted_answers: (fib.blanks || []).map((blank, index) => ({
          accepted_answer: blank,
          blank_index: index + 1
        }))
      })),
      
      // Artifacts
      artifacts: (artifacts || []).map(art => ({
        file_name: art.name || "",
        file_url: art.url || "",
        description: art.description || ""
      }))
    };
  };

  const onSubmit = async (data: CreateChallengeData) => {
    setIsSubmitting(true);
    try {
      // Validate Flag questions have correct answers
      for (let i = 0; i < questions.length; i++) {
        if (!questions[i].correctAnswer || questions[i].correctAnswer.trim() === '') {
          showError(`Flag Question ${i + 1} (${questions[i].title || 'Untitled'}): Please enter a correct answer`);
          setActiveTab('questions');
          setIsSubmitting(false);
          return;
        }
      }

      // Validate MCQ questions have at least one correct option selected
      for (let i = 0; i < mcqQuestions.length; i++) {
        const hasCorrectOption = mcqQuestions[i].options.some(opt => opt.isCorrect);
        if (!hasCorrectOption) {
          showError(`MCQ Question ${i + 1} (${mcqQuestions[i].title || 'Untitled'}): Please select at least one correct answer`);
          setActiveTab('mcq-fib');
          setIsSubmitting(false);
          return;
        }
      }

      // Validate FIB questions have answers for all blanks
      for (let i = 0; i < fibQuestions.length; i++) {
        if (fibQuestions[i].blanks.length === 0) {
          showError(`Fill-in-Blank Question ${i + 1} (${fibQuestions[i].title || 'Untitled'}): Please add at least one blank`);
          setActiveTab('mcq-fib');
          setIsSubmitting(false);
          return;
        }
        for (let j = 0; j < fibQuestions[i].blanks.length; j++) {
          if (!fibQuestions[i].blanks[j] || fibQuestions[i].blanks[j].trim() === '') {
            showError(`Fill-in-Blank Question ${i + 1} (${fibQuestions[i].title || 'Untitled'}): Please enter an answer for Blank ${j + 1}`);
            setActiveTab('mcq-fib');
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Calculate total points automatically (100 points per question)
      const calculatedPoints = (questions.length + mcqQuestions.length + fibQuestions.length) * 100;
      
      // Use custom category if "Other" was selected
      const finalCategory = showCustomCategory ? customCategory : data.category;
      
      // Prepare frontend data structure
      const frontendData = {
        ...data,
        category: finalCategory,
        points: calculatedPoints, // Use calculated points instead of user input
        timeEstimate: timeEstimate,
        flag_questions: questions,
        mcq_questions: mcqQuestions,
        fib_questions: fibQuestions,
        artifacts: artifacts,
      };

      // Transform to backend format
      const backendPayload = transformChallengeForUpdate(frontendData);

      // Update challenge using PUT request
      await challengeService.updateChallengeComplete(challengeId, backendPayload as any);

      showSuccess('Challenge updated successfully!');
      setTimeout(() => {
        router.push('/admin/challenges');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating challenge:', error);
      showError(error.message || 'Failed to update challenge');
    } finally {
      setIsSubmitting(false);
    }
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

  // Question Management Functions
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      title: '',
      text: '',
      flagFormat: '',
      correctAnswer: '',
      points: 100, // Fixed at 100 points
      whyMatters: '',
      maxHints: 3,
      pointsPerHint: 25, // Fixed at 25 points per hint
      hints: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleAddMCQQuestion = () => {
    const newMCQ: MCQQuestion = {
      id: `mcq-${Date.now()}`,
      title: '',
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

  const handleRemoveMCQQuestion = (id: string) => {
    setMCQQuestions(mcqQuestions.filter(q => q.id !== id));
  };

  const handleAddFIBQuestion = () => {
    const newFIB: FIBQuestion = {
      id: `fib-${Date.now()}`,
      title: '',
      text: '',
      blanks: [''],
      acceptableVariations: [],
      points: 100, // Fixed at 100 points
    };
    setFIBQuestions([...fibQuestions, newFIB]);
  };

  const handleRemoveFIBQuestion = (id: string) => {
    setFIBQuestions(fibQuestions.filter(q => q.id !== id));
  };

  const handleAddArtifact = () => {
    const newArtifact: Artifact = {
      id: `artifact-${Date.now()}`,
      name: '',
      description: '',
    };
    setArtifacts([...artifacts, newArtifact]);
  };

  const handleRemoveArtifact = (id: string) => {
    setArtifacts(artifacts.filter(a => a.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading challenge data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
              Edit Challenge
            </h1>
            <p className="text-text-secondary mt-1">Update challenge details and configuration</p>
          </div>
          <button
            onClick={() => router.push('/admin/challenges')}
            className="px-4 py-2 bg-secondary-bg text-text-primary rounded-lg hover:bg-border-color transition-colors"
          >
            ← Back to Challenges
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-card-bg rounded-xl p-2 border border-border-color inline-flex gap-2">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === 'basic'
                ? 'bg-accent-color text-white'
                : 'text-text-secondary hover:bg-secondary-bg'
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('scenario')}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === 'scenario'
                ? 'bg-accent-color text-white'
                : 'text-text-secondary hover:bg-secondary-bg'
            }`}
          >
            Scenario & Context
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === 'questions'
                ? 'bg-accent-color text-white'
                : 'text-text-secondary hover:bg-secondary-bg'
            }`}
          >
            Flag Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('mcq-fib')}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === 'mcq-fib'
                ? 'bg-accent-color text-white'
                : 'text-text-secondary hover:bg-secondary-bg'
            }`}
          >
            MCQ & Fill-in-Blank ({mcqQuestions.length + fibQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === 'preview'
                ? 'bg-accent-color text-white'
                : 'text-text-secondary hover:bg-secondary-bg'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto">
        <div className="bg-card-bg rounded-xl p-8 border border-border-color shadow-lg">
          
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Challenge Name *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="Enter challenge name"
                  className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Describe the challenge objective and what participants will learn"
                  rows={4}
                  className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color resize-none"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Category *
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
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Difficulty *
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
                  {errors.difficulty && (
                    <p className="text-red-500 text-sm mt-1">{errors.difficulty.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Time Estimate (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={timeEstimate}
                  onChange={(e) => setTimeEstimate(parseInt(e.target.value) || 60)}
                  placeholder="60"
                  className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Estimated time for participants to complete this challenge
                </p>
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
                      Current: {(questions.length + mcqQuestions.length + fibQuestions.length) * 100} points ({questions.length + mcqQuestions.length + fibQuestions.length} questions)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Status *
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Scenario Tab */}
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
                          onChange={(e) => {
                            const updated = [...artifacts];
                            updated[index].name = e.target.value;
                            setArtifacts(updated);
                          }}
                          className="w-full bg-transparent border-none text-text-primary font-semibold mb-2 focus:outline-none"
                          placeholder="Artifact name"
                        />
                        <input
                          type="text"
                          value={artifact.description}
                          onChange={(e) => {
                            const updated = [...artifacts];
                            updated[index].description = e.target.value;
                            setArtifacts(updated);
                          }}
                          className="w-full bg-transparent border-none text-text-secondary text-sm focus:outline-none"
                          placeholder="Description"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveArtifact(artifact.id)}
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
                      onClick={handleAddArtifact}
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
              {/* <div className="flex justify-between gap-4">
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
              </div> */}
            </div>
          )}

          {/* Questions Tab */}
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
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIndex].title = e.target.value;
                            setQuestions(updated);
                          }}
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
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIndex].text = e.target.value;
                              setQuestions(updated);
                            }}
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
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[qIndex].flagFormat = e.target.value;
                                setQuestions(updated);
                              }}
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
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[qIndex].correctAnswer = e.target.value;
                                setQuestions(updated);
                              }}
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
                            value={question.whyMatters || ''}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIndex].whyMatters = e.target.value;
                              setQuestions(updated);
                            }}
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
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    updated[qIndex].hints[hIndex].text = e.target.value;
                                    setQuestions(updated);
                                  }}
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
                              onClick={() => {
                                const updated = [...questions];
                                if (updated[qIndex].hints.length < 3) {
                                  updated[qIndex].hints.push({
                                    text: '',
                                    cost: 25
                                  });
                                  setQuestions(updated);
                                }
                              }}
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
                            onClick={() => handleRemoveQuestion(question.id)}
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
                    onClick={handleAddQuestion}
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
              {/* <div className="flex justify-between gap-4">
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
              </div> */}
            </div>
          )}

          {/* MCQ & FIB Tab */}
          {activeTab === 'mcq-fib' && (
            <div className="space-y-6">
              <div className="bg-secondary-bg bg-opacity-50 border-l-4 border-accent-color rounded p-4 mb-6">
                <p className="text-text-secondary">
                  Create multiple choice and fill-in-the-blank questions for knowledge assessment. No hints available for these question types.
                </p>
              </div>

              <div className="space-y-6">
                {/* MCQ Questions */}
                {mcqQuestions.map((mcq, index) => {
                  const currentErrors = mcqErrors[mcq.id] || {};
                  return (
                  <div key={mcq.id} className="bg-secondary-bg border border-border-color rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={mcq.title}
                          onChange={(e) => {
                            const updated = [...mcqQuestions];
                            updated[index].title = e.target.value;
                            setMCQQuestions(updated);
                          }}
                          placeholder="MCQ Question Title *"
                          className={`flex-1 text-lg font-semibold bg-transparent border-none text-text-primary focus:outline-none ${currentErrors.title ? 'border-b-2 border-red-500' : ''}`}
                        />
                        <span className="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-xs font-bold">
                          MCQ
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-accent-color text-white rounded-full text-sm font-bold ml-4">
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
                          onChange={(e) => {
                            const updated = [...mcqQuestions];
                            updated[index].text = e.target.value;
                            setMCQQuestions(updated);
                          }}
                          placeholder="Enter the question..."
                          rows={3}
                          className={`w-full px-4 py-3 bg-primary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 resize-none ${currentErrors.text ? 'border-red-500 focus:ring-red-500' : 'border-border-color focus:ring-accent-color'}`}
                        />
                        {currentErrors.text && <p className="text-red-500 text-xs mt-1">{currentErrors.text}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Options <span className="text-red-500">* (Select one correct answer)</span>
                        </label>
                        <div className="space-y-2">
                          {mcq.options.map((option, optIndex) => (
                            <div key={optIndex} className={`flex items-center gap-2 p-3 bg-primary-bg rounded-lg border ${currentErrors.options || currentErrors.optionTexts ? 'border-red-500' : 'border-border-color'}`}>
                              <input
                                type="radio"
                                name={`mcq-${mcq.id}`}
                                checked={option.isCorrect}
                                onChange={() => {
                                  const updated = [...mcqQuestions];
                                  updated[index].options = updated[index].options.map((opt, i) => ({
                                    ...opt,
                                    isCorrect: i === optIndex
                                  }));
                                  setMCQQuestions(updated);
                                }}
                                className="text-accent-color w-4 h-4"
                              />
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => {
                                  const updated = [...mcqQuestions];
                                  updated[index].options[optIndex].text = e.target.value;
                                  setMCQQuestions(updated);
                                }}
                                placeholder={`Option ${optIndex + 1} *`}
                                className="flex-1 px-3 py-2 bg-secondary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
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
                          onChange={(e) => {
                            const updated = [...mcqQuestions];
                            updated[index].explanation = e.target.value;
                            setMCQQuestions(updated);
                          }}
                          placeholder="Explain why this is the correct answer..."
                          rows={2}
                          className="w-full px-4 py-3 bg-primary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => validateMCQQuestion(mcq, index)}
                          className="btn-primary text-sm"
                        >
                          Save Question
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveMCQQuestion(mcq.id)}
                          className="px-4 py-2 bg-danger-color text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Remove Question
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}

                {/* FIB Questions */}
                {fibQuestions.map((fib, index) => {
                  const currentErrors = fibErrors[fib.id] || {};
                  return (
                  <div key={fib.id} className="bg-secondary-bg border border-border-color rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={fib.title}
                          onChange={(e) => {
                            const updated = [...fibQuestions];
                            updated[index].title = e.target.value;
                            setFIBQuestions(updated);
                          }}
                          placeholder="Fill-in-Blank Question Title *"
                          className={`flex-1 text-lg font-semibold bg-transparent border-none text-text-primary focus:outline-none ${currentErrors.title ? 'border-b-2 border-red-500' : ''}`}
                        />
                        <span className="px-3 py-1 bg-orange-500 bg-opacity-20 text-orange-400 rounded-full text-xs font-bold">
                          Fill-in-Blank
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-accent-color text-white rounded-full text-sm font-bold ml-4">
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
                          onChange={(e) => {
                            const updated = [...fibQuestions];
                            updated[index].text = e.target.value;
                            setFIBQuestions(updated);
                          }}
                          placeholder="Programmable Logic Controllers (PLCs) are industrial computers used to control ______ processes..."
                          rows={3}
                          className={`w-full px-4 py-3 bg-primary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 resize-none ${currentErrors.text ? 'border-red-500 focus:ring-red-500' : 'border-border-color focus:ring-accent-color'}`}
                        />
                        {currentErrors.text && <p className="text-red-500 text-xs mt-1">{currentErrors.text}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Correct Answers for Blanks <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {fib.blanks.map((blank, blankIndex) => (
                            <div key={blankIndex} className={`bg-orange-500 bg-opacity-10 border border-dashed rounded-lg p-3 ${currentErrors.blanks ? 'border-red-500' : 'border-orange-500'}`}>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-xs text-orange-400 font-medium">
                                  Blank {blankIndex + 1} *
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...fibQuestions];
                                    updated[index].blanks.splice(blankIndex, 1);
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
                                onChange={(e) => {
                                  const updated = [...fibQuestions];
                                  updated[index].blanks[blankIndex] = e.target.value;
                                  setFIBQuestions(updated);
                                }}
                                placeholder="Correct answer *"
                                className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                              />
                            </div>
                          ))}
                        </div>
                        {currentErrors.blanks && <p className="text-red-500 text-xs mt-1">{currentErrors.blanks}</p>}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...fibQuestions];
                            updated[index].blanks.push('');
                            setFIBQuestions(updated);
                          }}
                          className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                          + Add Blank
                        </button>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => validateFIBQuestion(fib, index)}
                          className="btn-primary text-sm"
                        >
                          Save Question
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFIBQuestion(fib.id)}
                          className="px-4 py-2 bg-danger-color text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Remove Question
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Add Question Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleAddMCQQuestion}
                  className="px-6 py-3 bg-accent-color text-white rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2"
                >
                  <span>➕</span>
                  Add Multiple Choice
                </button>
                <button
                  type="button"
                  onClick={handleAddFIBQuestion}
                  className="px-6 py-3 bg-accent-color text-white rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2"
                >
                  <span>➕</span>
                  Add Fill-in-Blank
                </button>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Challenge Preview</h2>
              
              <div className="bg-secondary-bg rounded-lg p-6 border border-border-color">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">{formValues.title || 'Untitled Challenge'}</h3>
                  <div className="flex gap-3 mb-4">
                    <span className="px-3 py-1 bg-primary-500 bg-opacity-20 text-primary-300 rounded text-sm">
                      {showCustomCategory ? customCategory || 'Other' : formValues.category}
                    </span>
                    <span className={`px-3 py-1 rounded text-sm ${
                      formValues.difficulty === 'Easy' ? 'bg-green-500 bg-opacity-20 text-green-500' :
                      formValues.difficulty === 'Medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' :
                      formValues.difficulty === 'Hard' ? 'bg-red-500 bg-opacity-20 text-red-500' :
                      'bg-purple-500 bg-opacity-20 text-purple-500'
                    }`}>
                      {formValues.difficulty}
                    </span>
                    <span className="px-3 py-1  bg-opacity-20 text-accent-color rounded text-sm">
                      {(questions.length + mcqQuestions.length + fibQuestions.length) * 100} points (auto-calculated)
                    </span>
                  </div>
                  <p className="text-text-secondary">{formValues.description || 'No description provided.'}</p>
                </div>

                {formValues.scenario && (
                  <div className="mb-4 p-4 bg-primary-bg rounded border border-border-color">
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Scenario</h4>
                    <p className="text-text-secondary text-sm whitespace-pre-wrap">{formValues.scenario}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Total Points:</span>{' '}
                    <span className="text-text-primary font-semibold">
                      {(questions.length + mcqQuestions.length + fibQuestions.length) * 100} (auto-calculated)
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Status:</span>{' '}
                    <span className={`text-sm font-medium ${
                      formValues.status === 'Published' ? 'text-green-500' :
                      formValues.status === 'Draft' ? 'text-yellow-500' :
                      'text-gray-500'
                    }`}>
                      {formValues.status}
                    </span>
                  </div>
                </div>

                {(questions.length > 0 || mcqQuestions.length > 0 || fibQuestions.length > 0) && (
                  <div className="mt-6 pt-6 border-t border-border-color">
                    <h4 className="text-sm font-semibold text-text-primary mb-3">Questions Summary</h4>
                    <div className="space-y-2 text-sm text-text-secondary">
                      {questions.length > 0 && <p>• {questions.length} Flag Capture Question(s)</p>}
                      {mcqQuestions.length > 0 && <p>• {mcqQuestions.length} Multiple Choice Question(s)</p>}
                      {fibQuestions.length > 0 && <p>• {fibQuestions.length} Fill-in-the-Blank Question(s)</p>}
                    </div>
                  </div>
                )}

                {artifacts.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border-color">
                    <h4 className="text-sm font-semibold text-text-primary mb-3">Artifacts</h4>
                    <div className="space-y-2">
                      {artifacts.map((artifact, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-text-primary font-medium">{artifact.name || `Artifact ${index + 1}`}</span>
                          {artifact.description && (
                            <p className="text-text-secondary text-xs mt-1">{artifact.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Publish Button in Preview */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/admin/challenges')}
                  className="px-6 py-3 bg-secondary-bg text-text-primary rounded-lg hover:bg-border-color transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-accent-color text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Updating...' : 'Update Challenge'}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons (except for preview tab) */}
          {activeTab !== 'preview' && (
            <div className="flex justify-between pt-6 border-t border-border-color mt-6">
              <button
                type="button"
                onClick={() => {
                  const tabs: Array<'basic' | 'scenario' | 'questions' | 'mcq-fib' | 'preview'> = 
                    ['basic', 'scenario', 'questions', 'mcq-fib', 'preview'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
                className="btn-secondary flex items-center gap-2"
                disabled={activeTab === 'basic'}
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  const tabs: Array<'basic' | 'scenario' | 'questions' | 'mcq-fib' | 'preview'> = 
                    ['basic', 'scenario', 'questions', 'mcq-fib', 'preview'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
                className="btn-primary flex items-center gap-2"
              >
                {activeTab === 'mcq-fib' ? 'Preview →' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

