import pandas as pd
from typing import Dict, Any
from tools.statistics import calculate_statistics, calculate_correlation

class StatisticsAgent:
    def __init__(self):
        self.name = "Statistics Agent"

    def execute(self, df: pd.DataFrame, target_col: str = None) -> Dict[str, Any]:
        num_cols = df.select_dtypes(include=['number']).columns.tolist()
        col = target_col if (target_col and target_col in num_cols) else (num_cols[0] if num_cols else None)

        col_stats = calculate_statistics(df, col) if col else {}
        corr = calculate_correlation(df)

        return {
            "agent": self.name,
            "target_column": col,
            "statistics": col_stats,
            "correlation_matrix": corr
        }
