import React from 'react';
import {
  Database,
  Columns,
  AlertCircle,
  Copy,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  BarChart3,
  Bot
} from 'lucide-react';
import { DatasetProfile, NavTab } from '../types';

interface DashboardViewProps {
  profile: DatasetProfile | null;
  datasetName: string;
  data: Record<string, any>[];
  setActiveTab: (tab: NavTab) => void;
  onAskQuestion: (q: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  datasetName,
  data,
  setActiveTab,
  onAskQuestion
}) => {
  if (!profile || data.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12">
        <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">No Dataset Loaded</h3>
        <p className="text-sm text-slate-500 mb-6">
          Upload your CSV or Excel data or load the pre-configured sample sales dataset to start autonomous multi-agent analysis.
        </p>
        <button
          onClick={() => setActiveTab('upload')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-xs"
        >
          Go to Upload Dataset <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const sampleCols = Object.keys(data[0] || {});
  const previewRows = data.slice(0, 6);

  const sampleQuestions = [
    'Which product generated the highest sales volume?',
    'What is the total revenue by region?',
    'Identify anomalies in transaction profitability.',
    'Forecast sales for the next 3 months.',
  ];

  return (
    <div className="space-y-6">
      {/* Platform Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-semibold text-blue-200">
              <Bot className="w-3.5 h-3.5" /> LangGraph Multi-Agent Engine Active
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Autonomous Data Analyst Ready</h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              DataSense Agent has parsed <span className="font-semibold text-white">{datasetName}</span>. 
              Ask natural language questions or explore the automated profiling, cleaning, anomaly detection, and forecasting modules.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" /> Open AI Chat
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-all border border-white/20 flex items-center gap-1.5"
            >
              Generate Audit Report
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Records</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{profile.rowCount.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">100% active memory</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Columns</span>
            <Columns className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{profile.columnCount}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {profile.numericalColumns.length} num &bull; {profile.categoricalColumns.length} cat
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Missing Cells</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{profile.missingTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">{profile.missingPercentage}% null rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Duplicates</span>
            <Copy className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{profile.duplicateCount}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">{profile.duplicatePercentage}% duplicate rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Data Quality</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900">{profile.dataQualityScore}%</p>
            <span className={`text-xs font-bold ${profile.dataQualityScore > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {profile.dataQualityScore > 80 ? 'High' : 'Moderate'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${profile.dataQualityScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${profile.dataQualityScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Suggested Autonomous Questions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Suggested Autonomous Analytical Prompts</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onAskQuestion(q)}
              className="p-3 text-left rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all text-xs font-medium text-slate-700 flex flex-col justify-between group"
            >
              <span>{q}</span>
              <span className="text-[11px] text-blue-600 font-semibold mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Run Agentic Query <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Data Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Dataset Sample Preview</h3>
            <p className="text-xs text-slate-500">Showing first {previewRows.length} rows of {profile.rowCount.toLocaleString()} records</p>
          </div>
          <button
            onClick={() => setActiveTab('profile')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            Full Profile View <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
              <tr>
                {sampleCols.map((c) => (
                  <th key={c} className="px-4 py-3 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {previewRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  {sampleCols.map((c) => (
                    <td key={c} className="px-4 py-2.5 whitespace-nowrap font-mono text-[11px]">
                      {row[c] !== null && row[c] !== undefined ? String(row[c]) : <span className="text-slate-300 italic">null</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
