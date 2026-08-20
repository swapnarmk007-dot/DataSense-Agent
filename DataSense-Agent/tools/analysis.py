import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

def group_by_analysis(
    df: pd.DataFrame,
    group_col: str,
    metric_col: str,
    agg_func: str = "sum",
    sort_descending: bool = True,
    top_n: int = 15
) -> Dict[str, Any]:
    """
    Performs verified group-by aggregation on deterministic Pandas engine.
    """
    if group_col not in df.columns or metric_col not in df.columns:
        raise ValueError(f"Columns {group_col} or {metric_col} not found in dataset.")

    agg_map = {
        "sum": "sum",
        "mean": "mean",
        "avg": "mean",
        "count": "count",
        "max": "max",
        "min": "min",
        "median": "median"
    }
    pandas_agg = agg_map.get(agg_func.lower(), "sum")

    grouped = df.groupby(group_col)[metric_col].agg(pandas_agg).reset_index()
    if sort_descending:
        grouped = grouped.sort_values(by=metric_col, ascending=False)
    else:
        grouped = grouped.sort_values(by=metric_col, ascending=True)

    result_df = grouped.head(top_n)
    total_val = float(df[metric_col].sum()) if pandas_agg == "sum" else float(df[metric_col].mean())
    top_entry = result_df.iloc[0] if not result_df.empty else None

    return {
        "table": result_df.to_dict(orient="records"),
        "group_col": group_col,
        "metric_col": metric_col,
        "aggregation": pandas_agg,
        "total_aggregate": round(total_val, 2),
        "top_performer": str(top_entry[group_col]) if top_entry is not None else "N/A",
        "top_value": round(float(top_entry[metric_col]), 2) if top_entry is not None else 0.0,
        "record_count": len(result_df)
    }

def top_n_analysis(
    df: pd.DataFrame,
    group_col: str,
    metric_col: str,
    n: int = 5,
    ascending: bool = False
) -> Dict[str, Any]:
    """
    Identifies Top N or Bottom N entities by a given numerical metric.
    """
    return group_by_analysis(df, group_col, metric_col, agg_func="sum", sort_descending=not ascending, top_n=n)

def filter_dataset(
    df: pd.DataFrame,
    col: str,
    operator: str,
    value: Any
) -> pd.DataFrame:
    """
    Applies deterministic condition filter.
    """
    if col not in df.columns:
        return df

    if operator == "==" or operator == "equals":
        return df[df[col] == value]
    elif operator == ">":
        return df[df[col] > float(value)]
    elif operator == "<":
        return df[df[col] < float(value)]
    elif operator == ">=":
        return df[df[col] >= float(value)]
    elif operator == "<=":
        return df[df[col] <= float(value)]
    elif operator == "contains":
        return df[df[col].astype(str).str.contains(str(value), case=False, na=False)]
    return df
