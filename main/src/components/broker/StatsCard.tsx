'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  bgColor: string;
}

const StatsCard = ({ title, value, change, isPositive, bgColor }: StatsCardProps) => {
  return (
    <div className={`${bgColor} text-white rounded-lg p-4`}>
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold">{value}</p>
        <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
          {isPositive ? '+' : ''}{change}
        </span>
      </div>
    </div>
  );
};

export default StatsCard;
