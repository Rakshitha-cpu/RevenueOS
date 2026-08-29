# 🔒 RevenueOS: Security Architecture & VAPT Verification Framework

> **Compliance Standards:** RBI Master Directions on Payment Aggregators (2024), DPDP Act (2023), ISO 27001, CERT-In Security Guidelines.

---

## 1. Cryptographic Immutability & Audit Integrity
- **SHA-256 Merkle Block Hashing:** Every policy decision, agent recommendation, and T+0 financial reversal is chained using cryptographic `SHA-256` Merkle hashing (`0x7f3a9e14c82b9042...`).
- **5-Year Tamper-Proof Retention:** Logs are append-only; updates and deletions are programmatically prohibited.
- **Verification API:** Any transaction log hash can be verified via the `/command-center` terminal against previous block roots.

---

## 2. API Security & Transport Encryption
- **TLS 1.3 Strict Transport:** All external Razorpay and NPCI API calls strictly enforce `TLS 1.3` with elliptic-curve Diffie-Hellman ephemeral (ECDHE) cipher suites.
- **Tokenization & Masking:** PII (Names, Phone Numbers, VPAs) are masked at rest (e.g. `+91 98450 XXXXX`, `rajesh@ok***`).
- **OAuth 2.0 / JWT Auth:** All merchant dashboard sessions require signed RS256 JWT tokens.

---

## 3. Data Localisation & Indian Residency
- **Primary Hosting:** AWS Asia Pacific (Mumbai) `ap-south-1` region.
- **Zero Cross-Border Transfer:** All customer identity dossiers, bank failure records, and speech telemetry remain strictly within sovereign Indian territory.

---

## 4. Annual VAPT Checklist (OWASP Top 10 API Security)

| Vulnerability Category | RevenueOS Control Mechanism | Status |
|---|---|---|
| **API1:2023 Broken Object Level Auth (BOLA)** | Scoped JWT claims with tenant-level multi-tenancy filters | ✅ PASS |
| **API2:2023 Broken Authentication** | Mandatory 6-digit OTP verification + Rate-limiting (5 req/min) | ✅ PASS |
| **API3:2023 Broken Object Property Auth** | Pydantic strict schema validation on all webhook payloads | ✅ PASS |
| **API4:2023 Unrestricted Resource Consumption** | Redis Token-Bucket rate limiting on all public endpoints | ✅ PASS |
| **API5:2023 Broken Function Level Auth** | Strict PolicyGuard firewall isolating execution privileges | ✅ PASS |
| **API8:2023 Security Misconfiguration** | Automated CORS origin locking and Helmet security headers | ✅ PASS |
| **CERT-In Mandate** | 6-Hour Incident Response & Audit Logging Clock configured | ✅ PASS |

---

## 5. Bounded Execution Boundaries (What the AI CANNOT Do)

```
┌────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────┐
│ ❌ PROHIBITED AI ACTIONS (Hardcoded in PolicyGuard)        │ 🛡️ ENFORCEMENT MECHANISM                                   │
├────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ • Cannot issue refunds > ₹10,000 without human manager     │ Deterministically blocked; raises HighValueEscalationError │
│ • Cannot call a customer > 3 times in 24 hours             │ Max retry limit enforced in PolicyGuard cooldown memory    │
│ • Cannot contact numbers on National DND / Opt-Out list    │ DNC suppression filter drops webhook before invocation     │
│ • Cannot modify transaction amounts or prices autonomously │ Discounts capped at strictly 5% (SAVE232) maximum          │
└────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```
