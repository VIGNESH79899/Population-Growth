import type { DataPoint, DatasetStats } from '@/types/population';
import { calculateStats } from '@/utils/populationModel';
import { CheckCircle, AlertTriangle, Info, Database } from 'lucide-react';

interface DataValidationProps {
  data: DataPoint[];
}

export function DataValidation({ data }: DataValidationProps) {
  const stats = calculateStats(data);
  const issues: string[] = [];
  const warnings: string[] = [];

  // Validation checks
  if (data.length < 3) {
    warnings.push('Limited data points may reduce prediction accuracy');
  }

  // Check for missing years
  const years = data.map(d => d.year);
  for (let i = 1; i < years.length; i++) {
    if (years[i] - years[i-1] > 1) {
      warnings.push(`Gap detected between years ${years[i-1]} and ${years[i]}`);
    }
  }

  // Check for negative values
  if (data.some(d => d.population < 0)) {
    issues.push('Negative population values detected');
  }

  // Check for extreme growth rates
  for (let i = 1; i < data.length; i++) {
    if (data[i-1].population > 0) {
      const rate = (data[i].population - data[i-1].population) / data[i-1].population;
      if (Math.abs(rate) > 0.5) {
        warnings.push(`Unusual growth rate (${(rate * 100).toFixed(0)}%) between ${data[i-1].year} and ${data[i].year}`);
        break;
      }
    }
  }

  const hasIssues = issues.length > 0;
  const hasWarnings = warnings.length > 0;

  return (
    <div className="card-academic">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          hasIssues ? 'bg-destructive/20' : hasWarnings ? 'bg-accent-light' : 'bg-secondary-light'
        }`}>
          {hasIssues ? (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          ) : hasWarnings ? (
            <Info className="w-5 h-5 text-accent" />
          ) : (
            <CheckCircle className="w-5 h-5 text-secondary" />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-foreground">
            {hasIssues ? 'Data Issues Detected' : hasWarnings ? 'Data Validated with Warnings' : 'Data Validated Successfully'}
          </h4>
          <p className="text-sm text-muted-foreground">Quality assessment complete</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="text-center p-3 bg-muted rounded-lg">
          <Database className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stats.size}</p>
          <p className="text-xs text-muted-foreground">Data Points</p>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <p className="text-xl font-bold text-foreground">{stats.minYear}</p>
          <p className="text-xs text-muted-foreground">Start Year</p>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <p className="text-xl font-bold text-foreground">{stats.maxYear}</p>
          <p className="text-xs text-muted-foreground">End Year</p>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <p className="text-xl font-bold text-foreground">{stats.minPopulation.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Min Population</p>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <p className="text-xl font-bold text-foreground">{stats.maxPopulation.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Max Population</p>
        </div>
      </div>

      {/* Issues & Warnings */}
      {(hasIssues || hasWarnings) && (
        <div className="space-y-2">
          {issues.map((issue, i) => (
            <div key={`issue-${i}`} className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {issue}
            </div>
          ))}
          {warnings.map((warning, i) => (
            <div key={`warn-${i}`} className="flex items-center gap-2 p-2 bg-accent-light rounded text-sm text-accent">
              <Info className="w-4 h-4 flex-shrink-0" />
              {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
