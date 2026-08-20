import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import requests
import json
import os
from datetime import datetime

# Set Streamlit page config
st.set_page_config(
    page_title="DataSense Agent — Autonomous AI Data Analyst",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1E293B;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #64748B;
        margin-bottom: 1.5rem;
    }
    .dev-badge {
        display: inline-block;
        background: #F1F5F9;
        color: #0F172A;
        padding: 0.35rem 0.8rem;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.85rem;
        border: 1px solid #E2E8F0;
        margin-bottom: 1rem;
    }
    .metric-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .step-box {
        background: #F8FAFC;
        border-left: 4px solid #3B82F6;
        padding: 0.75rem 1rem;
        margin-bottom: 0.5rem;
        border-radius: 0 8px 8px 0;
    }
</style>
""", unsafe_allow_html=True)

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:5000")

# Session state initialization
if "df" not in st.session_state:
    sample_csv_path = os.path.join(os.path.dirname(__file__), "data", "sample_sales.csv")
    if os.path.exists(sample_csv_path):
        st.session_state.df = pd.read_csv(sample_csv_path)
        st.session_state.filename = "sample_sales.csv"
    else:
        st.session_state.df = None
        st.session_state.filename = ""

if "chat_history" not in st.session_state:
    st.session_state.chat_history = [
        {
            "role": "assistant",
            "content": "Hello! I am **DataSense Agent**, your Autonomous AI Data Analyst developed by **Swapna V**. Ask me anything about your dataset, or select a demo prompt below."
        }
    ]

# Sidebar
with st.sidebar:
    st.markdown("## 🧠 DataSense Agent")
    st.markdown("**Autonomous AI Data Analyst**")
    st.markdown('<div class="dev-badge">👨‍💻 Swapna V | Agentic AI Engineer</div>', unsafe_allow_html=True)
    st.markdown("---")

    menu = st.radio(
        "Navigation",
        [
            "📊 Dashboard",
            "📁 Upload Dataset",
            "💬 AI Data Chat",
            "🔍 Data Profile",
            "🧹 Data Cleaning",
            "📈 Visual Analytics",
            "⚠️ Anomaly Detection",
            "🔮 Forecasting",
            "💡 AI Insights",
            "📄 Report"
        ]
    )

    st.markdown("---")
    if st.session_state.df is not None:
        st.success(f"**Loaded:** {st.session_state.filename}")
        st.caption(f"Rows: {len(st.session_state.df):,} | Columns: {len(st.session_state.df.columns)}")
    else:
        st.warning("No dataset loaded.")

# Header
st.markdown('<div class="main-header">🧠 DataSense Agent</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Autonomous Agentic AI Data Analytics Platform &bull; Developed by <b>Swapna V</b> (Agentic AI Engineer | IPEC Solutions)</div>', unsafe_allow_html=True)

# 1. DASHBOARD
if menu == "📊 Dashboard":
    st.subheader("Executive Data Health & Key Metrics")
    if st.session_state.df is None:
        st.info("Please upload a dataset or load the sample sales dataset to view the dashboard.")
    else:
        df = st.session_state.df
        row_cnt, col_cnt = df.shape
        missing_cnt = df.isna().sum().sum()
        dup_cnt = df.duplicated().sum()
        quality_score = max(10, min(100, int(100 - ((missing_cnt / (row_cnt * col_cnt if row_cnt*col_cnt>0 else 1))*150 + (dup_cnt/row_cnt if row_cnt>0 else 0)*120))))

        c1, c2, c3, c4, c5 = st.columns(5)
        c1.metric("Total Records", f"{row_cnt:,}")
        c2.metric("Total Columns", col_cnt)
        c3.metric("Missing Values", f"{missing_cnt:,}")
        c4.metric("Duplicates", f"{dup_cnt:,}")
        c5.metric("Data Quality Score", f"{quality_score}%")

        st.markdown("---")
        st.subheader("Dataset Preview")
        st.dataframe(df.head(10), use_container_width=True)

        # Quick charts
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()

        if len(num_cols) >= 1 and len(cat_cols) >= 1:
            col_a, col_b = st.columns(2)
            with col_a:
                fig1 = px.bar(
                    df.groupby(cat_cols[0])[num_cols[0]].sum().reset_index().sort_values(by=num_cols[0], ascending=False).head(8),
                    x=cat_cols[0],
                    y=num_cols[0],
                    title=f"Total {num_cols[0]} by {cat_cols[0]}",
                    template="plotly_white",
                    color=num_cols[0],
                    color_continuous_scale="Blues"
                )
                st.plotly_chart(fig1, use_container_width=True)

            with col_b:
                if len(cat_cols) > 1:
                    fig2 = px.pie(
                        df,
                        names=cat_cols[1],
                        values=num_cols[0],
                        title=f"{num_cols[0]} Distribution by {cat_cols[1]}",
                        template="plotly_white",
                        hole=0.4
                    )
                    st.plotly_chart(fig2, use_container_width=True)

# 2. UPLOAD DATASET
elif menu == "📁 Upload Dataset":
    st.subheader("Upload CSV or Excel Dataset")
    uploaded_file = st.file_uploader("Choose CSV or Excel file", type=["csv", "xlsx", "xls"])
    
    col_u1, col_u2 = st.columns(2)
    with col_u1:
        if uploaded_file is not None:
            try:
                if uploaded_file.name.endswith(".csv"):
                    df = pd.read_csv(uploaded_file)
                else:
                    df = pd.read_excel(uploaded_file)
                st.session_state.df = df
                st.session_state.filename = uploaded_file.name
                st.success(f"Successfully loaded {uploaded_file.name} ({len(df):,} rows)")
            except Exception as e:
                st.error(f"Error reading file: {e}")

    with col_u2:
        if st.button("🔄 Reset to Demo Sales Dataset"):
            sample_csv_path = os.path.join(os.path.dirname(__file__), "data", "sample_sales.csv")
            if os.path.exists(sample_csv_path):
                st.session_state.df = pd.read_csv(sample_csv_path)
                st.session_state.filename = "sample_sales.csv"
                st.success("Loaded Demo Sales Dataset!")

# 3. AI DATA CHAT
elif menu == "💬 AI Data Chat":
    st.subheader("Autonomous Multi-Agent AI Data Chat")
    
    # Suggested Demo Questions
    st.markdown("**Suggested Quick Questions:**")
    sq1, sq2, sq3, sq4 = st.columns(4)
    q_selected = None
    if sq1.button("Which region has the highest revenue?"):
        q_selected = "Which region generated the highest revenue?"
    if sq2.button("Show monthly sales trend"):
        q_selected = "Show monthly sales."
    if sq3.button("Find anomalies in dataset"):
        q_selected = "Find anomalies in sales."
    if sq4.button("Forecast next 3 months"):
        q_selected = "Forecast sales for the next 3 months."

    # Display chat history
    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            if "steps" in msg:
                with st.expander("🔍 View Multi-Agent Execution Trace"):
                    for s in msg["steps"]:
                        st.markdown(f"**[{s.get('agent', 'Agent')}]**: {s.get('action')}")
            if "chart" in msg and msg["chart"]:
                c_spec = msg["chart"]
                try:
                    c_df = pd.DataFrame(c_spec.get("data", []))
                    if not c_df.empty:
                        fig = px.bar(c_df, x=c_spec.get("x_axis"), y=c_spec.get("y_axis"), title=c_spec.get("title"), template="plotly_white")
                        st.plotly_chart(fig, use_container_width=True)
                except Exception:
                    pass

    # Chat Input
    user_query = st.chat_input("Ask a question about your dataset...") or q_selected

    if user_query:
        st.session_state.chat_history.append({"role": "user", "content": user_query})
        with st.chat_message("user"):
            st.markdown(user_query)

        with st.chat_message("assistant"):
            if st.session_state.df is None:
                st.error("Please load a dataset first.")
            else:
                from graph.workflow import execute_graph_query
                with st.spinner("🤖 Multi-Agent Graph executing..."):
                    res = execute_graph_query(st.session_state.df, user_query, st.session_state.filename)
                    
                    st.markdown(res["answer"])
                    
                    if res.get("insights"):
                        st.markdown("**Key Insights:**")
                        for ins in res["insights"]:
                            st.markdown(f"- {ins}")
                            
                    if res.get("recommendations"):
                        st.markdown("**Strategic Recommendations:**")
                        for rec in res["recommendations"]:
                            st.markdown(f"- {rec}")

                    with st.expander("🔍 Multi-Agent Execution Trace", expanded=False):
                        for s in res.get("steps", []):
                            st.markdown(f"**[{s['agent']}]**: {s['action']}")

                    if res.get("chart"):
                        c_spec = res["chart"]
                        c_df = pd.DataFrame(c_spec.get("data", []))
                        if not c_df.empty:
                            fig = px.bar(c_df, x=c_spec.get("x_axis"), y=c_spec.get("y_axis"), title=c_spec.get("title"), template="plotly_white")
                            st.plotly_chart(fig, use_container_width=True)

                    st.session_state.chat_history.append({
                        "role": "assistant",
                        "content": res["answer"],
                        "steps": res.get("steps"),
                        "chart": res.get("chart")
                    })

# 4. DATA PROFILE
elif menu == "🔍 Data Profile":
    st.subheader("Data Profiler Agent Output")
    if st.session_state.df is not None:
        from tools.profiler import profile_dataset
        prof = profile_dataset(st.session_state.df, st.session_state.filename)
        st.json(prof)
    else:
        st.info("Upload dataset to view profile.")

# 5. DATA CLEANING
elif menu == "🧹 Data Cleaning":
    st.subheader("Data Cleaning Agent")
    if st.session_state.df is not None:
        c1, c2 = st.columns(2)
        with c1:
            st_text = st.checkbox("Standardize Categorical Text", value=True)
            rm_dup = st.checkbox("Remove Duplicate Rows", value=True)
        with c2:
            imp_miss = st.checkbox("Impute Missing Values", value=True)
            clip_out = st.checkbox("Clip Extreme Outliers (1.5x IQR)", value=False)

        if st.button("🚀 Run Data Cleaning Pipeline"):
            from tools.cleaning import clean_dataset
            cleaned, logs = clean_dataset(st.session_state.df, st_text, rm_dup, imp_miss, clip_out)
            st.session_state.df = cleaned
            st.success(f"Cleaning complete! Applied {len(logs)} operations.")
            for l in logs:
                st.info(f"**{l['title']}**: {l['summary']}")
    else:
        st.info("Upload dataset to run cleaning.")

# 6. VISUAL ANALYTICS
elif menu == "📈 Visual Analytics":
    st.subheader("Visual Analytics Studio")
    if st.session_state.df is not None:
        df = st.session_state.df
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()

        c1, c2, c3 = st.columns(3)
        c_type = c1.selectbox("Chart Type", ["Bar", "Line", "Scatter", "Pie", "Box", "Histogram"])
        x_c = c2.selectbox("X-Axis", df.columns)
        y_c = c3.selectbox("Y-Axis (Numeric)", num_cols if num_cols else df.columns)

        if c_type == "Bar":
            fig = px.bar(df, x=x_c, y=y_c, title=f"{y_c} by {x_c}", template="plotly_white")
        elif c_type == "Line":
            fig = px.line(df, x=x_c, y=y_c, title=f"{y_c} over {x_c}", template="plotly_white")
        elif c_type == "Scatter":
            fig = px.scatter(df, x=x_c, y=y_c, title=f"{y_c} vs {x_c}", template="plotly_white")
        elif c_type == "Pie":
            fig = px.pie(df, names=x_c, values=y_c, title=f"{y_c} Share by {x_c}", template="plotly_white")
        elif c_type == "Box":
            fig = px.box(df, x=x_c, y=y_c, title=f"Distribution of {y_c} across {x_c}", template="plotly_white")
        else:
            fig = px.histogram(df, x=y_c, title=f"Distribution of {y_c}", template="plotly_white")

        st.plotly_chart(fig, use_container_width=True)

# 7. ANOMALY DETECTION
elif menu == "⚠️ Anomaly Detection":
    st.subheader("Anomaly Detection Agent")
    if st.session_state.df is not None:
        from agents.anomaly_agent import AnomalyAgent
        anom_agent = AnomalyAgent()
        res = anom_agent.execute(st.session_state.df)
        st.warning(f"Detected **{res['anomalies_count']} anomalous occurrences**.")
        if res["anomalies"]:
            st.dataframe(pd.DataFrame(res["anomalies"]), use_container_width=True)

# 8. FORECASTING
elif menu == "🔮 Forecasting":
    st.subheader("Forecasting Agent")
    if st.session_state.df is not None:
        from agents.forecasting_agent import ForecastingAgent
        fc_agent = ForecastingAgent()
        res = fc_agent.execute(st.session_state.df)
        fc_data = res["forecast_result"]
        if "error" not in fc_data:
            st.success(f"Trajectory: **{fc_data.get('trend_direction', '').upper()}** | Growth: **{fc_data.get('growth_rate_pct')}%**")
            hist_df = pd.DataFrame(fc_data["historical"])
            fut_df = pd.DataFrame(fc_data["forecast"])
            
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=hist_df["period"], y=hist_df["actual"], mode="lines+markers", name="Historical"))
            fig.add_trace(go.Scatter(x=fut_df["period"], y=fut_df["forecast"], mode="lines+markers", name="Forecast", line=dict(dash="dash", color="orange")))
            fig.update_layout(title="Time-Series Forecasting & Confidence Envelope", template="plotly_white")
            st.plotly_chart(fig, use_container_width=True)
            st.dataframe(fut_df, use_container_width=True)
        else:
            st.error(fc_data["error"])

# 9. AI INSIGHTS
elif menu == "💡 AI Insights":
    st.subheader("Strategic AI Insights")
    if st.session_state.df is not None:
        from agents.insight_agent import InsightAgent
        from tools.analysis import group_by_analysis
        ins_agent = InsightAgent()
        num_cols = st.session_state.df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = st.session_state.df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        if num_cols and cat_cols:
            analysis = group_by_analysis(st.session_state.df, cat_cols[0], num_cols[0])
            out = ins_agent.execute("Provide executive findings", analysis)
            st.markdown(out["answer"])
            st.markdown("### Key Business Findings")
            for i in out["insights"]:
                st.info(f"💡 {i}")
            st.markdown("### Strategic Recommendations")
            for r in out["recommendations"]:
                st.success(f"🎯 {r}")

# 10. REPORT
elif menu == "📄 Report":
    st.subheader("Executive Report Generator")
    if st.session_state.df is not None:
        from tools.profiler import profile_dataset
        from agents.report_agent import ReportAgent
        from agents.anomaly_agent import AnomalyAgent
        prof = profile_dataset(st.session_state.df, st.session_state.filename)
        anom = AnomalyAgent().execute(st.session_state.df)
        rep = ReportAgent().execute(st.session_state.df, prof, anom["anomalies"])
        
        st.markdown(rep["report_markdown"])
        st.download_button(
            "📥 Download Analytical Audit Report (.md)",
            data=rep["report_markdown"],
            file_name=f"DataSense_Report_{datetime.now().strftime('%Y%m%d')}.md",
            mime="text/markdown"
        )
