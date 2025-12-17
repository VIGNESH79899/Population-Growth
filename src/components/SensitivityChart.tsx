import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { SensitivityAnalysis } from '@/types/population';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SensitivityChartProps {
  sensitivity: SensitivityAnalysis;
  currentR: number;
  currentK: number;
}

export function SensitivityChart({ sensitivity, currentR, currentK }: SensitivityChartProps) {
  const rChartData = useMemo(() => ({
    labels: sensitivity.rSensitivity.map(s => s.value.toFixed(3)),
    datasets: [
      {
        label: 'MSE vs Growth Rate (r)',
        data: sensitivity.rSensitivity.map(s => s.mse),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 2,
        pointBackgroundColor: sensitivity.rSensitivity.map(s => 
          Math.abs(s.value - currentR) < 0.05 ? 'rgb(251, 146, 60)' : 'rgb(59, 130, 246)'
        ),
        pointBorderColor: sensitivity.rSensitivity.map(s => 
          Math.abs(s.value - currentR) < 0.05 ? 'rgb(251, 146, 60)' : 'rgb(59, 130, 246)'
        ),
        pointRadius: sensitivity.rSensitivity.map(s => 
          Math.abs(s.value - currentR) < 0.05 ? 8 : 4
        ),
        tension: 0.3
      }
    ]
  }), [sensitivity.rSensitivity, currentR]);

  const kChartData = useMemo(() => ({
    labels: sensitivity.kSensitivity.map(s => (s.value / 1000).toFixed(1) + 'K'),
    datasets: [
      {
        label: 'MSE vs Carrying Capacity (K)',
        data: sensitivity.kSensitivity.map(s => s.mse),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderWidth: 2,
        pointBackgroundColor: sensitivity.kSensitivity.map(s => 
          Math.abs(s.value - currentK) / currentK < 0.1 ? 'rgb(251, 146, 60)' : 'rgb(34, 197, 94)'
        ),
        pointBorderColor: sensitivity.kSensitivity.map(s => 
          Math.abs(s.value - currentK) / currentK < 0.1 ? 'rgb(251, 146, 60)' : 'rgb(34, 197, 94)'
        ),
        pointRadius: sensitivity.kSensitivity.map(s => 
          Math.abs(s.value - currentK) / currentK < 0.1 ? 8 : 4
        ),
        tension: 0.3
      }
    ]
  }), [sensitivity.kSensitivity, currentK]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12
      }
    },
    scales: {
      y: {
        title: { display: true, text: 'Mean Squared Error', font: { size: 11 } },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: { grid: { color: 'rgba(0, 0, 0, 0.05)' } }
    }
  };

  return (
    <div className="card-academic">
      <h3 className="text-lg font-semibold mb-4">Sensitivity Analysis</h3>
      <p className="text-sm text-muted-foreground mb-6">
        These charts show how prediction error changes with different parameter values. 
        The orange point indicates the selected optimal value.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2 text-primary">Growth Rate (r) Sensitivity</h4>
          <div className="h-[200px]">
            <Line data={rChartData} options={chartOptions} />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Stable zone: r ∈ [{sensitivity.stableZone.rMin.toFixed(3)}, {sensitivity.stableZone.rMax.toFixed(3)}]
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2 text-secondary">Carrying Capacity (K) Sensitivity</h4>
          <div className="h-[200px]">
            <Line data={kChartData} options={chartOptions} />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Stable zone: K ∈ [{sensitivity.stableZone.kMin.toLocaleString()}, {sensitivity.stableZone.kMax.toLocaleString()}]
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 bg-primary-light rounded-lg">
        <div className="text-sm font-medium mb-2">Optimal Parameters Found:</div>
        <div className="flex gap-6 text-sm">
          <span>Optimal r = <strong>{sensitivity.optimalR.toFixed(4)}</strong></span>
          <span>Optimal K = <strong>{sensitivity.optimalK.toLocaleString()}</strong></span>
        </div>
      </div>
    </div>
  );
}
