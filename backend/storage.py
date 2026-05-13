"""
FinGuard AI — JSON file-based storage (hackathon-friendly, no DB setup needed)
"""
import json
import os
import threading
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "db.json")
_lock = threading.Lock()

DEFAULT_DB = {
    "profile": {
        "name": "Shravya",
        "monthlySalary": 60000,
        "dailyLimit": 1200,
        "categoryBudgets": {
            "dining": 2000,
            "shopping": 3000,
            "transport": 1000,
            "fuel": 1500,
            "entertainment": 1500,
        },
    },
    "spent": {
        "daily": 740,
        "categories": {
            "dining": 1750,
            "shopping": 1200,
            "transport": 420,
            "fuel": 900,
            "entertainment": 600,
        },
    },
    "transactions": [
        {"id": 1, "merchant": "Swiggy", "amount": 320, "category": "dining", "time": "09:14 AM", "icon": "🍽️", "timestamp": datetime.now().isoformat()},
        {"id": 2, "merchant": "Ola Auto", "amount": 85, "category": "transport", "time": "10:32 AM", "icon": "🚕", "timestamp": datetime.now().isoformat()},
        {"id": 3, "merchant": "Zomato", "amount": 215, "category": "dining", "time": "01:05 PM", "icon": "🍽️", "timestamp": datetime.now().isoformat()},
        {"id": 4, "merchant": "Reliance Smart", "amount": 520, "category": "shopping", "time": "03:47 PM", "icon": "🛒", "timestamp": datetime.now().isoformat()},
        {"id": 5, "merchant": "HP Fuel", "amount": 600, "category": "fuel", "time": "06:20 PM", "icon": "⛽", "timestamp": datetime.now().isoformat()},
    ],
    "events": [],
}

CAT_ICONS = {
    "dining": "🍽️", "shopping": "🛍️", "transport": "🚕",
    "fuel": "⛽", "entertainment": "🎭", "hospital": "🏥",
    "medical": "💊", "grocery": "🛒", "default": "💳",
}


def _load() -> dict:
    if not os.path.exists(DB_PATH):
        _save(DEFAULT_DB)
        return DEFAULT_DB
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(data: dict):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_profile() -> dict:
    with _lock:
        return _load()["profile"]


def save_profile(profile_data: dict) -> dict:
    with _lock:
        db = _load()
        db["profile"] = profile_data
        _save(db)
        return db["profile"]


def get_spent() -> dict:
    with _lock:
        return _load()["spent"]


def get_transactions() -> list:
    with _lock:
        return _load()["transactions"]


def add_transaction(tx: dict) -> dict:
    with _lock:
        db = _load()
        tx["id"] = int(datetime.now().timestamp() * 1000)
        tx["timestamp"] = datetime.now().isoformat()
        tx["time"] = datetime.now().strftime("%I:%M %p")
        tx["icon"] = CAT_ICONS.get(tx.get("category", "default"), "💳")
        db["transactions"].insert(0, tx)
        # Update daily + category spent
        db["spent"]["daily"] = db["spent"].get("daily", 0) + tx.get("amount", 0)
        cat = tx.get("category", "default")
        db["spent"]["categories"][cat] = db["spent"]["categories"].get(cat, 0) + tx.get("amount", 0)
        _save(db)
        return tx


def get_events() -> list:
    with _lock:
        return _load()["events"]


def log_event(result: dict, payload: dict) -> None:
    with _lock:
        db = _load()
        db["events"].insert(0, {
            "id": int(datetime.now().timestamp() * 1000),
            "timestamp": datetime.now().isoformat(),
            "result": result,
            "payload_summary": {
                "event_type": payload.get("event_type"),
                "location_name": payload.get("location", {}).get("name") if payload.get("location") else None,
                "merchant": payload.get("transaction", {}).get("merchant") if payload.get("transaction") else None,
            },
        })
        db["events"] = db["events"][:50]  # keep last 50
        _save(db)


def get_dashboard(profile: dict) -> dict:
    with _lock:
        db = _load()
        spent = db["spent"]
        salary = profile["monthlySalary"]
        daily_limit = profile["dailyLimit"]
        daily = spent.get("daily", 0)
        return {
            "daily_spent": daily,
            "daily_limit": daily_limit,
            "daily_pct": min(100, round((daily / daily_limit) * 100)) if daily_limit > 0 else 0,
            "savings_locked": salary * 0.5,
            "savings_spendable": salary * 0.5,
            "monthly_salary": salary,
            "category_spent": spent.get("categories", {}),
            "category_budgets": profile["categoryBudgets"],
            "transactions": db["transactions"][:10],
            "events_today": len([e for e in db["events"] if e.get("timestamp", "").startswith(datetime.now().strftime("%Y-%m-%d"))]),
        }
