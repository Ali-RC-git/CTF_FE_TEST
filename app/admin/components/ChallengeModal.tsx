"use client";
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Challenge, CreateChallengeRequest, UpdateChallengeRequest } from '@/lib/api';
import ModalCloseButton from '@/components/ui/ModalCloseButton';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (challenge: CreateChallengeRequest | UpdateChallengeRequest) => void;
  challenge?: Challenge | null;
}

export default function ChallengeModal({ isOpen, onClose, onSave, challenge }: ChallengeModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateChallengeRequest>({
    title: '',
    description: '',
    category: 'OT/ICS Security',
    difficulty: 'medium',
    points: 40,
    timeEstimate: 60,
    status: 'draft',
    scenario: '',
    contextNotes: '',
    tags: [],
    artifacts: [],
    flag_questions: [],
    mcq_questions: [],
    fib_questions: [],
    fillblank_questions: []
  });

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!formData.scenario?.trim()) {
      errors.scenario = 'Scenario is required';
    }
    if ((formData.points || 0) <= 0) {
      errors.points = 'Points must be greater than 0';
    }
    if ((formData.timeEstimate || 0) <= 0) {
      errors.timeEstimate = 'Time estimate must be greater than 0';
    }
    if ((formData.flag_questions?.length || 0) + (formData.mcq_questions?.length || 0) + (formData.fib_questions?.length || 0) + (formData.fillblank_questions?.length || 0) === 0) {
      errors.questions = 'At least one question is required';
    }

    // Validate questions
    const allQuestions = [...(formData.flag_questions || []), ...(formData.mcq_questions || []), ...(formData.fib_questions || []), ...(formData.fillblank_questions || [])];
    allQuestions.forEach((question, index) => {
      if (!question.title.trim()) {
        errors[`question_${index}_title`] = 'Question title is required';
      }
      if (!question.description.trim()) {
        errors[`question_${index}_description`] = 'Question description is required';
      }
      if (!question.correctAnswer.trim()) {
        errors[`question_${index}_answer`] = 'Correct answer is required';
      }
      if (question.points <= 0) {
        errors[`question_${index}_points`] = 'Question points must be greater than 0';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (challenge) {
      setFormData(challenge);
    } else {
      setFormData({
        title: '',
        category: 'OT/ICS Security',
        difficulty: 'medium',
        points: 40,
        timeEstimate: 60,
        status: 'draft',
        description: '',
        scenario: '',
        contextNotes: '',
        artifacts: []
      });
    }
  }, [challenge, isOpen]);

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    } else {
      console.log('Validation failed:', validationErrors);
    }
    if (validateForm()) {
      onSave(formData);
      onClose();
    } else {
      console.log('Validation failed:', validationErrors);
    }
  };

  const addQuestion = (type: 'flag' | 'mcq' | 'fib' = 'flag') => {
    const newQuestion = {
      id: Date.now().toString(),
      title: '',
      description: '',
      flagFormat: '',
      correctAnswer: '',
      points: 10,
      instructions: '',
      whyMatters: '',
      type,
      options: type === 'mcq' ? [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false }
      ] : undefined,
      blanks: type === 'fib' ? [
        { id: '1', answer: '', variations: '' }
      ] : undefined,
      explanation: type === 'mcq' ? '' : undefined,
      hints: []
    };
    setFormData({
      ...formData,
      // TODO: Implement question management for new interface structure
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions : any[] = [];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    // TODO: Implement question management for new interface structure
    // setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...(formData.flag_questions || []), ...(formData.mcq_questions || []), ...(formData.fib_questions || []), ...(formData.fillblank_questions || [])].filter((_, i) => i !== index);
    // TODO: Implement question management for new interface structure
    // setFormData({ ...formData, questions: updatedQuestions });
  };

  const addHint = (questionIndex: number) => {
    const updatedQuestions : any[] = [];
    updatedQuestions[questionIndex].hints.push({
      text: '',
      cost: 5,
      maxUses: 3
    });
    // TODO: Implement question management for new interface structure
    // setFormData({ ...formData, questions: updatedQuestions });
  };

  const updateHint = (questionIndex: number, hintIndex: number, field: string, value: any) => {
    const updatedQuestions : any[] = [];
    updatedQuestions[questionIndex].hints[hintIndex] = {
      ...updatedQuestions[questionIndex].hints[hintIndex],
      [field]: value
    };
    // TODO: Implement question management for new interface structure
    // setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeHint = (questionIndex: number, hintIndex: number) => {
    const updatedQuestions : any[] = [];
    updatedQuestions[questionIndex].hints = updatedQuestions[questionIndex].hints.filter((_: any, i: number) => i !== hintIndex);
    // TODO: Implement question management for new interface structure
    // setFormData({ ...formData, questions: updatedQuestions });
  };

  const addArtifact = () => {
    const newArtifact = {
      name: '',
      description: ''
    };
    setFormData({
      ...formData,
      artifacts: [...(formData.artifacts || []), newArtifact]
    });
  };

  const updateArtifact = (index: number, field: string, value: string) => {
    const updatedArtifacts = [...(formData.artifacts || [])];
    updatedArtifacts[index] = { ...updatedArtifacts[index], [field]: value };
    setFormData({ ...formData, artifacts: updatedArtifacts });
  };

  const removeArtifact = (index: number) => {
    const updatedArtifacts = (formData.artifacts || []).filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, artifacts: updatedArtifacts });
  };

  const addMcqOption = (questionIndex: number) => {
    const updatedQuestions : any[] = [];
    const newOption = {
      id: Date.now().toString(),
      text: '',
      isCorrect: false
    };
    updatedQuestions[questionIndex].options = [...(updatedQuestions[questionIndex].options || []), newOption];
    // TODO: Implement question management for new interface structure
    // setFormData({ ...formData, questions: updatedQuestions });
  };

  const updateMcqOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const updatedQuestions : any[] = [];
    if (updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options![optionIndex] = {
        ...updatedQuestions[questionIndex].options![optionIndex],
        [field]: value
      };
    }
    // TODO: Implement question management for new interface structure
    // setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeMcqOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions : any[] = [];
    if (updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options!.filter((_: any, i: number) => i !== optionIndex);
    }
    // TODO: Implement question management for new interface structure
    // setFormData({ ...formData, questions: updatedQuestions });
  };

  const addFibBlank = (questionIndex: number) => {
    const updatedQuestions : any[] = [];
    const newBlank = {
      id: Date.now().toString(),
      answer: '',
      variations: ''
    };
    updatedQuestions[questionIndex].blanks = [...(updatedQuestions[questionIndex].blanks || []), newBlank];
    // TODO: Implement question management for new interface structure
    // setFormData({ ...formData, questions: updatedQuestions });
  };

  const updateFibBlank = (questionIndex: number, blankIndex: number, field: string, value: string) => {
    const updatedQuestions : any[] = [];
    if (updatedQuestions[questionIndex].blanks) {
      updatedQuestions[questionIndex].blanks![blankIndex] = {
        ...updatedQuestions[questionIndex].blanks![blankIndex],
        [field]: value
      };
    }
    // TODO: Implement question management for new interface structure
    // setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeFibBlank = (questionIndex: number, blankIndex: number) => {
    const updatedQuestions : any[] = [];
    if (updatedQuestions[questionIndex].blanks) {
      updatedQuestions[questionIndex].blanks = updatedQuestions[questionIndex].blanks!.filter((_: any, i: number) => i !== blankIndex);
    }
    // TODO: Implement question management for new interface structure
    // setFormData({ ...formData, questions: updatedQuestions });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-border-color">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border-color">
          <h2 className="text-xl font-bold text-accent-color">
            {challenge ? 'Edit Challenge' : 'Create New Challenge'}
          </h2>
          <ModalCloseButton onClick={onClose} />
          <ModalCloseButton onClick={onClose} />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-color">
          {['basic', 'scenario', 'questions', 'mcq-fib', 'preview'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'text-accent-color border-accent-color'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              {tab === 'basic' ? 'Basic Info' :
               tab === 'scenario' ? 'Scenario & Artifacts' :
               tab === 'questions' ? 'Questions & Hints' :
               tab === 'mcq-fib' ? 'MCQ & Fill-in-Blank' : 'Preview'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Challenge Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full px-4 py-3 bg-secondary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color ${
                    validationErrors.title ? 'border-red-500' : 'border-border-color'
                  }`}
                  placeholder="Enter challenge title"
                />
                {validationErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
                )}
                {validationErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                  >
                    <option value="OT/ICS Security">OT/ICS Security</option>
                    <option value="Network Security">Network Security</option>
                    <option value="Web Application Security">Web Application Security</option>
                    <option value="Digital Forensics">Digital Forensics</option>
                    <option value="Cryptography">Cryptography</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Total Points
                  </label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})}
                    className={`w-full px-4 py-3 bg-secondary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color ${
                      validationErrors.points ? 'border-red-500' : 'border-border-color'
                    }`}
                    min="1"
                  />
                  {validationErrors.points && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.points}</p>
                  )}
                  {validationErrors.points && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.points}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Time Estimate (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.timeEstimate}
                    onChange={(e) => setFormData({...formData, timeEstimate: parseInt(e.target.value) || 0})}
                    className={`w-full px-4 py-3 bg-secondary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color ${
                      validationErrors.timeEstimate ? 'border-red-500' : 'border-border-color'
                    }`}
                    min="1"
                  />
                  {validationErrors.timeEstimate && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.timeEstimate}</p>
                  )}
                  {validationErrors.timeEstimate && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.timeEstimate}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Challenge Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full px-4 py-3 bg-secondary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color min-h-[100px] ${
                    validationErrors.description ? 'border-red-500' : 'border-border-color'
                  }`}
                  placeholder="Describe the challenge scenario..."
                />
                {validationErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                )}
                {validationErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Scenario Tab */}
          {activeTab === 'scenario' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Scenario Text
                </label>
                <textarea
                  value={formData.scenario}
                  onChange={(e) => setFormData({...formData, scenario: e.target.value})}
                  className={`w-full px-4 py-3 bg-secondary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color min-h-[120px] ${
                    validationErrors.scenario ? 'border-red-500' : 'border-border-color'
                  }`}
                  placeholder="Enter the scenario description..."
                />
                {validationErrors.scenario && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.scenario}</p>
                )}
                {validationErrors.scenario && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.scenario}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  OT/ICS Context Notes
                </label>
                <textarea
                  value={formData.contextNotes}
                  onChange={(e) => setFormData({...formData, contextNotes: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color min-h-[100px]"
                  placeholder="Enter context notes..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Challenge Artifacts</h3>
                  <button
                    onClick={addArtifact}
                    className="btn-primary text-sm"
                  >
                    + Add Artifact
                  </button>
                </div>

                <div className="space-y-4">
                  {(formData.artifacts || []).map((artifact, index) => (
                    <div key={index} className="bg-secondary-bg rounded-lg p-4 border border-border-color">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Artifact Name
                          </label>
                          <input
                            type="text"
                            value={artifact.name}
                            onChange={(e) => updateArtifact(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                            placeholder="e.g., auth.log"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Description
                          </label>
                          <input
                            type="text"
                            value={artifact.description}
                            onChange={(e) => updateArtifact(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                            placeholder="e.g., Authentication logs"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeArtifact(index)}
                        className="mt-2 text-danger-color hover:text-red-400 text-sm"
                      >
                        Remove Artifact
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-text-primary">Challenge Questions</h3>
                <button
                  onClick={() => addQuestion('flag')}
                  className="btn-primary text-sm"
                >
                  + Add Flag Question
                </button>
              </div>
              {validationErrors.questions && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{validationErrors.questions}</p>
                </div>
              )}
              {validationErrors.questions && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{validationErrors.questions}</p>
                </div>
              )}

              <div className="space-y-6">
                {[...(formData.flag_questions || []), ...(formData.mcq_questions || []), ...(formData.fib_questions || []), ...(formData.fillblank_questions || [])].map((question, questionIndex) => (
                  <div key={question.id} className="bg-secondary-bg rounded-lg p-6 border border-border-color">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-semibold text-text-primary">
                        Q{questionIndex + 1}. {question.title || 'Untitled Question'}
                      </h4>
                      <div className="flex gap-2">
                        <span className="bg-accent-color text-white px-3 py-1 rounded text-sm font-bold">
                          {question.points} pts
                        </span>
                        <button
                          onClick={() => removeQuestion(questionIndex)}
                          className="text-danger-color hover:text-red-400"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Question Title
                        </label>
                        <input
                          type="text"
                          value={question.title}
                          onChange={(e) => updateQuestion(questionIndex, 'title', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                          placeholder="Enter question title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Question Description
                        </label>
                        <textarea
                          value={question.description}
                          onChange={(e) => updateQuestion(questionIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color min-h-[80px]"
                          placeholder="Enter question description"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Flag Format
                          </label>
                          <input
                            type="text"
                            value={question.flagFormat}
                            onChange={(e) => updateQuestion(questionIndex, 'flagFormat', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                            placeholder="e.g., flag{answer}"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Points
                          </label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Correct Answer
                        </label>
                        <input
                          type="text"
                          value={question.correctAnswer}
                          onChange={(e) => updateQuestion(questionIndex, 'correctAnswer', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                          placeholder="Enter the correct answer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Step-by-step Instructions
                        </label>
                        <textarea
                          value={question.instructions}
                          onChange={(e) => updateQuestion(questionIndex, 'instructions', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color min-h-[80px]"
                          placeholder="Enter step-by-step instructions"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Why This Matters (OT Context)
                        </label>
                        <textarea
                          value={question.whyMatters}
                          onChange={(e) => updateQuestion(questionIndex, 'whyMatters', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color min-h-[60px]"
                          placeholder="Explain why this matters in OT context"
                        />
                      </div>

                      {/* Hints Section */}
                      <div className="bg-primary-bg rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-semibold text-text-primary">Hints</h5>
                          <button
                            onClick={() => addHint(questionIndex)}
                            className="text-accent-color hover:text-accent-light text-sm"
                          >
                            + Add Hint
                          </button>
                        </div>

                        <div className="space-y-3">
                          {question.hints.map((hint: any, hintIndex: number) => (
                            <div key={hintIndex} className="bg-secondary-bg rounded p-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-text-secondary mb-1">
                                    Hint Text
                                  </label>
                                  <input
                                    type="text"
                                    value={hint.text}
                                    onChange={(e) => updateHint(questionIndex, hintIndex, 'text', e.target.value)}
                                    className="w-full px-2 py-1 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-color text-sm"
                                    placeholder="Enter hint text"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-text-secondary mb-1">
                                    Cost (points)
                                  </label>
                                  <input
                                    type="number"
                                    value={hint.cost}
                                    onChange={(e) => updateHint(questionIndex, hintIndex, 'cost', parseInt(e.target.value))}
                                    className="w-full px-2 py-1 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-color text-sm"
                                    min="0"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => removeHint(questionIndex, hintIndex)}
                                className="mt-2 text-danger-color hover:text-red-400 text-xs"
                              >
                                Remove Hint
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MCQ & Fill-in-Blank Tab */}
          {activeTab === 'mcq-fib' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-text-primary">MCQ & Fill-in-Blank Questions</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => addQuestion('mcq')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                  >
                    + Add MCQ
                  </button>
                  <button
                    onClick={() => addQuestion('fib')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm"
                  >
                    + Add Fill-in-Blank
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {[...(formData.flag_questions || []), ...(formData.mcq_questions || []), ...(formData.fib_questions || []), ...(formData.fillblank_questions || [])].filter(q => q.type === 'mcq' || q.type === 'fib').map((question, questionIndex) => (
                  <div key={question.id} className="bg-secondary-bg rounded-lg p-6 border border-border-color">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-semibold text-text-primary">
                        Q{questionIndex + 1}. {question.title || 'Untitled Question'}
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                          question.type === 'mcq' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {question.type === 'mcq' ? 'MCQ' : 'Fill-in-Blank'}
                        </span>
                      </h4>
                      <div className="flex gap-2">
                        <span className="bg-accent-color text-white px-3 py-1 rounded text-sm font-bold">
                          {question.points} pts
                        </span>
                        <button
                          onClick={() => removeQuestion(questionIndex)}
                          className="text-danger-color hover:text-red-400"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Question Text
                        </label>
                        <textarea
                          value={question.description}
                          onChange={(e) => updateQuestion(questionIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color min-h-[80px]"
                          placeholder="Enter question text"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Points
                          </label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                            min="0"
                          />
                        </div>
                      </div>

                      {/* MCQ Options */}
                      {question.type === 'mcq' && question.options && (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-text-secondary">
                              Answer Options
                            </label>
                            <button
                              onClick={() => addMcqOption(questionIndex)}
                              className="text-accent-color hover:text-accent-light text-sm"
                            >
                              + Add Option
                            </button>
                          </div>
                          <div className="space-y-2">
                            {question.options.map((option: any, optionIndex: number) => (
                              <div key={option.id} className="flex items-center gap-3 p-3 bg-primary-bg rounded">
                                <input
                                  type="radio"
                                  name={`correct-${questionIndex}`}
                                  checked={option.isCorrect}
                                  onChange={() => {
                                    // Set all options to false first
                                    question.options!.forEach((opt: any, idx: number) => {
                                      updateMcqOption(questionIndex, idx, 'isCorrect', false);
                                    });
                                    // Then set the selected one to true
                                    updateMcqOption(questionIndex, optionIndex, 'isCorrect', true);
                                  }}
                                  className="w-4 h-4 text-accent-color"
                                />
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => updateMcqOption(questionIndex, optionIndex, 'text', e.target.value)}
                                  className="flex-1 px-3 py-2 bg-secondary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                                  placeholder="Enter option text"
                                />
                                <button
                                  onClick={() => removeMcqOption(questionIndex, optionIndex)}
                                  className="text-danger-color hover:text-red-400 text-lg"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fill-in-Blank Blanks */}
                      {question.type === 'fib' && question.blanks && (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-text-secondary">
                              Correct Answers for Blanks
                            </label>
                            <button
                              onClick={() => addFibBlank(questionIndex)}
                              className="text-accent-color hover:text-accent-light text-sm"
                            >
                              + Add Blank
                            </button>
                          </div>
                          <div className="space-y-3">
                            {question.blanks.map((blank: any, blankIndex: number) => (
                              <div key={blank.id} className="bg-primary-bg rounded p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">
                                      Blank {blankIndex + 1} Answer
                                    </label>
                                    <input
                                      type="text"
                                      value={blank.answer}
                                      onChange={(e) => updateFibBlank(questionIndex, blankIndex, 'answer', e.target.value)}
                                      className="w-full px-2 py-1 bg-secondary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-color text-sm"
                                      placeholder="Correct answer"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">
                                      Variations (comma separated)
                                    </label>
                                    <input
                                      type="text"
                                      value={blank.variations || ''}
                                      onChange={(e) => updateFibBlank(questionIndex, blankIndex, 'variations', e.target.value)}
                                      className="w-full px-2 py-1 bg-secondary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-color text-sm"
                                      placeholder="synonym1, synonym2"
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeFibBlank(questionIndex, blankIndex)}
                                  className="mt-2 text-danger-color hover:text-red-400 text-xs"
                                >
                                  Remove Blank
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Explanation for MCQ */}
                      {question.type === 'mcq' && (
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Explanation (shown after answer)
                          </label>
                          <textarea
                            value={question.explanation || ''}
                            onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color min-h-[60px]"
                            placeholder="Explain why the correct answer is right and others are wrong"
                          />
                        </div>
                      )}

                      {/* Hints Section */}
                      <div className="bg-primary-bg rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-semibold text-text-primary">Hints</h5>
                          <button
                            onClick={() => addHint(questionIndex)}
                            className="text-accent-color hover:text-accent-light text-sm"
                          >
                            + Add Hint
                          </button>
                        </div>

                        <div className="space-y-3">
                          {question.hints.map((hint: any, hintIndex: number) => (
                            <div key={hintIndex} className="bg-secondary-bg rounded p-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-text-secondary mb-1">
                                    Hint Text
                                  </label>
                                  <input
                                    type="text"
                                    value={hint.text}
                                    onChange={(e) => updateHint(questionIndex, hintIndex, 'text', e.target.value)}
                                    className="w-full px-2 py-1 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-color text-sm"
                                    placeholder="Enter hint text"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-text-secondary mb-1">
                                    Cost (points)
                                  </label>
                                  <input
                                    type="number"
                                    value={hint.cost}
                                    onChange={(e) => updateHint(questionIndex, hintIndex, 'cost', parseInt(e.target.value))}
                                    className="w-full px-2 py-1 bg-primary-bg border border-border-color rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-color text-sm"
                                    min="0"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => removeHint(questionIndex, hintIndex)}
                                className="mt-2 text-danger-color hover:text-red-400 text-xs"
                              >
                                Remove Hint
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="bg-secondary-bg rounded-lg p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Student View Preview</h3>
                <p className="text-text-secondary mb-4">
                  This is how students will see the challenge. The hints system will automatically deduct points when students use hints.
                </p>
                <div className="bg-accent-color/10 border border-accent-color rounded-lg p-4">
                  <p className="text-accent-color text-sm">
                    <strong>Note:</strong> In the student view, the hint button will display: "Get Hint (-X pts)" where X is the point cost you configured for each question.
                  </p>
                </div>
              </div>

              <div className="bg-secondary-bg rounded-lg p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Challenge Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-color">{formData.points}</div>
                    <div className="text-sm text-text-secondary">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-color">{(formData.flag_questions?.length || 0) + (formData.mcq_questions?.length || 0) + (formData.fib_questions?.length || 0) + (formData.fillblank_questions?.length || 0)}</div>
                    <div className="text-sm text-text-secondary">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-color">{formData.timeEstimate}m</div>
                    <div className="text-sm text-text-secondary">Est. Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-color">{(formData.artifacts || []).length}</div>
                    <div className="text-sm text-text-secondary">Artifacts</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-border-color">
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            {challenge ? 'Update Challenge' : 'Create Challenge'}
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


