import React from 'react';
import {
  TableProperties,
  Hash,
  Type,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { DatasetProfile } from '../types';

interface ProfileViewProps {
  profile: DatasetProfile | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile }) => {
  if (!profile) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto">
        <p className="text-sm text-slate-500">Please load a dataset to view structural data profiling.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Quality Score */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
              Profiler Agent Audit
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs font-semibold text-slate-700">{profile.name}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Dataset Profile & Health Summary</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated evaluation of statistical moments, null distributions, and type inference.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-600">Data Quality Score</p>
            <p className="text-2xl font-black text-slate-900">{profile.dataQualityScore}/100</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-white shadow-xs font-bold text-xs text-emerald-700">
            {profile.dataQualityScore}%
          </div>
        </div>
      </div>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Total Rows</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{profile.rowCount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Total Columns</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{profile.columnCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Missing Cells</p>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{profile.missingTotal.toLocaleString()} ({profile.missingPercentage}%)</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Duplicate Records</p>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{profile.duplicateCount} ({profile.duplicatePercentage}%)</p>
        </div>
      </div>

      {/* Detailed Columns Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Attribute Schema & Statistical Moments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Column Name</th>
                <th className="px-4 py-3">Inferred Type</th>
                <th className="px-4 py-3">Null %</th>
                <th className="px-4 py-3">Unique</th>
                <th className="px-4 py-3">Min / Mode</th>
                <th className="px-4 py-3">Median / Mean</th>
                <th className="px-4 py-3">Max</th>
                <th className="px-4 py-3">Outliers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {profile.columns.map((col) => (
                <tr key={col.name} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    {col.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        col.type === 'numerical'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : col.type === 'datetime'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {col.type === 'numerical' ? <Hash className="w-3 h-3" /> : col.type === 'datetime' ? <Calendar className="w-3 h-3" /> : <Type className="w-3 h-3" />}
                      {col.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={col.nullPercentage > 0 ? 'text-amber-600 font-semibold' : 'text-slate-500'}>
                      {col.nullPercentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono whitespace-nowrap">{col.uniqueCount}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {col.min !== undefined ? col.min.toLocaleString() : col.mode || '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {col.median !== undefined ? `${col.median} (${col.mean})` : '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {col.max !== undefined ? col.max.toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {col.outliersCount !== undefined && col.outliersCount > 0 ? (
                      <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[10px] font-bold">
                        {col.outliersCount} outliers
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
