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
  viewAlign?: 'left' | 'center';
}

const SummaryCard = ({
  title,
  amount,
  icon,
  image,
  badge,
  customContent,
  onClick,
  viewAlign = 'center'
}: SummaryCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
      <div className="p-3">
        {badge && (
          <div className="absolute top-2 left-2 bg-green-950 text-white text-xs px-2 py-0.5 rounded-full z-10">
            {badge}
          </div>
        )}

        {customContent ? (
          customContent
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mt-3">{title}</h3>
              {amount && <p className="text-base font-semibold mt-1 text-black">{amount}</p>}
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
          className={`w-full py-1.5 text-sm font-medium text-green-950 border-t border-gray-200 transition-colors ${viewAlign === 'left' ? 'text-left pl-3' : 'text-center'}`}
        >
          View
        </motion.button>
      )}
    </div>
  );
};

export default SummaryCard;
