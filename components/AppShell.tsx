'use client';
import { useState } from 'react';
import { useTransactions } from '../lib/useTransactions';
import Dashboard from './Dashboard';
import TransactionList from './TransactionList';
import AddTransactionModal from './AddTransactionModal';
import styles from './AppShell.module.css';

type View = 'dashboard' | 'transactions';

export default function AppShell() {
  const [view, setView] = useState<View>('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const { txs, add, remove, ready } = useTransactions();

  function handleAdd() { setShowAdd(true); }
  function handleClose() { setShowAdd(false); }

  return (
    <div className={styles.root}>

      {/* ── Sidebar (desktop) ── */}
      <aside className={styles.sidebar}>
        <div className={styles.logoWrap}>
          <div className={styles.logoMark}>◎</div>
          <span className={styles.logoText}>CashPilot</span>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${view === 'dashboard' ? styles.navActive : ''}`}
            onClick={() => setView('dashboard')}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
              <rect x="2" y="2" width="7" height="7" rx="1.5"/>
              <rect x="11" y="2" width="7" height="7" rx="1.5"/>
              <rect x="2" y="11" width="7" height="7" rx="1.5"/>
              <rect x="11" y="11" width="7" height="7" rx="1.5"/>
            </svg>
            Dashboard
          </button>
          <button
            className={`${styles.navItem} ${view === 'transactions' ? styles.navActive : ''}`}
            onClick={() => setView('transactions')}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
              <line x1="4" y1="6" x2="16" y2="6"/>
              <line x1="4" y1="10" x2="16" y2="10"/>
              <line x1="4" y1="14" x2="12" y2="14"/>
            </svg>
            Transactions
          </button>
        </nav>

        <button className={styles.addBtn} onClick={handleAdd}>
          <span>+</span> Add Transaction
        </button>
      </aside>

      {/* ── Main content ── */}
      <div className={styles.contentWrap}>
        {/* Mobile header */}
        <header className={styles.mobileHeader}>
          <div className={styles.mobileLogo}>
            <div className={styles.logoMark}>◎</div>
            <span className={styles.logoText}>CashPilot</span>
          </div>
          <button className={styles.mobileAddBtn} onClick={handleAdd} aria-label="Add transaction">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <line x1="10" y1="4" x2="10" y2="16"/>
              <line x1="4" y1="10" x2="16" y2="10"/>
            </svg>
          </button>
        </header>

        <main className={styles.main}>
          {ready && view === 'dashboard' && (
            <Dashboard txs={txs} onAdd={handleAdd} onDelete={remove} />
          )}
          {ready && view === 'transactions' && (
            <TransactionList txs={txs} onDelete={remove} onAdd={handleAdd} />
          )}
          {!ready && <div className={styles.loading}><div className={styles.spinner} /></div>}
        </main>
      </div>

      {/* ── Bottom nav (mobile) ── */}
      <nav className={styles.bottomNav}>
        <button
          className={`${styles.bnItem} ${view === 'dashboard' ? styles.bnActive : ''}`}
          onClick={() => setView('dashboard')}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
            <rect x="2" y="2" width="7" height="7" rx="1.5"/>
            <rect x="11" y="2" width="7" height="7" rx="1.5"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5"/>
            <rect x="11" y="11" width="7" height="7" rx="1.5"/>
          </svg>
          <span>Dashboard</span>
        </button>
        <button className={styles.bnFab} onClick={handleAdd} aria-label="Add">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
            <line x1="10" y1="4" x2="10" y2="16"/>
            <line x1="4" y1="10" x2="16" y2="10"/>
          </svg>
        </button>
        <button
          className={`${styles.bnItem} ${view === 'transactions' ? styles.bnActive : ''}`}
          onClick={() => setView('transactions')}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
            <line x1="4" y1="6" x2="16" y2="6"/>
            <line x1="4" y1="10" x2="16" y2="10"/>
            <line x1="4" y1="14" x2="12" y2="14"/>
          </svg>
          <span>Transactions</span>
        </button>
      </nav>

      {/* ── Modal ── */}
      {showAdd && (
        <AddTransactionModal onSubmit={(t) => { add(t); setShowAdd(false); }} onClose={handleClose} />
      )}
    </div>
  );
}
