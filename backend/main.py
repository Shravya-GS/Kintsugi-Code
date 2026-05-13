"""
FinGuard AI — FastAPI Backend
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import EventPayload, Profile
from engine import evaluate_event
import storage

app = FastAPI(
    title="FinGuard AI API",
    description="Intelligent personal financial safety assistant backend",
    version="1.0.0",
)

# Allow frontend dev server + production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "FinGuard AI", "version": "1.0.0"}


# ─────────────────────────────────────────
# EVALUATE EVENT (core decision engine)
# ─────────────────────────────────────────
@app.post("/api/evaluate")
def evaluate(payload: EventPayload):
    """
    Run the FinGuard AI decision engine against an event payload.
    Returns a structured notification result based on all 4 rules.
    """
    profile_data = storage.get_profile()
    profile = Profile(**profile_data)

    result = evaluate_event(payload, profile)

    # Log every evaluated event
    storage.log_event(result, payload.model_dump())

    # If it's a real SMS transaction, persist it
    if payload.event_type == "sms_transaction" and payload.transaction:
        storage.add_transaction({
            "merchant": payload.transaction.merchant,
            "amount": payload.transaction.amount,
            "category": payload.transaction.category,
        })

    return result


# ─────────────────────────────────────────
# PROFILE
# ─────────────────────────────────────────
@app.get("/api/profile")
def get_profile():
    """Get the current user profile (salary, limits, budgets)."""
    return storage.get_profile()


@app.put("/api/profile")
def update_profile(profile: Profile):
    """Save/update the user profile."""
    saved = storage.save_profile(profile.model_dump())
    return {"success": True, "profile": saved}


# ─────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────
@app.get("/api/dashboard")
def get_dashboard():
    """Aggregated dashboard data — spending, savings, categories, recent transactions."""
    profile = storage.get_profile()
    return storage.get_dashboard(profile)


# ─────────────────────────────────────────
# TRANSACTIONS
# ─────────────────────────────────────────
@app.get("/api/transactions")
def get_transactions():
    """Get all stored transactions."""
    return storage.get_transactions()


@app.post("/api/transactions")
def add_transaction(tx: dict):
    """Manually add a transaction record."""
    result = storage.add_transaction(tx)
    return {"success": True, "transaction": result}


# ─────────────────────────────────────────
# EVENT LOG
# ─────────────────────────────────────────
@app.get("/api/events")
def get_events():
    """Get the last 50 evaluated events and their rule results."""
    return storage.get_events()
