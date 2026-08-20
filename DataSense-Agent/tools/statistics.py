import pandas as pd
import numpy as np
from typing import Dict, Any, List

def calculate_statistics(df: pd.DataFrame, col: str) -> Dict[str, Any]:
    """
    Computes rigorous statistical moments and summary statistics for a given feature.
    """
    if col not in df.columns:
        raise ValueError(f"Column '{col}' not found.")

    series = pd.to_numeric(df[col], errors='coerce').dropna()
    if series.empty:
        return {"error": "No valid numerical values in column."}

    vals = series.values
    q25, q50, q75 = np.percentile(vals, [25, 50, 75])
    iqr = q75 - q25
    std = float(np.std(vals))
    mean = float(np.mean(vals))
    skew = float(series.skew()) if len(vals) > 2 else 0.0
    kurt = float(series.kurt()) if len(vals) > 3 else 0.0

    return {
        "column": col,
        "count": int(len(vals)),
        "mean": round(mean, 2),
        "std": round(std, 2),
        "variance": round(float(np.var(vals)), 2),
        "min": round(float(np.min(vals)), 2),
        "q25": round(float(q25), 2),
        "median": round(float(q50), 2),
        "q75": round(float(q75), 2),
        "iqr": round(float(iqr), 2),
        "max": round(float(np.max(vals)), 2),
        "skewness": round(skew, 2),
        "kurtosis": round(kurt, 2),
    }

def calculate_correlation(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes pairwise Pearson correlation coefficients for all numerical features.
    """
    num_df = df.select_dtypes(include=[np.number])
    if num_df.empty or num_df.shape[1] < 2:
        return {"columns": [], "matrix": []}

    corr_matrix = num_df.corr().round(3)
    return {
        "columns": corr_matrix.columns.tolist(),
        "matrix": corr_matrix.values.tolist(),
        "pairs": [
            {
                "feature_a": c1,
                "feature_b": c2,
                "correlation": float(corr_matrix.loc[c1, c2])
            }
            for i, c1 in enumerate(corr_matrix.columns)
            for j, c2 in enumerate(corr_matrix.columns)
            if i < j
        ]
    }
