"""Streamlit dashboard for the log analytics pipeline."""

from __future__ import annotations

from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st

from backend.pipeline.pipeline import PipelineResult, run_pipeline, run_pipeline_from_content


def _counter_to_dataframe(counter: dict[str, int], label_key: str, value_key: str) -> pd.DataFrame:
    """Convert dictionary counters into a sorted DataFrame."""
    frame = pd.DataFrame([{label_key: key, value_key: value} for key, value in counter.items()])
    if frame.empty:
        return frame
    return frame.sort_values(by=value_key, ascending=False)


def render_metrics(result: PipelineResult) -> None:
    """Render summary metrics and charts."""
    col1, col2 = st.columns(2)
    col1.metric("Total Records", result.total_records)
    col2.metric("Total Errors", result.total_errors)

    ip_frame = _counter_to_dataframe(result.error_counts_per_ip, "IP", "Errors")
    level_frame = _counter_to_dataframe(result.log_level_distribution, "Level", "Count")
    service_frame = pd.DataFrame(
        [{"Service": service, "Errors": count} for service, count in result.top_failing_services]
    )
    timeline_frame = _counter_to_dataframe(result.error_timeline, "Hour", "Errors")

    st.subheader("Error Frequency by IP")
    if not ip_frame.empty:
        st.plotly_chart(px.bar(ip_frame, x="IP", y="Errors"), use_container_width=True)
    else:
        st.info("No error data available.")

    st.subheader("Log Level Distribution")
    if not level_frame.empty:
        st.plotly_chart(px.pie(level_frame, names="Level", values="Count"), use_container_width=True)
    else:
        st.info("No level distribution available.")

    st.subheader("Top Failing Services")
    if not service_frame.empty:
        st.plotly_chart(
            px.bar(service_frame, x="Service", y="Errors", color="Errors", color_continuous_scale="Reds"),
            use_container_width=True,
        )
    else:
        st.info("No failing service data available.")

    st.subheader("Timeline of Errors")
    if not timeline_frame.empty:
        ordered = timeline_frame.sort_values("Hour")
        st.plotly_chart(px.line(ordered, x="Hour", y="Errors", markers=True), use_container_width=True)
    else:
        st.info("No timeline data available.")


def main() -> None:
    """Main Streamlit entrypoint."""
    st.set_page_config(page_title="Log Analytics Pipeline", layout="wide")
    st.title("Log Analytics Pipeline Dashboard")
    st.caption("Functional programming based server-log analytics")

    level = st.selectbox("Optional level filter", options=["ALL", "ERROR", "WARN", "INFO", "DEBUG"])
    chosen_level = None if level == "ALL" else level

    uploaded_file = st.file_uploader("Upload a server log file", type=["txt", "log"])

    st.markdown("Or analyze default sample data file from project `data/` directory.")
    use_default = st.button("Run on Sample Dataset")

    if uploaded_file is not None:
        content = uploaded_file.getvalue().decode("utf-8", errors="ignore")
        result = run_pipeline_from_content(content, level=chosen_level)
        render_metrics(result)
    elif use_default:
        default_path = Path("data/server_logs.txt")
        if not default_path.exists():
            st.error("Default data file not found at data/server_logs.txt")
            return
        result = run_pipeline(default_path, level=chosen_level)
        render_metrics(result)


if __name__ == "__main__":
    main()

