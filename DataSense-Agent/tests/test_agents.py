import unittest
import pandas as pd
from agents.coordinator import CoordinatorAgent
from agents.profiler_agent import ProfilerAgent
from agents.analyst_agent import AnalystAgent
from agents.anomaly_agent import AnomalyAgent
from agents.forecasting_agent import ForecastingAgent

class TestDataSenseAgents(unittest.TestCase):
    def setUp(self):
        self.df = pd.DataFrame({
            "Region": ["North", "South", "East", "West"],
            "Sales": [1500.0, 2300.0, 950.0, 4200.0],
            "Order_Date": ["2024-01-15", "2024-02-15", "2024-03-15", "2024-04-15"]
        })

    def test_coordinator_planning(self):
        coord = CoordinatorAgent()
        plan = coord.plan_workflow("Which region has the highest revenue?", self.df.columns.tolist())
        self.assertEqual(plan["status"], "planned")
        self.assertIn("AnalystAgent", plan["pipeline"])

    def test_profiler_agent(self):
        prof = ProfilerAgent()
        res = prof.execute(self.df)
        self.assertEqual(res["profile"]["row_count"], 4)

    def test_analyst_agent(self):
        analyst = AnalystAgent()
        res = analyst.execute(self.df, "Which region generated the highest sales?")
        self.assertEqual(res["top_performer"], "West")

if __name__ == "__main__":
    unittest.main()
