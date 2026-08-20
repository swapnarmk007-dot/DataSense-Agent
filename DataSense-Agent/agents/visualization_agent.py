import pandas as pd
from typing import Dict, Any, Optional
from tools.visualization import generate_chart_config

class VisualizationAgent:
    def __init__(self):
        self.name = "Visualization Agent"

    def execute(
        self,
        df: pd.DataFrame,
        chart_type: Optional[str] = None,
        x_col: Optional[str] = None,
        y_col: Optional[str] = None
    ) -> Dict[str, Any]:
        c_type = chart_type or "bar"
        if not x_col and not df.empty:
            x_col = df.columns[0]
        if not y_col and len(df.columns) > 1:
            y_col = df.columns[1]

        chart_spec = generate_chart_config(df, chart_type=c_type, x_col=x_col, y_col=y_col)
        return {
            "agent": self.name,
            "chart_type": c_type,
            "chart_spec": chart_spec
        }
