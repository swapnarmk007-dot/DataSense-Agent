import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

def forecast_time_series(
    df: pd.DataFrame,
    date_col: str,
    metric_col: str,
    periods: int = 6
) -> Dict[str, Any]:
    """
    Computes time-series trend extraction and forward projections with confidence intervals.
    """
    if date_col not in df.columns or metric_col not in df.columns:
        raise ValueError(f"Columns {date_col} or {metric_col} not found in dataset.")

    temp_df = df[[date_col, metric_col]].dropna().copy()
    temp_df[date_col] = pd.to_datetime(temp_df[date_col], errors='coerce')
    temp_df = temp_df.dropna().sort_values(by=date_col)

    if temp_df.empty:
        return {"error": "No valid datetime records available for forecasting."}

    # Aggregate monthly
    temp_df['period'] = temp_df[date_col].dt.to_period('M').astype(str)
    monthly = temp_df.groupby('period')[metric_col].sum().reset_index()

    n = len(monthly)
    if n < 3:
        return {"error": "Need at least 3 monthly time points to compute trend."}

    x = np.arange(n)
    y = monthly[metric_col].values

    # Fit linear regression line
    slope, intercept = np.polyfit(x, y, 1)

    # Residual standard error
    y_pred = intercept + slope * x
    residuals = y - y_pred
    rse = np.std(residuals)

    historical = [
        {"period": str(row['period']), "actual": round(float(row[metric_col]), 2)}
        for _, row in monthly.iterrows()
    ]

    forecast = []
    last_period = pd.Period(monthly['period'].iloc[-1], freq='M')

    for i in range(1, periods + 1):
        future_period = str(last_period + i)
        future_x = n - 1 + i
        baseline = max(0.0, float(intercept + slope * future_x))
        margin = float(rse * (1 + 0.15 * i) * 1.96)

        forecast.append({
            "period": future_period,
            "forecast": round(baseline, 2),
            "lower_bound": round(max(0.0, baseline - margin), 2),
            "upper_bound": round(baseline + margin, 2)
        })

    growth_rate = round(((y[-1] - y[0]) / (y[0] if y[0] != 0 else 1.0)) * 100, 1)

    return {
        "date_col": date_col,
        "metric_col": metric_col,
        "historical": historical,
        "forecast": forecast,
        "trend_direction": "upward" if slope > 0 else ("downward" if slope < 0 else "stable"),
        "growth_rate_pct": growth_rate,
        "projected_total": round(sum(f["forecast"] for f in forecast), 2),
        "historical_total": round(float(np.sum(y)), 2)
    }
