import type { PredictionResult } from '@/types/population';

interface ResultsTableProps {
  predictions: PredictionResult[];
}

export function ResultsTable({ predictions }: ResultsTableProps) {
  const lastActualIndex = predictions.findIndex(p => p.actual === null);
  
  return (
    <div className="card-academic overflow-hidden">
      <h4 className="text-lg font-semibold text-foreground mb-4">Prediction Results Table</h4>
      <div className="overflow-x-auto max-h-96">
        <table className="table-academic text-sm">
          <thead className="sticky top-0">
            <tr>
              <th>Year</th>
              <th>Original Population</th>
              <th>AI Predicted</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((p, index) => {
              const isPredictionOnly = p.actual === null;
              const diff = p.actual !== null ? p.predicted - p.actual : null;
              const diffPercent = p.actual && p.actual > 0 
                ? ((diff! / p.actual) * 100).toFixed(1) 
                : null;
              
              return (
                <tr 
                  key={p.year}
                  className={isPredictionOnly ? 'bg-secondary-light/50' : ''}
                >
                  <td className="font-mono">
                    {p.year}
                    {index === lastActualIndex && (
                      <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">
                        Prediction Start
                      </span>
                    )}
                  </td>
                  <td className="font-mono">
                    {p.actual !== null ? p.actual.toLocaleString() : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="font-mono text-secondary font-medium">
                    {p.predicted.toLocaleString()}
                  </td>
                  <td className="font-mono">
                    {diff !== null ? (
                      <span className={diff >= 0 ? 'text-secondary' : 'text-destructive'}>
                        {diff >= 0 ? '+' : ''}{diff.toLocaleString()} ({diffPercent}%)
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Future prediction</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
