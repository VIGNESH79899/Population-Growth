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
import type { PredictionResult, ChartType } from '@/types/population';

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

interface PopulationChartProps {
  predictions: PredictionResult[];
  chartType: ChartType;
  showPredictionMarker?: boolean;
}

export function PopulationChart({ predictions, chartType, showPredictionMarker = true }: PopulationChartProps) {
  const lastActualIndex = useMemo(() => {
    for (let i = predictions.length - 1; i >= 0; i--) {
      if (predictions[i].actual !== null) return i;
    }
    return 0;
  }, [predictions]);

  const chartData = useMemo(() => {
    const labels = predictions.map((p) => p.year.toString());
    
    const actualData = predictions.map((p) => p.actual);
    const predictedData = predictions.map((p) => p.predicted);

    return {
      labels,
      datasets: [
        {
          label: 'Original Data',
          data: actualData,
          borderColor: 'hsl(217, 91%, 40%)',
          backgroundColor: 'hsla(217, 91%, 40%, 0.1)',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: 'hsl(217, 91%, 40%)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: chartType === 'line',
          tension: 0.3,
          spanGaps: false,
        },
        {
          label: 'AI Predicted',
          data: predictedData,
          borderColor: 'hsl(152, 60%, 40%)',
          backgroundColor: 'hsla(152, 60%, 40%, 0.3)',
          borderWidth: 2,
          borderDash: [8, 4],
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'hsl(152, 60%, 40%)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
        },
      ],
    };
  }, [predictions, chartType]);

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
          font: {
            family: "'Source Sans 3', sans-serif",
            size: 13,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: 'hsl(222, 47%, 11%)',
        bodyColor: 'hsl(215, 20%, 45%)',
        borderColor: 'hsl(214, 32%, 91%)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          family: "'Crimson Pro', serif",
          size: 14,
          weight: 600,
        },
        bodyFont: {
          family: "'Source Sans 3', sans-serif",
          size: 13,
        },
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return value !== null ? `${label}: ${value.toLocaleString()}` : '';
          },
        },
      },
      annotation: showPredictionMarker ? {
        annotations: {
          line1: {
            type: 'line',
            xMin: lastActualIndex,
            xMax: lastActualIndex,
            borderColor: 'hsl(38, 92%, 50%)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: 'Prediction Start',
              position: 'start',
            },
          },
        },
      } : undefined,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Year',
          font: {
            family: "'Source Sans 3', sans-serif",
            size: 14,
            weight: 500,
          },
          color: 'hsl(215, 20%, 45%)',
        },
        grid: {
          color: 'hsla(214, 32%, 91%, 0.5)',
        },
        ticks: {
          font: {
            family: "'Source Sans 3', sans-serif",
            size: 12,
          },
          color: 'hsl(215, 20%, 45%)',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Population',
          font: {
            family: "'Source Sans 3', sans-serif",
            size: 14,
            weight: 500,
          },
          color: 'hsl(215, 20%, 45%)',
        },
        grid: {
          color: 'hsla(214, 32%, 91%, 0.5)',
        },
        ticks: {
          font: {
            family: "'Source Sans 3', sans-serif",
            size: 12,
          },
          color: 'hsl(215, 20%, 45%)',
          callback: (value: number) => value.toLocaleString(),
        },
      },
    },
  }), [lastActualIndex, showPredictionMarker]);

  return (
    <div className="chart-container bg-card rounded-xl border border-border p-4 md:p-6">
      {chartType === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
      
      {showPredictionMarker && (
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-primary rounded" />
            <span className="text-muted-foreground">Solid: Original Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-secondary" />
            <span className="text-muted-foreground">Dashed: Predicted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-accent rounded" />
            <span className="text-muted-foreground">Prediction Start</span>
          </div>
        </div>
      )}
    </div>
  );
}
