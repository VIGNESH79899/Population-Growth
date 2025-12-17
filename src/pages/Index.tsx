import { useState } from 'react';
import { 
  TrendingUp, 
  BookOpen, 
  Calculator, 
  Database, 
  Brain, 
  BarChart3, 
  Sliders,
  Download,
  Building2,
  Leaf,
  DollarSign,
  Package,
  AlertTriangle,
  Target,
  LineChart,
  BarChart2,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { MathFormula, FormulaExplanation } from '@/components/MathFormula';
import { DataInput } from '@/components/DataInput';
import { DataValidation } from '@/components/DataValidation';
import { PopulationChart } from '@/components/PopulationChart';
import { ResultsTable } from '@/components/ResultsTable';
import { AIInsights } from '@/components/AIInsights';
import { StepByStepExplanation } from '@/components/StepByStepExplanation';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { DownloadResults } from '@/components/DownloadResults';
import { AcademicFooter } from '@/components/AcademicFooter';
import type { DataPoint, PredictionResult, ModelParameters, AIInsight, ChartType, InputMode } from '@/types/population';
import { runEnhancedPrediction } from '@/utils/populationModel';
import type { EnhancedPredictionResult } from '@/types/population';
import { EnhancedAIInsights } from '@/components/EnhancedAIInsights';
import { EnhancedChart } from '@/components/EnhancedChart';
import { SensitivityChart } from '@/components/SensitivityChart';
import { PreprocessingInfo } from '@/components/PreprocessingInfo';
import { ValidationResults } from '@/components/ValidationResults';

const Index = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [enhancedResult, setEnhancedResult] = useState<EnhancedPredictionResult | null>(null);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [yearsToPredict] = useState(5);
  const [hasPredicted, setHasPredicted] = useState(false);

  const handleDataSubmit = (newData: DataPoint[], mode: InputMode) => {
    setData(newData);
    setInputMode(mode);
    setHasPredicted(false);
    setEnhancedResult(null);
  };

  const runPrediction = () => {
    if (data.length < 2) return;

    const result = runEnhancedPrediction(data, yearsToPredict);
    setEnhancedResult(result);
    setHasPredicted(true);

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />

      {/* Hero Section */}
      <section id="home" className="section-container py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Calculator className="w-4 h-4" />
            Discrete Mathematics Project
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
            Predictive Modelling of{' '}
            <span className="gradient-text">Population Growth</span>{' '}
            Using Recurrence Relations
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            An AI-assisted platform demonstrating the practical application of logistic 
            recurrence relations for predicting population dynamics with interactive visualizations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#data-input" className="btn-primary inline-flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Start Prediction
            </a>
            <a href="#theory" className="btn-outline inline-flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Learn Theory
            </a>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section id="introduction" className="section-container bg-card py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center">Introduction</h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto">
            Understanding population growth and its prediction for sustainable planning
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="card-academic text-center animate-fade-up">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Population Growth</h3>
              <p className="text-muted-foreground text-sm">
                The increase in the number of individuals in a population over time, 
                influenced by birth rates, death rates, and migration patterns.
              </p>
            </div>

            <div className="card-academic text-center animate-fade-up delay-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Target className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Prediction Importance</h3>
              <p className="text-muted-foreground text-sm">
                Accurate population predictions enable governments and organizations 
                to plan infrastructure, resources, and services effectively.
              </p>
            </div>

            <div className="card-academic text-center animate-fade-up delay-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center">
                <Brain className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI-Assisted Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Machine learning techniques optimize model parameters and provide 
                intelligent insights from historical data patterns.
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-primary-light rounded-xl border border-primary/20">
            <h4 className="font-semibold text-lg mb-4 text-primary">Real-World Applications</h4>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Building2, label: 'Urban Planning' },
                { icon: Leaf, label: 'Environment Studies' },
                { icon: DollarSign, label: 'Economic Forecasting' },
                { icon: Package, label: 'Resource Management' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-card rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Theory Section */}
      <section id="theory" className="section-container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center">Theory: Recurrence Relations</h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto">
            Mathematical foundations of population growth modeling
          </p>

          <div className="mt-8 space-y-8">
            <div className="card-academic">
              <h3 className="text-xl font-semibold mb-4">What are Recurrence Relations?</h3>
              <p className="text-muted-foreground leading-relaxed">
                A <strong className="text-foreground">recurrence relation</strong> is an equation that defines a sequence 
                where each term is a function of the preceding terms. In population modeling, 
                this allows us to predict future population values based on current and past data, 
                capturing the dynamic nature of population changes over time.
              </p>
            </div>

            <FormulaExplanation />

            <div className="card-academic bg-secondary-light border-secondary/20">
              <h4 className="font-semibold text-secondary mb-3">Key Insight: The Saturation Effect</h4>
              <p className="text-muted-foreground">
                Unlike simple exponential growth, the logistic model accounts for 
                <strong className="text-foreground"> environmental carrying capacity</strong>. As population 
                approaches K, the growth rate naturally decreases due to resource limitations, 
                competition, and other environmental factors. This creates the characteristic 
                S-shaped (sigmoid) growth curve observed in real populations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Input Section */}
      <section id="data-input" className="section-container bg-card py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center">Data Input & Upload</h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto">
            Choose your preferred method to input population data
          </p>

          <div className="mt-8">
            <DataInput onDataSubmit={handleDataSubmit} />
          </div>

          {/* Data Validation */}
          {data.length > 0 && (
            <div className="mt-8 animate-fade-in">
              <DataValidation data={data} />

              <div className="mt-6 text-center">
                <button 
                  onClick={runPrediction}
                  className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
                >
                  <Brain className="w-6 h-6" />
                  Run AI Prediction Engine
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      {hasPredicted && enhancedResult && (
        <>
          <section id="prediction" className="section-container py-16">
            <div className="max-w-5xl mx-auto">
              <h2 className="section-title text-center">AI Prediction Engine</h2>
              <p className="section-subtitle text-center">
                Enhanced model with data-driven optimization and validation
              </p>

              <div className="mt-8 space-y-8">
                <PreprocessingInfo preprocessing={enhancedResult.preprocessing} />
                <EnhancedAIInsights 
                  insights={enhancedResult.insights} 
                  params={enhancedResult.params}
                  errorMetrics={enhancedResult.errorMetrics}
                  validation={enhancedResult.validation}
                  saturation={enhancedResult.saturation}
                />
                <ValidationResults validation={enhancedResult.validation} />
                <SensitivityChart 
                  sensitivity={enhancedResult.sensitivity}
                  currentR={enhancedResult.params.r}
                  currentK={enhancedResult.params.K}
                />
                <StepByStepExplanation steps={enhancedResult.steps} />
              </div>
            </div>
          </section>

          <section id="results" className="section-container bg-card py-16">
            <div className="max-w-5xl mx-auto">
              <h2 className="section-title text-center">Results & Visualization</h2>
              <p className="section-subtitle text-center">
                Compare original data with AI-predicted population trends
              </p>

              <div className="flex justify-center gap-2 mb-8">
                <button
                  onClick={() => setChartType('line')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    chartType === 'line' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <LineChart className="w-5 h-5" />
                  Line Chart
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <BarChart2 className="w-5 h-5" />
                  Bar Chart
                </button>
              </div>

              <div className="space-y-8">
                <EnhancedChart 
                  predictions={enhancedResult.predictions} 
                  chartType={chartType}
                  errorMetrics={enhancedResult.errorMetrics}
                />
                <ResultsTable predictions={enhancedResult.predictions} />
              </div>
            </div>
          </section>

          <section id="simulator" className="section-container py-16">
            <div className="max-w-5xl mx-auto">
              <h2 className="section-title text-center">What-If Simulator</h2>
              <p className="section-subtitle text-center">
                Explore how parameter changes affect population predictions
              </p>
              <div className="mt-8">
                <WhatIfSimulator 
                  baseParams={enhancedResult.params} 
                  data={data} 
                  yearsToPredict={yearsToPredict} 
                />
              </div>
            </div>
          </section>

          <section className="section-container bg-card py-16">
            <div className="max-w-4xl mx-auto">
              <DownloadResults predictions={enhancedResult.predictions} params={enhancedResult.params} />
            </div>
          </section>
        </>
      )}

      {/* Applications Section */}
      <section id="applications" className="section-container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center">Applications</h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto">
            Real-world applications of population prediction models
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mt-8">
            {[
              {
                icon: Building2,
                title: 'Urban Planning',
                description: 'Planning cities, transportation networks, housing, and public services based on projected population growth.',
                color: 'primary'
              },
              {
                icon: Leaf,
                title: 'Environmental Studies',
                description: 'Assessing environmental impact, wildlife conservation, and ecosystem management.',
                color: 'secondary'
              },
              {
                icon: DollarSign,
                title: 'Economics',
                description: 'Labor market projections, consumer demand forecasting, and economic policy planning.',
                color: 'accent'
              },
              {
                icon: Package,
                title: 'Resource Management',
                description: 'Allocating food, water, energy, and healthcare resources for future populations.',
                color: 'primary'
              }
            ].map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="card-academic animate-fade-up">
                <div className={`w-12 h-12 rounded-lg bg-${color}/10 flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${color}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Limitations Section */}
      <section className="section-container bg-card py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center flex items-center justify-center gap-3">
            <AlertTriangle className="w-8 h-8 text-accent" />
            Limitations
          </h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto">
            Important considerations when using this model
          </p>

          <div className="mt-8 space-y-4">
            {[
              'Assumes constant growth rate (r) which may not reflect real-world variations',
              'Does not account for migration patterns (immigration/emigration)',
              'Cannot predict sudden disasters, pandemics, or policy changes',
              'Carrying capacity (K) estimation depends heavily on historical data quality',
              'AI prediction accuracy improves with more historical data points'
            ].map((limitation, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 bg-accent-light rounded-lg border border-accent/20"
              >
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent font-bold">{index + 1}</span>
                </div>
                <p className="text-muted-foreground">{limitation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conclusion Section */}
      <section id="conclusion" className="section-container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center">Conclusion</h2>
          
          <div className="mt-8 space-y-6">
            <div className="card-academic">
              <h3 className="text-xl font-semibold mb-4">Summary of Findings</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This project demonstrates the powerful application of <strong className="text-foreground">logistic recurrence relations</strong> in 
                predicting population growth patterns. By combining mathematical modeling with AI-assisted 
                parameter estimation, we achieve accurate and explainable predictions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The logistic model captures the essential dynamics of population growth, including the 
                saturation effect that occurs as populations approach their environmental carrying capacity.
              </p>
            </div>

            <div className="card-academic bg-secondary-light border-secondary/20">
              <h3 className="text-xl font-semibold text-secondary mb-4">Future Scope</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronDown className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  Integration with real-time data sources for dynamic predictions
                </li>
                <li className="flex items-start gap-2">
                  <ChevronDown className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  Implementation of advanced models (age-structured, spatial models)
                </li>
                <li className="flex items-start gap-2">
                  <ChevronDown className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  Machine learning for automatic model selection and hyperparameter tuning
                </li>
                <li className="flex items-start gap-2">
                  <ChevronDown className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  Multi-species interaction models for ecosystem analysis
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* References Section */}
      <section className="section-container bg-card py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center">References</h2>
          
          <div className="mt-8 space-y-4">
            <div className="card-academic">
              <h4 className="font-semibold mb-4">Textbooks & Academic Sources</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                  Rosen, K. H. (2019). <em>Discrete Mathematics and Its Applications</em>. McGraw-Hill Education.
                </li>
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                  Kreyszig, E. (2011). <em>Advanced Engineering Mathematics</em>. John Wiley & Sons.
                </li>
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                  Murray, J. D. (2002). <em>Mathematical Biology I: An Introduction</em>. Springer.
                </li>
              </ul>
            </div>

            <div className="card-academic">
              <h4 className="font-semibold mb-4">Research Papers</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li className="flex items-start gap-2">
                  <ExternalLink className="w-4 h-4 text-secondary flex-shrink-0 mt-1" />
                  Verhulst, P. F. (1838). "Notice sur la loi que la population suit dans son accroissement." <em>Correspondance Mathématique et Physique</em>.
                </li>
                <li className="flex items-start gap-2">
                  <ExternalLink className="w-4 h-4 text-secondary flex-shrink-0 mt-1" />
                  May, R. M. (1976). "Simple mathematical models with very complicated dynamics." <em>Nature</em>.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <AcademicFooter />
    </div>
  );
};

export default Index;
