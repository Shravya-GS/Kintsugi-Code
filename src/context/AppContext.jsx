import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, saveProfile as apiSaveProfile, getDashboard, getEvents } from '../api/client';

const DEFAULT_PROFILE = {
  name: 'Shravya',
  monthlySalary: 60000,
  dailyLimit: 1200,
  categoryBudgets: { dining: 2000, shopping: 3000, transport: 1000, fuel: 1500, entertainment: 1500 },
};

const DEFAULT_SPENT = {
  daily: 740,
  categories: { dining: 1750, shopping: 1200, transport: 420, fuel: 900, entertainment: 600 },
  transactions: [
    { id: 1, merchant: 'Swiggy', amount: 320, category: 'dining', time: '09:14 AM', icon: '🍽️' },
    { id: 2, merchant: 'Ola Auto', amount: 85, category: 'transport', time: '10:32 AM', icon: '🚕' },
    { id: 3, merchant: 'Zomato', amount: 215, category: 'dining', time: '01:05 PM', icon: '🍽️' },
    { id: 4, merchant: 'Reliance Smart', amount: 520, category: 'shopping', time: '03:47 PM', icon: '🛒' },
    { id: 5, merchant: 'HP Fuel', amount: 600, category: 'fuel', time: '06:20 PM', icon: '⛽' },
  ],
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [spent, setSpent] = useState(DEFAULT_SPENT);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [events, setEvents] = useState([]);
  const [apiStatus, setApiStatus] = useState('connecting'); // 'connecting' | 'online' | 'offline'
  const [paymentMethod, setPaymentMethod] = useState('GPay');

  // Load profile + dashboard from API on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [prof, dash, evts] = await Promise.all([
          getProfile(),
          getDashboard(),
          getEvents(),
        ]);
        // Normalize profile (backend uses camelCase matching our frontend)
        setProfile({
          name: prof.name,
          monthlySalary: prof.monthlySalary,
          dailyLimit: prof.dailyLimit,
          categoryBudgets: prof.categoryBudgets,
        });
        setSpent({
          daily: dash.daily_spent,
          categories: dash.category_spent,
          transactions: dash.transactions,
        });
        setEvents(evts);
        setApiStatus('online');
      } catch (e) {
        console.warn('API offline — using local defaults:', e.message);
        setApiStatus('offline');
      }
    };
    load();
  }, []);

  const saveProfile = useCallback(async (updates) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    if (apiStatus === 'online') {
      try {
        await apiSaveProfile(updated);
      } catch (e) {
        console.warn('Failed to save profile to API:', e.message);
      }
    }
  }, [profile, apiStatus]);

  const fireNotification = useCallback((result, eventMeta) => {
    if (!result.show_notification) return;
    setNotification({ ...result, firedAt: Date.now(), eventMeta });
    setEvents(prev => [{ ...result, eventMeta, id: Date.now() }, ...prev.slice(0, 19)]);
  }, []);

  const dismissNotification = useCallback(() => setNotification(null), []);

  const refreshDashboard = useCallback(async () => {
    try {
      const dash = await getDashboard();
      setSpent({
        daily: dash.daily_spent,
        categories: dash.category_spent,
        transactions: dash.transactions,
      });
    } catch (e) {
      console.warn('Dashboard refresh failed:', e.message);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      profile, saveProfile, spent, setSpent,
      notification, fireNotification, dismissNotification,
      activeTab, setActiveTab,
      events, setEvents,
      apiStatus, refreshDashboard,
      paymentMethod, setPaymentMethod,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
