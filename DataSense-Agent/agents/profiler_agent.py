import pandas as pd
from typing import Dict, Any
from tools.profiler import profile_dataset

class ProfilerAgent:
    def __init__(self):
        self.name = "Data Profiler Agent"

    def execute(self, df: pd.DataFrame, dataset_name: str = "dataset.csv") -> Dict[str, Any]:
        profile = profile_dataset(df, dataset_name)
        return {
            "agent": self.name,
            "profile": profile,
            "summary": f"Dataset contains {profile['row_count']} rows and {profile['column_count']} columns with a {profile['data_quality_score']}% data health index."
        }
