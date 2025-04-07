'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RemainingAmountProps {
  amount: string;
  onPayNow: () => void;
}

const RemainingAmount = ({ amount, onPayNow }: RemainingAmountProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Remaining Amount</h3>
        <p className="text-xl font-semibold mt-1 text-black">INR {amount}</p>

        <div className="mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPayNow}
            className="w-full py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors"
          >
            Pay Now
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RemainingAmount;
