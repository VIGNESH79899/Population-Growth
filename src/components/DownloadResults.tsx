import { Download, FileText, Table } from 'lucide-react';
import type { PredictionResult, ModelParameters } from '@/types/population';
import { exportToCSV } from '@/utils/populationModel';

interface DownloadResultsProps {
  predictions: PredictionResult[];
  params: ModelParameters;
}

export function DownloadResults({ predictions, params }: DownloadResultsProps) {
  const handleDownloadCSV = () => {
    const csvContent = exportToCSV(predictions, params);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `population_predictions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card-academic">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-foreground">Download Results</h4>
          <p className="text-sm text-muted-foreground">Export predictions and model parameters</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleDownloadCSV}
          className="btn-primary flex items-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Download CSV
        </button>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
          <Table className="w-4 h-4" />
          File Contents
        </h5>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Year column</li>
          <li>• Original population values</li>
          <li>• AI-predicted population values</li>
          <li>• Model parameters (r = {params.r.toFixed(4)}, K = {params.K.toLocaleString()})</li>
        </ul>
      </div>
    </div>
  );
}
