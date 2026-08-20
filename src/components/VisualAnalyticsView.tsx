import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  ScatterChart as ScatterIcon,
  Sliders,
  Sparkles
} from 'lucide-react';
import { DatasetProfile } from '../types';

interface VisualAnalyticsViewProps {
  data: Record<string, any>[];
  profile: DatasetProfile | null;
}

export const VisualAnalyticsView: React.FC<VisualAnalyticsViewProps> = ({ data, profile }) => {
  if (!profile || data.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto">
        <p className="text-sm text-slate-500">Please load a dataset to configure custom visualizations.</p>
      </div>
    );
  }

  const numCols = profile.numericalColumns;
  const catCols = profile.categoricalColumns.length > 0 ? profile.categoricalColumns : Object.keys(data[0] || {});

  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [xAxis, setXAxis] = useState<string>(catCols[0] || Object.keys(data[0] || {})[0]);
  const [yAxis, setYAxis] = useState<string>(numCols[0] || Object.keys(data[0] || {})[1] || Object.keys(data[0] || {})[0]);
  const [aggType, setAggType] = useState<'sum' | 'mean' | 'count'>('sum');

  // Compute aggregated data
  const aggregatedData = useMemo(() => {
    const groups: Record<string, { sum: number; count: number }> = {};

    data.forEach((row) => {
      const key = String(row[xAxis] ?? 'N/A');
      const val = typeof row[yAxis] === 'number' ? row[yAxis] : parseFloat(row[yAxis]) || 0;

      if (!groups[key]) {
        groups[key] = { sum: 0, count: 0 };
      }
      groups[key].sum += val;
      groups[key].count += 1;
    });

    const result = Object.entries(groups).map(([k, v]) => {
      const computedVal =
        aggType === 'sum' ? v.sum : aggType === 'mean' ? v.sum / (v.count || 1) : v.count;
      return {
        category: k,
        value: Math.round(computedVal * 100) / 100,
      };
    });

    return result.sort((a, b) => b.value - a.value).slice(0, 15);
  }, [data, xAxis, yAxis, aggType]);

  const maxValue = Math.max(...aggregatedData.map((d) => d.value), 1);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                Visualization Agent
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Visual Analytics Studio</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive multi-dimensional charting powered by deterministic grouping algorithms.
            </p>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chartType === 'bar' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chartType === 'line' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Line
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chartType === 'pie' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>

        {/* Feature Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Group By (X-Axis)</label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              {profile.columns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Aggregate Metric (Y-Axis)</label>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              {numCols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Aggregation Function</label>
            <select
              value={aggType}
              onChange={(e) => setAggType(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="sum">SUM (Total Value)</option>
              <option value="mean">MEAN (Average Value)</option>
              <option value="count">COUNT (Frequency)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart Visualization Area */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {aggType.toUpperCase()} of {yAxis} grouped by {xAxis}
          </h3>
          <span className="text-xs text-slate-400 font-mono">Top {aggregatedData.length} records</span>
        </div>

        {/* Custom High-Precision CSS Visual Chart */}
        <div className="space-y-3 pt-2">
          {aggregatedData.map((item, idx) => {
            const pct = Math.max(2, (item.value / maxValue) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                  <span className="truncate max-w-xs">{item.category}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {item.value.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                  <div
                    className="h-3 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
