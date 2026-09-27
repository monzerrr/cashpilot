'use client';
import { useMemo } from 'react';
import type { Transaction } from './types';
import { getCat, fmt, todayStr, daysAgoStr, dateLabel } from './types';
import styles from './Dashboard.module.css';

interface Props {
  txs: Transaction[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

function monthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const label = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  return { start, end, label };
}

export default function Dashboard({ txs, onAdd, onDelete }: Props) {
  const { start, end, label } = useMemo(monthRange, []);

  const monthTxs = useMemo(
    () => txs.filter(t => t.date >= start && t.date <= end),
    [txs, start, end],
  );

  const income = useMemo(
    () => monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [monthTxs],
  );
  const expense = useMemo(
    () => monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [monthTxs],
  );
  const balance = income - expense;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  // Category breakdown (this month, expenses only)
  const catBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([id, amount]) => ({ cat: getCat(id), amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 7);
  }, [monthTxs]);

  const maxCatAmt = catBreakdown[0]?.amount || 1;

  // SVG donut data
  const donutData = useMemo(() => {
    const total = catBreakdown.reduce((s, c) => s + c.amount, 0) || 1;
    let offset = 0;
    const r = 44;
    const circ = 2 * Math.PI * r;
    return catBreakdown.map(({ cat, amount }) => {
      const pct = amount / total;
      const dash = pct * circ;
      const seg = { cat, amount, dash, offset: circ * (1 - offset) - circ };
      offset += pct;
      return seg;
    });
  }, [catBreakdown]);

  // Recent (last 8)
  const recent = useMemo(() => txs.slice(0, 8), [txs]);

  return (
    <div className={styles.root}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{label}</h1>
          <p className={styles.pageSub}>{monthTxs.length} transaction{monthTxs.length !== 1 ? 's' : ''}</p>
        </div>
        <button className={styles.addBtn} onClick={onAdd}>+ Add</button>
      </div>

      {/* Balance card */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceTop}>
          <div>
            <div className={styles.balanceLabel}>Net Balance</div>
            <div className={`${styles.balanceNum} ${balance >= 0 ? styles.pos : styles.neg}`}>
              {balance >= 0 ? '+' : '−'}{fmt(balance)}
            </div>
          </div>
          <div className={`${styles.savingsChip} ${balance >= 0 ? styles.chipGreen : styles.chipRed}`}>
            {balance >= 0 ? '↑' : '↓'} {Math.abs(savingsRate)}% savings
          </div>
        </div>
        <div className={styles.balanceMeta}>
          <span className={styles.incTag}>{fmt(income)} income</span>
          <span className={styles.expTag}>{fmt(expense)} spent</span>
        </div>
        {/* Spend progress bar */}
        {income > 0 && (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min((expense / income) * 100, 100)}%` }}
              />
            </div>
            <span className={styles.progressLabel}>
              {Math.round((expense / income) * 100)}% of income spent
            </span>
          </div>
        )}
      </div>

      {/* Stat row */}
      <div className={styles.statRow}>
        <div className={`${styles.statCard} ${styles.incCard}`}>
          <div className={styles.statIconWrap} style={{ background: 'var(--income-dim)' }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="var(--income)" strokeWidth="2" width="18" height="18">
              <polyline points="4,14 10,6 16,14"/>
            </svg>
          </div>
          <div className={styles.statBody}>
            <div className={styles.statLabel}>Income</div>
            <div className={styles.statVal} style={{ color: 'var(--income)' }}>{fmt(income)}</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.expCard}`}>
          <div className={styles.statIconWrap} style={{ background: 'var(--expense-dim)' }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="var(--expense)" strokeWidth="2" width="18" height="18">
              <polyline points="4,6 10,14 16,6"/>
            </svg>
          </div>
          <div className={styles.statBody}>
            <div className={styles.statLabel}>Expenses</div>
            <div className={styles.statVal} style={{ color: 'var(--expense)' }}>{fmt(expense)}</div>
          </div>
        </div>
      </div>

      {/* Spending breakdown */}
      {catBreakdown.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Spending Breakdown</h2>
          <div className={styles.breakdownGrid}>
            {/* Donut chart */}
            <div className={styles.donutWrap}>
              <svg viewBox="-6 -6 112 112" width="110" height="110">
                <circle cx="50" cy="50" r="44" fill="none" stroke="var(--surface-3)" strokeWidth="14"/>
                {donutData.map(({ cat, dash, offset }) => (
                  <circle
                    key={cat.id}
                    cx="50" cy="50" r="44"
                    fill="none"
                    stroke={cat.color}
                    strokeWidth="14"
                    strokeDasharray={`${dash} ${2 * Math.PI * 44}`}
                    strokeDashoffset={offset}
                    strokeLinecap="butt"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px', transition: 'stroke-dasharray 0.5s ease' }}
                  />
                ))}
              </svg>
              <div className={styles.donutCenter}>
                <div className={styles.donutTotal}>{fmt(expense)}</div>
                <div className={styles.donutSub}>total spent</div>
              </div>
            </div>

            {/* Bars */}
            <div className={styles.catBars}>
              {catBreakdown.map(({ cat, amount }) => (
                <div key={cat.id} className={styles.catRow}>
                  <div className={styles.catLeft}>
                    <span className={styles.catIcon}>{cat.icon}</span>
                    <span className={styles.catLabel}>{cat.label}</span>
                  </div>
                  <div className={styles.catBarWrap}>
                    <div
                      className={styles.catBar}
                      style={{
                        width: `${(amount / maxCatAmt) * 100}%`,
                        background: cat.color,
                      }}
                    />
                  </div>
                  <span className={styles.catAmt}>{fmt(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Transactions</h2>
        {recent.length === 0 ? (
          <div className={styles.emptyRecent}>
            <p>No transactions yet.</p>
            <button className={styles.emptyAddBtn} onClick={onAdd}>+ Add your first one</button>
          </div>
        ) : (
          <div className={styles.txList}>
            {recent.map(t => {
              const cat = getCat(t.category);
              return (
                <div key={t.id} className={styles.txRow} role="listitem">
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
                    <div className={`${styles.txAmt} ${t.type === 'income' ? styles.txInc : styles.txExp}`}>
                      {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                    </div>
                    <div className={styles.txDate}>{dateLabel(t.date)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
