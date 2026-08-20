# 🧠 DataSense Agent — Autonomous AI Data Analyst

> **Production-Ready Agentic AI Data Analytics Platform**  
> **Developer:** Swapna V | Agentic AI Engineer | IPEC Solutions  
> **Repository:** `DataSense-Agent`

---

## 🌟 Executive Overview

**DataSense Agent** is a full-stack, enterprise-grade **Agentic AI Data Analytics Platform**. Unlike naive chat interfaces that feed raw CSV tables into an LLM and suffer from numerical hallucinations, DataSense Agent implements a **Multi-Agent Orchestration Architecture**:

1. **Deterministic Computation Layer:** Pandas, NumPy, Scipy, and Scikit-Learn calculate exact metrics, statistical moments, IQR/Z-score anomalies, and linear regression forecasts.
2. **Agentic Orchestration Layer:** LangGraph DAG router and Coordinator Agent map user intent to specialized analytical tools.
3. **LLM Synthesis Layer:** Gemini 1.5/2.0 turns verified figures into executive summaries, operational takeaways, and strategic recommendations.

---

## 🏛️ System Architecture

```
User Query / Dataset
       │
       ▼
┌─────────────────────────┐
│   STREAMLIT DASHBOARD   │ ◄── Interactive UI (Plotly, Chat, Data Profile)
└───────────┬─────────────┘
            │ REST (HTTP/JSON)
            ▼
┌─────────────────────────┐
│   FLASK REST API        │ ◄── Endpoint routing, validation, file management
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│              LANGGRAPH COORDINATOR AGENT                        │
│  • Natural Language Intent Parsing & Dynamic Graph Routing      │
└───────┬──────────────┬──────────────┬─────────────┬─────────────┘
        │              │              │             │
        ▼              ▼              ▼             ▼
┌──────────────┐┌──────────────┐┌────────────┐┌───────────────┐
│Profiler Agent││Cleaner Agent ││Analyst Agt ││Anomaly Agent  │
└───────┬──────┘└──────┬───────┘└─────┬──────┘└──────┬────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│          DETERMINISTIC ANALYTICAL TOOL ENGINE               │
│  • Pandas • NumPy • Scipy • Scikit-learn • Plotly           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Verified Aggregates
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      INSIGHT AGENT                          │
│  • Gemini LLM • Executive Takeaways • Strategic Roadmap     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
                        Final Response
```

---

## 🤖 Specialized AI Agents

| Agent | Responsibility | Analytical Tools Used |
| :--- | :--- | :--- |
| **Coordinator Agent** | Parses query intent, dynamic DAG routing, pipeline error recovery | Intent Classifier, DAG Router |
| **Data Profiler Agent** | Calculates row/col shape, null rates, cardinality, and Data Quality Score | `tools/profiler.py` |
| **Data Cleaning Agent** | Imputes nulls (median/mode), purges duplicates, standardizes text casing | `tools/cleaning.py` |
| **Analyst Agent** | Executes deterministic group-by aggregations and Top-N rankings | `tools/analysis.py` |
| **Statistics Agent** | Computes variance, skewness, kurtosis, and Pearson correlation matrices | `tools/statistics.py` |
| **Visualization Agent**| Generates interactive, responsive Plotly chart specifications | `tools/visualization.py` |
| **Anomaly Agent** | Detects statistical outliers using Tukey's 1.5x IQR and Z-Score (>2.5σ) | `tools/anomaly_detection.py` |
| **Forecasting Agent** | Extracts time-series trends and generates forward confidence bounds | `tools/forecasting.py` |
| **Insight Agent** | Translates verified numbers into C-suite executive business takeaways | Gemini 1.5/2.0 API |
| **Report Agent** | Compiles comprehensive markdown audits and downloadable reports | `agents/report_agent.py` |

---

## 📁 Repository Structure

```
DataSense-Agent/
├── app.py                     # Streamlit Frontend Multi-Page Application
├── flask_api.py               # Flask REST Backend Service
├── requirements.txt           # Python Dependency Manifest
├── Procfile                   # Cloud Production Procfile (Gunicorn)
├── render.yaml                # Render Cloud Deployment Blueprint
├── README.md                  # Comprehensive Documentation
├── .env.example               # Environment Configuration Template
├── .gitignore                 # Version Control Ignore Rules
│
├── agents/                    # Specialized AI Agents
│   ├── coordinator.py
│   ├── profiler_agent.py
│   ├── cleaning_agent.py
│   ├── analyst_agent.py
│   ├── visualization_agent.py
│   ├── statistics_agent.py
│   ├── anomaly_agent.py
│   ├── forecasting_agent.py
│   ├── insight_agent.py
│   └── report_agent.py
│
├── tools/                     # Deterministic Calculation Engine
│   ├── profiler.py
│   ├── cleaning.py
│   ├── analysis.py
│   ├── statistics.py
│   ├── visualization.py
│   ├── anomaly_detection.py
│   └── forecasting.py
│
├── graph/                     # Graph Workflow Execution
│   └── workflow.py
│
├── utils/                     # Prompts, Validators & Formatting
│   ├── prompts.py
│   ├── validators.py
│   └── helpers.py
│
├── data/                      # Sample Dataset
│   └── sample_sales.csv
│
└── tests/                     # Automated Test Suite
    ├── test_api.py
    ├── test_analysis.py
    └── test_agents.py
```

---

## 🚀 Quickstart & Installation

### 1. Clone Repository & Setup Virtual Environment
```bash
git clone https://github.com/swapna-v/DataSense-Agent.git
cd DataSense-Agent

python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API key in `.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
BACKEND_URL=http://localhost:5000
PORT=5000
```

### 3. Launch the Backend API
```bash
python flask_api.py
```
*The Flask REST API will start on `http://localhost:5000`.*

### 4. Launch the Streamlit Frontend
In a new terminal window:
```bash
streamlit run app.py
```
*Streamlit dashboard will open in your browser on `http://localhost:8501`.*

---

## 📡 REST API Reference

### `GET /health`
Returns system status, loaded dataset stats, and developer credits.

### `POST /upload`
Accepts `multipart/form-data` with a `.csv` or `.xlsx` file.

### `POST /analyze`
Payload:
```json
{
  "question": "Which region generated the highest revenue in Q3?"
}
```

### `POST /profile`
Returns automated data health index, column metadata, and cardinality.

### `POST /clean`
Payload:
```json
{
  "standardize_text": true,
  "remove_duplicates": true,
  "impute_missing": true,
  "clip_outliers": false
}
```

### `POST /report`
Generates full executive audit markdown report.

---

## 🧪 Running Automated Tests
```bash
python -m unittest discover tests/
```

---
## 🚀 Live Demo

👉 [Open DataSense Agent](https://datasense-agent-p7qemk5a49vnrjt2lkovt5.streamlit.app/)


## 👨‍💻 Developer & Attribution

* **Developer:** Swapna V
* **Role:** Agentic AI Engineer
* **Organization:** IPEC Solutions
* **Specialization:** Autonomous Multi-Agent Architectures, LangGraph, Enterprise LLM Engineering, Deterministic Analytics
