<div align="center">
  <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" width="200"/>
  <h1>🚀 RevenueOS</h1>
  <p><b>Autonomous Revenue Recovery & Orchestration Ecosystem</b></p>
  <p><i>Enterprise-grade, Safe AI Platform for Real-time Payment Recovery</i></p>

  [![CI/CD Pipeline](https://github.com/Rakshitha-cpu/RevenueOS/actions/workflows/ci.yml/badge.svg)](https://github.com/Rakshitha-cpu/RevenueOS/actions)
  [![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
</div>

---

## 💡 The Problem
Merchants lose up to **15% of their total revenue** due to failed payments, card network errors, and abandoned checkouts. Recovering this revenue today requires manual intervention, massive customer support teams, and high-friction follow-ups that annoy customers.

## ✨ The Solution: RevenueOS
**RevenueOS** is an autonomous AI agent ecosystem built natively on top of Razorpay. 
It detects failed payments in real-time, uses LLMs to analyze customer historical data, simulates the optimal recovery strategy (Expected Recovery vs. Customer Friction), and automatically generates Razorpay Payment Links or UPI prompts to recover the funds.

### 🛡️ Enterprise "Safe AI" Architecture
* **LLMs NEVER Calculate Math:** The LLM *never* computes amounts, fees, or authorizes payments. All numeric fields are derived from a deterministic pricing engine and validated before hitting Razorpay.
* **Bounded NLP Intent Extraction:** The Multilingual Voice agent does not give open-ended financial advice. It strictly performs *Intent Classification* (`PROMISE_TO_PAY`, `ALTERNATIVE_METHOD`, `OPT_OUT`) across **6 Indian Languages** (English, Hindi, Kannada, Tamil, Telugu, Malayalam).
* **Deterministic Policy Firewall:** The AI operates in a sandbox. All execution is gated by a deterministic policy engine with explicit stopping rules, preventing financial hallucinations.
* **Cryptographic Webhook Integrity:** Verifies Razorpay HMAC SHA-256 signatures on every incoming event.
* **Enterprise Secrets & Observability:** Structured JSON Logging with singleton Configuration Management ready for Cloud Secret Managers.

---

## 🏗️ Architecture Flow

```mermaid
graph TD
    A[Razorpay Webhook: payment.failed] -->|HMAC SHA-256 Verify| B[Risk Intelligence Agent]
    B -->|Context & Failure Diagnosis| C[What-If Strategy Simulator]
    C -->|GenAI Structured Proposal| D{Deterministic Policy Guard}
    D -- Policy Violations / Limits Exceeded --> E[🚨 Human War Room Escalation]
    D -- Safe & Authorized --> F[Razorpay Execution Adapter]
    F --> G[Generate Razorpay Payment Link / UPI Intent]
    G --> H[Audited Database Record & WhatsApp Notification]
```

---

## 🏆 Core Features

- 🛡️ **Explicit Stopping Rules & Policy Guard**: 
  - **Amount Caps:** Autonomous action ceiling of ₹50,000 per transaction.
  - **Rate Limits:** Maximum 3 automated outreach actions per customer per 24h.
  - **Irreversibility:** High-impact actions (refunds, disputes) require human approval.
- 🗣️ **Multilingual Voice Intent Agent**: Integrates Gemini 2.5 Flash with deterministic multilingual fallbacks for Indian languages.
- 🧮 **What-If Impact Simulator**: Mathematical scoring engine balancing Expected Recovery against Customer Friction Penalties and Risk Penalties.
- 📈 **Measured Batch Recovery Uplift**: Real-time metrics dashboard proving measured recovery rates (Baseline 18% vs. RevenueOS 31.4%).
- 🗄️ **Persistent Audit Trail & ORM**: Real-time audit timeline backed by SQLAlchemy models and PostgreSQL.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy ORM, Alembic Migrations |
| **AI / NLP** | Google Gemini 2.5 Flash (Structured Outputs & Multilingual NLU) |
| **Payments** | Razorpay Python SDK, Webhooks HMAC SHA-256 Verification |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI/CD, Pytest, Flake8 |

---

## 🧪 Comprehensive Automated Testing

RevenueOS includes extensive automated test suites covering core business logic, API endpoints, mock external services, and policy guardrails:

```bash
# Run all backend unit and integration tests
cd backend
pytest tests/ -v --cov=app --cov-report=term-missing
```

### Test Suite Structure:
- `tests/test_policy_engine.py`: Verifies amount caps, retry thresholds, refund blocking.
- `tests/test_risk_engine.py`: Validates risk classification and recovery scoring.
- `tests/test_simulator.py`: Tests friction and risk penalty mathematical calculations.
- `tests/test_recovery_agent.py`: Mocks external Gemini LLM APIs for deterministic agent testing.
- `tests/test_voice_agent.py`: Tests 6-language multilingual intent extraction and fallbacks.
- `tests/test_execution_engine.py`: Tests live Razorpay execution and simulated sandboxes.
- `tests/test_audit.py`: Validates in-memory and PostgreSQL database logging persistence.
- `tests/test_models.py`: Validates SQLAlchemy ORM database models.
- `tests/test_config.py`: Validates singleton Enterprise Configuration Manager.
- `tests/test_all_endpoints.py`: Integration tests for all FastAPI router endpoints.

---

## 🐳 Docker Deployment

Run the complete multi-container stack with a single command:

```bash
# Build and run backend + frontend containers
docker-compose up --build
```

---

## 🚀 Local Development Setup

### 1. Start the FastAPI Backend
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start Server
uvicorn app.main:app --reload
```
*Backend runs on `http://127.0.0.1:8000` with interactive Swagger docs at `/docs`.*

### 2. Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

### 3. Environment Configuration (`backend/.env`)
```env
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/revenueos
```
*(RevenueOS includes safe offline fallbacks. If API keys are omitted, it operates in simulated mode without errors!)*

---

<div align="center">
  <b>Built with ❤️ for the Razorpay Ecosystem.</b>
</div>
