// FinGuard AI — Decision Engine
// Implements all 4 rules exactly as specified

const CRITICAL_LOCATION_TYPES = ['club', 'pub', 'bar', 'night_party_venue'];
const GEOFENCE_ALERT_TYPES = ['restaurant', 'mall', 'cafe', 'luxury_retail'];

const CATEGORY_MESSAGES = {
  dining: "You've gone over today's limit on dining 🍽️. How about cooking something cozy at home tonight — your wallet (and taste buds) will thank you!",
  shopping: "Today's spending limit is crossed from shopping 🛍️. Let's pause for now — those items will still be there tomorrow, and your budget will be happier.",
  transport: "Looks like transport costs pushed you over today's limit 🚕. Consider carpooling or using public transit for the rest of the day.",
  fuel: "Fuel spending has exceeded your daily limit ⛽. Try to avoid unnecessary trips for the rest of the day.",
  entertainment: "Entertainment spending tipped you over today 🎭. The fun doesn't have to stop — just pause purchases for now.",
  hospital: "We noticed a medical expense — please don't stress about the limit 🏥. Your health comes first. We'll help you review non-essential spending over the next few days to balance things out.",
  medical: "Health always comes first 💊. We'll gently help you offset this by being mindful of non-essential spending in the coming days.",
  grocery: "Even essentials added up today 🛒. You're doing fine — just be mindful of any non-essential spending for the rest of the day.",
  default: "You've crossed today's spending limit. Try to hold off on any non-essential purchases for the rest of the day — you've got this! 💪",
};

const GEOFENCE_CATEGORY_MAP = {
  restaurant: 'dining',
  cafe: 'dining',
  mall: 'shopping',
  luxury_retail: 'shopping',
};

export function evaluateEvent(event, profile) {
  const {
    event_type,
    timestamp,
    location,
    transaction,
    user_daily_spent,
    user_daily_limit,
    category_spent = {},
    category_budget = {},
  } = event;

  // ── RULE 4: CRITICAL RISK ZONE (OVERRIDE ALL) ──
  if (event_type === 'geofence_enter' && CRITICAL_LOCATION_TYPES.includes(location?.type)) {
    const hour = new Date(timestamp).getHours();
    if (hour >= 21 || hour <= 4) {
      return {
        show_notification: true,
        trigger_high_volume_alert: true,
        risk_level: 'critical',
        rule: 4,
        location_name: location.name,
        location_type: location.type,
        message: `Hey — before you step in, remember: you've worked hard for your ₹${(profile.monthlySalary / 2).toLocaleString('en-IN')} savings this month 💪. Late-night venues can lead to impulse spending and unsafe situations — your future self will thank you for staying mindful. We're with you, not against you. Stay sharp! 🛡️`,
      };
    }
  }

  // ── RULE 3: GEOFENCE PRE-ALERT ──
  if (event_type === 'geofence_enter' && GEOFENCE_ALERT_TYPES.includes(location?.type)) {
    const cat = GEOFENCE_CATEGORY_MAP[location.type] || 'shopping';
    const spent = category_spent[cat] || 0;
    const budget = category_budget[cat] || profile.categoryBudgets?.[cat] || 0;
    const remaining = Math.max(0, budget - spent);
    const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    return {
      show_notification: true,
      trigger_high_volume_alert: false,
      rule: 3,
      category: cat,
      remaining_category_budget: remaining,
      spent_so_far: spent,
      total_budget: budget,
      spent_percent: pct,
      location_name: location.name,
      location_type: location.type,
      message: remaining > 0
        ? `You're entering ${location.name} 📍. You have ₹${remaining.toLocaleString('en-IN')} left in your ${cat} budget (₹${spent.toLocaleString('en-IN')} of ₹${budget.toLocaleString('en-IN')} used). Spend mindfully and enjoy! 😊`
        : `Heads up! You've used up your entire ${cat} budget (₹${budget.toLocaleString('en-IN')}) for this month 🚨. Any spending here will go against your savings goal.`,
    };
  }

  // ── RULE 2: DAILY LIMIT ALERT ──
  if (event_type === 'sms_transaction' && user_daily_spent > user_daily_limit) {
    const overspend = user_daily_spent - user_daily_limit;
    const cat = transaction?.category || 'default';
    const msg = CATEGORY_MESSAGES[cat] || CATEGORY_MESSAGES.default;
    return {
      show_notification: true,
      trigger_high_volume_alert: false,
      rule: 2,
      overspend_amount: overspend,
      category: cat,
      transaction_amount: transaction?.amount,
      merchant: transaction?.merchant,
      daily_spent: user_daily_spent,
      daily_limit: user_daily_limit,
      message: msg,
    };
  }

  // ── RULE 1: SILENT MODE ──
  return { show_notification: false, rule: 1 };
}

export function getSavingsInfo(profile) {
  const locked = profile.monthlySalary * 0.5;
  const spendable = profile.monthlySalary - locked;
  return { locked, spendable };
}
