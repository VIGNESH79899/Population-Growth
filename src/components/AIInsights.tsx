import { TrendingUp, TrendingDown, Minus, Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import type { AIInsight, ModelParameters } from '@/types/population';

interface AIInsightsProps {
  insights: AIInsight;
  params: ModelParameters;
}

export function AIInsights({ insights, params }: AIInsightsProps) {
  const getTrendIcon = () => {
    switch (insights.growthTrend) {
      case 'exponential':
        return <TrendingUp className="w-6 h-6" />;
      case 'declining':
        return <TrendingDown className="w-6 h-6" />;
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  const getTrendColor = () => {
    switch (insights.growthTrend) {
      case 'exponential':
        return 'text-secondary bg-secondary-light border-secondary/30';
      case 'declining':
        return 'text-destructive bg-destructive/10 border-destructive/30';
      default:
        return 'text-primary bg-primary-light border-primary/30';
    }
  };

  const getRiskIcon = () => {
    switch (insights.riskLevel) {
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'low':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getRiskColor = () => {
    switch (insights.riskLevel) {
      case 'high':
        return 'text-destructive bg-destructive/10 border-destructive/30';
      case 'low':
        return 'text-secondary bg-secondary-light border-secondary/30';
      default:
        return 'text-accent bg-accent-light border-accent/30';
    }
  };

  const getConfidenceBadge = () => {
    switch (insights.confidence) {
      case 'high':
        return 'badge-high';
      case 'medium':
        return 'badge-medium';
      default:
        return 'badge-low';
    }
  };

  return (
    <div className="space-y-6">
      {/* Model Parameters Summary */}
      <div className="card-academic">
        <h4 className="text-lg font-semibold text-foreground mb-4">Estimated Model Parameters</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary-light rounded-lg">
            <p className="text-2xl font-bold font-mono text-primary">{params.r.toFixed(3)}</p>
            <p className="text-sm text-muted-foreground mt-1">Growth Rate (r)</p>
          </div>
          <div className="text-center p-4 bg-secondary-light rounded-lg">
            <p className="text-2xl font-bold font-mono text-secondary">{params.K.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Carrying Capacity (K)</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-2xl font-bold font-mono text-foreground">{params.P0.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Initial Population</p>
          </div>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Growth Trend */}
        <div className={`p-4 rounded-lg border-2 ${getTrendColor()}`}>
          <div className="flex items-center gap-3 mb-2">
            {getTrendIcon()}
            <span className="font-semibold">Growth Nature</span>
          </div>
          <p className="text-lg font-bold capitalize">{insights.growthTrend}</p>
        </div>

        {/* Risk Level */}
        <div className={`p-4 rounded-lg border-2 ${getRiskColor()}`}>
          <div className="flex items-center gap-3 mb-2">
            {getRiskIcon()}
            <span className="font-semibold">Risk Indicator</span>
          </div>
          <p className="text-lg font-bold capitalize">{insights.riskLevel}</p>
        </div>

        {/* Confidence */}
        <div className="p-4 rounded-lg border-2 border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-foreground">AI Confidence</span>
          </div>
          <span className={`badge-confidence ${getConfidenceBadge()}`}>
            {insights.confidence.toUpperCase()}
          </span>
        </div>
      </div>

      {/* AI Summary */}
      <div className="card-academic">
        <h4 className="text-lg font-semibold text-foreground mb-4">AI-Generated Dataset Summary</h4>
        <div className="space-y-3">
          {insights.summary.map((line, index) => (
            <p
              key={index}
              className="text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/30"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
