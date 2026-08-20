import json
import numpy as np
import pandas as pd
from typing import Any

def format_currency(val: float) -> str:
    """Formats float value into standard currency notation."""
    try:
        return f"${val:,.2f}"
    except Exception:
        return str(val)

def format_percentage(val: float) -> str:
    """Formats float into clean percentage string."""
    try:
        return f"{val:.1f}%"
    except Exception:
        return str(val)

def safe_json_serialize(obj: Any) -> Any:
    """Recursively converts NumPy and Pandas data types for clean JSON responses."""
    if isinstance(obj, (np.int_, np.intc, np.intp, np.int8, np.int16, np.int32, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.float_, np.float16, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, (np.ndarray,)):
        return obj.tolist()
    elif isinstance(obj, (pd.Timestamp, pd.Period)):
        return str(obj)
    elif isinstance(obj, dict):
        return {k: safe_json_serialize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [safe_json_serialize(i) for i in obj]
    return obj
