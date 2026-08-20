import pandas as pd
from typing import Dict, Any, Tuple
from tools.cleaning import clean_dataset
from tools.profiler import profile_dataset

class CleaningAgent:
    def __init__(self):
        self.name = "Data Cleaning Agent"

    def execute(
        self,
        df: pd.DataFrame,
        standardize_text: bool = True,
        remove_duplicates: bool = True,
        impute_missing: bool = True,
        clip_outliers: bool = False
    ) -> Dict[str, Any]:
        before_profile = profile_dataset(df)
        cleaned_df, logs = clean_dataset(
            df,
            standardize_text=standardize_text,
            remove_duplicates=remove_duplicates,
            impute_missing=impute_missing,
            clip_outliers=clip_outliers
        )
        after_profile = profile_dataset(cleaned_df)

        return {
            "agent": self.name,
            "cleaned_df": cleaned_df,
            "logs": logs,
            "before_score": before_profile["data_quality_score"],
            "after_score": after_profile["data_quality_score"],
            "rows_retained": len(cleaned_df),
            "operations_count": len(logs)
        }
