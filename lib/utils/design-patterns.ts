/**
 * Design Pattern Utilities
 * 
 * This file provides utility functions that implement common design patterns
 * for better code organization, reusability, and maintainability.
 */

import { CHALLENGE_STATUS, CHALLENGE_DIFFICULTY, CHALLENGE_CATEGORIES, TEAM_ROLES, QUESTION_STATUS } from '../constants/app';

// Factory Pattern for creating consistent objects
export class ObjectFactory {
  /**
   * Creates a standardized API response object
   */
  static createApiResponse<T>(data: T, success: boolean = true, message?: string) {
    return {
      success,
      data,
      message: message || (success ? 'Success' : 'Error'),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Creates a standardized error object
   */
  static createError(message: string, code?: string, details?: any) {
    return {
      success: false,
      error: {
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Creates a pagination metadata object
   */
  static createPaginationMeta(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }
}

// Strategy Pattern for different behaviors
export class StatusStrategy {
  private static strategies = {
    [CHALLENGE_STATUS.SOLVED]: {
      color: 'text-state-success',
      bgColor: 'bg-state-success',
      icon: '✓',
      label: 'Solved',
    },
    [CHALLENGE_STATUS.IN_PROGRESS]: {
      color: 'text-state-warning',
      bgColor: 'bg-state-warning',
      icon: '⏱',
      label: 'In Progress',
    },
    [CHALLENGE_STATUS.UNSOLVED]: {
      color: 'text-text-muted',
      bgColor: 'bg-text-muted',
      icon: '○',
      label: 'Unsolved',
    },
  };

  static getStatusConfig(status: string) {
    return this.strategies[status as keyof typeof this.strategies] || this.strategies[CHALLENGE_STATUS.UNSOLVED];
  }
}

export class DifficultyStrategy {
  private static strategies = {
    [CHALLENGE_DIFFICULTY.EASY]: {
      color: 'text-state-success',
      bgColor: 'bg-state-success',
      label: 'Easy',
      points: 10,
    },
    [CHALLENGE_DIFFICULTY.MEDIUM]: {
      color: 'text-state-warning',
      bgColor: 'bg-state-warning',
      label: 'Medium',
      points: 25,
    },
    [CHALLENGE_DIFFICULTY.HARD]: {
      color: 'text-state-error',
      bgColor: 'bg-state-error',
      label: 'Hard',
      points: 50,
    },
    [CHALLENGE_DIFFICULTY.EXPERT]: {
      color: 'text-interactive-primary',
      bgColor: 'bg-interactive-primary',
      label: 'Expert',
      points: 100,
    },
  };

  static getDifficultyConfig(difficulty: string) {
    return this.strategies[difficulty as keyof typeof this.strategies] || this.strategies[CHALLENGE_DIFFICULTY.MEDIUM];
  }
}

// Observer Pattern for state management
export class EventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }
}

// Builder Pattern for complex object construction
export class QueryBuilder {
  private query: any = {};

  where(field: string, operator: string, value: any) {
    this.query[field] = { [operator]: value };
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    this.query.orderBy = { field, direction };
    return this;
  }

  limit(count: number) {
    this.query.limit = count;
    return this;
  }

  offset(count: number) {
    this.query.offset = count;
    return this;
  }

  build() {
    return this.query;
  }
}

// Singleton Pattern for global state
export class AppState {
  private static instance: AppState;
  private state: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): AppState {
    if (!AppState.instance) {
      AppState.instance = new AppState();
    }
    return AppState.instance;
  }

  set(key: string, value: any) {
    this.state.set(key, value);
  }

  get(key: string) {
    return this.state.get(key);
  }

  has(key: string) {
    return this.state.has(key);
  }

  delete(key: string) {
    return this.state.delete(key);
  }

  clear() {
    this.state.clear();
  }
}

// Decorator Pattern for adding functionality
export function withLogging<T extends (...args: any[]) => any>(
  fn: T,
  context: string = 'Function'
): T {
  return ((...args: any[]) => {
    console.log(`[${context}] Called with:`, args);
    const result = fn(...args);
    console.log(`[${context}] Result:`, result);
    return result;
  }) as T;
}

export function withCaching<T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 300000 // 5 minutes
): T {
  const cache = new Map<string, { value: any; timestamp: number }>();

  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  }) as T;
}

// Adapter Pattern for different data formats
export class DataAdapter {
  static adaptChallengeData(rawData: any) {
    return {
      id: rawData.id,
      title: rawData.title,
      description: rawData.description,
      category: rawData.category,
      status: rawData.status,
      points: parseInt(rawData.points),
      difficulty: rawData.difficulty,
      solves: parseInt(rawData.solves),
      timeSpent: rawData.timeSpent,
      vmAvailable: Boolean(rawData.vmAvailable),
      vmStatus: rawData.vmStatus,
    };
  }

  static adaptTeamData(rawData: any) {
    return {
      id: rawData.id,
      name: rawData.name,
      size: parseInt(rawData.size),
      members: rawData.members.map((member: any) => ({
        id: member.id,
        name: member.name,
        initials: member.initials,
        role: member.role,
      })),
      isLeader: Boolean(rawData.isLeader),
    };
  }
}

// Command Pattern for actions
export interface Command {
  execute(): void;
  undo(): void;
}

export class CommandInvoker {
  private history: Command[] = [];
  private currentIndex: number = -1;

  execute(command: Command) {
    command.execute();
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(command);
    this.currentIndex++;
  }

  undo() {
    if (this.currentIndex >= 0) {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
    }
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
    }
  }
}

// Template Method Pattern for consistent workflows
export abstract class BaseWorkflow {
  abstract validate(): boolean;
  abstract process(): void;
  abstract cleanup(): void;

  execute() {
    if (!this.validate()) {
      throw new Error('Validation failed');
    }

    try {
      this.process();
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }
}

// Utility functions for common operations
export const DesignPatternUtils = {
  /**
   * Deep clone an object
   */
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Retry function with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxAttempts) {
          throw lastError;
        }
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  },

  /**
   * Memoize function results
   */
  memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map();
    return ((...args: any[]) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },
};
