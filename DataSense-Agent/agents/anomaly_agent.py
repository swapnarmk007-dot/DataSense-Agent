import pandas as pd
from typing import Dict, Any, List
from tools.anomaly_detection import detect_anomalies_iqr, detect_anomalies_zscore

class AnomalyAgent:
    def __init__(self):
        self.name = "Anomaly Detection Agent"

    def execute(self, df: pd.DataFrame, target_col: str = None) -> Dict[str, Any]:
        num_cols = df.select_dtypes(include=['number']).columns.tolist()
        cols_to_check = [target_col] if (target_col and target_col in num_cols) else num_cols

        all_anomalies: List[Dict[str, Any]] = []
        for c in cols_to_check:
            iqr_res = detect_anomalies_iqr(df, c)
            z_res = detect_anomalies_zscore(df, c)
            all_anomalies.extend(iqr_res)
            all_anomalies.extend(z_res)

        # Deduplicate
        seen = set()
        unique_anomalies = []
        for a in all_anomalies:
            key = f"{a.get('row_index')}_{a.get('column')}"
            if key not in seen:
                seen.add(key)
                unique_anomalies.append(a)

        return {
            "agent": self.name,
            "anomalies_count": len(unique_anomalies),
            "anomalies": unique_anomalies[:20],
            "severity_summary": {
                "critical": sum(1 for a in unique_anomalies if a.get("severity") == "critical"),
                "high": sum(1 for a in unique_anomalies if a.get("severity") == "high"),
                "medium": sum(1 for a in unique_anomalies if a.get("severity") == "medium"),
            }
        }
