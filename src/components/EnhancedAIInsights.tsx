import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Target,
  Gauge,
  BarChart3,
  Zap,
  Info
} from 'lucide-react';
import type { AIInsight, ModelParameters, ErrorMetrics, ValidationResult, SaturationAnalysis } from '@/types/population';
import { Progress } from '@/components/ui/progress';

interface EnhancedAIInsightsProps {
  insights: AIInsight;
  params: ModelParameters;
  errorMetrics: ErrorMetrics;
  validation: ValidationResult;
  saturation: SaturationAnalysis;
}

export function EnhancedAIInsights({ 
  insights, 
  params, 
  errorMetrics, 
  validation,
  saturation 
}: EnhancedAIInsightsProps) {
  const getTrendIcon = () => {
    switch (insights.growthTrend) {
      case 'exponential': return <TrendingUp className="w-5 h-5" />;
      case 'logistic': return <Activity className="w-5 h-5" />;
      case 'declining': return <TrendingDown className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getTrendColor = () => {
    switch (insights.growthTrend) {
      case 'exponential': return 'text-secondary';
      case 'logistic': return 'text-primary';
      case 'declining': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskColor = () => {
    switch (insights.riskLevel) {
      case 'high': return 'text-destructive';
      case 'moderate': return 'text-accent';
      default: return 'text-secondary';
    }
  };

  const getConfidenceColor = () => {
    switch (insights.confidence) {
      case 'high': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'medium': return 'bg-primary/20 text-primary border-primary/30';
      default: return 'bg-accent/20 text-accent border-accent/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Model Parameters Card */}
      <div className="card-academic">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Optimized Model Parameters
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary-light rounded-lg">
            <div className="text-2xl font-bold text-primary">{params.r.toFixed(4)}</div>
            <div className="text-sm text-muted-foreground">Growth Rate (r)</div>
            {params.rOriginal && params.rOriginal !== params.r && (
              <div className="text-xs text-muted-foreground mt-1">
                Original: {params.rOriginal.toFixed(4)}
              </div>
            )}
          </div>
          <div className="text-center p-4 bg-secondary-light rounded-lg">
            <div className="text-2xl font-bold text-secondary">{params.K.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Carrying Capacity (K)</div>
          </div>
          <div className="text-center p-4 bg-accent-light rounded-lg">
            <div className="text-2xl font-bold text-accent">{params.P0.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Initial Pop (P₀)</div>
          </div>
        </div>
        {params.optimizationApplied && (
          <div className="mt-3 flex items-center gap-2 text-sm text-secondary">
            <Zap className="w-4 h-4" />
            Parameters optimized using grid search to minimize prediction error
          </div>
        )}
      </div>

      {/* Error Metrics Card */}
      <div className="card-academic">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Accuracy Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-xl font-bold">{errorMetrics.mae.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">MAE</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-xl font-bold">{errorMetrics.rmse.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">RMSE</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-xl font-bold">{errorMetrics.mape.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">MAPE</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-xl font-bold">{(errorMetrics.r2 * 100).toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">R² Score</div>
          </div>
          <div className="text-center p-3 bg-secondary-light rounded-lg">
            <div className="text-xl font-bold text-secondary">+{validation.improvement.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Improvement</div>
          </div>
        </div>
      </div>

      {/* Confidence Panel */}
      <div className="card-academic">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" />
          AI Confidence Analysis
        </h3>
        
        <div className="flex items-center gap-4 mb-4">
          <div className={`px-4 py-2 rounded-full border ${getConfidenceColor()} font-semibold`}>
            {insights.confidence.toUpperCase()} CONFIDENCE
          </div>
          <div className="text-2xl font-bold">{insights.confidenceScore.toFixed(0)}%</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Data Consistency</span>
              <span>{insights.confidenceFactors.dataConsistency.toFixed(0)}%</span>
            </div>
            <Progress value={insights.confidenceFactors.dataConsistency} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Error Score</span>
              <span>{insights.confidenceFactors.errorScore.toFixed(0)}%</span>
            </div>
            <Progress value={insights.confidenceFactors.errorScore} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Stability</span>
              <span>{insights.confidenceFactors.stabilityScore.toFixed(0)}%</span>
            </div>
            <Progress value={insights.confidenceFactors.stabilityScore} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Data Quality</span>
              <span>{insights.confidenceFactors.dataQuality.toFixed(0)}%</span>
            </div>
            <Progress value={insights.confidenceFactors.dataQuality} className="h-2" />
          </div>
        </div>
      </div>

      {/* Insight Cards Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-academic">
          <div className={`flex items-center gap-2 mb-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="font-semibold">Growth Trend</span>
          </div>
          <div className="text-2xl font-bold capitalize mb-1">{insights.growthTrend}</div>
          <p className="text-sm text-muted-foreground">
            {insights.growthTrend === 'exponential' && 'Rapid unrestricted growth phase'}
            {insights.growthTrend === 'logistic' && 'Controlled growth approaching limits'}
            {insights.growthTrend === 'stable' && 'Equilibrium near carrying capacity'}
            {insights.growthTrend === 'declining' && 'Negative growth trend observed'}
          </p>
        </div>

        <div className="card-academic">
          <div className={`flex items-center gap-2 mb-2 ${getRiskColor()}`}>
            {insights.riskLevel === 'high' ? <AlertTriangle className="w-5 h-5" /> : 
             insights.riskLevel === 'moderate' ? <Shield className="w-5 h-5" /> : 
             <CheckCircle2 className="w-5 h-5" />}
            <span className="font-semibold">Risk Level</span>
          </div>
          <div className="text-2xl font-bold capitalize mb-1">{insights.riskLevel}</div>
          <p className="text-sm text-muted-foreground">
            {insights.riskLevel === 'high' && 'Near or exceeding capacity limits'}
            {insights.riskLevel === 'moderate' && 'Approaching environmental constraints'}
            {insights.riskLevel === 'low' && 'Well within sustainable bounds'}
          </p>
        </div>

        <div className="card-academic">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Activity className="w-5 h-5" />
            <span className="font-semibold">Stability</span>
          </div>
          <div className="text-2xl font-bold capitalize mb-1">{insights.stabilityLevel}</div>
          <p className="text-sm text-muted-foreground">
            {insights.stabilityLevel === 'stable' && 'Consistent predictable patterns'}
            {insights.stabilityLevel === 'moderate' && 'Some variability in growth'}
            {insights.stabilityLevel === 'unstable' && 'High variance in historical data'}
          </p>
        </div>
      </div>

      {/* Saturation Analysis */}
      <div className="card-academic">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Saturation Analysis
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Saturation Progress</span>
              <span>{saturation.saturationPercentage.toFixed(1)}% of K</span>
            </div>
            <Progress 
              value={Math.min(100, saturation.saturationPercentage)} 
              className={`h-3 ${saturation.saturationPercentage > 80 ? '[&>div]:bg-accent' : saturation.saturationPercentage > 60 ? '[&>div]:bg-primary' : '[&>div]:bg-secondary'}`}
            />
          </div>
          {saturation.isApproachingSaturation && (
            <div className="px-3 py-1 bg-accent-light text-accent rounded-full text-sm font-medium">
              Approaching Saturation
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{saturation.explanation}</p>
        {saturation.saturationYear && (
          <div className="mt-2 text-sm">
            <strong>Estimated saturation year:</strong> {saturation.saturationYear}
          </div>
        )}
        {saturation.dynamicGrowthAdjustment < 1 && (
          <div className="mt-2 text-sm text-accent flex items-center gap-2">
            <Info className="w-4 h-4" />
            Growth rate dynamically reduced by {((1 - saturation.dynamicGrowthAdjustment) * 100).toFixed(0)}% to reflect saturation effects
          </div>
        )}
      </div>

      {/* AI Summary */}
      <div className="card-academic bg-primary-light border-primary/20">
        <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          AI-Generated Dataset Summary
        </h4>
        <div className="space-y-2">
          {insights.summary.map((line, index) => (
            <p key={index} className="text-muted-foreground leading-relaxed">{line}</p>
          ))}
        </div>
      </div>

      {/* Parameter Explanation */}
      <div className="card-academic">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          Parameter Selection Explanation
        </h4>
        <div className="space-y-2">
          {insights.parameterExplanation.map((line, index) => (
            <p key={index} className="text-sm text-muted-foreground">{line}</p>
          ))}
        </div>
      </div>

      {/* Accuracy Explanation */}
      <div className="card-academic bg-secondary-light border-secondary/20">
        <h4 className="font-semibold text-secondary mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Accuracy Improvement Analysis
        </h4>
        <div className="space-y-2">
          {insights.accuracyExplanation.map((line, index) => (
            <p key={index} className="text-sm text-muted-foreground">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
