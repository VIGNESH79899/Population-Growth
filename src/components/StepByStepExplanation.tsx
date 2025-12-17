import { MathFormula } from './MathFormula';

interface StepByStepExplanationProps {
  steps: string[];
}

export function StepByStepExplanation({ steps }: StepByStepExplanationProps) {
  return (
    <div className="card-academic">
      <h4 className="text-lg font-semibold text-foreground mb-4">Step-by-Step Calculation</h4>
      
      <div className="mb-6 p-4 bg-primary-light rounded-lg border border-primary/20">
        <p className="font-medium text-foreground mb-2">Recurrence Relation Used:</p>
        <MathFormula formula="P(n) = r \times P(n-1) \times \left(1 - \frac{P(n-1)}{K}\right)" />
      </div>

      <div className="space-y-2 font-mono text-sm">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`${
              step === '' ? 'h-2' : 
              step.startsWith('Year') ? 'font-semibold text-primary mt-4 text-base' :
              step.startsWith('Starting') || step.startsWith('Using') ? 'text-muted-foreground italic' :
              step.startsWith('P(') ? 'pl-4 text-foreground' :
              'text-muted-foreground'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-secondary-light rounded-lg border border-secondary/20">
        <p className="text-sm text-secondary">
          <strong>AI Reasoning:</strong> The logistic model accounts for resource limitations by 
          reducing growth rate as population approaches the carrying capacity K. This creates the 
          characteristic S-shaped (sigmoid) curve observed in many natural populations.
        </p>
      </div>
    </div>
  );
}
