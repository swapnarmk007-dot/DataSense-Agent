import os
import io
import json
import pandas as pd
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from graph.workflow import execute_graph_query
from tools.profiler import profile_dataset
from tools.cleaning import clean_dataset
from tools.visualization import generate_chart_config
from agents.report_agent import ReportAgent
from agents.anomaly_agent import AnomalyAgent
from utils.validators import validate_dataset_schema, validate_query_safety
from utils.helpers import safe_json_serialize

load_dotenv()

app = Flask(__name__)
CORS(app)

# Global dataset session memory
SESSION_DATA = {
    "df": None,
    "filename": "sample_sales.csv"
}

# Auto-load sample dataset if available
sample_path = os.path.join(os.path.dirname(__file__), "data", "sample_sales.csv")
if os.path.exists(sample_path):
    try:
        SESSION_DATA["df"] = pd.read_csv(sample_path)
    except Exception as e:
        print(f"Sample dataset load notice: {e}")

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint providing platform status and developer branding."""
    return jsonify({
        "status": "healthy",
        "service": "DataSense Agent REST API",
        "platform": "Agentic AI Data Analytics Platform",
        "developer": "Swapna V",
        "role": "Agentic AI Engineer | IPEC Solutions",
        "dataset_loaded": SESSION_DATA["df"] is not None,
        "rows": len(SESSION_DATA["df"]) if SESSION_DATA["df"] is not None else 0
    })

@app.route("/upload", methods=["POST"])
def upload_dataset():
    """Upload CSV or Excel dataset endpoint."""
    try:
        if "file" not in request.files:
            return jsonify({"status": "error", "message": "No file uploaded in form data."}), 400

        file = request.files["file"]
        filename = file.filename or "uploaded_dataset.csv"

        if filename.endswith(".csv"):
            df = pd.read_csv(file)
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file)
        else:
            return jsonify({"status": "error", "message": "Unsupported file format. Please upload CSV or Excel."}), 400

        is_valid, err_msg = validate_dataset_schema(df)
        if not is_valid:
            return jsonify({"status": "error", "message": err_msg}), 400

        SESSION_DATA["df"] = df
        SESSION_DATA["filename"] = filename

        profile = profile_dataset(df, filename)

        return jsonify({
            "status": "success",
            "message": f"Successfully uploaded and profiled {filename}.",
            "filename": filename,
            "rows": len(df),
            "columns": len(df.columns),
            "profile": safe_json_serialize(profile)
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/analyze", methods=["POST"])
def analyze_query():
    """Main Agentic multi-agent reasoning and deterministic analytics endpoint."""
    try:
        data = request.get_json() or {}
        question = data.get("question", "").strip()

        if not question:
            return jsonify({"status": "error", "message": "Field 'question' is required."}), 400

        is_safe, safety_err = validate_query_safety(question)
        if not is_safe:
            return jsonify({"status": "error", "message": safety_err}), 400

        df = SESSION_DATA.get("df")
        if df is None or df.empty:
            return jsonify({"status": "error", "message": "No dataset currently loaded. Please upload a dataset first."}), 400

        result = execute_graph_query(df, question, SESSION_DATA.get("filename", "dataset.csv"))
        return jsonify(safe_json_serialize(result))

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/profile", methods=["POST"])
def get_profile():
    """Data Profiler endpoint."""
    try:
        df = SESSION_DATA.get("df")
        if df is None or df.empty:
            return jsonify({"status": "error", "message": "No dataset loaded."}), 400

        profile = profile_dataset(df, SESSION_DATA.get("filename", "dataset.csv"))
        return jsonify({"status": "success", "profile": safe_json_serialize(profile)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/clean", methods=["POST"])
def clean_data_route():
    """Data Cleaning Agent execution endpoint."""
    try:
        df = SESSION_DATA.get("df")
        if df is None or df.empty:
            return jsonify({"status": "error", "message": "No dataset loaded."}), 400

        params = request.get_json() or {}
        cleaned_df, logs = clean_dataset(
            df,
            standardize_text=params.get("standardize_text", True),
            remove_duplicates=params.get("remove_duplicates", True),
            impute_missing=params.get("impute_missing", True),
            clip_outliers=params.get("clip_outliers", False)
        )
        SESSION_DATA["df"] = cleaned_df

        new_profile = profile_dataset(cleaned_df, SESSION_DATA.get("filename", "dataset.csv"))

        return jsonify({
            "status": "success",
            "message": f"Successfully performed {len(logs)} cleaning routines.",
            "logs": safe_json_serialize(logs),
            "profile": safe_json_serialize(new_profile),
            "rows": len(cleaned_df)
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/visualize", methods=["POST"])
def visualize_route():
    """Visualization Agent route."""
    try:
        df = SESSION_DATA.get("df")
        if df is None or df.empty:
            return jsonify({"status": "error", "message": "No dataset loaded."}), 400

        params = request.get_json() or {}
        chart_spec = generate_chart_config(
            df,
            chart_type=params.get("chart_type", "bar"),
            x_col=params.get("x_col"),
            y_col=params.get("y_col"),
            title=params.get("title")
        )
        return jsonify({"status": "success", "chart": safe_json_serialize(chart_spec)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/report", methods=["POST"])
def generate_report():
    """Generates structured analytical report."""
    try:
        df = SESSION_DATA.get("df")
        if df is None or df.empty:
            return jsonify({"status": "error", "message": "No dataset loaded."}), 400

        profile = profile_dataset(df, SESSION_DATA.get("filename", "dataset.csv"))
        anomaly_agent = AnomalyAgent()
        anom_res = anomaly_agent.execute(df)
        report_agent = ReportAgent()
        report_res = report_agent.execute(df, profile, anom_res["anomalies"])

        return jsonify({"status": "success", "report": report_res["report_markdown"]})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    """File download endpoint."""
    file_path = os.path.join(os.path.dirname(__file__), "data", filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return jsonify({"status": "error", "message": "File not found"}), 404

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
