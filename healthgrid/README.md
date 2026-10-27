# IMISI HealthGrid

IMISI HealthGrid is a synthetic-data MVP for payer-provider interoperability. It includes a provider console, an insurer work queue, an operations dashboard, and a TypeScript API.

## Requirements

- Node.js 20 or later
- npm 9 or later

## Run locally

From this directory:

```bash
npm install
npm run dev
```

The frontend is available at [http://localhost:3000](http://localhost:3000) and the API at [http://localhost:5000](http://localhost:5000). To build all workspaces, run `npm run build`.

The backend uses an in-memory store, so authorisation requests and audit events are reset when the backend restarts. Member records are synthetic demo data only. This MVP does not provide production authentication, persistence, or a compliance certification; do not enter real patient information.

## API

All API routes except the health check are under `/api/v1`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Backend health |
| GET | `/api/v1/members/:id` | Look up synthetic member eligibility |
| POST | `/api/v1/authorisations` | Create an authorisation request |
| GET | `/api/v1/authorisations` | List requests |
| GET | `/api/v1/authorisations/:id` | Get a request |
| POST | `/api/v1/authorisations/:id/actions` | Record a workflow action |
| POST | `/api/v1/authorisations/check-completeness` | Check required request fields |
| GET | `/api/v1/metrics/operations` | Get operations metrics |
| GET | `/api/v1/audit-logs` | List audit events |

An action request uses `action`, `targetState`, and optionally `reviewer_id` and `comment`. The action and target state must agree with the workflow transition matrix in `shared/types/constraints.ts`.
