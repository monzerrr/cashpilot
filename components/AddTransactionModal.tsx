'use client';
import { useState, useRef, useEffect } from 'react';
import type { Transaction, TransactionType } from './types';
import { EXPENSE_CATS, INCOME_CATS, todayStr } from './types';
import styles from './AddTransactionModal.module.css';

interface Props {
  onSubmit: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export default function AddTransactionModal({ onSubmit, onClose }: Props) {
  const [type, setType]     = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCat]  = useState('');
  const [note, setNote]     = useState('');
  const [date, setDate]     = useState(todayStr());

  const amtRef = useRef<HTMLInputElement>(null);
  const cats = type === 'expense' ? EXPENSE_CATS : INCOME_CATS;

  useEffect(() => { amtRef.current?.focus(); }, []);

  function switchType(t: TransactionType) {
    setType(t);
    setCat('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount.replace(/,/g, ''));
    if (!amt || amt <= 0 || !category) return;
    onSubmit({ type, amount: amt, category, note: note.trim(), date });
  }

  const valid = parseFloat(amount) > 0 && !!category;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Add Transaction"
    >
      <div className={styles.modal}>
        <div className={styles.handle} />

        {/* Type toggle */}
        <div className={styles.typeToggle}>
          <button
            type="button"
            className={`${styles.typeBtn} ${type === 'expense' ? styles.typeBtnExp : ''}`}
            onClick={() => switchType('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${type === 'income' ? styles.typeBtnInc : ''}`}
            onClick={() => switchType('income')}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Amount */}
          <div className={styles.amountRow}>
            <span className={`${styles.currSign} ${type === 'income' ? styles.signInc : styles.signExp}`}>$</span>
            <input
              ref={amtRef}
              className={styles.amountInput}
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          {/* Category */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Category</label>
            <div className={styles.catGrid}>
              {cats.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  className={`${styles.catChip} ${category === cat.id ? styles.catChipActive : ''}`}
                  style={category === cat.id
                    ? { '--chip-c': cat.color, borderColor: cat.color, background: cat.color + '18', color: cat.color } as React.CSSProperties
                    : undefined
                  }
                  onClick={() => setCat(cat.id)}
                >
                  <span className={styles.chipIcon}>{cat.icon}</span>
                  <span className={styles.chipLabel}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Note <span className={styles.optional}>(optional)</span></label>
            <input
              className={styles.textInput}
              type="text"
              placeholder="What was this for?"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={80}
            />
          </div>

          {/* Date */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Date</label>
            <input
              className={styles.textInput}
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.submitBtn} ${type === 'expense' ? styles.submitExp : styles.submitInc}`}
              disabled={!valid}
            >
              Add {type === 'expense' ? 'Expense' : 'Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
