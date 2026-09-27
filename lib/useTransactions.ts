'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '../components/types';
import { todayStr, daysAgoStr } from '../components/types';

const KEY = 'cashpilot_v1';

const SAMPLE: Transaction[] = [
  { id: 's1',  type: 'income',  amount: 2500, category: 'salary',        note: 'Monthly salary',          date: todayStr(),     createdAt: new Date().toISOString() },
  { id: 's2',  type: 'expense', amount: 45,   category: 'food',          note: 'Lunch at Roadster',        date: todayStr(),     createdAt: new Date().toISOString() },
  { id: 's3',  type: 'expense', amount: 12,   category: 'cigarettes',    note: 'Marlboro pack',            date: daysAgoStr(1),  createdAt: new Date().toISOString() },
  { id: 's4',  type: 'expense', amount: 180,  category: 'bills',         note: 'Electricity',              date: daysAgoStr(2),  createdAt: new Date().toISOString() },
  { id: 's5',  type: 'income',  amount: 350,  category: 'freelance',     note: 'Logo design — client A',   date: daysAgoStr(3),  createdAt: new Date().toISOString() },
  { id: 's6',  type: 'expense', amount: 65,   category: 'shopping',      note: 'ABC mall',                 date: daysAgoStr(4),  createdAt: new Date().toISOString() },
  { id: 's7',  type: 'expense', amount: 8,    category: 'coffee',        note: 'Starbucks',                date: daysAgoStr(5),  createdAt: new Date().toISOString() },
  { id: 's8',  type: 'income',  amount: 80,   category: 'tips',          note: 'Tips Thursday evening',    date: daysAgoStr(6),  createdAt: new Date().toISOString() },
  { id: 's9',  type: 'expense', amount: 35,   category: 'transport',     note: 'Uber rides',               date: daysAgoStr(7),  createdAt: new Date().toISOString() },
  { id: 's10', type: 'expense', amount: 15,   category: 'subscriptions', note: 'Netflix',                  date: daysAgoStr(8),  createdAt: new Date().toISOString() },
  { id: 's11', type: 'income',  amount: 120,  category: 'freelance',     note: 'Instagram content batch',  date: daysAgoStr(9),  createdAt: new Date().toISOString() },
  { id: 's12', type: 'expense', amount: 28,   category: 'food',          note: 'Grocery run',              date: daysAgoStr(10), createdAt: new Date().toISOString() },
  { id: 's13', type: 'expense', amount: 95,   category: 'bills',         note: 'Internet — Ogero',         date: daysAgoStr(11), createdAt: new Date().toISOString() },
  { id: 's14', type: 'expense', amount: 22,   category: 'entertainment', note: 'Cinema tickets',           date: daysAgoStr(12), createdAt: new Date().toISOString() },
  { id: 's15', type: 'income',  amount: 50,   category: 'tips',          note: 'Tips Saturday night',      date: daysAgoStr(13), createdAt: new Date().toISOString() },
  { id: 's16', type: 'expense', amount: 18,   category: 'cigarettes',    note: 'L&M pack',                 date: daysAgoStr(14), createdAt: new Date().toISOString() },
  { id: 's17', type: 'expense', amount: 72,   category: 'shopping',      note: 'Zara — shirt',             date: daysAgoStr(15), createdAt: new Date().toISOString() },
  { id: 's18', type: 'income',  amount: 200,  category: 'freelance',     note: 'Website landing page',     date: daysAgoStr(16), createdAt: new Date().toISOString() },
  { id: 's19', type: 'expense', amount: 14,   category: 'food',          note: 'Barbar shawarma',          date: daysAgoStr(17), createdAt: new Date().toISOString() },
  { id: 's20', type: 'expense', amount: 60,   category: 'health',        note: 'Pharmacy',                 date: daysAgoStr(18), createdAt: new Date().toISOString() },
];

export function useTransactions() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setTxs(raw ? (JSON.parse(raw) as Transaction[]) : SAMPLE);
    } catch {
      setTxs(SAMPLE);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(txs)); } catch { /* quota exceeded */ }
  }, [txs, ready]);

  const add = useCallback((t: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTxs(prev => [
      { ...t, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const remove = useCallback((id: string) => {
    setTxs(prev => prev.filter(t => t.id !== id));
  }, []);

  return { txs, add, remove, ready };
}
