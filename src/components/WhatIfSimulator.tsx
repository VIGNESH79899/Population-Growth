import { useState } from 'react';
import { Sliders, Zap, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import type { ModelParameters, DataPoint } from '@/types/population';
import { generatePredictions } from '@/utils/populationModel';
import { PopulationChart } from './PopulationChart';

interface WhatIfSimulatorProps {
  baseParams: ModelParameters;
  data: DataPoint[];
  yearsToPredict: number;
}

export function WhatIfSimulator({ baseParams, data, yearsToPredict }: WhatIfSimulatorProps) {
  const [adjustedR, setAdjustedR] = useState(baseParams.r);
  const [populationShock, setPopulationShock] = useState(0);
  const [shockYear, setShockYear] = useState(Math.floor(yearsToPredict / 2));

  const resetSimulation = () => {
    setAdjustedR(baseParams.r);
    setPopulationShock(0);
    setShockYear(Math.floor(yearsToPredict / 2));
  };

  // Apply shock to predictions
  const simulatedPredictions = (() => {
    const adjustedParams = { ...baseParams, r: adjustedR };
    let predictions = generatePredictions(data, adjustedParams, yearsToPredict);
    
    if (populationShock !== 0) {
      predictions = predictions.map((p, index) => {
        if (index >= shockYear) {
          const shockMultiplier = 1 + populationShock / 100;
          return {
            ...p,
            predicted: Math.round(p.predicted * (index === shockYear ? shockMultiplier : 1)),
          };
        }
        return p;
      });
    }
    
    return predictions;
  })();

  const rChange = ((adjustedR - baseParams.r) / baseParams.r * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="card-academic">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Interactive Simulator</h4>
              <p className="text-sm text-muted-foreground">Adjust parameters to see real-time changes</p>
            </div>
          </div>
          <button
            onClick={resetSimulation}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Growth Rate Adjustment */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium text-foreground">Growth Rate (r)</label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {adjustedR.toFixed(3)}
                {parseFloat(rChange) !== 0 && (
                  <span className={parseFloat(rChange) > 0 ? 'text-secondary' : 'text-destructive'}>
                    {' '}({parseFloat(rChange) > 0 ? '+' : ''}{rChange}%)
                  </span>
                )}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.05"
              value={adjustedR}
              onChange={(e) => setAdjustedR(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow (0.5)</span>
              <span>Base ({baseParams.r.toFixed(2)})</span>
              <span>Fast (4.0)</span>
            </div>
          </div>

          {/* Population Shock */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium text-foreground">Population Shock Event</label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {populationShock > 0 ? '+' : ''}{populationShock}%
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={populationShock}
              onChange={(e) => setPopulationShock(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Decline
              </span>
              <span>No Change</span>
              <span className="flex items-center gap-1">
                Boom <TrendingUp className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {populationShock !== 0 && (
          <div className="mt-4 p-4 bg-accent-light rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium text-foreground">
                  {populationShock > 0 ? 'Population Boom' : 'Population Decline'} Simulated
                </p>
                <p className="text-sm text-muted-foreground">
                  A {Math.abs(populationShock)}% {populationShock > 0 ? 'increase' : 'decrease'} event is applied to the prediction model
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <PopulationChart predictions={simulatedPredictions} chartType="line" />
    </div>
  );
}
