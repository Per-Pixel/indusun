'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Transaction {
  id: string;
  name: string;
  price: string;
  image: string;
  details: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-base font-medium text-black">Transaction</h2>
        <Link href="/transactions" className="text-xs text-blue-500 font-medium">
          See all
        </Link>
      </div>

      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center p-4">
            <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center mr-3">
              <Image
                src="/transaction-icons/Transaction icon.png"
                alt={transaction.name}
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-black">{transaction.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{transaction.details}</p>
            </div>
            <div className="text-sm font-medium text-red-500">-$<span>{transaction.price}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
