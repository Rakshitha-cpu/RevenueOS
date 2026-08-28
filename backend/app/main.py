from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import risk, ai, authorization, simulator, voice, audit, webhooks
from dotenv import load_dotenv

# Load environment variables (API keys)
load_dotenv()

app = FastAPI(
    title="RevenueOS API",
    description="Revenue Intelligence & Recovery Orchestrator",
    version="1.0.0"
)

# Allow frontend to call the backend API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
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

@app.get("/")
def read_root():
    return {"message": "Welcome to RevenueOS API"}

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}


