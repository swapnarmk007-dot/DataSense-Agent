import pandas as pd
from typing import Tuple, Optional

def validate_dataset_schema(df: pd.DataFrame) -> Tuple[bool, Optional[str]]:
    """
    Validates uploaded DataFrame for integrity and analysis readiness.
    """
    if df is None:
        return False, "Dataset is None."
    if df.empty:
        return False, "Dataset contains 0 rows."
    if df.shape[1] == 0:
        return False, "Dataset contains 0 columns."
    if df.shape[0] < 2:
        return False, "Dataset must have at least 2 rows for statistical inference."
    return True, None

def validate_query_safety(query: str) -> Tuple[bool, Optional[str]]:
    """
    Guards against unsafe commands or code injection attempts.
    """
    disallowed = ["import os", "eval(", "exec(", "__import__", "subprocess", "drop table", "rm -rf"]
    q_lower = query.lower()
    for token in disallowed:
        if token in q_lower:
            return False, f"Prohibited expression '{token}' detected in query."
    return True, None
