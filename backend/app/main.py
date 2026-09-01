from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import risk, ai, authorization, simulator, voice, audit, webhooks, metrics, refunds
from app.core.exceptions import RevenueOSBaseException, revenueos_exception_handler
from dotenv import load_dotenv

# Load environment variables (API keys)
load_dotenv()

app = FastAPI(
    title="RevenueOS API",
    description="Revenue Intelligence & Recovery Orchestrator",
    version="1.0.0"
)

# Register custom exception handler
app.add_exception_handler(RevenueOSBaseException, revenueos_exception_handler)

# Allow frontend to call the backend API with strict origin control
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://revenue-os-6cw6.vercel.app",
    "https://revenueos.vercel.app",
    "https://revenue-os.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register routers
app.include_router(risk.router, prefix="/api/v1/risk", tags=["Risk Engine"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI Decisions"])
app.include_router(authorization.router, prefix="/api/v1/authorization", tags=["Policy & Security"])
app.include_router(simulator.router, prefix="/api/v1/simulator", tags=["What-If Simulator"])
app.include_router(voice.router, prefix="/api/v1/voice", tags=["Voice Engine"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit Trail"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["External Integrations"])
app.include_router(metrics.router, prefix="/api/v1/observability", tags=["Observability & Metrics"])
app.include_router(refunds.router, prefix="/api/v1/refunds", tags=["Instant Refunds & Compensation"])

@app.get("/")
def read_root():
    return {"message": "Welcome to RevenueOS API"}

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}


