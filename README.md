# Log_Analytics_Pipeline

Production-quality Python project that demonstrates functional programming concepts in a real-world log analytics system with:
- FastAPI backend API
- Functional log processing pipeline
- Streamlit dashboard
- Pytest coverage

## Project Structure

```text
Log_Analytics_Pipeline
|
|-- data/
|   `-- server_logs.txt
|
|-- backend/
|   |-- app.py
|   |-- api/
|   |   |-- __init__.py
|   |   `-- routes.py
|   `-- pipeline/
|       |-- __init__.py
|       |-- stream_utils.py
|       |-- functional_utils.py
|       |-- filters.py
|       |-- analytics.py
|       `-- pipeline.py
|
|-- frontend/
|   `-- dashboard.py
|
|-- tests/
|   |-- test_pipeline.py
|   `-- test_analytics.py
|
|-- requirements.txt
|-- .gitignore
`-- README.md
```

## Functional Programming Concepts Demonstrated

- Higher-order functions: `compose`, stream mappers/filters, predicate combinators
- Lambda functions: inline reducers, filter predicates
- Closures: level/service/message filters
- Currying: `curry_binary` and curried service-ranking usage
- Partial functions: `functools.partial` in in-memory pipeline steps
- Function composition: `transform_pipeline` and `compose`
- Lazy evaluation with generators: file line streaming + iterator pipelines
- Streams/iterator pipelines: `map_stream`, `filter_stream`, chained transformations
- Recursion: `recursive_map`, `recursive_total`, `reduce_recursive`
- Immutable-style updates: dictionary counters returned as new values
- Pure transformations: parsing, filtering, and aggregations separated from I/O

## Log Format

The parser expects this format:

```text
timestamp|level|service|ip|message
```

Example:

```text
2026-03-01T10:15:00Z|ERROR|billing-service|10.0.0.8|Payment gateway timeout
```

## Setup in VSCode

1. Open folder `Log_Analytics_Pipeline` in VSCode.
2. Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Install dependencies:

```powershell
pip install -r requirements.txt
```

## Run Backend API

```powershell
uvicorn backend.app:app --reload
```

Backend endpoints:
- `GET /api/analytics/health`
- `POST /api/analytics/analyze` (multipart file upload, optional `level` query param)

## Run Streamlit Dashboard

```powershell
streamlit run frontend/dashboard.py
```

Dashboard provides:
- Upload log file
- Analyze sample file from `data/server_logs.txt`
- Visuals:
  - Error frequency by IP
  - Log level distribution
  - Top failing services
  - Timeline of errors

## Run Tests

```powershell
pytest -q
```
