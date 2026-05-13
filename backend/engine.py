"""
FinGuard AI — Python Decision Engine
Implements all 4 rules, mirrors the JS engine output exactly.
"""
from datetime import datetime
from typing import Optional
from models import EventPayload, EvaluateResponse, Profile
import llm

CRITICAL_LOCATION_TYPES = {"club", "pub", "bar", "night_party_venue"}
GEOFENCE_ALERT_TYPES = {"restaurant", "mall", "cafe", "luxury_retail"}
GEOFENCE_CATEGORY_MAP = {
    "restaurant": "dining",
    "cafe": "dining",
    "mall": "shopping",
    "luxury_retail": "shopping",
}

CATEGORY_MESSAGES = {
    "dining": "You've gone over today's limit on dining 🍽️. How about cooking something cozy at home tonight — your wallet (and taste buds) will thank you!",
    "shopping": "Today's spending limit is crossed from shopping 🛍️. Let's pause for now — those items will still be there tomorrow, and your budget will be happier.",
    "transport": "Looks like transport costs pushed you over today's limit 🚕. Consider carpooling or public transit for the rest of the day.",
    "fuel": "Fuel spending has exceeded your daily limit ⛽. Try to avoid unnecessary trips for the rest of the day.",
    "entertainment": "Entertainment spending tipped you over today 🎭. The fun doesn't have to stop — just pause purchases for now.",
    "hospital": "We noticed a medical expense — please don't stress about the limit 🏥. Your health comes first. We'll help you review non-essential spending over the next few days to balance things out.",
    "medical": "Health always comes first 💊. We'll gently help you offset this by being mindful of non-essential spending in the coming days.",
    "grocery": "Even essentials added up today 🛒. You're doing fine — just be mindful of any non-essential spending for the rest of the day.",
}
DEFAULT_MSG = "You've crossed today's spending limit. Try to hold off on any non-essential purchases for the rest of the day — you've got this! 💪"


def evaluate_event(event: EventPayload, profile: Profile) -> dict:
    """Main decision function — returns a dict matching EvaluateResponse."""

    location_type = event.location.type if event.location else None
    location_name = event.location.name if event.location else None

    # Parse timestamp hour
    try:
        hour = datetime.fromisoformat(event.timestamp).hour
    except Exception:
        hour = datetime.now().hour

    # ── RULE 4: CRITICAL RISK ZONE ──
    if event.event_type == "geofence_enter" and location_type in CRITICAL_LOCATION_TYPES:
        # Get Smart Advice from Gemini
            savings = profile.monthlySalary * 0.5
            smart_msg = llm.generate_smart_advice(event.model_dump(), profile.model_dump(), 4)
            final_msg = smart_msg if smart_msg else (
                f"Hey — before you step in, remember: you've worked hard for your "
                f"₹{int(savings):,} savings this month 💪. Late-night venues can lead to "
                f"impulse spending and unsafe situations — your future self will thank you "
                f"for staying mindful. We're with you, not against you. Stay sharp! 🛡️"
            )

            return {
                "show_notification": True,
                "trigger_high_volume_alert": True,
                "risk_level": "critical",
                "rule": 4,
                "location_name": location_name,
                "location_type": location_type,
                "message": final_msg,
            }

    # ── RULE 3: GEOFENCE PRE-ALERT ──
    if event.event_type == "geofence_enter" and location_type in GEOFENCE_ALERT_TYPES:
        cat = GEOFENCE_CATEGORY_MAP.get(location_type, "shopping")
        spent = event.category_spent.get(cat, 0)
        budget = event.category_budget.get(cat, getattr(profile.categoryBudgets, cat, 0))
        remaining = max(0.0, budget - spent)
        pct = round((spent / budget) * 100) if budget > 0 else 0

        if remaining > 0:
            fallback_msg = (
                f"You're entering {location_name} 📍. You have ₹{int(remaining):,} left "
                f"in your {cat} budget (₹{int(spent):,} of ₹{int(budget):,} used). "
                f"Spend mindfully and enjoy! 😊"
            )
        else:
            fallback_msg = (
                f"Heads up! You've used up your entire {cat} budget (₹{int(budget):,}) "
                f"for this month 🚨. Any spending here will go against your savings goal."
            )

        # Get Smart Advice from Gemini
        smart_msg = llm.generate_smart_advice(event.model_dump(), profile.model_dump(), 3)
        final_msg = smart_msg if smart_msg else fallback_msg

        return {
            "show_notification": True,
            "trigger_high_volume_alert": False,
            "rule": 3,
            "category": cat,
            "remaining_category_budget": remaining,
            "spent_so_far": spent,
            "total_budget": budget,
            "spent_percent": pct,
            "location_name": location_name,
            "location_type": location_type,
            "message": final_msg,
        }

    # ── RULE 2: DAILY LIMIT ALERT ──
    if event.event_type == "sms_transaction" and event.user_daily_spent > event.user_daily_limit:
        overspend = event.user_daily_spent - event.user_daily_limit
        cat = event.transaction.category if event.transaction else "default"
        fallback_msg = CATEGORY_MESSAGES.get(cat, DEFAULT_MSG)

        # Get Smart Advice from Gemini
        smart_msg = llm.generate_smart_advice(event.model_dump(), profile.model_dump(), 2)
        final_msg = smart_msg if smart_msg else fallback_msg

        return {
            "show_notification": True,
            "trigger_high_volume_alert": False,
            "rule": 2,
            "overspend_amount": overspend,
            "category": cat,
            "transaction_amount": event.transaction.amount if event.transaction else None,
            "merchant": event.transaction.merchant if event.transaction else None,
            "daily_spent": event.user_daily_spent,
            "daily_limit": event.user_daily_limit,
            "message": final_msg,
        }

    # ── RULE 1: SILENT ──
    return {"show_notification": False, "rule": 1}
