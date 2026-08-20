import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { DataCleaningLog, DatasetProfile } from '../types';

interface CleaningViewProps {
  data: Record<string, any>[];
  profile: DatasetProfile | null;
  onApplyCleaning: (
    options: {
      standardizeText: boolean;
      removeDuplicates: boolean;
      imputeMissing: boolean;
      clipOutliers: boolean;
    }
  ) => void;
  cleaningLogs: DataCleaningLog[];
  isCleaned: boolean;
}

export const CleaningView: React.FC<CleaningViewProps> = ({
  data,
  profile,
  onApplyCleaning,
  cleaningLogs,
  isCleaned
}) => {
  const [standardizeText, setStandardizeText] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [imputeMissing, setImputeMissing] = useState(true);
  const [clipOutliers, setClipOutliers] = useState(false);
  const [running, setRunning] = useState(false);

  const handleRunPipeline = () => {
    setRunning(true);
    setTimeout(() => {
      onApplyCleaning({
        standardizeText,
        removeDuplicates,
        imputeMissing,
        clipOutliers
      });
      setRunning(false);
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
              Data Cleaning Agent
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Automated Data Sanitization Pipeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic data cleaning algorithms ensure model-ready tables without synthetic distortions.
          </p>
        </div>

        {isCleaned && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" /> Sanitization Pipeline Active
          </div>
        )}
      </div>

      {/* Pipeline Controls & Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Configure Cleaning Strategies</h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={standardizeText}
                onChange={(e) => setStandardizeText(e.target.checked)}
                className="mt-0.5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Standardize Text & Strip Whitespaces</p>
                <p className="text-[11px] text-slate-500">Trims leading/trailing spaces and harmonizes string casings.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="mt-0.5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Purge Duplicate Records</p>
                <p className="text-[11px] text-slate-500">De-duplicates identical row signatures across all attributes.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={imputeMissing}
                onChange={(e) => setImputeMissing(e.target.checked)}
                className="mt-0.5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Impute Missing Values (Median / Mode)</p>
                <p className="text-[11px] text-slate-500">Fills numerical nulls with robust medians and categories with statistical modes.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={clipOutliers}
                onChange={(e) => setClipOutliers(e.target.checked)}
                className="mt-0.5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Winsorize Outliers (1.5x IQR Bounds)</p>
                <p className="text-[11px] text-slate-500">Constrains extreme numerical spikes to Tukey lower and upper fences.</p>
              </div>
            </label>
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={running}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{running ? 'Executing Cleaning Routines...' : 'Execute Data Cleaning Agent'}</span>
          </button>
        </div>

        {/* Audit Log / Results */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Pipeline Execution Audit Log</h3>

          {cleaningLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Run the cleaning agent to view step-by-step modification logs.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cleaningLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                      {log.recordsAffected} records modified
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{log.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
