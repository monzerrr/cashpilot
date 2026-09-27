export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;       // YYYY-MM-DD
  createdAt: string;  // ISO timestamp
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export const EXPENSE_CATS: Category[] = [
  { id: 'food',          label: 'Food & Drinks', icon: '🍔', color: '#FB7185', type: 'expense' },
  { id: 'shopping',      label: 'Shopping',       icon: '🛒', color: '#818CF8', type: 'expense' },
  { id: 'bills',         label: 'Bills',          icon: '🏠', color: '#FBBF24', type: 'expense' },
  { id: 'transport',     label: 'Transport',      icon: '🚗', color: '#38BDF8', type: 'expense' },
  { id: 'coffee',        label: 'Coffee',         icon: '☕', color: '#D97706', type: 'expense' },
  { id: 'cigarettes',    label: 'Cigarettes',     icon: '🚬', color: '#94A3B8', type: 'expense' },
  { id: 'health',        label: 'Health',         icon: '🏥', color: '#34D399', type: 'expense' },
  { id: 'entertainment', label: 'Entertainment',  icon: '🎮', color: '#A78BFA', type: 'expense' },
  { id: 'subscriptions', label: 'Subscriptions',  icon: '📱', color: '#F472B6', type: 'expense' },
  { id: 'education',     label: 'Education',      icon: '📚', color: '#22D3EE', type: 'expense' },
  { id: 'other_exp',     label: 'Other',          icon: '💳', color: '#64748B', type: 'expense' },
];

export const INCOME_CATS: Category[] = [
  { id: 'salary',     label: 'Salary',     icon: '💰', color: '#00C2A0', type: 'income' },
  { id: 'freelance',  label: 'Freelance',  icon: '💻', color: '#818CF8', type: 'income' },
  { id: 'tips',       label: 'Tips',       icon: '💵', color: '#34D399', type: 'income' },
  { id: 'gift',       label: 'Gift',       icon: '🎁', color: '#F472B6', type: 'income' },
  { id: 'investment', label: 'Investment', icon: '📈', color: '#FBBF24', type: 'income' },
  { id: 'rental',     label: 'Rental',     icon: '🏘️', color: '#38BDF8', type: 'income' },
  { id: 'other_inc',  label: 'Other',      icon: '💳', color: '#64748B', type: 'income' },
];

export const ALL_CATS: Category[] = [...EXPENSE_CATS, ...INCOME_CATS];

export function getCat(id: string): Category {
  return (
    ALL_CATS.find(c => c.id === id) ?? {
      id: 'other',
      label: 'Other',
      icon: '💳',
      color: '#64748B',
      type: 'expense' as TransactionType,
    }
  );
}

export function fmt(n: number, decimals = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(n));
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function dateLabel(dateStr: string): string {
  const today = todayStr();
  const yesterday = daysAgoStr(1);
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  const d = new Date(dateStr + 'T12:00:00');
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
}
