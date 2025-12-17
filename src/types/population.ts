export interface DataPoint {
  year: number;
  population: number;
}

export interface PredictionResult {
  year: number;
  actual: number | null;
  predicted: number;
  error?: number;
  confidenceLow?: number;
  confidenceHigh?: number;
}

export interface ModelParameters {
  r: number;
  K: number;
  P0: number;
  rOriginal?: number;
  KOriginal?: number;
  optimizationApplied?: boolean;
}

export interface DatasetStats {
  size: number;
  minYear: number;
  maxYear: number;
  minPopulation: number;
  maxPopulation: number;
  avgGrowthRate: number;
}

export interface ErrorMetrics {
  mae: number;
  mse: number;
  rmse: number;
  mape: number;
  r2: number;
}

export interface ValidationResult {
  trainMetrics: ErrorMetrics;
  testMetrics: ErrorMetrics;
  improvement: number;
  tunedParams: ModelParameters;
  untunedParams: ModelParameters;
}

export interface PreprocessingResult {
  cleanedData: DataPoint[];
  normalizedData: DataPoint[];
  smoothedData: DataPoint[];
  issues: string[];
  corrections: string[];
  normalizationFactor: number;
}

export interface SensitivityAnalysis {
  rSensitivity: { value: number; mse: number }[];
  kSensitivity: { value: number; mse: number }[];
  stableZone: { rMin: number; rMax: number; kMin: number; kMax: number };
  optimalR: number;
  optimalK: number;
}

export interface SaturationAnalysis {
  isApproachingSaturation: boolean;
  saturationYear: number | null;
  saturationPercentage: number;
  dynamicGrowthAdjustment: number;
  explanation: string;
}

export interface AIInsight {
  growthTrend: 'exponential' | 'logistic' | 'stable' | 'declining';
  stabilityLevel: 'stable' | 'moderate' | 'unstable';
  riskLevel: 'low' | 'moderate' | 'high';
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number;
  confidenceFactors: {
    dataConsistency: number;
    errorScore: number;
    stabilityScore: number;
    dataQuality: number;
  };
  summary: string[];
  parameterExplanation: string[];
  accuracyExplanation: string[];
}

export interface EnhancedPredictionResult {
  predictions: PredictionResult[];
  params: ModelParameters;
  insights: AIInsight;
  errorMetrics: ErrorMetrics;
  validation: ValidationResult;
  preprocessing: PreprocessingResult;
  sensitivity: SensitivityAnalysis;
  saturation: SaturationAnalysis;
  steps: string[];
}

export type InputMode = 'manual' | 'random' | 'csv';

export type ChartType = 'line' | 'bar';
