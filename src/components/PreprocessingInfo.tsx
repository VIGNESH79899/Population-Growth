import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles,
  Filter,
  BarChart3
} from 'lucide-react';
import type { PreprocessingResult } from '@/types/population';

interface PreprocessingInfoProps {
  preprocessing: PreprocessingResult;
}

export function PreprocessingInfo({ preprocessing }: PreprocessingInfoProps) {
  const hasIssues = preprocessing.issues.length > 0;
  const hasCorrections = preprocessing.corrections.length > 0;

  return (
    <div className="card-academic">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Filter className="w-5 h-5 text-primary" />
        Data Preprocessing & Quality
      </h3>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-2xl font-bold">{preprocessing.cleanedData.length}</div>
          <div className="text-sm text-muted-foreground">Data Points</div>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-2xl font-bold">{preprocessing.normalizationFactor.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Normalization Factor</div>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className={`text-2xl font-bold ${hasIssues ? 'text-accent' : 'text-secondary'}`}>
            {hasIssues ? preprocessing.issues.length : '✓'}
          </div>
          <div className="text-sm text-muted-foreground">Issues Detected</div>
        </div>
      </div>

      {/* Processing Steps */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-3 p-3 bg-primary-light rounded-lg">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm">Data Cleaning</div>
            <p className="text-xs text-muted-foreground">
              Handled missing values, zero/negative populations through interpolation and neighbor averaging
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-secondary-light rounded-lg">
          <BarChart3 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm">Moving Average Smoothing</div>
            <p className="text-xs text-muted-foreground">
              Applied 3-point moving average to reduce minor fluctuations and noise in the data
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
          <Filter className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm">Normalization</div>
            <p className="text-xs text-muted-foreground">
              Min-max scaling applied for stable parameter estimation (factor: {preprocessing.normalizationFactor.toLocaleString()})
            </p>
          </div>
        </div>
      </div>

      {/* Issues */}
      {hasIssues && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-accent">
            <AlertTriangle className="w-4 h-4" />
            Detected Issues
          </h4>
          <ul className="space-y-1">
            {preprocessing.issues.map((issue, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-accent">•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Corrections Applied */}
      {hasCorrections && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-secondary">
            <CheckCircle2 className="w-4 h-4" />
            Corrections Applied
          </h4>
          <ul className="space-y-1 max-h-32 overflow-y-auto">
            {preprocessing.corrections.map((correction, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-secondary">✓</span>
                {correction}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasIssues && !hasCorrections && (
        <div className="flex items-center gap-2 text-secondary">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">Data quality is excellent - no corrections needed</span>
        </div>
      )}

      <div className="mt-4 p-3 bg-primary-light rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Why preprocessing matters:</strong> Clean, smoothed data produces more stable 
            parameter estimates and reduces prediction variance. Normalization ensures consistent scaling 
            during optimization.
          </p>
        </div>
      </div>
    </div>
  );
}
