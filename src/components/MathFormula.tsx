import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export function MathFormula({ formula, displayMode = true, className = '' }: MathFormulaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(formula, containerRef.current, {
        displayMode,
        throwOnError: false,
        trust: true,
      });
    }
  }, [formula, displayMode]);

  return (
    <div
      ref={containerRef}
      className={`${displayMode ? 'math-block' : 'inline-block'} ${className}`}
    />
  );
}

export function FormulaExplanation() {
  return (
    <div className="space-y-6">
      <div className="card-academic">
        <h4 className="text-lg font-semibold text-foreground mb-4">
          Logistic Population Growth Model
        </h4>
        <MathFormula formula="P(n) = r \times P(n-1) \times \left(1 - \frac{P(n-1)}{K}\right)" />
        
        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-4 p-4 bg-primary-light rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <MathFormula formula="P(n)" displayMode={false} />
            </div>
            <div>
              <p className="font-medium text-foreground">Population at Year n</p>
              <p className="text-sm text-muted-foreground">
                The predicted population value at the nth time step (year)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-secondary-light rounded-lg">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <MathFormula formula="r" displayMode={false} />
            </div>
            <div>
              <p className="font-medium text-foreground">Growth Rate</p>
              <p className="text-sm text-muted-foreground">
                The intrinsic rate of population increase (typically 0.5 - 4.0)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-accent-light rounded-lg">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <MathFormula formula="K" displayMode={false} />
            </div>
            <div>
              <p className="font-medium text-foreground">Carrying Capacity</p>
              <p className="text-sm text-muted-foreground">
                Maximum sustainable population given environmental constraints
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
            <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
              <MathFormula formula="1 - \frac{P}{K}" displayMode={false} />
            </div>
            <div>
              <p className="font-medium text-foreground">Saturation Factor</p>
              <p className="text-sm text-muted-foreground">
                Limits growth as population approaches carrying capacity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
