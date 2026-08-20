import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { DatasetProfile } from '../types';
import { forecastTimeSeries } from '../utils/dataEngine';

interface ForecastingViewProps {
  data: Record<string, any>[];
  profile: DatasetProfile | null;
}

export const ForecastingView: React.FC<ForecastingViewProps> = ({ data, profile }) => {
  if (!profile || data.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto">
        <p className="text-sm text-slate-500">Please load a dataset with date and metric features.</p>
      </div>
    );
  }

  const dateCols = profile.dateColumns.length > 0 ? profile.dateColumns : Object.keys(data[0] || {}).filter((k) => k.toLowerCase().includes('date') || k.toLowerCase().includes('time'));
  const numCols = profile.numericalColumns;

  const [selectedDateCol, setSelectedDateCol] = useState<string>(dateCols[0] || Object.keys(data[0] || {})[0]);
  const [selectedMetricCol, setSelectedMetricCol] = useState<string>(numCols[0] || Object.keys(data[0] || {})[1]);
  const [periods, setPeriods] = useState<number>(4);

  const forecast =
    selectedDateCol && selectedMetricCol ? forecastTimeSeries(data, selectedDateCol, selectedMetricCol, periods) : null;


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-200">
              Forecasting Agent
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Time-Series Trend & Predictive Projections</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Extracts seasonality and calculates forward horizons with 95% statistical confidence intervals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Date Attribute</label>
            <select
              value={selectedDateCol}
              onChange={(e) => setSelectedDateCol(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800"
            >
              {Object.keys(data[0] || {}).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Metric</label>
            <select
              value={selectedMetricCol}
              onChange={(e) => setSelectedMetricCol(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800"
            >
              {numCols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Horizon</label>
            <select
              value={periods}
              onChange={(e) => setPeriods(parseInt(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800"
            >
              <option value={3}>3 Periods</option>
              <option value={4}>4 Periods</option>
              <option value={6}>6 Periods</option>
            </select>
          </div>
        </div>
      </div>

      {forecast ? (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500">Projected Cumulative</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                ${forecast.projectedTotal.toLocaleString()}
              </p>
              <p className="text-xs text-purple-600 font-medium mt-1">Next {periods} periods</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500">Historical Total</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                ${forecast.historicalTotal.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">{forecast.historical.length} periods recorded</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500">Trend Trajectory</p>
              <div className="flex items-center gap-1.5 mt-1">
                {forecast.trendDirection === 'upward' ? (
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                ) : forecast.trendDirection === 'downward' ? (
                  <ArrowDownRight className="w-5 h-5 text-rose-600" />
                ) : (
                  <Minus className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-xl font-bold uppercase text-slate-900">{forecast.trendDirection}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500">Estimated Velocity</p>
              <p className="text-xl font-extrabold text-blue-600 mt-1">{forecast.growthRatePct}%</p>
              <p className="text-xs text-slate-400 mt-1">Period-over-period</p>
            </div>
          </div>

          {/* Forecast Table & Horizon */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Forward Projections with 95% Confidence Bounds</h3>
              <span className="text-xs text-purple-600 font-semibold">{periods}-Step Horizon</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Future Period</th>
                    <th className="px-4 py-3">Projected Baseline</th>
                    <th className="px-4 py-3">Lower Bound (95% CI)</th>
                    <th className="px-4 py-3">Upper Bound (95% CI)</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {forecast.forecast.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{f.period}</td>
                      <td className="px-4 py-3 font-mono font-bold text-purple-600 text-sm">
                        ${f.forecast.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        ${f.lowerBound.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        ${f.upperBound.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold">
                          Projected
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">Select a valid date column with chronological entries.</p>
        </div>
      )}
    </div>
  );
};
