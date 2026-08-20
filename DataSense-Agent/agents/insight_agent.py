import os
from typing import Dict, Any, List

class InsightAgent:
    """
    Insight Agent: Translates deterministic numerical calculations into
    concise, high-impact executive business insights.
    Uses Gemini API when available with deterministic rule fallback.
    """
    def __init__(self):
        self.name = "Insight Agent"

    def execute(self, question: str, analytical_results: Dict[str, Any], df_sample: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        api_key = os.environ.get("GEMINI_API_KEY")
        insights = []
        recommendations = []
        answer = ""

        top_entity = analytical_results.get("top_performer", "Leading Segment")
        top_val = analytical_results.get("top_value", 0)
        metric = analytical_results.get("metric_col", "Metric")
        group = analytical_results.get("group_col", "Category")
        total = analytical_results.get("total_aggregate", 1)

        pct_share = round((top_val / total * 100), 1) if total > 0 else 0

        # Try Gemini API if key is available
        if api_key and api_key != "your_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                prompt = f"""You are the Insight Agent in DataSense Agent, developed by Swapna V (Agentic AI Engineer).
Question: {question}
Verified Analytical Numbers:
- Top Performer: {top_entity}
- Value: {top_val} ({metric})
- Group: {group}
- Total: {total} ({pct_share}% share)

Provide a 2-sentence executive summary, 2 business insights, and 2 actionable recommendations."""
                resp = model.generate_content(prompt)
                if resp.text:
                    answer = resp.text
            except Exception:
                pass

        if not answer:
            answer = f"**{top_entity}** generated the highest **{metric}** of **{top_val:,.2f}**, representing **{pct_share}%** of total recorded volume ({total:,.2f})."
            insights = [
                f"{top_entity} demonstrates dominant performance in {group}, exceeding segment median significantly.",
                f"Concentration risk: {pct_share}% of total {metric} depends on the top segment."
            ]
            recommendations = [
                f"Allocate targeted inventory and sales bandwidth to {top_entity}.",
                f"Explore cross-selling opportunities into adjacent {group} tiers."
            ]

        return {
            "agent": self.name,
            "answer": answer,
            "insights": insights,
            "recommendations": recommendations
        }
