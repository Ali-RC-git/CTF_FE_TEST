'use client';

export default function ScoreboardManagementHeader() {
  return (
    <div className="flex justify-between items-start flex-wrap gap-5">
      <div className="flex items-center">
        <div className="bg-gradient-to-r from-accent-dark to-accent-color w-10 h-10 rounded-lg flex items-center justify-center mr-3 font-bold text-white">
          C
        </div>
        <div className="text-2xl font-bold text-text-primary">
          CRDF Global <span className="bg-admin-color text-white text-xs px-2 py-1 rounded-full ml-2">ADMIN</span>
        </div>
      </div>
      
      <div className="flex-1">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent mb-2">
          Scoreboard Management
        </h1>
        <p className="text-text-secondary">
          Admin controls for managing live scoreboard, rankings, and scoring
        </p>
      </div>
      
      <div className="flex gap-4">
        <button className="btn-secondary flex items-center gap-2">
          <span>📥</span>
          Export Scoreboard
        </button>
        <button className="btn-primary flex items-center gap-2">
          <span>🔄</span>
          Refresh Data
        </button>
      </div>
    </div>
  );
}
