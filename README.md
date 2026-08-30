# 🛡️ RevenueOS: Safety-First Autonomous Payment Recovery Engine

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/Rakshitha-cpu/RevenueOS)
[![Architecture](https://img.shields.io/badge/Architecture-Deterministic%20PolicyGuard-blue.svg)](https://github.com/Rakshitha-cpu/RevenueOS)
[![Batch Test](https://img.shields.io/badge/Simulation-50%20Synthetic%20Scenarios-success.svg)](https://github.com/Rakshitha-cpu/RevenueOS)
[![Reversal Latency](https://img.shields.io/badge/Demo%20Latency-2.18s%20(Simulated%20Rail)-purple.svg)](https://github.com/Rakshitha-cpu/RevenueOS)
[![Audit Ledger](https://img.shields.io/badge/Audit%20Ledger-SHA--256%20Merkle%20Chained-blueviolet.svg)](https://github.com/Rakshitha-cpu/RevenueOS)

> **A safety-first autonomous payment recovery system that converts failed checkout transactions into recoverable revenue without allowing AI to directly control irreversible financial actions.**  
> Built for the **Razorpay AI Builder Hackathon**.  
> **GitHub Repository:** [https://github.com/Rakshitha-cpu/RevenueOS](https://github.com/Rakshitha-cpu/RevenueOS)

---

## 🎯 The Core Problem & Motivation
Payment gateway drop-offs and bank network timeouts (`E_504`) are among the largest sources of checkout friction in Indian e-commerce. When a transaction fails, traditional systems either spam the customer with blind retries or force them into a multi-day support loop.

RevenueOS solves this by combining **contextual AI reasoning for customer engagement** with **hardcoded deterministic guardrails for financial execution**.

---

## 🛡️ The Architecture: Safety-First Financial AI

In financial systems, **LLMs cannot be trusted to execute irreversible money movement directly**. RevenueOS enforces a strict 4-stage bounded execution loop:

```
                          FAILED CHECKOUT (E_504 / Limit / Timeout)
                                             │
                                             ▼
                                  [ AI DECISION ENGINE ]
                             (Gemini 2.5 Flash / Local NLP)
                             • Probes motive (delivery / price)
                             • Recommends channel (WhatsApp / Split)
                                             │
                                             ▼
                                ┌─────────────────────────┐
                                │  🛡️ PolicyGuard Engine  │
                                └────────────┬────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
                 [ APPROVED ]                                [ REJECTED ]
                       │                                           │
                       ▼                                           ▼
             [ BOUNDED EXECUTOR ]                         [ ESCALATE / HALT ]
        • 1-Tap UPI WhatsApp link                     • Risk > 85 ➔ Block fraud
        • Simulated instant reversal                  • Cart > ₹25k ➔ Senior Specialist
        • Idempotency key (15m TTL)                   • DND Flag ➔ Strict suppression
                       │                                           │
                       └─────────────────────┬─────────────────────┘
                                             │
                                             ▼
                                    [ AUDIT & TELEMETRY ]
                           • Cryptographic SHA-256 Merkle chain
                           • Forensic event timestamping
```

### ⚡ Graceful Degradation & Fallback Rule:
* **AI Unavailable or High Latency:** System seamlessly falls back to a **deterministic rule engine**.
* **Rules Ambiguous:** System escalates to a **human supervisor (Senior Specialist Vikram)**.

---

## 📊 Benchmark Evaluation (50 Synthetic Scenarios)

To evaluate the system's decision-making across varied failure modes, we executed a test suite of **50 synthetic transaction scenarios** modeled after common Indian gateway failure patterns (HDFC, SBI, ICICI, Axis, Kotak):

| Evaluation Metric | Benchmark Result | Traditional Baseline |
|---|---|---|
| **Evaluated Test Cohort** | **50 Synthetic Failure Scenarios** | — |
| **Total Test Cart Volume** | **₹5,13,947** | — |
| **Simulated Recovery Volume** | **₹4,50,207 (43 / 50 scenarios)** | ~10% via generic SMS |
| **DNC / Consent Halts Respected** | **7 cases strictly halted** | Often retried repeatedly |
| **Recovery Strategy Success Rate** | **86.0% across simulated cohort** | 12% industry average |
| **Demo Pipeline Latency** | **2.18 seconds (Simulated NPCI UTR flow)** | 5–7 business days |
| **Reproducible Test Dataset** | [`backend/batch_test_results.csv`](file:///backend/batch_test_results.csv) | — |

---

## 🔧 Runtime Failure Recovery (What Broke & How We Fixed It)

Building reliable autonomous systems requires identifying edge-case failures and engineering deterministic software guards:

| Initial Failure Observed | Root Cause | Engineering Fix Implemented |
|---|---|---|
| **AI suggested retries on high-risk carts** | Fraud score threshold was too permissive (60) | Raised threshold to 85 and added velocity checks in `PolicyGuard`. |
| **Voice agent cancelled on blind "no"** | Basic keyword match intercepted questions like *"No, why did my card fail?"* | Replaced naive substrings with regex word boundaries and **structured motive probing**. |
| **Repetitive greeting loops on channel change** | Intent collision when customer said *"Send SMS"* | Built **progressive multi-turn state transitions** passing conversation history into Gemini. |
| **Guard blocked legitimate high-value carts** | Static threshold at ₹25,000 flagged valid luxury purchases | Tuned to auto-approve up to ₹25,000 with a **Maker-Checker supervisor approval tier** for higher amounts. |
| **Reversal failure on network timeout** | Single-shot API call failed on simulated lag | Engineered automatic **3-retry exponential backoff** (1s, 2s, 4s). |

---

## 🔒 Security & System Integrity Architecture

1. **HMAC-SHA256 Signature Verification:** Validates authentic `X-Razorpay-Signature` headers to reject forged callback payloads.
2. **Cryptographic Idempotency Keys:** Links contain an `idemp_...` token with 15-minute TTL to prevent duplicate charges.
3. **Maker-Checker Dual Authorization:** Carts $>₹25,000$ automatically require supervisor sign-off before dispatch.
4. **Tokenized CoFT Architecture:** Follows PCI-DSS Level 1 principles by never storing or logging raw PAN/CVV data.
5. **Cryptographic Audit Trail:** Chained SHA-256 Merkle hashes (`0x7f3a...`) ensure tamper-evident internal logging.

---

## 🎬 5-Minute Hackathon Demo Flow

1. **[0:00 – 1:00] The Core Philosophy:** Why LLMs should recommend but never execute financial transactions directly.
2. **[1:00 – 2:00] The PolicyGuard in Action:** Trigger a normal E_504 recovery, then demonstrate PolicyGuard blocking a high-fraud cart (Risk 92) and escalating a ₹30,000 cart to Supervisor Vikram.
3. **[2:00 – 3:15] Vernacular Voice Telecaller:** Demonstrate multi-turn motive probing in Kannada/Hindi on `/voice` with zero repetitive loops.
4. **[3:15 – 4:15] Synthetic 50-Scenario Benchmark:** Walk through the `/batch-evaluation` dashboard, demonstrating how stopping rules halted 7 DND scenarios.
5. **[4:15 – 5:00] Fallback Architecture & Wrap-Up:** Show system behavior when AI is offline—falling back to deterministic rules.

---

## ⚡ Quickstart & Local Execution

```bash
# 1. Clone the repository
git clone https://github.com/Rakshitha-cpu/RevenueOS.git
cd RevenueOS

# 2. Run backend (FastAPI)
uvicorn backend.app.main:app --reload --port 8000

# 3. Run frontend (Next.js)
cd frontend
npm run dev
```
* **Frontend UI:** `http://localhost:3000`
* **FastAPI Docs:** `http://localhost:8000/docs`

---

## 🛡️ Deterministic PolicyGuard Unit Test Suite

```bash
python -m unittest backend/tests/test_compliance_guard.py
# Ran 4 tests in 0.001s ... OK (100% Deterministic Pass)
```
