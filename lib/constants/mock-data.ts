/**
 * Mock data for development and testing
 */

import { Course, Challenge, Team, ChallengeDetail, ScoreboardEntry } from '@/lib/types';
import { COURSE_ICONS, CHALLENGE_CATEGORIES, CHALLENGE_STATUS, CHALLENGE_DIFFICULTY, TEAM_ROLES, QUESTION_STATUS, ARTIFACT_TYPES, SCOREBOARD_HIGHLIGHTS, TREND_DIRECTIONS } from './app';

// Mock courses data
export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Introduction to Cybersecurity',
    description: 'Learn the fundamentals of cybersecurity, including threats, vulnerabilities, and basic defense mechanisms.',
    modules: 12,
    icon: COURSE_ICONS.CYBERSECURITY
  },
  {
    id: '2',
    title: 'Web Application Security',
    description: 'Understanding and exploiting web vulnerabilities like SQL injection, XSS, and CSRF.',
    modules: 8,
    icon: COURSE_ICONS.WEB_SECURITY
  },
  {
    id: '3',
    title: 'Network Security Fundamentals',
    description: 'Explore network protocols, firewalls, intrusion detection systems, and secure network design.',
    modules: 10,
    icon: COURSE_ICONS.NETWORK
  },
  {
    id: '4',
    title: 'Digital Forensics',
    description: 'Learn to investigate cybercrimes, analyze digital evidence, and use forensic tools.',
    modules: 15,
    icon: COURSE_ICONS.FORENSICS
  }
];

// Mock challenges data
export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'SQL Injection Master',
    description: 'Exploit SQL injection vulnerabilities to extract sensitive data from the database.',
    category: CHALLENGE_CATEGORIES.WEB,
    status: CHALLENGE_STATUS.SOLVED,
    points: 100,
    difficulty: CHALLENGE_DIFFICULTY.MEDIUM,
    solves: 42
  },
  {
    id: '2',
    title: 'RSA Challenge',
    description: 'Break RSA encryption with weak key generation parameters.',
    category: CHALLENGE_CATEGORIES.CRYPTO,
    status: CHALLENGE_STATUS.IN_PROGRESS,
    points: 150,
    difficulty: CHALLENGE_DIFFICULTY.HARD,
    solves: 18,
    timeSpent: '2 hours spent'
  },
  {
    id: '3',
    title: 'Memory Dump Analysis',
    description: 'Analyze a memory dump to find hidden credentials and sensitive data.',
    category: CHALLENGE_CATEGORIES.FORENSICS,
    status: CHALLENGE_STATUS.UNSOLVED,
    points: 200,
    difficulty: CHALLENGE_DIFFICULTY.HARD,
    solves: 8
  },
  {
    id: '4',
    title: 'AWS IAM Misconfiguration',
    description: 'Exploit misconfigured IAM policies to gain elevated privileges.',
    category: CHALLENGE_CATEGORIES.CLOUD,
    status: CHALLENGE_STATUS.UNSOLVED,
    points: 120,
    difficulty: CHALLENGE_DIFFICULTY.MEDIUM,
    solves: 25,
    vmAvailable: true,
    vmStatus: 'Ready to deploy'
  }
];

// Mock teams data
export const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Cyber Warriors',
    size: 4,
    isLeader: true,
    members: [
      {
        id: '1',
        name: 'John Doe',
        initials: 'JD',
        role: TEAM_ROLES.LEADER
      },
      {
        id: '2',
        name: 'Alice Johnson',
        initials: 'AJ',
        role: TEAM_ROLES.MEMBER
      },
      {
        id: '3',
        name: 'Bob Smith',
        initials: 'BS',
        role: TEAM_ROLES.MEMBER
      },
      {
        id: '4',
        name: 'Carol Davis',
        initials: 'CD',
        role: TEAM_ROLES.MEMBER
      }
    ]
  }
];

// Mock scoreboard entries
export const MOCK_SCOREBOARD_ENTRIES: ScoreboardEntry[] = [
  {
    id: '1',
    rank: 1,
    teamName: 'QuantumPoptarts',
    points: 6242,
    trend: TREND_DIRECTIONS.STABLE,
    highlight: SCOREBOARD_HIGHLIGHTS.GOLD
  },
  {
    id: '2',
    rank: 2,
    teamName: 'WEH',
    points: 5995,
    trend: TREND_DIRECTIONS.UP,
    highlight: SCOREBOARD_HIGHLIGHTS.SILVER
  },
  {
    id: '3',
    rank: 3,
    teamName: 'TeamName-of-MyChoice',
    points: 5258,
    trend: TREND_DIRECTIONS.STABLE,
    highlight: SCOREBOARD_HIGHLIGHTS.BRONZE
  },
  {
    id: '4',
    rank: 4,
    teamName: 'The Undecideds',
    points: 3489,
    trend: TREND_DIRECTIONS.DOWN
  }
];

// Mock challenge detail
export const MOCK_CHALLENGE_DETAIL: ChallengeDetail = {
  id: '1',
  title: 'Midnight Credentials - OT Edition',
  category: 'OT/ICS Security',
  difficulty: CHALLENGE_DIFFICULTY.MEDIUM,
  estimatedTime: '45-60 mins',
  totalPoints: 40,
  timeSpent: '00:00:17',
  tags: true,
  scenario: "A water treatment plant's engineering workstation (which has access to PLC programming and HMI configuration) shows signs of unauthorized activity. An attacker appears to have used compromised credentials to log into an engineering workstation, elevated privileges, and accessed control-related files. The artifacts provided are offline and safe for training.",
  contextNotes: [
    'The engineering workstation is used by OT staff to manage PLC setpoints and HMI screens.',
    'Compromise of service accounts on this host can directly affect process control.',
    'For safety, all exercises are offline and use synthetic artifacts.'
  ],
  artifacts: [
    {
      id: '1',
      name: 'wordlist_small.txt',
      description: 'Password wordlist for cracking',
      type: ARTIFACT_TYPES.WORDLIST
    },
    {
      id: '2',
      name: 'john_input_rawmd5.txt',
      description: 'MD5 hashes for password cracking',
      type: ARTIFACT_TYPES.FILE
    },
    {
      id: '3',
      name: 'auth.log',
      description: 'Authentication logs from engineering workstation',
      type: ARTIFACT_TYPES.LOG
    },
    {
      id: '4',
      name: 'investigation_notes.txt',
      description: 'Initial investigation findings',
      type: ARTIFACT_TYPES.NOTES
    },
    {
      id: '5',
      name: 'passwd_copy.txt',
      description: 'User account information',
      type: ARTIFACT_TYPES.FILE
    }
  ],
  questions: [
    {
      id: '1',
      title: 'Crack the password for svc_backup',
      description: 'Crack the password for svc_backup (an OT service account used for PLC backups) and submit the flag.',
      points: 30,
      type: 'flag',
      flagFormat: 'cracked_svc_backup_<password>',
      instructions: [
        'Use john with --format=raw-md5 and the provided wordlist to crack john_input_rawmd5.txt',
        'Identify the password for svc_backup',
        'Submit as cracked_svc_backup_<password>'
      ],
      whyThisMatters: 'Compromised OT service accounts can be used to alter PLCs or exfiltrate control logic.',
      status: QUESTION_STATUS.NOT_ATTEMPTED
    },
    {
      id: '2',
      title: 'Identify Attacker IP Address',
      description: 'Which IP did the attacker use to log in as svc_backup on the engineering workstation?',
      points: 10,
      type: 'flag',
      flagFormat: 'ip_<address>',
      instructions: [
        'Open auth.log and find the Accepted password entry for svc_backup',
        'Copy the IP address associated with that successful login'
      ],
      whyThisMatters: 'Identifying the source helps isolate the intrusion path and block attacker access.',
      status: QUESTION_STATUS.NOT_ATTEMPTED
    }
  ],
  tools: [
    {
      id: '1',
      name: 'John the Ripper Guide',
      icon: 'magnifying-glass'
    },
    {
      id: '2',
      name: 'OT Security Basics',
      icon: 'book'
    },
    {
      id: '3',
      name: 'Challenge Discussion',
      icon: 'chat'
    },
    {
      id: '4',
      name: 'Video Walkthrough',
      icon: 'video'
    }
  ]
};

// Legacy constants for backward compatibility - DEPRECATED
export const CATEGORY_COLORS = {
  WEB: 'bg-purple-600',
  CRYPTO: 'bg-orange-500',
  FORENSICS: 'bg-green-500',
  CLOUD: 'bg-blue-400',
  REVERSE: 'bg-red-500',
  PWN: 'bg-pink-500'
} as const;

export const STATUS_COLORS = {
  Solved: 'bg-green-500',
  'In Progress': 'bg-yellow-500',
  Unsolved: 'bg-purple-600',
  'Not attempted': 'bg-gray-500'
} as const;
