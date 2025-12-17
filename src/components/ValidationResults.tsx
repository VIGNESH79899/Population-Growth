import { 
  GitCompare, 
  TrendingUp, 
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import type { ValidationResult } from '@/types/population';
import { Progress } from '@/components/ui/progress';

interface ValidationResultsProps {
  validation: ValidationResult;
}

export function ValidationResults({ validation }: ValidationResultsProps) {
  const improvementColor = validation.improvement > 20 
    ? 'text-secondary' 
    : validation.improvement > 10 
      ? 'text-primary' 
      : 'text-accent';

  return (
    <div className="card-academic">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <GitCompare className="w-5 h-5 text-primary" />
        Rolling Validation Results
      </h3>

      <p className="text-sm text-muted-foreground mb-6">
        Data was split into training (70%) and testing (30%) sets to validate prediction accuracy 
        and compare untuned vs. optimized parameters.
      </p>

      {/* Improvement Highlight */}
      <div className="p-6 bg-secondary-light rounded-xl mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp className={`w-6 h-6 ${improvementColor}`} />
          <span className="text-sm font-medium">Accuracy Improvement</span>
        </div>
        <div className={`text-4xl font-bold ${improvementColor}`}>
          +{validation.improvement.toFixed(1)}%
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Reduction in Mean Squared Error after parameter optimization
        </p>
      </div>

      {/* Comparison Table */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Untuned Parameters */}
        <div className="p-4 border border-muted rounded-lg">
          <h4 className="font-medium mb-3 text-muted-foreground">Baseline Parameters</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Growth Rate (r)</span>
              <span className="font-mono">{validation.untunedParams.r.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Carrying Capacity (K)</span>
              <span className="font-mono">{validation.untunedParams.K.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Tuned Parameters */}
        <div className="p-4 border border-secondary rounded-lg bg-secondary-light">
          <h4 className="font-medium mb-3 text-secondary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Optimized Parameters
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Growth Rate (r)</span>
              <span className="font-mono font-bold">{validation.tunedParams.r.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Carrying Capacity (K)</span>
              <span className="font-mono font-bold">{validation.tunedParams.K.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Comparison */}
      <h4 className="font-medium mb-3 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        Error Metrics (Optimized Model)
      </h4>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Training Metrics */}
        <div>
          <h5 className="text-sm font-medium mb-3 text-muted-foreground">Training Set</h5>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>MAE</span>
                <span>{validation.trainMetrics.mae.toLocaleString()}</span>
              </div>
              <Progress value={Math.max(0, 100 - validation.trainMetrics.mape)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>RMSE</span>
                <span>{validation.trainMetrics.rmse.toLocaleString()}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>R²</span>
                <span>{(validation.trainMetrics.r2 * 100).toFixed(1)}%</span>
              </div>
              <Progress value={validation.trainMetrics.r2 * 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* Testing Metrics */}
        <div>
          <h5 className="text-sm font-medium mb-3 text-muted-foreground">Testing Set</h5>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>MAE</span>
                <span>{validation.testMetrics.mae.toLocaleString()}</span>
              </div>
              <Progress value={Math.max(0, 100 - validation.testMetrics.mape)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>RMSE</span>
                <span>{validation.testMetrics.rmse.toLocaleString()}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>R²</span>
                <span>{(validation.testMetrics.r2 * 100).toFixed(1)}%</span>
              </div>
              <Progress value={validation.testMetrics.r2 * 100} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Interpretation:</strong> The optimized model shows 
          {validation.improvement > 15 ? ' significant' : validation.improvement > 5 ? ' moderate' : ' slight'} improvement 
          over baseline parameters. 
          {validation.testMetrics.r2 > 0.9 
            ? ' The high R² on test data indicates excellent generalization.' 
            : validation.testMetrics.r2 > 0.7 
              ? ' The R² indicates good model fit with acceptable generalization.' 
              : ' Consider adding more training data for better accuracy.'}
        </p>
      </div>
    </div>
  );
}
