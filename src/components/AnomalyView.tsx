import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Sliders,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { AnomalyRecord, DatasetProfile } from '../types';
import { detectAnomaliesIQR } from '../utils/dataEngine';

interface AnomalyViewProps {
  data: Record<string, any>[];
  profile: DatasetProfile | null;
}

export const AnomalyView: React.FC<AnomalyViewProps> = ({ data, profile }) => {
  if (!profile || data.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto">
        <p className="text-sm text-slate-500">Please load a dataset to detect statistical anomalies.</p>
      </div>
    );
  }

  const numCols = profile.numericalColumns;
  const [selectedCol, setSelectedCol] = useState<string>(numCols[0] || '');
  const [threshold, setThreshold] = useState<number>(1.5);

  const anomalies: AnomalyRecord[] = selectedCol ? detectAnomaliesIQR(data, selectedCol, threshold) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
              Anomaly Detection Agent
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Statistical Anomaly & Outlier Detection</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Uses Tukey's Interquartile Range (IQR) and Z-Score deviations to pinpoint unusual business patterns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Feature</label>
            <select
              value={selectedCol}
              onChange={(e) => setSelectedCol(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              {numCols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">IQR Multiplier ({threshold}x)</label>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-24 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Flagged Anomalies</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{anomalies.length}</p>
          <p className="text-xs text-slate-400 mt-1">out of {data.length} records</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Critical Severity</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            {anomalies.filter((a) => a.severity === 'high').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">&gt; 3.0 IQR distance</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Method</p>
          <p className="text-xl font-bold text-slate-800 mt-1">Tukey's IQR & Z-Score</p>
          <p className="text-xs text-slate-400 mt-1">100% deterministic</p>
        </div>
      </div>

      {/* Anomaly Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Detected Outlier Records ({selectedCol})</h3>
          <span className="text-xs text-slate-400 font-medium">{anomalies.length} instances flagged</span>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-8 text-center bg-slate-50">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No anomalies detected in '{selectedCol}'</p>
            <p className="text-[11px] text-slate-400">All data points fall within the expected statistical boundaries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Row Index</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Expected Bounds</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {anomalies.map((a, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">#{a.rowIndex}</td>
                    <td className="px-4 py-3 font-mono font-black text-rose-600">
                      {a.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      [{a.expectedMin.toLocaleString()} &ndash; {a.expectedMax.toLocaleString()}]
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          a.severity === 'high'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600">{a.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
