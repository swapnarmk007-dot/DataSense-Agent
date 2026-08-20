import pandas as pd
import numpy as np
from typing import Dict, Any

def profile_dataset(df: pd.DataFrame, dataset_name: str = "dataset.csv") -> Dict[str, Any]:
    """
    Deterministic data profiler calculating data shapes, null rates,
    duplicate rows, feature types, quantiles, and data quality scores.
    """
    if df is None or df.empty:
        return {
            "name": dataset_name,
            "row_count": 0,
            "column_count": 0,
            "columns": [],
            "missing_total": 0,
            "missing_percentage": 0.0,
            "duplicate_count": 0,
            "duplicate_percentage": 0.0,
            "data_quality_score": 100,
            "numerical_columns": [],
            "categorical_columns": [],
            "date_columns": [],
        }

    row_count, col_count = df.shape
    total_cells = row_count * col_count
    total_nulls = int(df.isna().sum().sum())
    missing_pct = round((total_nulls / total_cells) * 100, 2) if total_cells > 0 else 0.0
    duplicate_count = int(df.duplicated().sum())
    duplicate_pct = round((duplicate_count / row_count) * 100, 2) if row_count > 0 else 0.0

    numerical_cols = []
    categorical_cols = []
    date_cols = []
    columns_meta = []

    for col in df.columns:
        series = df[col]
        null_cnt = int(series.isna().sum())
        null_col_pct = round((null_cnt / row_count) * 100, 2)
        unique_cnt = int(series.nunique())
        non_null_series = series.dropna()

        # Type detection
        is_num = pd.api.types.is_numeric_dtype(series)
        is_datetime = pd.api.types.is_datetime64_any_dtype(series)

        if not is_num and not is_datetime and not non_null_series.empty:
            try:
                sample_dates = pd.to_datetime(non_null_series.head(50), errors='coerce')
                if sample_dates.notna().mean() > 0.8:
                    is_datetime = True
            except Exception:
                pass

        col_dict: Dict[str, Any] = {
            "name": col,
            "dtype": str(series.dtype),
            "null_count": null_cnt,
            "null_percentage": null_col_pct,
            "unique_count": unique_cnt,
            "sample_values": non_null_series.head(5).tolist(),
        }

        if is_num:
            numerical_cols.append(col)
            col_dict["type"] = "numerical"
            vals = non_null_series.values
            if len(vals) > 0:
                q25, q50, q75 = np.percentile(vals, [25, 50, 75])
                iqr = q75 - q25
                outliers = int(((vals < (q25 - 1.5 * iqr)) | (vals > (q75 + 1.5 * iqr))).sum())
                col_dict.update({
                    "min": float(np.min(vals)),
                    "max": float(np.max(vals)),
                    "mean": round(float(np.mean(vals)), 2),
                    "std": round(float(np.std(vals)), 2),
                    "median": round(float(q50), 2),
                    "q25": round(float(q25), 2),
                    "q75": round(float(q75), 2),
                    "iqr": round(float(iqr), 2),
                    "outliers_count": outliers,
                })
        elif is_datetime:
            date_cols.append(col)
            col_dict["type"] = "datetime"
            try:
                dt_series = pd.to_datetime(non_null_series)
                col_dict["min"] = str(dt_series.min())
                col_dict["max"] = str(dt_series.max())
            except Exception:
                pass
        else:
            categorical_cols.append(col)
            col_dict["type"] = "categorical"
            if not non_null_series.empty:
                col_dict["mode"] = str(non_null_series.mode().iloc[0]) if not non_null_series.mode().empty else "N/A"

        columns_meta.append(col_dict)

    # Score calculation
    quality_score = max(10, min(100, int(100 - (missing_pct * 1.5 + duplicate_pct * 1.2))))

    return {
        "name": dataset_name,
        "row_count": row_count,
        "column_count": col_count,
        "columns": columns_meta,
        "missing_total": total_nulls,
        "missing_percentage": missing_pct,
        "duplicate_count": duplicate_count,
        "duplicate_percentage": duplicate_pct,
        "data_quality_score": quality_score,
        "numerical_columns": numerical_cols,
        "categorical_columns": categorical_cols,
        "date_columns": date_cols,
    }
