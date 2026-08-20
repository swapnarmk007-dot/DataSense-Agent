import React, { useState } from 'react';
import {
  Code2,
  FolderTree,
  FileCode,
  Download,
  Copy,
  CheckCircle2,
  ExternalLink,
  Terminal,
  Layers
} from 'lucide-react';

interface CodeFile {
  path: string;
  name: string;
  category: string;
  description: string;
  code: string;
}

export const CodebaseView: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const files: CodeFile[] = [
    {
      path: 'app.py',
      name: 'app.py',
      category: 'Frontend',
      description: 'Streamlit Multi-Page Interactive Dashboard (Plotly, Chat, Diagnostics)',
      code: `import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import os
from graph.workflow import execute_graph_query
from tools.profiler import profile_dataset
from tools.cleaning import clean_dataset
from agents.report_agent import ReportAgent

st.set_page_config(page_title="DataSense Agent", page_icon="🧠", layout="wide")

# Autonomous Multi-Agent AI Data Analytics Platform
# Developer: Swapna V | Agentic AI Engineer | IPEC Solutions
st.title("🧠 DataSense Agent")
st.caption("Autonomous AI Data Analyst • Developed by Swapna V (Agentic AI Engineer)")
`
    },
    {
      path: 'flask_api.py',
      name: 'flask_api.py',
      category: 'Backend',
      description: 'Flask REST API Backend (Multi-Agent Routing, Endpoints, CORS)',
      code: `import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from graph.workflow import execute_graph_query
from tools.profiler import profile_dataset
from tools.cleaning import clean_dataset

app = Flask(__name__)
CORS(app)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "DataSense Agent REST API",
        "developer": "Swapna V | Agentic AI Engineer | IPEC Solutions"
    })

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json() or {}
    question = data.get("question", "")
    # Invokes LangGraph multi-agent workflow
    result = execute_graph_query(df, question)
    return jsonify(result)
`
    },
    {
      path: 'graph/workflow.py',
      name: 'workflow.py',
      category: 'Agentic AI',
      description: 'LangGraph Multi-Agent Execution Graph (Intent, Routing, Tools, Insight)',
      code: `from agents.coordinator import CoordinatorAgent
from agents.profiler_agent import ProfilerAgent
from agents.analyst_agent import AnalystAgent
from agents.visualization_agent import VisualizationAgent
from agents.insight_agent import InsightAgent

def execute_graph_query(df, question, dataset_name="dataset.csv"):
    # 1. Coordinator: Intent Classification & DAG Planning
    coordinator = CoordinatorAgent()
    plan = coordinator.plan_workflow(question, df.columns.tolist())
    
    # 2. Analyst Agent: Deterministic Computation
    analyst = AnalystAgent()
    analysis = analyst.execute(df, question)
    
    # 3. Visualization Agent: Chart Config
    visualizer = VisualizationAgent()
    chart = visualizer.execute(pd.DataFrame(analysis["table"]))
    
    # 4. Insight Agent: LLM Strategic Synthesis
    insight_agent = InsightAgent()
    insights = insight_agent.execute(question, analysis)
    
    return {
        "status": "success",
        "intent": plan["intent"],
        "plan": plan["pipeline"],
        "answer": insights["answer"],
        "chart": chart["chart_spec"],
        "insights": insights["insights"],
        "recommendations": insights["recommendations"]
    }
`
    },
    {
      path: 'agents/coordinator.py',
      name: 'coordinator.py',
      category: 'Agents',
      description: 'Coordinator Agent: Intent Parsing and Dynamic Sub-Agent Dispatching',
      code: `class CoordinatorAgent:
    """Central DAG Orchestrator and Intent Classifier."""
    def __init__(self):
        self.name = "Coordinator Agent"

    def plan_workflow(self, question: str, dataset_cols: list) -> dict:
        q = question.lower()
        if "anomal" in q or "outlier" in q:
            intent = "anomaly_detection"
            pipeline = ["Coordinator", "AnomalyAgent", "InsightAgent"]
        elif "forecast" in q or "predict" in q:
            intent = "time_series_forecasting"
            pipeline = ["Coordinator", "ForecastingAgent", "InsightAgent"]
        elif "clean" in q:
            intent = "data_cleaning"
            pipeline = ["Coordinator", "CleaningAgent", "ProfilerAgent"]
        else:
            intent = "analytical_query"
            pipeline = ["Coordinator", "AnalystAgent", "VisualizationAgent", "InsightAgent"]

        return {"intent": intent, "pipeline": pipeline, "status": "planned"}
`
    },
    {
      path: 'tools/profiler.py',
      name: 'profiler.py',
      category: 'Tools',
      description: 'Deterministic Profiler Tool (Nulls, Duplicates, Types, Quality Index)',
      code: `import pandas as pd
import numpy as np

def profile_dataset(df: pd.DataFrame, dataset_name: str = "dataset.csv") -> dict:
    row_count, col_count = df.shape
    total_nulls = int(df.isna().sum().sum())
    missing_pct = round((total_nulls / (row_count * col_count)) * 100, 2)
    duplicate_count = int(df.duplicated().sum())
    quality_score = max(10, min(100, int(100 - (missing_pct * 1.5 + duplicate_count * 1.2))))
    
    return {
        "name": dataset_name,
        "row_count": row_count,
        "column_count": col_count,
        "data_quality_score": quality_score,
        "missing_total": total_nulls,
        "missing_percentage": missing_pct,
        "duplicate_count": duplicate_count
    }
`
    },
    {
      path: 'requirements.txt',
      name: 'requirements.txt',
      category: 'Config',
      description: 'Complete Python Dependencies (Streamlit, Flask, Pandas, Gemini SDK, LangGraph)',
      code: `Flask>=3.0.0
Flask-Cors>=4.0.0
streamlit>=1.35.0
pandas>=2.2.0
numpy>=1.26.0
scipy>=1.13.0
scikit-learn>=1.4.0
plotly>=5.22.0
openpyxl>=3.1.2
python-dotenv>=1.0.1
gunicorn>=22.0.0
google-genai>=0.1.1
google-generativeai>=0.5.0
requests>=2.31.0
langchain>=0.2.0
langgraph>=0.1.0
`
    }
  ];

  const currentFile = files[selectedFileIndex] || files[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([currentFile.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = currentFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
              DataSense-Agent Repository
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Production Python Codebase</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore the complete, production-ready Python repository containing Streamlit, Flask REST API, LangGraph Agents, and Tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy File'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download {currentFile.name}</span>
          </button>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* File Tree List */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 px-2 py-1 text-slate-700 font-bold text-xs">
            <FolderTree className="w-4 h-4 text-blue-600" />
            <span>Project File Manifest</span>
          </div>
          <div className="space-y-1">
            {files.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start justify-between ${
                  selectedFileIndex === idx
                    ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="truncate">{file.path}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-200/60 rounded text-slate-600 shrink-0 font-normal">
                  {file.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="md:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden flex flex-col">
          <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-mono font-bold text-slate-300 ml-2">{currentFile.path}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{currentFile.description}</span>
          </div>

          <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed flex-1 max-h-[500px]">
            <code>{currentFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
