# Log_Analytics_Pipeline

Production-quality Python project that demonstrates functional programming concepts in a real-world log analytics system with:
- FastAPI backend API
- Functional log processing pipeline
- Next.js analytics dashboard
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
|   |-- app/
|   |-- components/
|   |-- hooks/
|   `-- lib/
|
|-- tests/
|   |-- test_api_integration.py
|   |-- test_api_routes.py
|   |-- test_pipeline.py
|   `-- test_analytics.py
|
|-- requirements.txt
|-- pytest.ini
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

## What Is New

- Richer backend analytics output with service volume, recurring error messages, clean-record ratio, unique IP counts, and service-scoped filtering
- Processing metadata including source tracking, generated timestamp, skipped malformed record counts, applied filter context, observation-window timestamps, and hourly traffic timelines
- Service health classification across all observed services, including quiet-service counts and busiest-service detection
- Next.js dashboard updates for service-aware filtering, persisted filters, quieter background refreshes, deeper error diagnostics, and resilient empty states across charts
- Better developer ergonomics with expanded API and pipeline coverage plus production build verification

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
- `GET /`
- `GET /api/analytics/health`
- `POST /api/analytics/analyze` (multipart file upload, optional `level` and `service` query params)
- `GET /api/analytics/analyze-sample` (optional `level` and `service` query params)

## Run Frontend Dashboard

```powershell
cd frontend
npm install
npm run dev
```

Open the dashboard at:
- `http://127.0.0.1:3000/`

Set an optional backend override in the frontend shell:

```powershell
$env:BACKEND_URL="http://127.0.0.1:8000"
```

Dashboard capabilities:
- Dashboard overview with health badge, traffic-vs-error trend comparisons, service health badges, observation-span context, and filter-scope summaries
- Log analytics upload flow with client-side file validation plus level and service filters
- Error insights page with service share analysis, recurring error messages, service health breakdowns, and operational diagnosis
- IP activity page with ranked offenders, unique IP coverage, average error load, and error-share breakdown
- Settings page with saved auto-refresh, persisted filters, table-density preferences, and operational metadata visibility

## Run Tests

```powershell
python -m pytest
```
