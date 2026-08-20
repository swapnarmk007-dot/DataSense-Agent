export type DataType = 'numerical' | 'categorical' | 'datetime' | 'boolean' | 'text';

export type NavTab =
  | 'dashboard'
  | 'upload'
  | 'chat'
  | 'profile'
  | 'clean'
  | 'visualize'
  | 'anomalies'
  | 'forecast'
  | 'insights'
  | 'report'
  | 'codebase';

export interface ColumnProfile {
  name: string;
  type: DataType;
  rawType: string;
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  sampleValues: (string | number | boolean)[];
  min?: number | string;
  max?: number | string;
  mean?: number;
  std?: number;
  median?: number;
  q25?: number;
  q75?: number;
  iqr?: number;
  skewness?: number;
  outliersCount?: number;
  mode?: string | number;
}

export interface DatasetProfile {
  name: string;
  rowCount: number;
  columnCount: number;
  columns: ColumnProfile[];
  missingTotal: number;
  missingPercentage: number;
  duplicateCount: number;
  duplicatePercentage: number;
  dataQualityScore: number; // 0 - 100
  numericalColumns: string[];
  categoricalColumns: string[];
  dateColumns: string[];
  memorySizeKB: number;
  createdAt: string;
}

export interface CleaningLog {
  id: string;
  title: string;
  description: string;
  type: 'standardize_text' | 'remove_duplicates' | 'impute_missing' | 'convert_types' | 'clip_outliers' | 'custom';
  affectedColumns: string[];
  recordsAffected: number;
  beforeMetric: string;
  afterMetric: string;
  timestamp: string;
}

export type DataCleaningLog = CleaningLog;

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'box' | 'heatmap' | 'area';
  title: string;
  xAxis: string;
  yAxis: string;
  categoryAxis?: string;
  aggregation?: 'sum' | 'mean' | 'count' | 'median' | 'min' | 'max';
  data: any[];
  layout?: Record<string, any>;
  description?: string;
}

export type AgentRole =
  | 'coordinator'
  | 'profiler'
  | 'cleaner'
  | 'analyst'
  | 'visualizer'
  | 'statistics'
  | 'anomaly'
  | 'forecasting'
  | 'insight'
  | 'report';

export interface AgentStep {
  id: string;
  agent: AgentRole | string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  action: string;
  tool?: string;
  toolInput?: Record<string, any>;
  toolResult?: any;
  durationMs: number;
  explanation?: string;
}

export type MultiAgentTraceStep = AgentStep;

export interface AnalysisResponse {
  question: string;
  intent: string;
  plan: string[];
  steps: AgentStep[];
  answer: string;
  numericalEvidence: Record<string, any>;
  supportingTable?: any[];
  chart?: ChartConfig;
  insights: string[];
  recommendations: string[];
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: string;
  steps?: AgentStep[];
  chart?: ChartConfig;
  tableData?: any[];
  numericalEvidence?: Record<string, any>;
  insights?: string[];
  recommendations?: string[];
  isProcessing?: boolean;
}

export interface AnomalyItem {
  id: string;
  rowIndex: number;
  record: Record<string, any>;
  column: string;
  value: number;
  expectedMin: number;
  expectedMax: number;
  deviationScore: number;
  method: 'IQR' | 'Z-Score' | 'Isolation Forest';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

export type AnomalyRecord = AnomalyItem;

export interface ForecastPoint {
  date: string;
  actual?: number;
  predicted?: number;
  lowerBound?: number;
  upperBound?: number;
}

export interface ForecastResult {
  dateColumn: string;
  metricColumn: string;
  frequency: 'monthly' | 'daily' | 'weekly';
  modelUsed: 'Holt-Winters Moving Average' | 'Linear Regression Trend' | 'Prophet-like Decomposition';
  historyPoints: ForecastPoint[];
  forecastPoints: ForecastPoint[];
  growthRatePct: number;
  summary: {
    historicalTotal: number;
    projectedTotal: number;
    highestProjectedPeriod: string;
    trendDirection: 'upward' | 'downward' | 'stable';
  };
}

export interface ExecutiveReport {
  title: string;
  author: string;
  role: string;
  company: string;
  generatedAt: string;
  datasetName: string;
  executiveSummary: string;
  dataHealthOverview: {
    totalRecords: number;
    totalFeatures: number;
    qualityScore: number;
    missingPct: number;
    duplicates: number;
  };
  keyFindings: {
    category: string;
    finding: string;
    impact: 'High' | 'Medium' | 'Low';
  }[];
  topInsights: string[];
  risksAndVulnerabilities: string[];
  strategicRecommendations: string[];
  statisticalHighlights: {
    metric: string;
    value: string;
    context: string;
  }[];
}
