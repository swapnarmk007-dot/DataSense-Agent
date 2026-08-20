import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

def generate_chart_config(
    df: pd.DataFrame,
    chart_type: str = "bar",
    x_col: Optional[str] = None,
    y_col: Optional[str] = None,
    title: Optional[str] = None,
    color_col: Optional[str] = None
) -> Dict[str, Any]:
    """
    Constructs deterministic Plotly chart payload specifications for Streamlit and REST API consumers.
    """
    cols = df.columns.tolist()
    if not x_col and len(cols) > 0:
        x_col = cols[0]
    if not y_col and len(cols) > 1:
        y_col = cols[1]

    plot_title = title or f"{y_col or 'Metric'} by {x_col or 'Category'}"

    return {
        "type": chart_type,
        "title": plot_title,
        "x_axis": x_col,
        "y_axis": y_col,
        "color": color_col,
        "data": df.to_dict(orient="records"),
        "layout": {
            "template": "plotly_white",
            "margin": {"l": 40, "r": 40, "t": 60, "b": 40},
            "xaxis": {"title": x_col},
            "yaxis": {"title": y_col}
        }
    }
