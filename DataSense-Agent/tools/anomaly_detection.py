import pandas as pd
import numpy as np
from typing import List, Dict, Any

def detect_anomalies_iqr(df: pd.DataFrame, col: str, threshold: float = 1.5) -> List[Dict[str, Any]]:
    """
    Detects univariate outliers using Tukey's Interquartile Range method.
    """
    if col not in df.columns:
        return []

    series = pd.to_numeric(df[col], errors='coerce')
    clean = series.dropna()
    if clean.empty:
        return []

    q25, q75 = np.percentile(clean, [25, 75])
    iqr = q75 - q25
    lower_bound = q25 - threshold * iqr
    upper_bound = q75 + threshold * iqr

    anomalies = []
    for idx, val in series.items():
        if pd.notna(val) and (val < lower_bound or val > upper_bound):
            anomalies.append({
                "row_index": int(idx),
                "column": col,
                "value": float(val),
                "expected_range": [round(float(lower_bound), 2), round(float(upper_bound), 2)],
                "method": "IQR",
                "reason": f"Value {val} outside bounds [{lower_bound:.2f}, {upper_bound:.2f}]",
                "severity": "high" if (val < lower_bound - iqr or val > upper_bound + iqr) else "medium",
                "record": df.iloc[idx].to_dict()
            })
    return anomalies

def detect_anomalies_zscore(df: pd.DataFrame, col: str, z_thresh: float = 2.5) -> List[Dict[str, Any]]:
    """
    Detects outliers using standard Z-Score deviations from empirical mean.
    """
    if col not in df.columns:
        return []

    series = pd.to_numeric(df[col], errors='coerce')
    clean = series.dropna()
    if clean.empty or np.std(clean) == 0:
        return []

    mean = np.mean(clean)
    std = np.std(clean)

    anomalies = []
    for idx, val in series.items():
        if pd.notna(val):
            z = (val - mean) / std
            if abs(z) >= z_thresh:
                anomalies.append({
                    "row_index": int(idx),
                    "column": col,
                    "value": float(val),
                    "z_score": round(float(z), 2),
                    "method": "Z-Score",
                    "reason": f"Z-score {z:.2f} exceeds threshold of {z_thresh}",
                    "severity": "critical" if abs(z) >= 4.0 else ("high" if abs(z) >= 3.0 else "medium"),
                    "record": df.iloc[idx].to_dict()
                })
    return anomalies
