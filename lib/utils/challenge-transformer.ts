/**
 * Challenge data transformer for API communication
 * Transforms frontend data structure to backend API format
 */

export interface FrontendChallengeData {
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  points: number;
  timeEstimate?: number;
  status: 'Draft' | 'Published' | 'Archived';
  description: string;
  scenario?: string;
  contextNotes?: string;
  previewEnabled?: boolean;
  maxAttempts?: number;
  flag_questions?: any[];
  mcq_questions?: any[];
  fib_questions?: any[];
  artifacts?: any[];
  tags?: string[];
}

export const transformChallengeForUpdate = (frontendData: FrontendChallengeData) => {
  return {
    // Basic fields
    title: frontendData.title,
    category: frontendData.category,
    difficulty: frontendData.difficulty.toLowerCase(), // Convert to lowercase for backend
    points: frontendData.points, // Use points field
    total_points: frontendData.points, // Also send as total_points for backend compatibility
    timeEstimate: frontendData.timeEstimate || 30,
    time_estimate_minutes: frontendData.timeEstimate || 30,
    status: frontendData.status.toLowerCase(), // Convert to lowercase for backend (published, draft, archived)
    description: frontendData.description,
    scenario: frontendData.scenario,
    contextNotes: frontendData.contextNotes,
    context_note: frontendData.contextNotes, // Also send as context_note for backend compatibility
    tags: frontendData.tags,
    preview_enabled: frontendData.previewEnabled ?? true,
    max_attempts: frontendData.maxAttempts || 0,
    
    // Flag questions
    flag_questions: (frontendData.flag_questions || []).map((fq: any, fqIndex: number) => ({
      question_text: fq.text, // Changed from text
      flag_format: fq.flagFormat,
      correct_flag: fq.correctAnswer, // Changed from correctAnswer
      why_matters: fq.whyMatters, // Changed from whyMatters
      context: fq.context || "",
      points: fq.points,
      max_attempts: fq.maxAttempts || 3,
      hints: (fq.hints || []).map((hint: any, index: number) => ({
        hint_text: hint.text, // Changed from text
        cost: typeof hint.cost === 'number' ? hint.cost.toFixed(2) : String(hint.cost), // Must be string with decimals
        reveal_order: index + 1 // Add reveal order
      }))
    })),
    
    // MCQ questions
    mcq_questions: (frontendData.mcq_questions || []).map((mcq: any) => ({
      question_text: mcq.text, // Changed from text
      explanation: mcq.explanation,
      points: mcq.points,
      options: (mcq.options || []).map((opt: any, index: number) => ({
        option_text: opt.text, // Changed from text
        is_correct: opt.isCorrect, // Changed from isCorrect
        option_order: index + 1 // Add option order
      }))
    })),
    
    // Fill-in-the-blank questions
    fillblank_questions: (frontendData.fib_questions || []).map((fib: any) => ({
      question_text: fib.text, // Changed from text
      explanation: fib.explanation || "",
      points: fib.points,
      max_attempts: fib.maxAttempts || 3,
      accepted_answers: (fib.blanks || []).map((blank: any, index: number) => ({
        accepted_answer: blank,
        blank_index: index + 1
      }))
    })),
    
    // Artifacts
    artifacts: (frontendData.artifacts || []).map((art: any) => ({
      file_name: art.fileName || art.file_name || art.name,
      file_url: art.fileUrl || art.file_url || art.url,
      description: art.description
    }))
  };
};

export const transformChallengeForCreate = transformChallengeForUpdate;


