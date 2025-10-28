import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useChallengeManagement } from '@/lib/hooks/useChallengeManagement';
import { useToast } from '@/lib/hooks/useToast';
import { Challenge } from '@/lib/types';

export default function ChallengesContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const { authState } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const {
    challenges,
    isLoading,
    error,
    totalCount,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    duplicateChallenge,
    fetchChallenges,
    clearError
  } = useChallengeManagement();

  // Hardcoded categories list
  const categories = ['OT/ICS Security', 'Network Security', 'Web Application Security', 'Digital Forensics', 'Cryptography'];

  // Handle search and filters
  useEffect(() => {
    const params: any = {
      page: 1,
      page_size: 20
    };
    
    if (searchTerm) params.search = searchTerm;
    if (categoryFilter) params.category = categoryFilter;
    if (difficultyFilter) params.difficulty = difficultyFilter;
    
    // Apply status filter - prioritize statusFilter over tab filter
    if (statusFilter) {
      params.status = statusFilter;
    } else {
      // Apply tab filter only if no status filter is selected
      if (activeTab === 'active') params.status = 'published';
      else if (activeTab === 'draft') params.status = 'draft';
      else if (activeTab === 'archived') params.status = 'archived';
    }
    
    fetchChallenges(params);
  }, [authState.isAuthenticated, searchTerm, categoryFilter, difficultyFilter, statusFilter, activeTab, fetchChallenges]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, clearError, showError]);

  const handleAddChallenge = () => {
    router.push('/admin/challenges/create');
  };

  const handleEditChallenge = (challengeId: string) => {
    router.push(`/admin/challenges/${challengeId}/edit`);
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    console.log('Delete challenge clicked:', challengeId);
    if (confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      try {
        console.log('Deleting challenge...');
        await deleteChallenge(challengeId);
        console.log('Challenge deleted successfully');
        showSuccess('Challenge deleted successfully!');
      } catch (error) {
        console.error('Failed to delete challenge:', error);
        showError('Failed to delete challenge. Please try again.');
      }
    }
  };

  const handleViewChallenge = (challengeId: string) => {
    console.log('View challenge clicked:', challengeId);
    router.push(`/admin/challenges/${challengeId}`);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Clear status filter when switching tabs to avoid conflicts
    setStatusFilter('');
  };

  const handleDuplicateChallenge = async (challengeId: string) => {
    try {
      await duplicateChallenge(challengeId);
      showSuccess('Challenge duplicated successfully!');
    } catch (error) {
      console.error('Failed to duplicate challenge:', error);
      showError('Failed to duplicate challenge. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-success-color';
      case 'medium':
        return 'text-warning-color';
      case 'hard':
        return 'text-danger-color';
      default:
        return 'text-accent-color';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2.5 py-1 rounded-full text-xs font-bold uppercase";
    switch (status.toLowerCase()) {
      case 'published':
        return `${baseClasses} bg-success-color/20 text-success-color`;
      case 'draft':
        return `${baseClasses} bg-warning-color/20 text-warning-color`;
      case 'archived':
        return `${baseClasses} bg-danger-color/20 text-danger-color`;
      default:
        return `${baseClasses} bg-text-secondary/20 text-text-secondary`;
    }
  };
  
  return (
    <section>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
          {t.admin.challenges.title}
        </h1>
        <div className="flex gap-4 md:flex-row flex-col">
          <button className="btn-secondary flex items-center justify-center gap-2">
            <span>📥</span>
            {t.admin.challenges.exportChallenges}
          </button>
          <button 
            onClick={handleAddChallenge}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <span>➕</span>
            {t.admin.challenges.addChallenge}
          </button>
        </div>
      </header>

      {/* Filter Controls */}
      <div className="bg-background-secondary p-4 rounded-lg mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-text-secondary mb-2">Search Challenges</label>
          <input 
            type="text" 
            placeholder="Search by name, category" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded bg-background-primary border border-border-default text-text-primary focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>
      
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg mb-6">
        <div className="flex border-b border-border-color mb-5 overflow-x-auto">
          {['all', 'active', 'draft', 'archived'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-3 px-5 cursor-pointer transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab 
                  ? 'text-accent-color border-b-accent-color' 
                  : 'text-text-secondary border-b-transparent'
              }`}
            >
              {tab === 'all' ? t.admin.challenges.allChallenges : 
               tab === 'active' ? t.admin.challenges.activeChallenges : 
               tab === 'draft' ? t.admin.challenges.draftChallenges : t.admin.challenges.archivedChallenges}
            </button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
            <span className="ml-2 text-text-secondary">Loading challenges...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">{t.admin.challenges.challengeTitle}</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">{t.admin.challenges.category}</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">{t.admin.challenges.difficulty}</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Questions</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">{t.admin.challenges.points}</th>
                  {/* <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">{t.admin.challenges.completion}</th> */}
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">{t.admin.dashboard.status}</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Created</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">{t.admin.users.actions}</th>
                </tr>
              </thead>
              <tbody>
                {challenges.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-text-secondary">
                      No challenges found. Create your first challenge to get started!
                    </td>
                  </tr>
                ) : (
                  challenges.map((challenge) => {
                    const totalQuestions = challenge.total_questions || 0;
                    const calculatedPoints = totalQuestions * 100;
                    
                    return (
                    <tr key={challenge.id} className="hover:bg-white/3">
                      <td className="py-3 px-4 border-b border-white/5">
                        <div className="font-medium">{challenge.title}</div>
                      </td>
                      <td className="py-3 px-4 border-b border-white/5">
                        <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs">
                          {challenge.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-white/5">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-white/5">
                        <span className="text-sm font-medium">{totalQuestions}</span>
                      </td>
                      <td className="py-3 px-4 border-b border-white/5">
                        <span className="text-sm font-medium">{calculatedPoints}</span>
                      </td>
                      {/* <td className="py-3 px-4 border-b border-white/5">
                        <div className="text-sm">{challenge.solves_count || 0}</div>
                        <div className="text-xs text-text-secondary">
                          {challenge.submissions_count || 0} attempts
                        </div>
                      </td> */}
                      <td className="py-3 px-4 border-b border-white/5">
                        <span className={getStatusBadge(challenge.status)}>
                          {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-white/5">
                        <div className="text-sm">{challenge.created_at ? new Date(challenge.created_at).toLocaleDateString() : 'N/A'}</div>
                        <div className="text-xs text-text-secondary">
                          by {challenge.created_by_name || 'Unknown'}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-white/5">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditChallenge(challenge.id)}
                            className="p-1 text-text-secondary hover:text-accent-color transition-colors"
                            title="Edit Challenge"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleViewChallenge(challenge.id)}
                            className="p-1 text-text-secondary hover:text-accent-color transition-colors"
                            title="View Challenge"
                          >
                            👁️
                          </button>
                          <button 
                            onClick={() => handleDeleteChallenge(challenge.id)}
                            className="p-1 text-text-secondary hover:text-danger-color transition-colors"
                            title="Delete Challenge"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && challenges.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-text-secondary text-sm">
            Showing <span className="font-medium">{challenges.length}</span> of <span className="font-medium">{totalCount}</span> challenges
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => fetchChallenges({ page: currentPage - 1 })}
              disabled={!hasPreviousPage}
              className="px-3 py-1 border border-border-default rounded bg-background-secondary text-text-secondary hover:bg-background-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-3 py-1 border border-primary-500 rounded bg-primary-500/20 text-primary-300">
              {currentPage}
            </button>
            <button 
              onClick={() => fetchChallenges({ page: currentPage + 1 })}
              disabled={!hasNextPage}
              className="px-3 py-1 border border-border-default rounded bg-background-secondary text-text-secondary hover:bg-background-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
