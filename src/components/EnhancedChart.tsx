import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import type { ChartType, PredictionResult, ErrorMetrics } from '@/types/population';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EnhancedChartProps {
  predictions: PredictionResult[];
  chartType: ChartType;
  showConfidenceIntervals?: boolean;
  showErrorRegions?: boolean;
  errorMetrics?: ErrorMetrics;
}

export function EnhancedChart({ 
  predictions, 
  chartType, 
  showConfidenceIntervals = true,
  showErrorRegions = true,
  errorMetrics 
}: EnhancedChartProps) {
  const lastActualIndex = useMemo(() => {
    for (let i = predictions.length - 1; i >= 0; i--) {
      if (predictions[i].actual !== null) return i;
    }
    return -1;
  }, [predictions]);

  const chartData = useMemo(() => {
    const labels = predictions.map(p => p.year.toString());
    
    // Actual data (solid line)
    const actualData = predictions.map(p => p.actual);
    
    // Predicted data (dotted line)
    const predictedData = predictions.map(p => p.predicted);
    
    // Confidence bounds
    const confidenceLow = predictions.map(p => p.confidenceLow ?? null);
    const confidenceHigh = predictions.map(p => p.confidenceHigh ?? null);
    
    // Error data (difference between actual and predicted)
    const errorData = predictions.map(p => 
      p.actual !== null && p.error !== undefined ? p.error : null
    );

    const datasets: any[] = [];

    // Confidence interval fill (if enabled)
    if (showConfidenceIntervals && chartType === 'line') {
      datasets.push({
        label: 'Confidence Interval',
        data: confidenceHigh,
        borderColor: 'transparent',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: '+1',
        pointRadius: 0,
        order: 3
      });
      datasets.push({
        label: 'Confidence Low',
        data: confidenceLow,
        borderColor: 'rgba(34, 197, 94, 0.3)',
        borderDash: [2, 2],
        backgroundColor: 'transparent',
        pointRadius: 0,
        borderWidth: 1,
        order: 2
      });
    }

    // Predicted data
    datasets.push({
      label: 'AI Predicted',
      data: predictedData,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: chartType === 'bar' 
        ? 'rgba(34, 197, 94, 0.6)' 
        : 'rgba(34, 197, 94, 0.1)',
      borderDash: chartType === 'line' ? [5, 5] : undefined,
      borderWidth: 2,
      pointRadius: chartType === 'line' ? 3 : 0,
      pointBackgroundColor: 'rgb(34, 197, 94)',
      fill: chartType === 'line',
      tension: 0.3,
      order: 1
    });

    // Actual data
    datasets.push({
      label: 'Original Data',
      data: actualData,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: chartType === 'bar' 
        ? 'rgba(59, 130, 246, 0.8)' 
        : 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      pointRadius: chartType === 'line' ? 5 : 0,
      pointBackgroundColor: 'rgb(59, 130, 246)',
      fill: false,
      tension: 0.3,
      order: 0
    });

    return { labels, datasets };
  }, [predictions, chartType, showConfidenceIntervals]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          filter: (item: any) => !item.text.includes('Confidence Low')
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (value === null) return '';
            
            const prediction = predictions[context.dataIndex];
            let result = `${label}: ${value.toLocaleString()}`;
            
            if (label === 'AI Predicted' && prediction.error !== undefined) {
              result += ` (Error: ${prediction.error.toLocaleString()})`;
            }
            
            return result;
          },
          afterBody: function(tooltipItems: any) {
            const dataIndex = tooltipItems[0]?.dataIndex;
            if (dataIndex === undefined) return '';
            
            const prediction = predictions[dataIndex];
            const lines: string[] = [];
            
            if (prediction.confidenceLow && prediction.confidenceHigh) {
              lines.push(`Confidence: ${prediction.confidenceLow.toLocaleString()} - ${prediction.confidenceHigh.toLocaleString()}`);
            }
            
            if (dataIndex > lastActualIndex) {
              lines.push('(Future prediction)');
            }
            
            return lines;
          }
        }
      },
      annotation: {
        annotations: lastActualIndex >= 0 ? {
          predictionLine: {
            type: 'line',
            xMin: lastActualIndex,
            xMax: lastActualIndex,
            borderColor: 'rgba(251, 146, 60, 0.8)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: 'Prediction Start',
              position: 'start',
              backgroundColor: 'rgba(251, 146, 60, 0.9)',
              color: '#fff',
              font: { size: 11, weight: 'bold' }
            }
          }
        } : {}
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
          font: { weight: 'bold' as const }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Population',
          font: { weight: 'bold' as const }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value: number) {
            return value.toLocaleString();
          }
        }
      }
    }
  }), [predictions, lastActualIndex]);

  return (
    <div className="card-academic">
      <div className="h-[400px]">
        {chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>

      {/* Legend explanation */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-primary"></div>
          <span>Original Data (solid line)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-secondary border-dashed border-t-2 border-secondary"></div>
          <span>AI Predicted (dotted line)</span>
        </div>
        {showConfidenceIntervals && chartType === 'line' && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-secondary/20 rounded"></div>
            <span>Confidence Interval</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-accent border-l-2 border-dashed border-accent"></div>
          <span>Prediction Start Point</span>
        </div>
      </div>

      {/* Error metrics summary */}
      {errorMetrics && showErrorRegions && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-2">Model Fit Quality</div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className={`${errorMetrics.r2 > 0.9 ? 'text-secondary' : errorMetrics.r2 > 0.7 ? 'text-primary' : 'text-accent'}`}>
              R² = {(errorMetrics.r2 * 100).toFixed(1)}%
              {errorMetrics.r2 > 0.9 ? ' (Excellent)' : errorMetrics.r2 > 0.7 ? ' (Good)' : ' (Fair)'}
            </span>
            <span>MAPE = {errorMetrics.mape.toFixed(1)}%</span>
            <span>RMSE = {errorMetrics.rmse.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
