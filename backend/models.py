from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Literal
from datetime import datetime


class Coordinates(BaseModel):
    lat: float
    lng: float


class Location(BaseModel):
    name: str
    type: str
    coordinates: Optional[Coordinates] = None


class Transaction(BaseModel):
    amount: float
    merchant: str
    category: str
    daily_total_after: Optional[float] = None
    sms_raw: Optional[str] = None


class EventPayload(BaseModel):
    event_type: Literal["sms_transaction", "geofence_enter", "geofence_exit"]
    timestamp: str
    location: Optional[Location] = None
    transaction: Optional[Transaction] = None
    user_daily_spent: float = 0
    user_daily_limit: float = 1200
    category_spent: Dict[str, float] = {}
    category_budget: Dict[str, float] = {}


class CategoryBudgets(BaseModel):
    dining: float = 2000
    shopping: float = 3000
    transport: float = 1000
    fuel: float = 1500
    entertainment: float = 1500


class Profile(BaseModel):
    name: str = "Shravya"
    monthlySalary: float = 60000
    dailyLimit: float = 1200
    categoryBudgets: CategoryBudgets = Field(default_factory=CategoryBudgets)


class TransactionRecord(BaseModel):
    id: int
    merchant: str
    amount: float
    category: str
    time: str
    icon: str
    timestamp: str


class EvaluateResponse(BaseModel):
    show_notification: bool
    rule: int
    trigger_high_volume_alert: bool = False
    risk_level: Optional[str] = None
    overspend_amount: Optional[float] = None
    category: Optional[str] = None
    remaining_category_budget: Optional[float] = None
    spent_so_far: Optional[float] = None
    total_budget: Optional[float] = None
    spent_percent: Optional[int] = None
    transaction_amount: Optional[float] = None
    merchant: Optional[str] = None
    daily_spent: Optional[float] = None
    daily_limit: Optional[float] = None
    location_name: Optional[str] = None
    location_type: Optional[str] = None
    message: Optional[str] = None


class DashboardStats(BaseModel):
    daily_spent: float
    daily_limit: float
    daily_pct: int
    savings_locked: float
    savings_spendable: float
    monthly_salary: float
    category_spent: Dict[str, float]
    category_budgets: Dict[str, float]
    transactions: list
    events_today: int
