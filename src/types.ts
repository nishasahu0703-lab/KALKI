
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

export interface ProblemAnalysis {
  title: string;
  difficulty: Difficulty;
  type: string[];
  constraints: string[];
  patterns: string[];
  summary: string;
}

export interface CodeSolution {
  language: 'cpp' | 'java' | 'python';
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface LogicStep {
  title: string;
  content: string;
}

export interface LogicExplanation {
  problemBreakdown: string;
  bruteForce: {
    approach: string;
    whyItFails: string;
  };
  optimized: {
    approach: string;
    thinking: string;
  };
  steps: LogicStep[];
}

export interface InterviewAdvice {
  verbalExplanation: string;
  keyPoints: string[];
  sampleScript: string;
}

export interface DryRunStep {
  step: number;
  description: string;
  state: Record<string, any>;
}

export interface ProblemSolution {
  analysis: ProblemAnalysis;
  logic: LogicExplanation;
  codes: CodeSolution[];
  testCases: TestCase[];
  interviewAdvice: InterviewAdvice;
  dryRun: DryRunStep[];
  topPerformanceStrategy: string;
}

export interface UserPerformance {
  weakTopics: string[];
  strongTopics: string[];
  solvedCount: Record<Difficulty, number>;
  totalSolved: number;
}
