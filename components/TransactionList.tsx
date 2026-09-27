'use client';
import { useState, useMemo } from 'react';
import type { Transaction, TransactionType } from './types';
import { getCat, fmt, dateLabel } from './types';
import styles from './TransactionList.module.css';

interface Props {
  txs: Transaction[];
  onDelete: (id: string) => void;
  onAdd: () => void;
}

type TypeFilter = 'all' | TransactionType;
type Period     = 'week' | 'month' | 'all';

const PERIOD_LABELS: Record<Period, string> = { week: 'This Week', month: 'This Month', all: 'All Time' };

export default function TransactionList({ txs, onDelete, onAdd }: Props) {
  const [typeF, setTypeF]   = useState<TypeFilter>('all');
  const [period, setPeriod] = useState<Period>('month');
  const [confirm, setConfirm] = useState<string | null>(null);

  const periodStart = useMemo(() => {
    const now = new Date();
    if (period === 'week') {
      const d = new Date(now); d.setDate(d.getDate() - 7);
      return d.toISOString().split('T')[0];
    }
    if (period === 'month') {
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }
    return '0000-01-01';
  }, [period]);

  const filtered = useMemo(() =>
    txs.filter(t => {
      if (typeF !== 'all' && t.type !== typeF) return false;
      return t.date >= periodStart;
    }),
    [txs, typeF, periodStart],
  );

  const grouped = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    filtered.forEach(t => { (map[t.date] ??= []).push(t); });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const totals = useMemo(() => ({
    income:  filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  }), [filtered]);

  function handleDelete(id: string) {
    if (confirm === id) { onDelete(id); setConfirm(null); }
    else { setConfirm(id); setTimeout(() => setConfirm(c => c === id ? null : c), 3000); }
  }

  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Transactions</h1>
        <button className={styles.addBtn} onClick={onAdd}>+ Add</button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          {(['all', 'income', 'expense'] as TypeFilter[]).map(f => (
            <button
              key={f}
              className={`${styles.filterPill} ${typeF === f ? styles.pillActive : ''}`}
              onClick={() => setTypeF(f)}
            >
              {f === 'all' ? 'All' : f === 'income' ? '↑ Income' : '↓ Expenses'}
            </button>
          ))}
        </div>
        <div className={styles.filterRow}>
          {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([p, l]) => (
            <button
              key={p}
              className={`${styles.filterPill} ${period === p ? styles.pillActive : ''}`}
              onClick={() => setPeriod(p)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className={styles.summary}>
          <span className={styles.sumInc}>+{fmt(totals.income)}</span>
          <span className={styles.sumDot}>·</span>
          <span className={styles.sumExp}>−{fmt(totals.expense)}</span>
          <span className={styles.sumDot}>·</span>
          <span className={totals.income - totals.expense >= 0 ? styles.sumNetPos : styles.sumNetNeg}>
            Net {totals.income >= totals.expense ? '+' : '−'}{fmt(totals.income - totals.expense)}
          </span>
          <span className={styles.sumCount}>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Empty state */}
      {grouped.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyEmoji}>📭</div>
          <p className={styles.emptyTitle}>Nothing here yet</p>
          <p className={styles.emptySub}>Try switching the filters or add a new transaction.</p>
          <button className={styles.emptyAddBtn} onClick={onAdd}>+ Add Transaction</button>
        </div>
      )}

      {/* Transaction groups */}
      {grouped.map(([date, dateTxs]) => {
        const dayExpense = dateTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return (
          <div key={date} className={styles.group}>
            <div className={styles.groupHeader}>
              <span className={styles.groupDate}>{dateLabel(date)}</span>
              {dayExpense > 0 && (
                <span className={styles.groupTotal}>−{fmt(dayExpense)}</span>
              )}
            </div>
            <div className={styles.groupRows}>
              {dateTxs.map(t => {
                const cat = getCat(t.category);
                const isConfirm = confirm === t.id;
                return (
                  <div key={t.id} className={`${styles.txRow} ${isConfirm ? styles.txRowDanger : ''}`}>
                    <div
                      className={styles.txIcon}
                      style={{ background: cat.color + '1A', color: cat.color }}
                    >
                      {cat.icon}
                    </div>
                    <div className={styles.txMeta}>
                      <div className={styles.txCat}>{cat.label}</div>
                      {t.note && <div className={styles.txNote}>{t.note}</div>}
                    </div>
                    <div className={styles.txRight}>
                      <div className={`${styles.txAmt} ${t.type === 'income' ? styles.amtInc : styles.amtExp}`}>
                        {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                      </div>
                      <button
                        className={`${styles.deleteBtn} ${isConfirm ? styles.deleteBtnConfirm : ''}`}
                        onClick={() => handleDelete(t.id)}
                        title={isConfirm ? 'Click again to confirm' : 'Delete'}
                      >
                        {isConfirm ? 'Confirm' : '×'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
