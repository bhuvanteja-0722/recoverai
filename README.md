# RecoverAI — Financial Intelligence System

> **"An AI command center watching money move through a living financial network."**

RecoverAI is a next-generation AI revenue recovery agent designed for modern payment infrastructure. It continuously monitors transaction flows, diagnoses payment failures in real time using NVIDIA NIM / Llama 3.1 microservices, executes policy-governed bounded recovery actions via Razorpay, asserts outcome verification, and produces tamper-evident SHA-256 audit trails.

---

## ⚡ Core Product Capabilities

1. **Transaction Intelligence Flow**: Real-time 3D & 2D WebGL visual graph of network transactions, identifying transient anomalies before revenue is permanently lost.
2. **NVIDIA NIM Integration**: AI diagnosis categorizing failure root causes (technical timeouts, issuer auth failures, insufficient balances) with bounded confidence scoring and 429 exponential backoff resilience.
3. **Policy-Governed Execution**: Automated bounded intervention (gateway retry, payment links, targeted coupons, human escalation) guarded by strict business rules.
4. **Outcome Verification Assertion**: Active outcome verification service with endpoint (`GET /api/v1/verification/`) confirming payment status reconciliation.
5. **Tamper-Evident Audit Trail**: SHA-256 integrity hash attached to every system action and audit log event.
6. **Zero Hardcoded Secrets**: Strict environment variable configuration (`NGC_API_KEY`, `RAZORPAY_KEY_ID`, `INTERNAL_API_KEY`).

---

## 🛠️ Architecture & Tech Stack

```
razorpay/
├── backend/                  # FastAPI (Python 3.11)
│   ├── app/
│   │   ├── api/v1/           # Health, Verification, Audit, Agent, Tools
│   │   ├── models/           # SQLAlchemy models (Transaction, AuditEvent, VerificationRecord)
│   │   ├── schemas/          # Pydantic v2 validation models
│   │   └── services/         # NIM 429 handler, Policy Engine, Razorpay Integration
│   └── tests/                # Pytest unit & integration test suite
├── frontend/                 # React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── components/       # Hero, DetectSection, RecoveryScene (Three.js), Dashboard
│   │   ├── hooks/            # useApi, useMouseParallax, useReducedMotion
│   │   └── services/         # Centralized API layer with error boundaries
├── docker-compose.yml        # Production Docker orchestration
└── .env.example              # Environment variables template
```

---

## 🚀 Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (optional for containerized deployment)

### 1. Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run FastAPI backend on port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Run Vite dev server on port 5173
npm run dev
```

### 3. Docker Compose (Full Stack)

```bash
cp .env.example .env
docker-compose up --build
```

---

## 🧪 Verification & Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/health` | GET | System health & service operational status |
| `/api/v1/verification/` | GET | **Verification Service Status** (Active, Operational) |
| `/api/v1/verification/action` | POST | Verify outcome of a recovery action |
| `/api/v1/agent/diagnose` | POST | Run NVIDIA NIM AI diagnosis on a failed transaction |
| `/api/v1/agent/intervene` | POST | Execute policy-checked recovery intervention |
| `/api/v1/audit/stats` | GET | Fetch tamper-evident audit logs & SHA-256 hashes |

---

## 🔐 Security & Reliability

- **NIM 429 Handling**: Exponential backoff with jitter and deterministic rule-based fallback.
- **Rate Limiting**: `slowapi` rate limits on auth and AI endpoints.
- **CORS Protection**: Explicit origins whitelist.
- **Error Boundaries**: Clean user-facing error messages without internal stack trace leakage.
