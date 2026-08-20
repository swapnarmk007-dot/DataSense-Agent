import React, { useState } from 'react';
import { Upload, FileSpreadsheet, FileText, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface UploadViewProps {
  onDatasetLoaded: (data: Record<string, any>[], filename: string) => void;
  onResetToDemo: () => void;
  currentFilename: string;
  totalRows: number;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onDatasetLoaded,
  onResetToDemo,
  currentFilename,
  totalRows
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setUploading(true);
    setUploadError(null);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          setUploading(false);
          if (results.data && results.data.length > 0) {
            onDatasetLoaded(results.data as Record<string, any>[], file.name);
          } else {
            setUploadError('Parsed CSV contains 0 valid data rows.');
          }
        },
        error: (err) => {
          setUploading(false);
          setUploadError(`CSV Parse Error: ${err.message}`);
        }
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: 'binary' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          setUploading(false);
          if (jsonData && jsonData.length > 0) {
            onDatasetLoaded(jsonData as Record<string, any>[], file.name);
          } else {
            setUploadError('Excel file sheet contains no data.');
          }
        } catch (err: any) {
          setUploading(false);
          setUploadError(`Excel Parse Error: ${err.message}`);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setUploading(false);
      setUploadError('Unsupported file type. Please upload a .csv, .xlsx, or .xls file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Upload Dataset</h2>
        <p className="text-sm text-slate-500 mb-6">
          Upload any structured CSV or Excel dataset to trigger autonomous profiling, multi-agent query execution, and AI insights.
        </p>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Drag and drop your dataset file here, or{' '}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline underline-offset-2">
                  browse from computer
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </label>
              </p>
              <p className="text-xs text-slate-400">Supports CSV, XLSX, and XLS up to 50MB</p>
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Status / Switcher */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">Current Active Dataset: {currentFilename}</p>
              <p className="text-[11px] text-slate-500">{totalRows.toLocaleString()} rows in memory</p>
            </div>
          </div>

          <button
            onClick={onResetToDemo}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Enterprise Sales Demo Dataset
          </button>
        </div>
      </div>

      {/* Dataset Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs">
            <FileSpreadsheet className="w-4 h-4" /> Tabular Support
          </div>
          <h4 className="text-sm font-bold text-slate-900">Multi-Format Parsing</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Automatic header recognition, type inference for numbers, currencies, dates, and categories.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
            <FileText className="w-4 h-4" /> Instant Profiling
          </div>
          <h4 className="text-sm font-bold text-slate-900">Automated Health Scoring</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Immediately evaluates null rates, duplicate records, quantiles, and data quality indices.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" /> Agentic Readiness
          </div>
          <h4 className="text-sm font-bold text-slate-900">Zero Hallucinations</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            All numerical queries execute over deterministic analytical engines before LLM synthesis.
          </p>
        </div>
      </div>
    </div>
  );
};
