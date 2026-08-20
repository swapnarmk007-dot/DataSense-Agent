import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  CheckCircle2,
  Printer,
  Sparkles
} from 'lucide-react';
import { DatasetProfile } from '../types';
import { detectAnomaliesIQR, forecastTimeSeries } from '../utils/dataEngine';

interface ReportViewProps {
  profile: DatasetProfile | null;
  data: Record<string, any>[];
  datasetName: string;
}

export const ReportView: React.FC<ReportViewProps> = ({ profile, data, datasetName }) => {
  const [copied, setCopied] = useState(false);

  if (!profile || data.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto">
        <p className="text-sm text-slate-500">Please load a dataset to compile an executive audit report.</p>
      </div>
    );
  }

  const numCols = profile.numericalColumns;
  const targetNum = numCols[0] || 'Sales';
  const anomalies = detectAnomaliesIQR(data, targetNum);
  const totalVal = data.reduce((acc, r) => acc + (parseFloat(r[targetNum]) || 0), 0);

  const reportMarkdown = `# 🧠 DataSense Agent — Executive Analytical Audit

**Platform:** DataSense Agent  
**Autonomous AI Analyst Developer:** Swapna V | Agentic AI Engineer | IPEC Solutions  
**Report Timestamp:** ${new Date().toLocaleString()}  
**Dataset Analyzed:** ${datasetName}  

---

## 1. Executive Summary & Health Index
DataSense Agent conducted an autonomous multi-agent evaluation across **${profile.rowCount.toLocaleString()} records** and **${profile.columnCount} attributes**.
The overall Data Quality Score is certified at **${profile.dataQualityScore}/100**.

* **Total Records:** ${profile.rowCount.toLocaleString()}
* **Total Attributes:** ${profile.columnCount}
* **Missing Value Rate:** ${profile.missingPercentage}% (${profile.missingTotal.toLocaleString()} nulls)
* **Duplicate Rows:** ${profile.duplicateCount} (${profile.duplicatePercentage}%)
* **Cumulative ${targetNum}:** $${Math.round(totalVal).toLocaleString()}

---

## 2. Statistical Schema & Attributes
* **Numerical Features (${profile.numericalColumns.length}):** ${profile.numericalColumns.join(', ') || 'None'}
* **Categorical Features (${profile.categoricalColumns.length}):** ${profile.categoricalColumns.join(', ') || 'None'}
* **Temporal Features (${profile.dateColumns.length}):** ${profile.dateColumns.join(', ') || 'None'}

---

## 3. Anomaly & Risk Detection (${targetNum})
* **Flagged Outliers:** ${anomalies.length} instances
* **High Severity Count:** ${anomalies.filter((a) => a.severity === 'high').length}
* **Detection Algorithms:** Tukey's 1.5x IQR & Empirical Z-Score (>2.5σ)

---

## 4. Strategic Business Roadmap
1. **Focus Commercial Capital:** Prioritize top-performing products and regional hubs to maximize return on sales.
2. **Audit Outlier Contracts:** Review high-value anomalous transactions to protect against pricing drift.
3. **Automate Pipeline Sanitization:** Standardize whitespace and null imputation prior to downstream analytics.

---
*Report generated autonomously by DataSense Agent multi-agent orchestration architecture.*
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([reportMarkdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `DataSense_Report_${datasetName.replace(/\.[^/.]+$/, '')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
              Report Agent
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Executive Audit & Compliance Report</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-compiled markdown report ready for C-suite executive briefing and compliance archiving.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Report (.md)</span>
          </button>
        </div>
      </div>

      {/* Formatted Report Card */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-slate-800 text-xs leading-relaxed">
        <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-extrabold text-slate-900">DataSense Agent &bull; Executive Audit</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{new Date().toLocaleDateString()}</span>
        </div>

        <div className="space-y-4 font-mono text-[11px] bg-slate-50 p-6 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap">
          {reportMarkdown}
        </div>
      </div>
    </div>
  );
};
