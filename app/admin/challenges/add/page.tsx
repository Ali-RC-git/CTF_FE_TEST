'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/lib/hooks/useToast';
import { useChallengeManagement } from '@/lib/hooks/useChallengeManagement';

export default function AddChallengePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { createChallenge } = useChallengeManagement();
  const [formData, setFormData] = useState({
    title: '',
    category: 'OT/ICS Security',
    difficulty: 'Medium',
    points: 40,
    description: '',
    status: 'Draft'
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hasChanges) {
          if (confirm('Do you want to discard the changes?')) {
            router.back();
          }
        } else {
          router.back();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [hasChanges, router]);

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createChallenge({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        points: formData.points,
        status: formData.status,
        tags: [],
        scenario: '',
        contextNotes: ''
      });
      showSuccess('Challenge created successfully!');
      router.back();
    } catch (error) {
      showError('Failed to create challenge. Please try again.');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('Do you want to discard the changes?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
          Add New Challenge
        </h1>
        <button
          onClick={handleCancel}
          className="w-8 h-8 bg-danger-color text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Close"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Challenge Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter challenge title"
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
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
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Points
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => handleInputChange('points', parseInt(e.target.value))}
                min="0"
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Challenge Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the challenge scenario..."
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color min-h-[120px]"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="submit"
              className="btn-primary"
            >
              Create Challenge
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn-primary"
            >
              Create Challenge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
