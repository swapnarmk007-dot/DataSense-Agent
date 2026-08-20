import pandas as pd
from typing import Dict, Any
from tools.forecasting import forecast_time_series

class ForecastingAgent:
    def __init__(self):
        self.name = "Forecasting Agent"

    def execute(self, df: pd.DataFrame, date_col: str = None, metric_col: str = None, periods: int = 6) -> Dict[str, Any]:
        date_candidates = [c for c in df.columns if "date" in c.lower() or "time" in c.lower()]
        num_candidates = [c for c in df.columns if any(k in c.lower() for k in ["sales", "revenue", "profit", "amount", "cost"])]

        d_col = date_col or (date_candidates[0] if date_candidates else df.columns[0])
        m_col = metric_col or (num_candidates[0] if num_candidates else df.select_dtypes(include=['number']).columns[0])

        forecast_res = forecast_time_series(df, d_col, m_col, periods=periods)

        return {
            "agent": self.name,
            "forecast_result": forecast_res,
            "summary": f"Computed {periods}-period forward forecast with {forecast_res.get('trend_direction', 'stable')} trend."
        }
