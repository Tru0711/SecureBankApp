import React from 'react';
import { CURRENCY_SYMBOL } from '../../utils/constants';

export default function AmountDisplay({ amount = 0, showSymbol = true, className = '' }) {
  const formatted = Number(amount).toLocaleString('en-IN');
  return (
    <span className={className}>
      {showSymbol && CURRENCY_SYMBOL}{formatted}
    </span>
  );
}
