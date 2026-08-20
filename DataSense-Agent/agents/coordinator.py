import re
from typing import Dict, Any, List

class CoordinatorAgent:
    """
    Central Orchestrator Agent.
    Responsibilities:
    - Parses natural language user intent
    - Formulates dynamic execution DAG / plan
    - Dispatches tasks to specialized child agents
    - Maintains state & error recovery
    """
    def __init__(self):
        self.name = "Coordinator Agent"

    def plan_workflow(self, question: str, dataset_cols: List[str]) -> Dict[str, Any]:
        q_clean = question.lower().strip()

        # Intent evaluation
        if any(k in q_clean for k in ["overview", "profile", "summary", "about", "describe", "columns", "shape"]):
            intent = "dataset_profiling"
            pipeline = ["Coordinator", "ProfilerAgent", "InsightAgent"]
        elif any(k in q_clean for k in ["clean", "missing", "duplicate", "null", "standardize", "nan"]):
            intent = "data_cleaning"
            pipeline = ["Coordinator", "CleaningAgent", "ProfilerAgent", "InsightAgent"]
        elif any(k in q_clean for k in ["anomal", "outlier", "unusual", "suspicious", "irregular", "weird"]):
            intent = "anomaly_detection"
            pipeline = ["Coordinator", "AnomalyAgent", "VisualizationAgent", "InsightAgent"]
        elif any(k in q_clean for k in ["forecast", "predict", "future", "next month", "trend forward", "projection"]):
            intent = "time_series_forecasting"
            pipeline = ["Coordinator", "ForecastingAgent", "VisualizationAgent", "InsightAgent"]
        elif any(k in q_clean for k in ["statistic", "correlation", "variance", "std dev", "skew", "kurtosis"]):
            intent = "statistical_analysis"
            pipeline = ["Coordinator", "StatisticsAgent", "VisualizationAgent", "InsightAgent"]
        elif any(k in q_clean for k in ["report", "executive summary", "comprehensive audit"]):
            intent = "report_generation"
            pipeline = ["Coordinator", "ProfilerAgent", "AnalystAgent", "ReportAgent"]
        else:
            intent = "analytical_query"
            pipeline = ["Coordinator", "AnalystAgent", "VisualizationAgent", "InsightAgent"]

        return {
            "intent": intent,
            "pipeline": pipeline,
            "question": question,
            "status": "planned"
        }
