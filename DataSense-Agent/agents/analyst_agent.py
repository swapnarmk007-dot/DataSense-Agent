import pandas as pd
import numpy as np
from typing import Dict, Any
from tools.analysis import group_by_analysis, top_n_analysis

class AnalystAgent:
    def __init__(self):
        self.name = "Analyst Agent"

    def execute(self, df: pd.DataFrame, question: str) -> Dict[str, Any]:
        q = question.lower()
        cols = df.columns.tolist()

        # Find best matching categorical and numerical columns
        cat_cols = df.select_dtypes(include=['object', 'string', 'category']).columns.tolist()
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()

        group_col = cat_cols[0] if cat_cols else cols[0]
        metric_col = num_cols[0] if num_cols else cols[-1]

        for c in cat_cols:
            if c.lower() in q:
                group_col = c
                break

        for n in num_cols:
            if n.lower() in q:
                metric_col = n
                break

        agg = "sum"
        if "average" in q or "mean" in q or "avg" in q:
            agg = "mean"
        elif "count" in q or "how many" in q:
            agg = "count"
        elif "max" in q or "highest single" in q:
            agg = "max"

        res = group_by_analysis(df, group_col, metric_col, agg_func=agg, top_n=10)

        return {
            "agent": self.name,
            "group_col": group_col,
            "metric_col": metric_col,
            "aggregation": agg,
            "table": res["table"],
            "top_performer": res["top_performer"],
            "top_value": res["top_value"],
            "total_aggregate": res["total_aggregate"]
        }
