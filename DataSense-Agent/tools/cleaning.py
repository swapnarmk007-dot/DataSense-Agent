import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple

def clean_dataset(
    df: pd.DataFrame,
    standardize_text: bool = True,
    remove_duplicates: bool = True,
    impute_missing: bool = True,
    clip_outliers: bool = False
) -> Tuple[pd.DataFrame, List[Dict[str, Any]]]:
    """
    Automated cleaning pipeline:
    - Standardizes categorical casing and trims whitespaces
    - Removes duplicate records
    - Imputes missing numerical/categorical values
    - Clips extreme statistical outliers
    """
    cleaned_df = df.copy()
    logs: List[Dict[str, Any]] = []

    # 1. Standardize text
    if standardize_text:
        text_cols = cleaned_df.select_dtypes(include=['object', 'string']).columns
        mod_count = 0
        for col in text_cols:
            before_vals = cleaned_df[col].astype(str)
            cleaned_df[col] = cleaned_df[col].apply(lambda x: x.strip() if isinstance(x, str) else x)
            mod_count += (before_vals != cleaned_df[col].astype(str)).sum()

        logs.append({
            "operation": "standardize_text",
            "title": "Standardize Text & Strip Whitespaces",
            "affected_columns": list(text_cols),
            "records_affected": int(mod_count),
            "summary": f"Cleaned whitespace irregularities across {len(text_cols)} text columns."
        })

    # 2. Remove duplicates
    if remove_duplicates:
        initial_len = len(cleaned_df)
        cleaned_df = cleaned_df.drop_duplicates()
        dups_removed = initial_len - len(cleaned_df)
        logs.append({
            "operation": "remove_duplicates",
            "title": "Purge Duplicate Rows",
            "affected_columns": list(cleaned_df.columns),
            "records_affected": int(dups_removed),
            "summary": f"Purged {dups_removed} identical duplicate records."
        })

    # 3. Impute missing values
    if impute_missing:
        num_cols = cleaned_df.select_dtypes(include=[np.number]).columns
        cat_cols = cleaned_df.select_dtypes(include=['object', 'string', 'category']).columns
        imputed_count = int(cleaned_df.isna().sum().sum())

        for col in num_cols:
            if cleaned_df[col].isna().sum() > 0:
                median_val = cleaned_df[col].median()
                cleaned_df[col] = cleaned_df[col].fillna(median_val)

        for col in cat_cols:
            if cleaned_df[col].isna().sum() > 0:
                mode_val = cleaned_df[col].mode().iloc[0] if not cleaned_df[col].mode().empty else "Unknown"
                cleaned_df[col] = cleaned_df[col].fillna(mode_val)

        logs.append({
            "operation": "impute_missing",
            "title": "Impute Missing Values (Median & Mode)",
            "affected_columns": list(num_cols) + list(cat_cols),
            "records_affected": imputed_count,
            "summary": f"Imputed {imputed_count} null cells using robust median/mode imputation."
        })

    # 4. Outlier Winsorization
    if clip_outliers:
        num_cols = cleaned_df.select_dtypes(include=[np.number]).columns
        clipped_total = 0
        for col in num_cols:
            vals = cleaned_df[col].dropna()
            if len(vals) > 0:
                q25, q75 = np.percentile(vals, [25, 75])
                iqr = q75 - q25
                lower_b = q25 - 1.5 * iqr
                upper_b = q75 + 1.5 * iqr
                clipped = ((cleaned_df[col] < lower_b) | (cleaned_df[col] > upper_b)).sum()
                cleaned_df[col] = cleaned_df[col].clip(lower=lower_b, upper=upper_b)
                clipped_total += int(clipped)

        logs.append({
            "operation": "clip_outliers",
            "title": "Clip Statistical Outliers (IQR Bounds)",
            "affected_columns": list(num_cols),
            "records_affected": clipped_total,
            "summary": f"Constrained {clipped_total} values to 1.5x IQR boundaries."
        })

    return cleaned_df, logs
