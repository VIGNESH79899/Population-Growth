import type { 
  DataPoint, 
  PredictionResult, 
  ModelParameters, 
  DatasetStats, 
  AIInsight,
  ErrorMetrics,
  ValidationResult,
  PreprocessingResult,
  SensitivityAnalysis,
  SaturationAnalysis,
  EnhancedPredictionResult
} from '@/types/population';

// ============= CORE LOGISTIC MODEL =============

// Logistic recurrence relation: P(n) = r × P(n-1) × (1 - P(n-1)/K)
export function logisticGrowth(pPrev: number, r: number, K: number): number {
  return r * pPrev * (1 - pPrev / K);
}

// ============= DATA PREPROCESSING =============

export function preprocessData(data: DataPoint[]): PreprocessingResult {
  const issues: string[] = [];
  const corrections: string[] = [];
  
  if (data.length === 0) {
    return {
      cleanedData: [],
      normalizedData: [],
      smoothedData: [],
      issues: ['No data provided'],
      corrections: [],
      normalizationFactor: 1
    };
  }

  // Step 1: Clean data - handle missing, zero, negative values
  let cleanedData = [...data].sort((a, b) => a.year - b.year);
  
  // Detect and fix missing years
  const years = cleanedData.map(d => d.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const missingYears: number[] = [];
  
  for (let y = minYear; y <= maxYear; y++) {
    if (!years.includes(y)) {
      missingYears.push(y);
    }
  }
  
  if (missingYears.length > 0) {
    issues.push(`Missing data for years: ${missingYears.slice(0, 3).join(', ')}${missingYears.length > 3 ? '...' : ''}`);
    // Interpolate missing values
    missingYears.forEach(year => {
      const before = cleanedData.filter(d => d.year < year).pop();
      const after = cleanedData.find(d => d.year > year);
      if (before && after) {
        const ratio = (year - before.year) / (after.year - before.year);
        const interpolated = before.population + ratio * (after.population - before.population);
        cleanedData.push({ year, population: Math.round(interpolated) });
        corrections.push(`Interpolated year ${year}: ${Math.round(interpolated).toLocaleString()}`);
      }
    });
    cleanedData.sort((a, b) => a.year - b.year);
  }

  // Handle zero/negative values
  const invalidValues = cleanedData.filter(d => d.population <= 0);
  if (invalidValues.length > 0) {
    issues.push(`Found ${invalidValues.length} zero or negative population values`);
    cleanedData = cleanedData.map((d, i) => {
      if (d.population <= 0) {
        // Use average of neighbors
        const prev = cleanedData[i - 1]?.population || 1;
        const next = cleanedData[i + 1]?.population || prev;
        const fixed = Math.round((prev + next) / 2);
        corrections.push(`Fixed year ${d.year}: 0 → ${fixed.toLocaleString()}`);
        return { ...d, population: fixed };
      }
      return d;
    });
  }

  // Step 2: Smoothing using moving average (window of 3)
  const windowSize = Math.min(3, Math.floor(cleanedData.length / 2));
  const smoothedData = cleanedData.map((d, i) => {
    if (windowSize < 2 || cleanedData.length < 4) return d;
    
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(cleanedData.length, i + Math.ceil(windowSize / 2));
    const window = cleanedData.slice(start, end);
    const avg = window.reduce((sum, w) => sum + w.population, 0) / window.length;
    return { year: d.year, population: Math.round(avg) };
  });

  // Step 3: Normalization (min-max scaling for parameter estimation)
  const populations = cleanedData.map(d => d.population);
  const maxPop = Math.max(...populations);
  const normalizationFactor = maxPop > 0 ? maxPop : 1;
  
  const normalizedData = cleanedData.map(d => ({
    year: d.year,
    population: d.population / normalizationFactor
  }));

  if (corrections.length > 0) {
    corrections.unshift(`Applied ${corrections.length} data corrections for improved stability`);
  }

  return {
    cleanedData,
    normalizedData,
    smoothedData,
    issues,
    corrections,
    normalizationFactor
  };
}

// ============= ERROR METRICS =============

export function calculateErrorMetrics(actual: number[], predicted: number[]): ErrorMetrics {
  if (actual.length === 0 || actual.length !== predicted.length) {
    return { mae: 0, mse: 0, rmse: 0, mape: 0, r2: 0 };
  }

  const n = actual.length;
  let sumAbsError = 0;
  let sumSqError = 0;
  let sumAbsPercentError = 0;
  
  for (let i = 0; i < n; i++) {
    const error = actual[i] - predicted[i];
    sumAbsError += Math.abs(error);
    sumSqError += error * error;
    if (actual[i] !== 0) {
      sumAbsPercentError += Math.abs(error / actual[i]);
    }
  }

  const mae = sumAbsError / n;
  const mse = sumSqError / n;
  const rmse = Math.sqrt(mse);
  const mape = (sumAbsPercentError / n) * 100;

  // R² calculation
  const meanActual = actual.reduce((a, b) => a + b, 0) / n;
  const ssTot = actual.reduce((sum, a) => sum + Math.pow(a - meanActual, 2), 0);
  const ssRes = sumSqError;
  const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

  return { mae, mse, rmse, mape, r2: Math.max(0, r2) };
}

// ============= ADAPTIVE PARAMETER ESTIMATION =============

export function estimateParametersBasic(data: DataPoint[]): ModelParameters {
  if (data.length < 2) {
    return { r: 1.5, K: data[0]?.population * 10 || 10000, P0: data[0]?.population || 1000 };
  }
  
  const P0 = data[0].population;
  
  // Basic growth rate estimation
  const growthRates: number[] = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i - 1].population > 0) {
      const rate = data[i].population / data[i - 1].population;
      growthRates.push(rate);
    }
  }
  
  const avgRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
  const r = Math.min(Math.max(avgRate, 0.5), 4);
  
  const maxPop = Math.max(...data.map(d => d.population));
  const K = Math.max(maxPop * 1.5, P0 * 5);
  
  return { r, K, P0 };
}

export function estimateParametersAdvanced(
  data: DataPoint[],
  smoothedData?: DataPoint[]
): ModelParameters {
  if (data.length < 2) {
    return { 
      r: 1.5, 
      K: data[0]?.population * 10 || 10000, 
      P0: data[0]?.population || 1000,
      rOriginal: 1.5,
      KOriginal: data[0]?.population * 10 || 10000,
      optimizationApplied: false
    };
  }

  const workingData = smoothedData && smoothedData.length > 0 ? smoothedData : data;
  const P0 = data[0].population;

  // Time-weighted growth rate estimation (recent data has higher weight)
  let weightedRateSum = 0;
  let weightSum = 0;
  const n = workingData.length;
  
  for (let i = 1; i < n; i++) {
    if (workingData[i - 1].population > 0) {
      const rate = workingData[i].population / workingData[i - 1].population;
      // Exponential weighting - recent years have ~3x weight of oldest
      const weight = Math.exp((i / n) * 1.1);
      weightedRateSum += rate * weight;
      weightSum += weight;
    }
  }
  
  const weightedAvgRate = weightSum > 0 ? weightedRateSum / weightSum : 1.5;

  // Estimate carrying capacity from saturation trends
  const recentData = workingData.slice(-Math.ceil(n / 2));
  const recentGrowthRates: number[] = [];
  
  for (let i = 1; i < recentData.length; i++) {
    if (recentData[i - 1].population > 0) {
      const rate = (recentData[i].population - recentData[i - 1].population) / recentData[i - 1].population;
      recentGrowthRates.push(rate);
    }
  }
  
  const avgRecentGrowth = recentGrowthRates.length > 0 
    ? recentGrowthRates.reduce((a, b) => a + b, 0) / recentGrowthRates.length 
    : 0.05;
  
  // If growth is slowing, estimate K based on saturation trend
  const maxPop = Math.max(...data.map(d => d.population));
  const lastPop = data[data.length - 1].population;
  
  let K: number;
  if (avgRecentGrowth < 0.02 && lastPop > maxPop * 0.9) {
    // Near saturation - K is close to current max
    K = maxPop * 1.1;
  } else if (avgRecentGrowth < 0.05) {
    // Slowing growth
    K = maxPop * 1.3;
  } else {
    // Active growth - extrapolate K
    K = maxPop * (1.5 + avgRecentGrowth * 5);
  }

  const rOriginal = weightedAvgRate;
  const KOriginal = K;
  
  // Clamp r to reasonable bounds
  const r = Math.min(Math.max(weightedAvgRate, 0.5), 4);
  K = Math.max(K, P0 * 2);

  return { 
    r, 
    K, 
    P0,
    rOriginal,
    KOriginal,
    optimizationApplied: false
  };
}

// ============= PARAMETER OPTIMIZATION =============

export function optimizeParameters(
  data: DataPoint[],
  initialParams: ModelParameters,
  iterations: number = 100
): ModelParameters {
  let bestParams = { ...initialParams };
  let bestMse = Infinity;
  
  const actual = data.map(d => d.population);
  
  // Grid search with refinement
  const rRange = [
    Math.max(0.5, initialParams.r * 0.5),
    Math.min(4, initialParams.r * 1.5)
  ];
  const kRange = [
    Math.max(initialParams.P0 * 1.5, initialParams.K * 0.5),
    initialParams.K * 2
  ];
  
  const rStep = (rRange[1] - rRange[0]) / Math.sqrt(iterations);
  const kStep = (kRange[1] - kRange[0]) / Math.sqrt(iterations);
  
  for (let r = rRange[0]; r <= rRange[1]; r += rStep) {
    for (let K = kRange[0]; K <= kRange[1]; K += kStep) {
      const predicted = generatePredictionsForData(data, { r, K, P0: initialParams.P0 });
      const mse = calculateErrorMetrics(actual, predicted).mse;
      
      if (mse < bestMse) {
        bestMse = mse;
        bestParams = { ...initialParams, r, K, optimizationApplied: true };
      }
    }
  }
  
  return bestParams;
}

function generatePredictionsForData(data: DataPoint[], params: ModelParameters): number[] {
  const predictions: number[] = [];
  let currentPop = params.P0;
  
  for (let i = 0; i < data.length; i++) {
    predictions.push(Math.round(currentPop));
    currentPop = logisticGrowth(currentPop, params.r, params.K);
    currentPop = Math.max(0, currentPop);
  }
  
  return predictions;
}

// ============= ROLLING VALIDATION =============

export function performRollingValidation(
  data: DataPoint[],
  trainRatio: number = 0.7
): ValidationResult {
  const splitIndex = Math.floor(data.length * trainRatio);
  const trainData = data.slice(0, splitIndex);
  const testData = data.slice(splitIndex);
  
  if (trainData.length < 2 || testData.length < 1) {
    const defaultParams = estimateParametersBasic(data);
    const defaultMetrics = { mae: 0, mse: 0, rmse: 0, mape: 0, r2: 0 };
    return {
      trainMetrics: defaultMetrics,
      testMetrics: defaultMetrics,
      improvement: 0,
      tunedParams: defaultParams,
      untunedParams: defaultParams
    };
  }
  
  // Untuned prediction
  const untunedParams = estimateParametersBasic(trainData);
  const untunedPredictions = generatePredictionsForData(data, untunedParams);
  const untunedTrainPreds = untunedPredictions.slice(0, splitIndex);
  const untunedTestPreds = untunedPredictions.slice(splitIndex);
  
  // Tuned prediction
  const advancedParams = estimateParametersAdvanced(trainData);
  const tunedParams = optimizeParameters(trainData, advancedParams);
  const tunedPredictions = generatePredictionsForData(data, tunedParams);
  const tunedTrainPreds = tunedPredictions.slice(0, splitIndex);
  const tunedTestPreds = tunedPredictions.slice(splitIndex);
  
  const trainActual = trainData.map(d => d.population);
  const testActual = testData.map(d => d.population);
  
  const trainMetrics = calculateErrorMetrics(trainActual, tunedTrainPreds);
  const testMetrics = calculateErrorMetrics(testActual, tunedTestPreds);
  
  const untunedTestMetrics = calculateErrorMetrics(testActual, untunedTestPreds);
  const improvement = untunedTestMetrics.mse > 0 
    ? ((untunedTestMetrics.mse - testMetrics.mse) / untunedTestMetrics.mse) * 100 
    : 0;
  
  return {
    trainMetrics,
    testMetrics,
    improvement: Math.max(0, improvement),
    tunedParams,
    untunedParams
  };
}

// ============= SENSITIVITY ANALYSIS =============

export function performSensitivityAnalysis(
  data: DataPoint[],
  baseParams: ModelParameters
): SensitivityAnalysis {
  const actual = data.map(d => d.population);
  const rSensitivity: { value: number; mse: number }[] = [];
  const kSensitivity: { value: number; mse: number }[] = [];
  
  // Test r variations
  for (let rMult = 0.5; rMult <= 1.5; rMult += 0.1) {
    const r = baseParams.r * rMult;
    const preds = generatePredictionsForData(data, { ...baseParams, r });
    const mse = calculateErrorMetrics(actual, preds).mse;
    rSensitivity.push({ value: r, mse });
  }
  
  // Test K variations
  for (let kMult = 0.5; kMult <= 2; kMult += 0.15) {
    const K = baseParams.K * kMult;
    const preds = generatePredictionsForData(data, { ...baseParams, K });
    const mse = calculateErrorMetrics(actual, preds).mse;
    kSensitivity.push({ value: K, mse });
  }
  
  // Find optimal values
  const optimalR = rSensitivity.reduce((best, curr) => curr.mse < best.mse ? curr : best).value;
  const optimalK = kSensitivity.reduce((best, curr) => curr.mse < best.mse ? curr : best).value;
  
  // Determine stable zones (MSE < 2x minimum)
  const minRMse = Math.min(...rSensitivity.map(s => s.mse));
  const minKMse = Math.min(...kSensitivity.map(s => s.mse));
  
  const stableR = rSensitivity.filter(s => s.mse < minRMse * 2);
  const stableK = kSensitivity.filter(s => s.mse < minKMse * 2);
  
  return {
    rSensitivity,
    kSensitivity,
    stableZone: {
      rMin: Math.min(...stableR.map(s => s.value)),
      rMax: Math.max(...stableR.map(s => s.value)),
      kMin: Math.min(...stableK.map(s => s.value)),
      kMax: Math.max(...stableK.map(s => s.value))
    },
    optimalR,
    optimalK
  };
}

// ============= SATURATION ANALYSIS =============

export function analyzeSaturation(
  data: DataPoint[],
  predictions: PredictionResult[],
  params: ModelParameters
): SaturationAnalysis {
  const lastPop = data[data.length - 1]?.population || 0;
  const saturationPercentage = (lastPop / params.K) * 100;
  const isApproachingSaturation = saturationPercentage > 70;
  
  // Find year when saturation is reached
  let saturationYear: number | null = null;
  for (const pred of predictions) {
    if (pred.predicted >= params.K * 0.95) {
      saturationYear = pred.year;
      break;
    }
  }
  
  // Calculate dynamic growth adjustment
  let dynamicGrowthAdjustment = 1;
  if (saturationPercentage > 90) {
    dynamicGrowthAdjustment = 0.5;
  } else if (saturationPercentage > 80) {
    dynamicGrowthAdjustment = 0.7;
  } else if (saturationPercentage > 70) {
    dynamicGrowthAdjustment = 0.85;
  }
  
  let explanation = '';
  if (saturationPercentage > 90) {
    explanation = 'Population has reached near-saturation levels. Growth rate is significantly reduced due to resource constraints. Further growth will be minimal.';
  } else if (saturationPercentage > 70) {
    explanation = 'Population is approaching carrying capacity. Growth is slowing as environmental limits become more impactful. Expect gradual stabilization.';
  } else if (saturationPercentage > 50) {
    explanation = 'Population is at moderate density relative to carrying capacity. Growth continues but may begin slowing in future years.';
  } else {
    explanation = 'Population is well below carrying capacity. Current growth trajectory shows room for significant expansion before environmental limits are reached.';
  }
  
  return {
    isApproachingSaturation,
    saturationYear,
    saturationPercentage,
    dynamicGrowthAdjustment,
    explanation
  };
}

// ============= PREDICTION GENERATION =============

export function generatePredictions(
  data: DataPoint[],
  params: ModelParameters,
  yearsToPredict: number,
  saturation?: SaturationAnalysis
): PredictionResult[] {
  const results: PredictionResult[] = [];
  const { r, K, P0 } = params;
  
  let currentPop = P0;
  const startYear = data.length > 0 ? data[0].year : 2020;
  const totalYears = data.length + yearsToPredict;
  
  // Apply dynamic growth adjustment if near saturation
  const effectiveR = saturation 
    ? r * saturation.dynamicGrowthAdjustment 
    : r;
  
  for (let i = 0; i < totalYears; i++) {
    const year = startYear + i;
    const actual = i < data.length ? data[i].population : null;
    const predicted = Math.round(currentPop);
    
    // Calculate error for actual data points
    const error = actual !== null ? Math.abs(actual - predicted) : undefined;
    
    // Calculate confidence intervals (±15% for historical, increasing for future)
    const confidenceMultiplier = actual !== null ? 0.1 : 0.1 + (i - data.length) * 0.02;
    const confidenceLow = Math.round(predicted * (1 - confidenceMultiplier));
    const confidenceHigh = Math.round(predicted * (1 + confidenceMultiplier));
    
    results.push({
      year,
      actual,
      predicted,
      error,
      confidenceLow,
      confidenceHigh
    });
    
    // Use effective r for future predictions
    const useR = i >= data.length ? effectiveR : r;
    currentPop = logisticGrowth(currentPop, useR, K);
    currentPop = Math.max(0, Math.min(currentPop, K * 1.05)); // Cap at 105% of K
  }
  
  return results;
}

// ============= AI INSIGHTS GENERATION =============

export function generateInsights(
  data: DataPoint[],
  predictions: PredictionResult[],
  params: ModelParameters,
  errorMetrics: ErrorMetrics,
  validation: ValidationResult
): AIInsight {
  const stats = calculateStats(data);
  const lastActual = data[data.length - 1]?.population || 0;
  const lastPredicted = predictions[predictions.length - 1]?.predicted || 0;
  
  // Determine growth trend
  let growthTrend: AIInsight['growthTrend'] = 'stable';
  if (stats.avgGrowthRate > 0.05) growthTrend = 'exponential';
  else if (stats.avgGrowthRate > 0.01) growthTrend = 'logistic';
  else if (stats.avgGrowthRate < -0.01) growthTrend = 'declining';
  
  // Determine stability
  const popVariance = calculateVariance(data.map(d => d.population));
  let stabilityLevel: AIInsight['stabilityLevel'] = 'stable';
  if (popVariance > lastActual * 0.3) stabilityLevel = 'unstable';
  else if (popVariance > lastActual * 0.1) stabilityLevel = 'moderate';
  
  // Determine risk
  let riskLevel: AIInsight['riskLevel'] = 'low';
  if (lastPredicted > params.K * 0.9) riskLevel = 'high';
  else if (lastPredicted > params.K * 0.7) riskLevel = 'moderate';
  
  // Calculate confidence factors
  const dataConsistency = Math.max(0, 100 - (popVariance / lastActual) * 100);
  const errorScore = Math.max(0, 100 - errorMetrics.mape);
  const stabilityScore = stabilityLevel === 'stable' ? 90 : stabilityLevel === 'moderate' ? 60 : 30;
  const dataQuality = Math.min(100, data.length * 10);
  
  const confidenceScore = (dataConsistency * 0.25 + errorScore * 0.35 + stabilityScore * 0.2 + dataQuality * 0.2);
  
  let confidence: AIInsight['confidence'] = 'high';
  if (confidenceScore < 50) confidence = 'low';
  else if (confidenceScore < 70) confidence = 'medium';
  
  // Generate summary
  const summary: string[] = [];
  
  if (growthTrend === 'exponential') {
    summary.push(`The population exhibits strong exponential growth with an average rate of ${(stats.avgGrowthRate * 100).toFixed(1)}% per year.`);
  } else if (growthTrend === 'logistic') {
    summary.push(`The population shows characteristic logistic growth, gradually approaching the carrying capacity.`);
  } else if (growthTrend === 'stable') {
    summary.push(`The population has reached a relatively stable equilibrium state near the carrying capacity.`);
  } else {
    summary.push(`The population shows a declining trend, possibly due to environmental constraints or resource limitations.`);
  }
  
  summary.push(`The estimated carrying capacity (K = ${params.K.toLocaleString()}) represents the maximum sustainable population level.`);
  
  if (validation.improvement > 0) {
    summary.push(`Model optimization improved prediction accuracy by ${validation.improvement.toFixed(1)}% compared to baseline parameters.`);
  }
  
  summary.push(`Based on ${data.length} historical data points, the model achieves ${confidence} confidence (${confidenceScore.toFixed(0)}%) with MAPE of ${errorMetrics.mape.toFixed(1)}%.`);
  
  // Parameter explanation
  const parameterExplanation: string[] = [];
  parameterExplanation.push(`Growth Rate (r = ${params.r.toFixed(4)}): Estimated using time-weighted analysis of historical growth patterns, with recent data given higher importance.`);
  parameterExplanation.push(`Carrying Capacity (K = ${params.K.toLocaleString()}): Derived from saturation trend analysis and maximum observed population, representing environmental limits.`);
  if (params.optimizationApplied) {
    parameterExplanation.push(`Parameters were optimized using grid search to minimize Mean Squared Error across historical data.`);
  }
  
  // Accuracy explanation
  const accuracyExplanation: string[] = [];
  accuracyExplanation.push(`Mean Absolute Error: ${errorMetrics.mae.toLocaleString()} (average deviation per year)`);
  accuracyExplanation.push(`Root Mean Square Error: ${errorMetrics.rmse.toLocaleString()} (penalizes large errors)`);
  accuracyExplanation.push(`R² Score: ${(errorMetrics.r2 * 100).toFixed(1)}% (variance explained by model)`);
  if (validation.improvement > 0) {
    accuracyExplanation.push(`Tuning improved MSE by ${validation.improvement.toFixed(1)}% over default estimation.`);
  }
  
  return { 
    growthTrend, 
    stabilityLevel, 
    riskLevel, 
    confidence,
    confidenceScore,
    confidenceFactors: {
      dataConsistency,
      errorScore,
      stabilityScore,
      dataQuality
    },
    summary,
    parameterExplanation,
    accuracyExplanation
  };
}

// ============= ENHANCED PREDICTION PIPELINE =============

export function runEnhancedPrediction(
  data: DataPoint[],
  yearsToPredict: number
): EnhancedPredictionResult {
  // Step 1: Preprocess data
  const preprocessing = preprocessData(data);
  const workingData = preprocessing.smoothedData.length > 0 
    ? preprocessing.smoothedData 
    : preprocessing.cleanedData;
  
  // Step 2: Advanced parameter estimation
  const baseParams = estimateParametersAdvanced(workingData, preprocessing.smoothedData);
  
  // Step 3: Rolling validation
  const validation = performRollingValidation(workingData);
  
  // Step 4: Use validated params or optimize
  const params = validation.tunedParams.optimizationApplied 
    ? validation.tunedParams 
    : optimizeParameters(workingData, baseParams);
  
  // Step 5: Sensitivity analysis
  const sensitivity = performSensitivityAnalysis(workingData, params);
  
  // Step 6: Initial predictions for saturation analysis
  const initialPredictions = generatePredictions(workingData, params, yearsToPredict);
  
  // Step 7: Saturation analysis
  const saturation = analyzeSaturation(workingData, initialPredictions, params);
  
  // Step 8: Final predictions with saturation adjustment
  const predictions = generatePredictions(workingData, params, yearsToPredict, saturation);
  
  // Step 9: Calculate final error metrics
  const actualValues = workingData.map(d => d.population);
  const predictedValues = predictions.slice(0, workingData.length).map(p => p.predicted);
  const errorMetrics = calculateErrorMetrics(actualValues, predictedValues);
  
  // Step 10: Generate insights
  const insights = generateInsights(workingData, predictions, params, errorMetrics, validation);
  
  // Step 11: Generate step-by-step explanation
  const steps = generateEnhancedStepByStep(params, workingData[0]?.population || 0, saturation, errorMetrics);
  
  return {
    predictions,
    params,
    insights,
    errorMetrics,
    validation,
    preprocessing,
    sensitivity,
    saturation,
    steps
  };
}

// ============= HELPER FUNCTIONS =============

export function calculateStats(data: DataPoint[]): DatasetStats {
  if (data.length === 0) {
    return {
      size: 0,
      minYear: 0,
      maxYear: 0,
      minPopulation: 0,
      maxPopulation: 0,
      avgGrowthRate: 0
    };
  }
  
  const populations = data.map(d => d.population);
  const years = data.map(d => d.year);
  
  let totalGrowthRate = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i - 1].population > 0) {
      totalGrowthRate += (data[i].population - data[i - 1].population) / data[i - 1].population;
    }
  }
  
  return {
    size: data.length,
    minYear: Math.min(...years),
    maxYear: Math.max(...years),
    minPopulation: Math.min(...populations),
    maxPopulation: Math.max(...populations),
    avgGrowthRate: data.length > 1 ? totalGrowthRate / (data.length - 1) : 0
  };
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
}

export function generateEnhancedStepByStep(
  params: ModelParameters,
  initialPop: number,
  saturation: SaturationAnalysis,
  errorMetrics: ErrorMetrics,
  steps: number = 3
): string[] {
  const explanations: string[] = [];
  let P = initialPop;
  
  explanations.push('=== AI-Enhanced Prediction Process ===');
  explanations.push('');
  explanations.push('📊 Parameter Selection Rationale:');
  explanations.push(`• Growth rate r = ${params.r.toFixed(4)} was selected using time-weighted historical analysis`);
  explanations.push(`• Carrying capacity K = ${params.K.toLocaleString()} represents estimated environmental limit`);
  explanations.push(`• Initial population P₀ = ${initialPop.toLocaleString()}`);
  explanations.push('');
  
  if (params.optimizationApplied) {
    explanations.push('🔧 Optimization Applied:');
    explanations.push(`• Parameters tuned to minimize prediction error`);
    explanations.push(`• Final MAPE: ${errorMetrics.mape.toFixed(2)}%`);
    explanations.push(`• R² Score: ${(errorMetrics.r2 * 100).toFixed(1)}%`);
    explanations.push('');
  }
  
  explanations.push('📈 Step-by-Step Calculations:');
  explanations.push(`Using P(n) = r × P(n-1) × (1 - P(n-1)/K)`);
  explanations.push('');
  
  for (let n = 1; n <= steps; n++) {
    const factor = (1 - P / params.K);
    const newP = logisticGrowth(P, params.r, params.K);
    
    explanations.push(`Year ${n}:`);
    explanations.push(`  P(${n}) = ${params.r.toFixed(4)} × ${Math.round(P).toLocaleString()} × (1 - ${Math.round(P).toLocaleString()}/${params.K.toLocaleString()})`);
    explanations.push(`  P(${n}) = ${params.r.toFixed(4)} × ${Math.round(P).toLocaleString()} × ${factor.toFixed(4)}`);
    explanations.push(`  P(${n}) = ${Math.round(newP).toLocaleString()}`);
    explanations.push('');
    
    P = newP;
  }
  
  if (saturation.isApproachingSaturation) {
    explanations.push('⚠️ Saturation Detection:');
    explanations.push(`• Population at ${saturation.saturationPercentage.toFixed(1)}% of carrying capacity`);
    explanations.push(`• Growth rate dynamically reduced by factor of ${saturation.dynamicGrowthAdjustment.toFixed(2)}`);
    if (saturation.saturationYear) {
      explanations.push(`• Estimated saturation year: ${saturation.saturationYear}`);
    }
  }
  
  return explanations;
}

// Legacy function for backward compatibility
export function generateStepByStep(
  params: ModelParameters,
  initialPop: number,
  steps: number = 3
): string[] {
  const explanations: string[] = [];
  let P = initialPop;
  
  explanations.push(`Starting with initial population P(0) = ${P.toLocaleString()}`);
  explanations.push(`Using growth rate r = ${params.r.toFixed(3)} and carrying capacity K = ${params.K.toLocaleString()}`);
  explanations.push('');
  
  for (let n = 1; n <= steps; n++) {
    const factor = (1 - P / params.K);
    const newP = logisticGrowth(P, params.r, params.K);
    
    explanations.push(`Year ${n}:`);
    explanations.push(`P(${n}) = ${params.r.toFixed(3)} × ${Math.round(P).toLocaleString()} × (1 - ${Math.round(P).toLocaleString()} / ${params.K.toLocaleString()})`);
    explanations.push(`P(${n}) = ${params.r.toFixed(3)} × ${Math.round(P).toLocaleString()} × ${factor.toFixed(4)}`);
    explanations.push(`P(${n}) = ${Math.round(newP).toLocaleString()}`);
    explanations.push('');
    
    P = newP;
  }
  
  return explanations;
}

// Backward compatible parameter estimation
export function estimateParameters(data: DataPoint[]): ModelParameters {
  return estimateParametersAdvanced(data);
}

export function generateRandomDataset(startYear: number, numYears: number): DataPoint[] {
  const data: DataPoint[] = [];
  let population = Math.floor(Math.random() * 5000) + 1000;
  const growthRate = 0.02 + Math.random() * 0.08;
  const K = population * (5 + Math.random() * 10);
  
  for (let i = 0; i < numYears; i++) {
    data.push({
      year: startYear + i,
      population: Math.round(population)
    });
    
    const r = growthRate + (Math.random() - 0.5) * 0.02;
    population = population * (1 + r * (1 - population / K));
    population = Math.max(100, population);
  }
  
  return data;
}

export function exportToCSV(
  predictions: PredictionResult[],
  params: ModelParameters,
  errorMetrics?: ErrorMetrics
): string {
  const headers = ['Year', 'Original Population', 'Predicted Population', 'Error', 'Confidence Low', 'Confidence High', 'Growth Rate (r)', 'Carrying Capacity (K)'];
  const rows = predictions.map((p, index) => [
    p.year,
    p.actual ?? 'N/A',
    p.predicted,
    p.error?.toFixed(0) ?? 'N/A',
    p.confidenceLow ?? 'N/A',
    p.confidenceHigh ?? 'N/A',
    index === 0 ? params.r.toFixed(4) : '',
    index === 0 ? params.K.toFixed(0) : ''
  ]);
  
  let csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  
  if (errorMetrics) {
    csv += '\n\n';
    csv += 'Error Metrics\n';
    csv += `MAE,${errorMetrics.mae.toFixed(2)}\n`;
    csv += `MSE,${errorMetrics.mse.toFixed(2)}\n`;
    csv += `RMSE,${errorMetrics.rmse.toFixed(2)}\n`;
    csv += `MAPE,${errorMetrics.mape.toFixed(2)}%\n`;
    csv += `R²,${(errorMetrics.r2 * 100).toFixed(2)}%`;
  }
  
  return csv;
}
