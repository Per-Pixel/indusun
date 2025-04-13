'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SummaryCardProps {
  title: string;
  amount?: string;
  icon?: React.ReactNode;
  image?: React.ReactNode;
  badge?: string;
  customContent?: React.ReactNode;
  onClick?: () => void;
}

const SummaryCard = ({
  title,
  amount,
  icon,
  image,
  badge,
  customContent,
  onClick
}: SummaryCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
      <div className="p-4">
        {badge && (
          <div className="absolute top-3 left-3 bg-green-950 text-white text-xs px-2 py-1 rounded-full z-10">
            {badge}
          </div>
        )}

        {customContent ? (
          <div className="mt-4">{customContent}</div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{title}</h3>
              {amount && <p className="text-xl font-semibold mt-1 text-black">{amount}</p>}
            </div>
            {icon && <div className="text-green-800">{icon}</div>}
            {image && <div>{image}</div>}
          </div>
        )}
      </div>
      {onClick && (
        <motion.button
          whileHover={{ backgroundColor: '#f3f4f6' }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          className="w-full py-2 text-center text-sm font-medium text-green-950 border-t border-gray-200 transition-colors"
        >
          View
        </motion.button>
      )}
    </div>
  );
};

export default SummaryCard;
