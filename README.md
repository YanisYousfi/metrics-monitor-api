# Metrics Monitor API

A REST API for collecting, querying, and analyzing application performance metrics. Built with Express, TypeScript, PostgreSQL, and Zod.

## Features

- **Metric ingestion** — Record `response_time`, `error_rate`, and `memory_usage` metrics from registered sources
- **Filtered queries** — Retrieve metrics by source, type, and date range
- **Aggregate statistics** — Get avg, min, max, count, and p95 values computed in PostgreSQL
- **Anomaly detection** — Identify outliers using a sliding-window standard deviation model (2σ threshold over a 5-row window), computed entirely in SQL with window functions

## Tech Stack

| Layer      | Technology           |
| ---------- | -------------------- |
| Runtime    | Node.js + TypeScript |
| Framework  | Express              |
| Database   | PostgreSQL           |
| Validation | Zod                  |

## Project Structure

```
src/
├── index.ts                  # App entry point, middleware registration
├── db.ts                     # PostgreSQL connection pool
├── routes/
│   └── metrics.ts            # All metric endpoints
├── models/
│   ├── common.ts             # Shared schemas (date range, metric type enum)
│   ├── metrics.ts            # Metric, MetricStats, Anomaly interfaces
│   └── source.ts             # Source ID param schema
├── middleware/
│   ├── logger.ts             # Request logging (method, path, status, duration)
│   └── errorHandler.ts       # Centralized error handling (Zod → 400, else → 500)
└── utils/
    └── asyncHandler.ts       # Wraps async route handlers to forward errors
migrations/
├── 001_create_sources.sql
├── 002_create_metrics.sql
└── 003_create_alerts.sql
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14

### Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/YanisYousfi/metrics-monitor-api.git
   cd metrics-monitor-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file at the project root:

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=metrics_monitor
   PORT=3000
   ```

4. **Database (Docker)**

```bash
docker run -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=metrics_monitor -v pgdata:/var/lib/postgresql -v ./migrations:/docker-entrypoint-initdb.d postgres
```

This starts PostgreSQL and runs all migrations automatically on first boot.

5. **Run migrations**

   Execute the SQL files in `migrations/` against your database, in order:

   ```bash
   psql -U postgres -d metrics_monitor -f migrations/001_create_sources.sql
   psql -U postgres -d metrics_monitor -f migrations/002_create_metrics.sql
   psql -U postgres -d metrics_monitor -f migrations/003_create_alerts.sql
   ```

6. **Start the dev server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check

| Method | Path      | Description                         |
| ------ | --------- | ----------------------------------- |
| `GET`  | `/health` | Returns server status and timestamp |

### Metrics

| Method | Path                  | Description                  |
| ------ | --------------------- | ---------------------------- |
| `POST` | `/metrics`            | Record a new metric          |
| `GET`  | `/metrics/stats`      | Get aggregate statistics     |
| `GET`  | `/metrics/anomalies`  | Detect anomalous data points |
| `GET`  | `/metrics/:source_id` | Get metrics for a source     |

---

#### `POST /metrics`

Record a metric data point.

**Request body:**

```json
{
  "source_id": 1,
  "metric_type": "response_time",
  "value": 142.5,
  "timestamp": "2026-03-29T12:00:00.000Z"
}
```

| Field         | Type     | Required | Notes                                                 |
| ------------- | -------- | -------- | ----------------------------------------------------- |
| `source_id`   | `number` | ✓        | Must reference an existing source                     |
| `metric_type` | `string` | ✓        | One of: `response_time`, `error_rate`, `memory_usage` |
| `value`       | `number` | ✓        | Must be ≥ 0                                           |
| `timestamp`   | `string` |          | ISO 8601 datetime. Defaults to now                    |

**Response:** `201 Created`

```json
{
  "id": 1,
  "source_id": 1,
  "metric_type": "response_time",
  "value": 142.5,
  "created_at": "2026-03-29T12:00:00.000Z"
}
```

---

#### `GET /metrics/:source_id`

Retrieve all metrics for a given source, with optional filters.

**Query parameters:**

| Param         | Type     | Required | Notes                |
| ------------- | -------- | -------- | -------------------- |
| `metric_type` | `string` |          | Filter by type       |
| `date_from`   | `string` |          | ISO 8601 lower bound |
| `date_to`     | `string` |          | ISO 8601 upper bound |

**Example:**

```
GET /metrics/1?metric_type=response_time&date_from=2026-03-01T00:00:00Z
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "source_id": 1,
      "metric_type": "response_time",
      "value": 142.5,
      "created_at": "2026-03-29T12:00:00.000Z"
    }
  ]
}
```

---

#### `GET /metrics/stats`

Get aggregate statistics across metrics. All query parameters are optional, allowing global or filtered aggregation.

**Query parameters:**

| Param         | Type     | Required | Notes                |
| ------------- | -------- | -------- | -------------------- |
| `source_id`   | `number` |          | Filter by source     |
| `metric_type` | `string` |          | Filter by type       |
| `date_from`   | `string` |          | ISO 8601 lower bound |
| `date_to`     | `string` |          | ISO 8601 upper bound |

**Response:** `200 OK`

```json
{
  "data": [
    {
      "avg_value": 150.25,
      "min_value": 42.0,
      "max_value": 380.1,
      "count": 128,
      "p95_value": 310.5
    }
  ]
}
```

---

#### `GET /metrics/anomalies`

Detect anomalous metric values using a sliding-window analysis. A data point is flagged as anomalous when its value exceeds the moving average by more than 2 standard deviations over a 5-row window, partitioned by source and metric type.

**Query parameters:** Same as `/metrics/stats`.

**Response:** `200 OK`

```json
{
  "data": [
    {
      "source_id": 1,
      "metric_type": "response_time",
      "value": 892.3,
      "moving_avg": 145.2,
      "moving_stddev": 28.4,
      "created_at": "2026-03-29T14:32:00.000Z"
    }
  ]
}
```

## Error Handling

All validation errors return `400` with Zod issue details. Unhandled errors return `500`.

```json
{
  "errors": [
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "string",
      "path": ["value"],
      "message": "Expected number, received string"
    }
  ]
}
```

## License

ISC
