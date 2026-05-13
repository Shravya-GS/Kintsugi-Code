import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

def generate_smart_advice(event: dict, profile: dict, rule_id: int) -> str:
    """
    Generates personalized, empathetic financial advice using Gemini.
    """
    if not model:
        return None

    # Construct the context prompt
    prompt = f"""
    You are 'FinGuard AI', a highly empathetic and intelligent personal financial coach.
    Your goal is to help the user stay within their budget and reach their savings goals without being preachy or judgmental.
    Use a supportive, encouraging, and occasionally witty tone. Use emojis where appropriate.

    USER PROFILE:
    - Name: {profile.get('name', 'User')}
    - Monthly Salary: ₹{profile.get('monthlySalary', 0):,}
    - Daily Spending Limit: ₹{profile.get('dailyLimit', 0):,}
    - Monthly Category Budgets: {profile.get('categoryBudgets', {})}

    CURRENT EVENT (Triggered Rule {rule_id}):
    - Event Type: {event.get('event_type')}
    - Location: {event.get('location', {}).get('name', 'Unknown')} ({event.get('location', {}).get('type', 'Unknown')})
    - Transaction: {event.get('transaction', {})}
    - Today's Total Spent: ₹{event.get('user_daily_spent', 0):,}
    - Category Spent so far: {event.get('category_spent', {})}

    RULE CONTEXT:
    Rule 2: Daily limit exceeded.
    Rule 3: Geofence pre-alert (entering a spending zone).
    Rule 4: Late-night risk zone (bar/club/etc).

    TASK:
    Generate a short (1-2 sentences), punchy, and highly personalized notification message for this specific user.
    Focus on the "why" — saving for the future, staying mindful, or protecting their hard-earned salary.
    For Rule 4, be slightly more protective/urgent about safety and impulse spending.
    For Rule 3, be encouraging but remind them of their remaining budget.
    For Rule 2, be supportive and suggest a pivot (like cooking at home or skipping non-essentials).

    MESSAGE:
    """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Error: {e}")
        return None
