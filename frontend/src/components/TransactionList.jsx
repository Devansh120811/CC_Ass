import React from 'react';
import { format } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export function TransactionList({ transactions }) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className={`p-4 rounded-lg shadow-md flex items-center justify-between ${
            transaction.type === 'deposit'
              ? 'bg-green-50 border-l-4 border-green-500'
              : 'bg-red-50 border-l-4 border-red-500'
          }`}
        >
          <div className="flex items-center gap-4">
            {transaction.type === 'deposit' ? (
              <ArrowUpCircle className="text-green-500" size={24} />
            ) : (
              <ArrowDownCircle className="text-red-500" size={24} />
            )}
            <div>
              <p className="font-medium text-gray-900">{transaction.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{format(new Date(transaction.date), 'MMM d, yyyy h:mm a')}</span>
                <span>•</span>
                <span className="capitalize">{transaction.category}</span>
              </div>
            </div>
          </div>
          <div
            className={`text-lg font-semibold ${
              transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
