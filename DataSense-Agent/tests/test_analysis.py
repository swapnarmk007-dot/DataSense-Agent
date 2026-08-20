import unittest
import pandas as pd
import numpy as np
from tools.profiler import profile_dataset
from tools.cleaning import clean_dataset
from tools.analysis import group_by_analysis, top_n_analysis
from tools.statistics import calculate_statistics, calculate_correlation
from tools.anomaly_detection import detect_anomalies_iqr, detect_anomalies_zscore
from tools.forecasting import forecast_time_series

class TestDataSenseAnalysisTools(unittest.TestCase):
    def setUp(self):
        self.df = pd.DataFrame({
            "Region": ["North", "North", "South", "West", "East", "West"],
            "Sales": [100.0, 200.0, 150.0, 300.0, 50.0, 400.0],
            "Profit": [20.0, 40.0, 30.0, 80.0, 10.0, 110.0],
            "Order_Date": ["2024-01-01", "2024-02-01", "2024-03-01", "2024-04-01", "2024-05-01", "2024-06-01"]
        })

    def test_profiler(self):
        profile = profile_dataset(self.df, "test.csv")
        self.assertEqual(profile["row_count"], 6)
        self.assertEqual(profile["column_count"], 4)
        self.assertIn("Sales", profile["numerical_columns"])
        self.assertIn("Region", profile["categorical_columns"])

    def test_group_by(self):
        res = group_by_analysis(self.df, "Region", "Sales", agg_func="sum")
        self.assertEqual(res["top_performer"], "West")
        self.assertEqual(res["top_value"], 700.0)

    def test_statistics(self):
        stats = calculate_statistics(self.df, "Sales")
        self.assertEqual(stats["count"], 6)
        self.assertEqual(stats["min"], 50.0)
        self.assertEqual(stats["max"], 400.0)

    def test_forecasting(self):
        fc = forecast_time_series(self.df, "Order_Date", "Sales", periods=3)
        self.assertIn("forecast", fc)
        self.assertEqual(len(fc["forecast"]), 3)

if __name__ == "__main__":
    unittest.main()
