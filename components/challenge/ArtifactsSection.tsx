import { ChallengeDetail } from '@/lib/types';

interface ArtifactsSectionProps {
  challenge: ChallengeDetail;
  onDownloadAll?: () => void;
  onDownloadArtifact?: (artifactId: string) => void;
  className?: string;
}

export default function ArtifactsSection({ challenge, onDownloadAll, onDownloadArtifact, className = '' }: ArtifactsSectionProps) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'wordlist':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'log':
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'notes':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`${className}`}>
      <div className="bg-secondary-bg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-warning-color rounded flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          </div>
          <h2 className="text-text-primary text-xl font-semibold">Artifacts You Will Use</h2>
        </div>
        
        <p className="text-text-primary text-sm opacity-80 mb-6">
          Download and analyze these files to solve the challenge:
        </p>

        {/* Artifacts Grid */}
        {challenge.artifacts && challenge.artifacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {challenge.artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="bg-primary-bg rounded-lg p-4 cursor-pointer hover:bg-card-bg transition-colors duration-200"
                onClick={() => onDownloadArtifact?.(artifact.id)}
              >
                <div className="flex items-start space-x-3">
                  {getFileIcon(artifact.type)}
                  <div className="flex-1">
                    <h3 className="text-text-primary font-medium text-sm mb-1">
                      {artifact.name}
                    </h3>
                    <p className="text-text-primary text-xs opacity-70">
                      {artifact.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-text-secondary text-sm mb-6">No artifacts available for this challenge.</div>
        )}

        {/* Download All Button */}
        {challenge.artifacts && challenge.artifacts.length > 0 && (
          <button
            onClick={onDownloadAll}
            className="bg-accent-color hover:bg-accent-dark text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download All Artifacts</span>
          </button>
        )}
      </div>
    </div>
  );
}
