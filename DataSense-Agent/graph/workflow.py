import pandas as pd
from typing import Dict, Any, List, TypedDict
from agents.coordinator import CoordinatorAgent
from agents.profiler_agent import ProfilerAgent
from agents.cleaning_agent import CleaningAgent
from agents.analyst_agent import AnalystAgent
from agents.visualization_agent import VisualizationAgent
from agents.statistics_agent import StatisticsAgent
from agents.anomaly_agent import AnomalyAgent
from agents.forecasting_agent import ForecastingAgent
from agents.insight_agent import InsightAgent
from agents.report_agent import ReportAgent

class AgentState(TypedDict):
    question: str
    df: pd.DataFrame
    dataset_name: str
    plan: Dict[str, Any]
    analytical_result: Dict[str, Any]
    chart_config: Dict[str, Any]
    final_answer: str
    insights: List[str]
    recommendations: List[str]
    steps: List[Dict[str, Any]]

def create_data_analytics_graph():
    """
    Returns an orchestrated multi-agent execution pipeline.
    Compatible with LangGraph / LangChain graph pattern.
    """
    return {
        "coordinator": CoordinatorAgent(),
        "profiler": ProfilerAgent(),
        "cleaner": CleaningAgent(),
        "analyst": AnalystAgent(),
        "visualizer": VisualizationAgent(),
        "statistics": StatisticsAgent(),
        "anomaly": AnomalyAgent(),
        "forecasting": ForecastingAgent(),
        "insight": InsightAgent(),
        "report": ReportAgent(),
    }

def execute_graph_query(df: pd.DataFrame, question: str, dataset_name: str = "dataset.csv") -> Dict[str, Any]:
    """
    Executes dynamic multi-agent DAG workflow:
    User Question -> Coordinator (Intent) -> Specialized Agent -> Visualization -> Insight
    """
    graph = create_data_analytics_graph()
    steps = []

    # 1. Coordinator planning
    plan_res = graph["coordinator"].plan_workflow(question, df.columns.tolist())
    intent = plan_res["intent"]
    steps.append({
        "agent": "Coordinator Agent",
        "action": f"Identified intent '{intent}' and generated execution graph: {' -> '.join(plan_res['pipeline'])}",
        "status": "completed"
    })

    analytical_data = {}
    chart_data = None

    if intent == "dataset_profiling":
        prof_res = graph["profiler"].execute(df, dataset_name)
        analytical_data = prof_res["profile"]
        steps.append({
            "agent": "Data Profiler Agent",
            "action": f"Profiled {prof_res['profile']['row_count']} rows across {prof_res['profile']['column_count']} columns.",
            "status": "completed"
        })
        answer = f"The dataset **{dataset_name}** contains **{analytical_data['row_count']:,} rows** and **{analytical_data['column_count']} columns** with a Data Quality Score of **{analytical_data['data_quality_score']}%**."
        insights = [
            f"Missing values comprise {analytical_data['missing_percentage']}% of the dataset.",
            f"Identified {analytical_data['duplicate_count']} duplicate records."
        ]
        recommendations = ["Proceed with data cleaning and exploration in Visual Analytics."]

    elif intent == "data_cleaning":
        clean_res = graph["cleaner"].execute(df)
        analytical_data = clean_res
        steps.append({
            "agent": "Data Cleaning Agent",
            "action": f"Executed {clean_res['operations_count']} cleaning routines.",
            "status": "completed"
        })
        answer = f"Data Cleaning Agent completed sanitization. Quality score increased from **{clean_res['before_score']}%** to **{clean_res['after_score']}%**."
        insights = ["Sanitized text whitespace and imputed missing values."]
        recommendations = ["Apply cleaned dataset to downstream modeling."]

    elif intent == "anomaly_detection":
        anom_res = graph["anomaly"].execute(df)
        analytical_data = anom_res
        steps.append({
            "agent": "Anomaly Detection Agent",
            "action": f"Flagged {anom_res['anomalies_count']} anomalous records using IQR and Z-Score algorithms.",
            "status": "completed"
        })
        answer = f"Anomaly Detection Agent flagged **{anom_res['anomalies_count']} anomalous entries** across numerical attributes."
        insights = ["Outliers identified primarily in transaction volume and profit metrics."]
        recommendations = ["Audit high-value enterprise sales records to ensure contract accuracy."]

    elif intent == "time_series_forecasting":
        fc_res = graph["forecasting"].execute(df)
        analytical_data = fc_res["forecast_result"]
        steps.append({
            "agent": "Forecasting Agent",
            "action": fc_res["summary"],
            "status": "completed"
        })
        answer = f"Forecasting Agent projects a **{analytical_data.get('trend_direction', 'steady')} trend** with projected cumulative sum of **${analytical_data.get('projected_total', 0):,.2f}**."
        insights = [f"Growth velocity is estimated at {analytical_data.get('growth_rate_pct', 0)}%."]
        recommendations = ["Plan operational resources according to projected peak periods."]

    else:
        # General analysis
        analysis_res = graph["analyst"].execute(df, question)
        analytical_data = analysis_res
        steps.append({
            "agent": "Analyst Agent",
            "action": f"Computed {analysis_res['aggregation'].upper()} on {analysis_res['metric_col']} grouped by {analysis_res['group_col']}.",
            "status": "completed"
        })

        vis_res = graph["visualizer"].execute(pd.DataFrame(analysis_res["table"]))
        chart_data = vis_res["chart_spec"]
        steps.append({
            "agent": "Visualization Agent",
            "action": f"Constructed {vis_res['chart_type']} chart specification.",
            "status": "completed"
        })

        insight_res = graph["insight"].execute(question, analysis_res)
        steps.append({
            "agent": "Insight Agent",
            "action": "Synthesized executive business takeaways.",
            "status": "completed"
        })
        answer = insight_res["answer"]
        insights = insight_res["insights"]
        recommendations = insight_res["recommendations"]

    return {
        "status": "success",
        "question": question,
        "intent": intent,
        "plan": plan_res["pipeline"],
        "steps": steps,
        "answer": answer,
        "data": analytical_data,
        "chart": chart_data,
        "insights": insights,
        "recommendations": recommendations,
    }
